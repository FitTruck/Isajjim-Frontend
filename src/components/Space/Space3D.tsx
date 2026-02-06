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
  // 박스 테두리 렌더링을 위한 엣지 지오메트리 (옵션)
  edgesGeometry?: THREE.EdgesGeometry;
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
  const hasAppeared = useRef(false);
  const prevAnimKey = useRef(animationKey);

  // 배치 위치 (cm → m)
  const targetX = placement.x / 100;
  const targetY = placement.y / 100 + furniture.height / 2;
  const targetZ = placement.z / 100;

  // 회전
  const rotationY = placement.orientation === Orientation.WLH ? Math.PI / 2 : 0;

  // Animation Key 변경 시 리셋
  if (prevAnimKey.current !== animationKey) {
    hasAppeared.current = false;
    prevAnimKey.current = animationKey;
  }

  // visible이 true가 될 때 or 위치 변경 시 애니메이션
  useEffect(() => {
    if (visible && groupRef.current) {
      const isFirstAppearance = !hasAppeared.current;
      
      // 시작 Y 위치 결정
      // 첫 등장이면 위에서 떨어짐, 아니면 현재 위치에서 시작
      let startY = targetY;
      
      if (isFirstAppearance) {
        startY = targetY + 1.5;
        // 깜빡임 방지: 즉시 위치 설정
        groupRef.current.position.y = startY;
        hasAppeared.current = true;
      } else {
        startY = groupRef.current.position.y;
      }

      // 목표 위치와 차이가 적으면 바로 설정하고 종료
      if (Math.abs(startY - targetY) < 0.005) {
        groupRef.current.position.y = targetY;
        return;
      }

      // 애니메이션 실행
      const duration = 270;
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
          // 보정
          if (groupRef.current) groupRef.current.position.y = targetY;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [visible, animationKey, targetY]);

  if (!visible) return null;

  return (
    <group
      ref={groupRef}
      // Y는 수동 제어하므로 초기값만 주거나 제외 (여기서는 position prop에 Y를 제외하고 X,Z만 바인딩 권장하지만, 
      // R3F에서 [x,y,z] 배열 프로퍼티는 개별 갱신이 어려울 수 있으므로 개별 prop 사용)
      position-x={targetX}
      position-z={targetZ}
      // position-y는 useEffect에서 제어하므로 prop으로 넘기지 않음 (초기 마운트 시에는 0이나 targetY 등 기본값)
      rotation={[0, rotationY, 0]}
    >
      <points geometry={furniture.geometry} material={furniture.material} />
      {furniture.edgesGeometry && (
        <lineSegments geometry={furniture.edgesGeometry}>
           <lineBasicMaterial color="#CC6600" />
        </lineSegments>
      )}
    </group>
  );
};

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// instanceId에서 baseId 추출 (복제 인덱스만 제거)
// 예: "123_0" → "123", "box_5" → "box", "456_2" → "456"
const extractBaseId = (instanceId: string): string => {
  const lastUnderscoreIdx = instanceId.lastIndexOf('_');
  if (lastUnderscoreIdx === -1) return instanceId;

  const suffix = instanceId.substring(lastUnderscoreIdx + 1);
  // 마지막 부분이 숫자면 복제 인덱스로 간주하고 제거
  if (/^\d+$/.test(suffix)) {
    return instanceId.substring(0, lastUnderscoreIdx);
  }

  return instanceId;
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

// PLY 캐시 (ply_url → geometry/material) - 컴포넌트 외부에 선언하여 전역 캐시로 사용
const plyCache = new Map<string, { geometry: THREE.BufferGeometry; material: THREE.PointsMaterial; edgesGeometry?: THREE.EdgesGeometry; width: number; depth: number; height: number }>();

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

  // 이전 트럭 상태 저장 (점진적 업데이트용)
  const prevTrucksRef = useRef<{ types: string; count: number; totalPlacements: number }>({
    types: '',
    count: 0,
    totalPlacements: 0
  });

  // scheduleNext 함수 ref (순환 의존성 방지)
  const scheduleNextRef = useRef<() => void>(() => {});

  const hasSimulation = furniture && furniture.length > 0;
  const currentTruck = trucks[currentTruckIndex];
  const currentTruckType = currentTruck?.type || truckType || '2.5ton';

  // 1. PLY 로드 (AI 서버가 절대 크기 PLY 제공 → 스케일링 불필요)
  // 캐시를 사용하여 같은 ply_url은 다시 다운로드하지 않음
  useEffect(() => {
    if (!furniture || furniture.length === 0) {
      setLoadedFurniture(new Map());
      return;
    }
    const loadAllPLY = async () => {
      // 이미 데이터가 있다면 로딩 표시 생략 (깜빡임 방지)
      if (loadedFurniture.size === 0) {
        setIsLoading(true);
      }
      const loaded = new Map<string, LoadedFurniture>();

      // 1. 모든 비동기 작업(Promise)을 배열로 생성
      const loadPromises = furniture.map(async (f) => {
        if (!f.ply_url) return null;

        // furnitureId를 직접 키로 사용 (배열 인덱스 제거)
        const id = String(f.furnitureId);

        // BOX_PLACEHOLDER 처리 (박스 추가 기능)
        if (f.ply_url === 'BOX_PLACEHOLDER') {
          let cached = plyCache.get('BOX_PLACEHOLDER');
          if (!cached) {
             // 50cm x 30cm x 35cm 박스 생성
             const width = 0.5; 
             const height = 0.35; 
             const depth = 0.3; 
             // 세그먼트를 50으로 증가시켜 점 밀도 향상
             const geometry = new THREE.BoxGeometry(width, height, depth, 40, 40, 40);
             // 테두리용 지오메트리 (세그먼트 없는 박스로 생성)
             const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth));
             // 점 크기를 키워 가시성 향상
             const material = new THREE.PointsMaterial({ size: 0.025, color: '#F0893B' });
             cached = { geometry, material, edgesGeometry, width, depth, height };
             plyCache.set('BOX_PLACEHOLDER', cached);
          }
          return {
             id,
             data: {
               id,
               geometry: cached.geometry,
               material: cached.material,
               edgesGeometry: cached.edgesGeometry,
               width: cached.width,
               depth: cached.depth,
               height: cached.height,
             }
          };
        }

        // 캐시 확인
        const cached = plyCache.get(f.ply_url);
        if (cached) {
          console.log(`[PLY 캐시 히트] ${id} (${f.ply_url.slice(-30)})`);
          return {
            id,
            data: {
              id,
              geometry: cached.geometry,
              material: cached.material,
              edgesGeometry: cached.edgesGeometry,
              width: cached.width,
              depth: cached.depth,
              height: cached.height,
            }
          };
        }

        // 캐시 미스 → 다운로드
        try {
          console.log(`[PLY 다운로드] ${id}`);
          const { geometry, material } = await loadPLY(f.ply_url, 0.008, false);
          geometry.center();
          const size = getGeometrySize(geometry);

          // 캐시에 저장
          plyCache.set(f.ply_url, {
            geometry,
            material,
            width: size.x,
            depth: size.z,
            height: size.y,
          });

          return {
            id,
            data: {
              id,
              geometry,
              material,
              width: size.x,
              depth: size.z,
              height: size.y,
            }
          };
        } catch (err) {
          console.error(`PLY 로드 실패: ${id}`, err);
          return null;
        }
      });

      // 2. Promise.all로 모든 요청을 병렬로 처리
      const results = await Promise.all(loadPromises);

      // 3. 결과값을 Map에 세팅
      results.forEach((result) => {
        if (result) {
          loaded.set(result.id, result.data);
          console.log(`[PLY 로드 완료] ${result.id}`);
        }
      });

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
    furniture.forEach((f) => {
      // furnitureId를 직접 baseId로 사용 (배열 인덱스 제거)
      const baseId = String(f.furnitureId);
      const loadedItem = loadedFurniture.get(baseId);
      if (!loadedItem) return;

      const qty = f.quantity ?? 1;
      if (qty <= 0) return;  // quantity 0인 가구 건너뛰기
      for (let copyIndex = 0; copyIndex < qty; copyIndex++) {
        items.push({
          id: `${baseId}_${copyIndex}`,  // instanceId: furnitureId_copyIndex
          width: loadedItem.width * 100,   // m → cm
          depth: loadedItem.depth * 100,
          height: loadedItem.height * 100,
        });
      }
    });

    console.log('=== binPacking 입력 (quantity 반영, cm) ===', items);

    let newTrucks: TruckPlacement[];
    let newMessage: string;

    if (truckType) {
      // 트럭 타입이 지정되면 단일 트럭 모드
      const result = optimizeOBB(items, truckType);
      console.log('=== binPacking 결과 (단일 트럭) ===', result);

      newTrucks = [{
        type: truckType,
        placements: result.placedItems,
        utilization: result.volumeUtilization,
      }];
      newMessage = result.message;
    } else {
      // 트럭 타입 미지정 → 멀티트럭 자동 최적화
      const result = packMultiTruck(items);
      console.log('=== binPacking 결과 (멀티트럭) ===', result);

      newTrucks = result.trucks;
      newMessage = result.message;
    }

    // 이전 트럭과 비교
    const newTruckTypes = newTrucks.map(t => t.type).join(',');
    const newTruckCount = newTrucks.length;
    const newTotalPlacements = newTrucks.reduce((sum, t) => sum + t.placements.length, 0);
    const prevTypes = prevTrucksRef.current.types;
    const prevCount = prevTrucksRef.current.count;
    const prevTotalPlacements = prevTrucksRef.current.totalPlacements;

    const isSameTruckConfig = (prevTypes === newTruckTypes && prevCount === newTruckCount);
    const hasNewPlacements = newTotalPlacements > prevTotalPlacements;

    setTrucks(newTrucks);
    setPackingMessage(newMessage);

    if (!isSameTruckConfig || hasNewPlacements) {
      // 트럭 구성 변경 OR 가구 변경 → 전체 초기화
      console.log('[시뮬레이션] 변경 감지 → 전체 초기화');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setCurrentTruckIndex(0);
      setTruckVisibleCounts(newTrucks.map(() => 0));  // visible counts도 초기화
      setIsPlaying(false);
      setSimulationState('idle');
      setAnimationKey((k) => k + 1);
    }

    prevTrucksRef.current = { types: newTruckTypes, count: newTruckCount, totalPlacements: newTotalPlacements };
  }, [loadedFurniture, truckType, furniture, simulationState]);

  // trucks 변경 시 truckVisibleCounts 초기화 (트럭 개수가 변경된 경우에만)
  useEffect(() => {
    setTruckVisibleCounts(prev => {
      if (prev.length !== trucks.length) {
        return trucks.map(() => 0);
      }
      // 트럭 개수 동일 → 기존 visible counts 유지
      return prev;
    });
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
    // simulationState가 idle일 때만 자동 재생 (completed 상태에서 수량 변경 시 자동 재생 안 함)
    if (autoPlay && !isLoading && trucks.length > 0 && !isPlaying && allZero && simulationState === 'idle') {
      play();
    }
  }, [autoPlay, isLoading, trucks.length, truckVisibleCounts, simulationState]);

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
    }, 200);  // 애니메이션 속도 2배 빠르게 (400ms → 200ms)
  }, [onAnimationComplete]);

  // scheduleNext를 ref에 저장 (binPacking useEffect에서 사용)
  useEffect(() => {
    scheduleNextRef.current = scheduleNext;
  }, [scheduleNext]);

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

    // 멀티트럭일 때 거리 증가
    let distance = maxDim * 2.5;
    if (trucks.length > 1) {
      // 전체 트럭 배치의 너비 계산
      const totalWidth = calculateTruckXOffset(trucks, trucks.length - 1) + dims.width / 2;
      distance = Math.max(distance, totalWidth * 1.2);
    }

    return [distance, distance * 0.8, distance];
  }, [hasSimulation, currentTruckType, trucks]);

  // 컨테이너 중앙 (카메라 타겟)
  const containerCenter = useMemo((): [number, number, number] => {
    const dims = TRUCK_DIMENSIONS[currentTruckType as keyof typeof TRUCK_DIMENSIONS] || TRUCK_DIMENSIONS['2.5ton'];

    // 애니메이션 완료 후에는 모든 트럭의 중앙을 보도록
    if (simulationState === 'completed' && trucks.length > 1) {
      // 첫 트럭과 마지막 트럭의 중간점 계산
      const firstTruckX = 0;
      const lastTruckX = calculateTruckXOffset(trucks, trucks.length - 1);
      const centerX = (firstTruckX + lastTruckX) / 2;
      return [centerX, dims.height / 2, 0];
    }

    // 애니메이션 중에는 현재 트럭
    const xOffset = calculateTruckXOffset(trucks, currentTruckIndex);
    return [xOffset, dims.height / 2, 0];
  }, [currentTruckType, trucks, currentTruckIndex, simulationState]);

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

        {hasSimulation && trucks.length > 0 ? (
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
            <Text style={styles.loadingText}>가구 가져오는 중...</Text>
          ) : trucks.length === 0 ? (
            <Text style={styles.loadingText}>배치 계산 중...</Text>
          ) : (
            <View style={styles.controlsRow}>
              {simulationState === 'running' && (
                <Text style={styles.loadingText}>적재 중...</Text>
              )}
              {simulationState === 'completed' && (
                <TouchableOpacity style={styles.playButton} onPress={play}>
                  <Text style={styles.buttonText}>다시 보기</Text>
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
