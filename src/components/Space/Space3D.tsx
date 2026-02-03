import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsStd } from 'three-stdlib';
import * as THREE from 'three';
import TruckContainer from './TruckContainer';
import { loadPLY, getGeometrySize } from './utils/plyLoader';
import { Space3DProps, TruckType, TRUCK_DIMENSIONS } from '../../types/simulation';
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

interface ControlsProps {
  truckType?: TruckType;
}

const Controls: React.FC<ControlsProps> = ({ truckType }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsStd>(null);

  const cameraDistance = useMemo(() => {
    if (!truckType) return { min: 5, max: 100 };
    const dims = TRUCK_DIMENSIONS[truckType];
    const maxDim = Math.max(dims.width, dims.depth, dims.height);
    return { min: maxDim * 1.5, max: maxDim * 10 };
  }, [truckType]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
  }, []);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return (
    <orbitControlsStd
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping={true}
      dampingFactor={0.05}
      autoRotateSpeed={2.0}
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

// 시뮬레이션 씬
interface SimulationSceneProps {
  truckType: TruckType;
  placements: PlacedBox[];
  loadedFurniture: Map<string, LoadedFurniture>;
  visibleCount: number;
  animationKey: number;
}

const SimulationScene: React.FC<SimulationSceneProps> = ({
  truckType,
  placements,
  loadedFurniture,
  visibleCount,
  animationKey,
}) => {
  return (
    <group position={[0, 0, 0]}>
      <TruckContainer truckType={truckType} />

      {placements.map((placement, index) => {
        const furniture = loadedFurniture.get(placement.itemId);
        if (!furniture) return null;

        return (
          <FurniturePoints
            key={`${placement.itemId}-${animationKey}`}
            furniture={furniture}
            placement={placement}
            visible={index < visibleCount}
            animationKey={animationKey}
          />
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
}) => {
  const [loadedFurniture, setLoadedFurniture] = useState<Map<string, LoadedFurniture>>(new Map());
  const [trucks, setTrucks] = useState<TruckPlacement[]>([]);
  const [currentTruckIndex, setCurrentTruckIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [packingMessage, setPackingMessage] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hasSimulation = furniture && furniture.length > 0;
  const currentTruck = trucks[currentTruckIndex];
  const placements = currentTruck?.placements || [];
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

  // 2. PLY 로드 완료 후 binPacking 실행
  useEffect(() => {
    if (loadedFurniture.size === 0) {
      setTrucks([]);
      setPackingMessage('');
      return;
    }

    // PLY 바운딩박스 크기로 OBBItem 생성 (m → cm for binPacking)
    const items: OBBItem[] = Array.from(loadedFurniture.values()).map((f) => ({
      id: f.id,
      width: f.width * 100,   // m → cm
      depth: f.depth * 100,
      height: f.height * 100,
    }));

    console.log('=== binPacking 입력 (실제 PLY 크기, cm) ===', items);

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
    setCurrentTruckIndex(0);
    setVisibleCount(0);
    setIsPlaying(false);
    setAnimationKey((k) => k + 1);
  }, [loadedFurniture, truckType]);

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
    if (autoPlay && !isLoading && trucks.length > 0 && !isPlaying && visibleCount === 0) {
      play();
    }
  }, [autoPlay, isLoading, trucks.length]);

  // 순차 애니메이션 (현재 트럭 → 다음 트럭)
  const scheduleNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        const currentPlacements = trucks[currentTruckIndex]?.placements || [];

        if (next < currentPlacements.length) {
          scheduleNext();
        } else if (currentTruckIndex < trucks.length - 1) {
          // 다음 트럭으로 이동
          setTimeout(() => {
            setCurrentTruckIndex((idx) => idx + 1);
            setVisibleCount(0);
            setAnimationKey((k) => k + 1);
            setTimeout(() => scheduleNext(), 500);
          }, 800);
        } else {
          setIsPlaying(false);
          onAnimationComplete?.();
        }
        return next;
      });
    }, 600);
  }, [trucks, currentTruckIndex, onAnimationComplete]);

  const play = useCallback(() => {
    // 처음 트럭부터 시작
    setCurrentTruckIndex(0);
    setVisibleCount(0);
    setAnimationKey((k) => k + 1);
    setIsPlaying(true);

    // 약간의 딜레이 후 시작 (리셋 반영)
    setTimeout(() => {
      scheduleNext();
    }, 100);
  }, [scheduleNext]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTruckIndex(0);
    setVisibleCount(0);
    setAnimationKey((k) => k + 1);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 트럭 이동
  const goToTruck = useCallback((index: number) => {
    if (isPlaying) return;
    setCurrentTruckIndex(index);
    setVisibleCount(0);
    setAnimationKey((k) => k + 1);
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

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#020617' }}>
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[20, 40, 20]} intensity={2} />
        <pointLight position={[-20, 20, -20]} intensity={0.5} color="#6ad2ff" />

        <group position={[0, -0.01, 0]}>
          <gridHelper args={[20, 20, "#081027", "#050c1f"]} />
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {hasSimulation && !isLoading && trucks.length > 0 ? (
          <SimulationScene
            truckType={currentTruckType as any}
            placements={placements}
            loadedFurniture={loadedFurniture}
            visibleCount={visibleCount}
            animationKey={animationKey}
          />
        ) : (
          <TruckContainer truckType="2.5ton" />
        )}

        <Controls truckType={hasSimulation ? currentTruckType as any : undefined} />
      </Canvas>

      {/* 컨트롤 UI */}
      {hasSimulation && (
        <View style={styles.controlsOverlay}>
          {isLoading ? (
            <Text style={styles.loadingText}>PLY 로딩 중...</Text>
          ) : trucks.length === 0 ? (
            <Text style={styles.loadingText}>배치 계산 중...</Text>
          ) : (
            <>
              {/* 트럭 정보 */}
              <View style={styles.truckInfoRow}>
                <Text style={styles.truckInfoText}>
                  {packingMessage}
                </Text>
              </View>

              {/* 트럭 네비게이션 (멀티트럭일 때만) */}
              {trucks.length > 1 && (
                <View style={styles.truckNavRow}>
                  {trucks.map((truck, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.truckNavButton,
                        currentTruckIndex === index && styles.truckNavButtonActive,
                      ]}
                      onPress={() => goToTruck(index)}
                    >
                      <Text
                        style={[
                          styles.truckNavText,
                          currentTruckIndex === index && styles.truckNavTextActive,
                        ]}
                      >
                        {index + 1}. {truck.type} ({truck.utilization}%)
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.controlsRow}>
                {!isPlaying && (
                  <TouchableOpacity style={styles.playButton} onPress={play}>
                    <Text style={styles.buttonText}>▶ 시작</Text>
                  </TouchableOpacity>
                )}
                {isPlaying && (
                  <TouchableOpacity style={styles.pauseButton} onPress={() => {
                    setIsPlaying(false);
                    if (timerRef.current) {
                      clearTimeout(timerRef.current);
                      timerRef.current = null;
                    }
                  }}>
                    <Text style={styles.buttonText}>⏸ 일시정지</Text>
                  </TouchableOpacity>
                )}
                {(visibleCount > 0 || currentTruckIndex > 0) && (
                  <TouchableOpacity style={styles.resetButton} onPress={reset}>
                    <Text style={styles.buttonText}>↺ 리셋</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsText}>
                  {trucks.length > 1 ? `[${currentTruckIndex + 1}/${trucks.length}] ` : ''}
                  {currentTruckType}: {visibleCount} / {placements.length} 배치
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controlsOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  truckInfoRow: {
    marginBottom: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  truckInfoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  truckNavRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  truckNavButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  truckNavButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
  },
  truckNavText: {
    color: '#aaa',
    fontSize: 11,
  },
  truckNavTextActive: {
    color: 'white',
    fontWeight: '600',
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
  pauseButton: {
    backgroundColor: 'rgba(200, 150, 0, 0.8)',
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
  statsRow: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statsText: {
    color: 'white',
    fontSize: 11,
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
