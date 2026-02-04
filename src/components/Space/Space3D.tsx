import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsStd } from 'three-stdlib';
import * as THREE from 'three';
import TruckContainer from './TruckContainer';
import { loadPLY, getGeometrySize } from './utils/plyLoader';
import { Space3DProps, TruckType, TRUCK_DIMENSIONS, SimulationTruckResult } from '../../types/simulation';
import { optimizeOBB, packMultiTruck } from '../../binPacking/packer';
import { OBBItem, PlacedBox, Orientation, TruckPlacement } from '../../binPacking/types';

extend({ OrbitControlsStd });

declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControlsStd: any;
  }
}

// 로드된 가구 데이터
interface LoadedFurniture {
  id: string;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  // PLY 바운딩박스 크기 (m) - AI 서버가 절대 크기로 제공
  width: number;
  depth: number;
  height: number;
}

// 트럭 간 간격 (m)
const TRUCK_SPACING_GAP = 1.5;

// 트럭 X 위치 계산 (오른쪽으로 나열)
const calculateTruckXOffset = (trucks: TruckPlacement[], index: number): number => {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    const dims = TRUCK_DIMENSIONS[trucks[i].type as TruckType];
    offset += dims.width + TRUCK_SPACING_GAP;
  }
  return offset;
};

// Easing 함수
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface AnimatedControlsProps {
  truckType?: TruckType;
  targetPosition: [number, number, number];
  animationDuration?: number;
}

const AnimatedControls: React.FC<AnimatedControlsProps> = ({
  truckType,
  targetPosition,
  animationDuration = 800,
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsStd>(null);

  const cameraDistance = useMemo(() => {
    if (!truckType) return { min: 5, max: 100 };
    const dims = TRUCK_DIMENSIONS[truckType];
    const maxDim = Math.max(dims.width, dims.depth, dims.height);
    return { min: maxDim * 1.5, max: maxDim * 10 };
  }, [truckType]);

  // 애니메이션 상태
  const animState = useRef({
    isAnimating: false,
    startTime: 0,
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    startCamPos: new THREE.Vector3(),
    endCamPos: new THREE.Vector3(),
  });

  // targetPosition 변경 시 애니메이션 시작
  useEffect(() => {
    if (!controlsRef.current) return;

    const current = controlsRef.current.target.clone();
    const target = new THREE.Vector3(...targetPosition);

    if (current.distanceTo(target) < 0.01) return;

    const offset = camera.position.clone().sub(current);

    animState.current = {
      isAnimating: true,
      startTime: performance.now(),
      startTarget: current,
      endTarget: target,
      startCamPos: camera.position.clone(),
      endCamPos: target.clone().add(offset),
    };
  }, [targetPosition, camera]);

  // 프레임마다 애니메이션 업데이트
  useFrame(() => {
    if (!controlsRef.current) return;

    if (animState.current.isAnimating) {
      const elapsed = performance.now() - animState.current.startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const eased = easeOutCubic(progress);

      // 타겟 보간
      controlsRef.current.target.lerpVectors(
        animState.current.startTarget,
        animState.current.endTarget,
        eased
      );

      // 카메라 위치 보간
      camera.position.lerpVectors(
        animState.current.startCamPos,
        animState.current.endCamPos,
        eased
      );

      if (progress >= 1) {
        animState.current.isAnimating = false;
      }
    }

    controlsRef.current.update();
  });

  return (
    <orbitControlsStd
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={cameraDistance.min}
      maxDistance={cameraDistance.max}
      maxPolarAngle={Math.PI / 2.1}
    />
  );
};

// 가구 메시 컴포넌트 (이미 로드된 geometry 사용)
interface FurniturePointsProps {
  furniture: LoadedFurniture;
  placement: PlacedBox;
  visible: boolean;
  animationKey: number;
}

const FurniturePoints: React.FC<FurniturePointsProps> = ({
  furniture,
  placement,
  visible,
  animationKey,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);

  // 배치 위치 (cm → m)
  const targetX = placement.x / 100;
  const targetY = placement.y / 100 + furniture.height / 2;
  const targetZ = placement.z / 100;

  // 회전
  const rotationY = placement.orientation === Orientation.WLH ? Math.PI / 2 : 0;

  // visible이 true가 될 때 애니메이션 시작
  useEffect(() => {
    if (visible && groupRef.current) {
      // 시작 위치 (위에서)
      const startY = targetY + 1.5;
      groupRef.current.position.y = startY;
      setCurrentY(startY);

      // 애니메이션
      const duration = 400;
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutBack(progress);
        const newY = startY + (targetY - startY) * eased;

        if (groupRef.current) {
          groupRef.current.position.y = newY;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCurrentY(targetY);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [visible, animationKey, targetY]);

  if (!visible) return null;

  return (
    <group
      ref={groupRef}
      position={[targetX, currentY ?? targetY, targetZ]}
      rotation={[0, rotationY, 0]}
    >
      <points geometry={furniture.geometry} material={furniture.material} />
    </group>
  );
};

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// instanceId에서 baseId 추출 (예: "chair_0_2" → "chair_0")
const extractBaseId = (instanceId: string): string => {
  const lastUnderscoreIdx = instanceId.lastIndexOf('_');
  if (lastUnderscoreIdx === -1) return instanceId;
  return instanceId.substring(0, lastUnderscoreIdx);
};

// 멀티 트럭 씬 (모든 완료 트럭 + 현재 트럭 렌더링)
interface MultiTruckSceneProps {
  trucks: TruckPlacement[];
  currentTruckIndex: number;
  truckVisibleCounts: number[];
  loadedFurniture: Map<string, LoadedFurniture>;
  animationKey: number;
}

const MultiTruckScene: React.FC<MultiTruckSceneProps> = ({
  trucks,
  currentTruckIndex,
  truckVisibleCounts,
  loadedFurniture,
  animationKey,
}) => {
  return (
    <group>
      {trucks.map((truck, truckIdx) => {
        // 현재 트럭 이하만 렌더링
        if (truckIdx > currentTruckIndex) return null;

        const xOffset = calculateTruckXOffset(trucks, truckIdx);
        const visibleCount = truckVisibleCounts[truckIdx] || 0;

        return (
          <group key={truckIdx} position={[xOffset, 0, 0]}>
            <TruckContainer truckType={truck.type as TruckType} />
            {truck.placements.map((placement, index) => {
              const baseId = extractBaseId(placement.itemId);
              const furniture = loadedFurniture.get(baseId);
              if (!furniture) return null;

              // 완료된 트럭(truckIdx < currentTruckIndex)은 모든 아이템 항상 표시
              const isCompletedTruck = truckIdx < currentTruckIndex;

              return (
                <FurniturePoints
                  key={`${truckIdx}-${placement.itemId}`}
                  furniture={furniture}
                  placement={placement}
                  visible={isCompletedTruck || index < visibleCount}
                  animationKey={animationKey}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

const Space3D: React.FC<Space3DProps> = ({
  furniture,
  truckType,
  autoPlay = false,
  onAnimationComplete,
  onTrucksChange,
}) => {
  const [loadedFurniture, setLoadedFurniture] = useState<Map<string, LoadedFurniture>>(new Map());
  const [trucks, setTrucks] = useState<TruckPlacement[]>([]);
  const [currentTruckIndex, setCurrentTruckIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [truckVisibleCounts, setTruckVisibleCounts] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [packingMessage, setPackingMessage] = useState('');
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hasSimulation = furniture && furniture.length > 0;
  const currentTruck = trucks[currentTruckIndex];
  const currentTruckType = currentTruck?.type || truckType || '2.5ton';

  // 1. PLY 로드 (AI 서버가 절대 크기 PLY 제공 → 스케일링 불필요)
  useEffect(() => {
    if (!furniture || furniture.length === 0) {
      setLoadedFurniture(new Map());
      return;
    }

    const loadAllPLY = async () => {
      setIsLoading(true);
      const loaded = new Map<string, LoadedFurniture>();

      for (let i = 0; i < furniture.length; i++) {
        const f = furniture[i];
        if (!f.ply_url) continue;

        const id = `${f.furnitureId}_${i}`;

        try {
          // GCS PLY는 이미 Y-up으로 변환됨 → 좌표계 변환 비활성화
          const { geometry, material } = await loadPLY(f.ply_url, 0.008, false);
          geometry.center();

          // PLY 바운딩박스 = 히트박스 (절대 크기, m 단위)
          const size = getGeometrySize(geometry);

          loaded.set(id, {
            id,
            geometry,
            material,
            width: size.x,
            depth: size.z,
            height: size.y,
          });

          console.log(`[PLY 로드] ${id}: ${size.x.toFixed(2)}m x ${size.z.toFixed(2)}m x ${size.y.toFixed(2)}m`);
        } catch (err) {
          console.error(`PLY 로드 실패: ${id}`, err);
        }
      }

      setLoadedFurniture(loaded);
      setIsLoading(false);
    };

    loadAllPLY();
  }, [furniture]);

  // 2. PLY 로드 완료 후 binPacking 실행 (quantity 반영)
  useEffect(() => {
    if (loadedFurniture.size === 0 || !furniture || furniture.length === 0) {
      setTrucks([]);
      setPackingMessage('');
      return;
    }

    // quantity만큼 OBBItem 복제 생성 (m → cm for binPacking)
    const items: OBBItem[] = [];
    furniture.forEach((f, furnitureIndex) => {
      const baseId = `${f.furnitureId}_${furnitureIndex}`;
      const loadedItem = loadedFurniture.get(baseId);
      if (!loadedItem) return;

      const qty = f.quantity ?? 1;
      if (qty <= 0) return;  // quantity 0인 가구 건너뛰기
      for (let copyIndex = 0; copyIndex < qty; copyIndex++) {
        items.push({
          id: `${baseId}_${copyIndex}`,  // instanceId: baseId_copyIndex
          width: loadedItem.width * 100,   // m → cm
          depth: loadedItem.depth * 100,
          height: loadedItem.height * 100,
        });
      }
    });

    console.log('=== binPacking 입력 (quantity 반영, cm) ===', items);

    if (truckType) {
      // 트럭 타입이 지정되면 단일 트럭 모드
      const result = optimizeOBB(items, truckType);
      console.log('=== binPacking 결과 (단일 트럭) ===', result);

      setTrucks([{
        type: truckType,
        placements: result.placedItems,
        utilization: result.volumeUtilization,
      }]);
      setPackingMessage(result.message);
    } else {
      // 트럭 타입 미지정 → 멀티트럭 자동 최적화
      const result = packMultiTruck(items);
      console.log('=== binPacking 결과 (멀티트럭) ===', result);

      setTrucks(result.trucks);
      setPackingMessage(result.message);
    }

    // 새로운 결과면 애니메이션 리셋
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentTruckIndex(0);
    setIsPlaying(false);
    setSimulationState('idle');
    setAnimationKey((k) => k + 1);
  }, [loadedFurniture, truckType, furniture]);

  // trucks 변경 시 truckVisibleCounts 초기화
  useEffect(() => {
    setTruckVisibleCounts(trucks.map(() => 0));
  }, [trucks]);

  // 트럭 결과가 변경되면 부모에게 알림
  useEffect(() => {
    if (onTrucksChange && trucks.length > 0) {
      // 트럭 타입별로 집계
      const truckCounts = trucks.reduce((acc, truck) => {
        const type = truck.type as TruckType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<TruckType, number>);

      const truckResults: SimulationTruckResult[] = Object.entries(truckCounts).map(
        ([type, quantity]) => ({ type: type as TruckType, quantity })
      );

      onTrucksChange(truckResults);
    }
  }, [trucks, onTrucksChange]);

  // 타이머 클린업
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // autoPlay 처리: 데이터 준비 완료 시 자동 재생
  useEffect(() => {
    const allZero = truckVisibleCounts.length > 0 && truckVisibleCounts.every(c => c === 0);
    if (autoPlay && !isLoading && trucks.length > 0 && !isPlaying && allZero) {
      play();
    }
  }, [autoPlay, isLoading, trucks.length, truckVisibleCounts]);

  // 최신 값을 참조하기 위한 ref
  const trucksRef = useRef(trucks);
  const currentTruckIndexRef = useRef(currentTruckIndex);

  useEffect(() => {
    trucksRef.current = trucks;
  }, [trucks]);

  useEffect(() => {
    currentTruckIndexRef.current = currentTruckIndex;
  }, [currentTruckIndex]);

  // 순차 애니메이션 (현재 트럭 → 다음 트럭, 이전 트럭 유지)
  const scheduleNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      // ref에서 최신 값 사용
      const currentTrucks = trucksRef.current;
      const currentIdx = currentTruckIndexRef.current;
      const currentPlacements = currentTrucks[currentIdx]?.placements || [];

      setTruckVisibleCounts((prev) => {
        const newCounts = [...prev];
        const currentCount = newCounts[currentIdx] || 0;
        const nextCount = currentCount + 1;
        newCounts[currentIdx] = nextCount;

        if (nextCount < currentPlacements.length) {
          // 현재 트럭 계속 적재
          scheduleNext();
        } else if (currentIdx < currentTrucks.length - 1) {
          // 현재 트럭 적재 완료 → 다음 트럭으로 전환
          // 현재 트럭의 visible count를 완전히 설정 (모든 아이템 표시)
          newCounts[currentIdx] = currentPlacements.length;

          timerRef.current = setTimeout(() => {
            setCurrentTruckIndex((idx) => idx + 1);
            // animationKey는 리셋하지 않음 → 이전 가구 유지
            timerRef.current = setTimeout(() => scheduleNext(), 800); // 카메라 이동 대기
          }, 500);
        } else {
          // 모든 트럭 완료
          setIsPlaying(false);
          setSimulationState('completed');
          onAnimationComplete?.();
        }

        return newCounts;
      });
    }, 600);
  }, [onAnimationComplete]);

  const play = useCallback(() => {
    // 처음 트럭부터 시작
    setCurrentTruckIndex(0);
    setTruckVisibleCounts(trucks.map(() => 0));
    setAnimationKey((k) => k + 1);
    setIsPlaying(true);
    setSimulationState('running');

    // 약간의 딜레이 후 시작 (리셋 반영)
    setTimeout(() => {
      scheduleNext();
    }, 100);
  }, [scheduleNext, trucks]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTruckIndex(0);
    setTruckVisibleCounts(trucks.map(() => 0));
    setSimulationState('idle');
    setAnimationKey((k) => k + 1);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [trucks]);

  // 트럭 이동
  const goToTruck = useCallback((index: number) => {
    if (isPlaying) return;
    setCurrentTruckIndex(index);
  }, [isPlaying]);

  // 카메라 위치
  const cameraPosition = useMemo((): [number, number, number] => {
    if (!hasSimulation) {
      return [20, 20, 18];
    }
    const dims = TRUCK_DIMENSIONS[currentTruckType as keyof typeof TRUCK_DIMENSIONS] || TRUCK_DIMENSIONS['2.5ton'];
    const maxDim = Math.max(dims.width, dims.depth, dims.height);
    const distance = maxDim * 2.5;
    return [distance, distance * 0.8, distance];
  }, [hasSimulation, currentTruckType]);

  // 컨테이너 중앙 (카메라 타겟) - 현재 트럭 위치로 이동
  const containerCenter = useMemo((): [number, number, number] => {
    const dims = TRUCK_DIMENSIONS[currentTruckType as keyof typeof TRUCK_DIMENSIONS] || TRUCK_DIMENSIONS['2.5ton'];
    const xOffset = calculateTruckXOffset(trucks, currentTruckIndex);
    return [xOffset, dims.height / 2, 0];
  }, [currentTruckType, trucks, currentTruckIndex]);

  return (
    <View style={styles.canvasContainer}>
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#FFFFFF']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[20, 40, 20]} intensity={2} />
        <pointLight position={[-20, 20, -20]} intensity={0.5} color="#6ad2ff" />

        <group position={[0, -0.01, 0]}>
          <gridHelper args={[20, 20, "#CCCCCC", "#E0E0E0"]} />
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {hasSimulation && !isLoading && trucks.length > 0 ? (
          <MultiTruckScene
            trucks={trucks}
            currentTruckIndex={currentTruckIndex}
            truckVisibleCounts={truckVisibleCounts}
            loadedFurniture={loadedFurniture}
            animationKey={animationKey}
          />
        ) : (
          <TruckContainer truckType="2.5ton" />
        )}

        <AnimatedControls
          truckType={hasSimulation ? currentTruckType as TruckType : undefined}
          targetPosition={containerCenter}
        />
      </Canvas>

      {/* 컨트롤 UI */}
      {hasSimulation && (
        <View style={styles.controlsOverlay}>
          {isLoading ? (
            <Text style={styles.loadingText}>PLY 로딩 중...</Text>
          ) : trucks.length === 0 ? (
            <Text style={styles.loadingText}>배치 계산 중...</Text>
          ) : (
            <View style={styles.controlsRow}>
              {simulationState === 'idle' && (
                <TouchableOpacity style={styles.playButton} onPress={play}>
                  <Text style={styles.buttonText}>▶ 시작</Text>
                </TouchableOpacity>
              )}
              {simulationState === 'running' && (
                <Text style={styles.loadingText}>적재 중...</Text>
              )}
              {simulationState === 'completed' && (
                <TouchableOpacity style={styles.resetButton} onPress={reset}>
                  <Text style={styles.buttonText}>↺ 리셋</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playButton: {
    backgroundColor: '#F0893B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetButton: {
    backgroundColor: 'rgba(100, 100, 200, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
});

export default Space3D;
