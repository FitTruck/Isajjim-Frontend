import React, { useRef, useEffect, useLayoutEffect, useMemo, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverPolyfill;
}
import { View, TouchableOpacity, Text, StyleSheet, Platform, PanResponder } from 'react-native';
import { Canvas as WebCanvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const Canvas: typeof WebCanvas = Platform.OS === 'web'
  ? WebCanvas
  : require('@react-three/fiber/native').Canvas;
import * as THREE from 'three';
import TruckContainer from './TruckContainer';
import { Space3DProps, TruckType, TRUCK_DIMENSIONS, SimulationTruckResult } from '../../types/simulation';
import { optimizeOBB, packMultiTruck } from '../../binPacking/packer';
import { OBBItem, PlacedBox, Orientation, TruckPlacement } from '../../binPacking/types';

// label → hue 매핑 (사용 빈도 순 정렬 후 골든 앵글 137.5° 배분)
// 자주 함께 등장하는 BED/SOFA/DESK가 서로 멀리 떨어진 색상을 가짐
const LABEL_HUE: Record<string, number> = {
  BED: 0,              // 빨강
  SOFA: 138,           // 초록
  WARDROBE: 275,       // 보라
  DINING_TABLE: 53,    // 주황-노랑
  DESK: 190,           // 청록
  REFRIGERATOR: 328,   // 핑크
  WASHING_MACHINE: 105,// 연두
  NIGHTSTAND: 243,     // 파랑-보라
  CABINET: 20,         // 주황
  CHAIR_STOOL: 158,    // 청록-초록
  BOOKSHELF: 295,      // 자주
  COFFEE_TABLE: 73,    // 노랑
  MONITOR_TV: 210,     // 파랑
  DRAWER: 348,         // 빨강-핑크
  TV_STAND: 125,       // 연두-초록
  POTTED_PLANT: 263,   // 남보라
  DRYER: 40,           // 주황-노랑
  DISPLAY_SHELF: 178,  // 청록
  MIRROR: 315,         // 자주-핑크
  VANITY_TABLE: 93,    // 노랑-연두
  DISH_CABINET: 230,   // 파랑
  MICROWAVE_OVEN: 8,   // 빨강-주황
  AIR_CONDITIONER: 145,// 초록
  PIANO: 283,          // 보라
  MASSAGE_CHAIR: 60,   // 노랑-주황
  TREADMILL: 198,      // 청록-파랑
  EXERCISE_BIKE: 335,  // 빨강-핑크
  STORAGE_BOX: 113,    // 연두
  FAN: 250,            // 파랑-보라
  box: 28,             // 주황 (fallback)
};

function generateColor(label: string): string {
  const hue = label in LABEL_HUE
    ? LABEL_HUE[label]
    : Math.abs(label.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 5381)) % 360;
  return `hsl(${hue}, 65%, 60%)`;
}

interface LoadedFurniture {
  id: string;
  color: string;
  geometry: THREE.BoxGeometry;
  edgesGeometry: THREE.EdgesGeometry;
  width: number;  // m
  depth: number;  // m
  height: number; // m
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
  controlsRef: React.RefObject<any>;
}

const AnimatedControls: React.FC<AnimatedControlsProps> = ({
  truckType,
  targetPosition,
  animationDuration = 800,
  controlsRef,
}) => {

  const cameraDistance = useMemo(() => {
    if (!truckType) return { min: 5, max: 100 };
    const dims = TRUCK_DIMENSIONS[truckType];
    const maxDim = Math.max(dims.width, dims.depth, dims.height);
    return { min: maxDim * 1.5, max: maxDim * 10 };
  }, [truckType]);

  // target만 애니메이션 (camera.position 직접 조작 시 OrbitControls 내부 구면좌표 충돌)
  const animState = useRef({
    isAnimating: false,
    startTime: 0,
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
  });

  useEffect(() => {
    if (!controlsRef.current) return;

    const current = controlsRef.current.target.clone();
    const target = new THREE.Vector3(...targetPosition);

    if (current.distanceTo(target) < 0.01) return;

    animState.current = {
      isAnimating: true,
      startTime: performance.now(),
      startTarget: current,
      endTarget: target,
    };
  }, [targetPosition]);

  useFrame(() => {
    if (!controlsRef.current || !animState.current.isAnimating) return;

    const elapsed = performance.now() - animState.current.startTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const eased = easeOutCubic(progress);

    controlsRef.current.target.lerpVectors(
      animState.current.startTarget,
      animState.current.endTarget,
      eased
    );

    if (progress >= 1) {
      animState.current.isAnimating = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={cameraDistance.min}
      maxDistance={cameraDistance.max}
      maxPolarAngle={Math.PI / 2.1}
    />
  );
};

// 핀치 줌 컨트롤러 (Canvas 내부에서 카메라 거리 조절)
function PinchZoomController({ zoomDeltaRef, controlsRef }: {
  zoomDeltaRef: React.RefObject<number>;
  controlsRef: React.RefObject<any>;
}) {
  useFrame(() => {
    const delta = zoomDeltaRef.current ?? 0;
    if (Math.abs(delta) < 0.001 || !controlsRef.current) return;
    (zoomDeltaRef as React.MutableRefObject<number>).current = 0;

    const controls = controlsRef.current;
    const target = controls.target.clone() as THREE.Vector3;
    const dir = controls.object.position.clone().sub(target);
    const currentDist = dir.length();
    const newDist = Math.max(
      controls.minDistance,
      Math.min(controls.maxDistance, currentDist * (1 - delta * 2))
    );
    controls.object.position.copy(target.add(dir.normalize().multiplyScalar(newDist)));
    controls.update();
  });
  return null;
}

// 가구 박스 컴포넌트
interface FurnitureBoxProps {
  furniture: LoadedFurniture;
  placement: PlacedBox;
  visible: boolean;
  dimmed?: boolean;
}

const FurnitureBox: React.FC<FurnitureBoxProps> = ({ furniture, placement, visible, dimmed = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const hasAppeared = useRef(false);

  // 배치 위치 (cm → m)
  const targetX = placement.x / 100;
  const targetY = placement.y / 100 + furniture.height / 2;
  const targetZ = placement.z / 100;

  const rotationY = placement.orientation === Orientation.WLH ? Math.PI / 2 : 0;

  useLayoutEffect(() => {
    if (visible && groupRef.current && !hasAppeared.current) {
      groupRef.current.position.y = targetY + 1.5;
    }
  }, [visible, targetY]);

  useEffect(() => {
    if (visible && groupRef.current) {
      const isFirstAppearance = !hasAppeared.current;
      let startY = targetY;

      if (isFirstAppearance) {
        startY = targetY + 1.5;
        groupRef.current.position.y = startY;
        hasAppeared.current = true;
      } else {
        startY = groupRef.current.position.y;
      }

      if (Math.abs(startY - targetY) < 0.005) {
        groupRef.current.position.y = targetY;
        return;
      }

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
          if (groupRef.current) groupRef.current.position.y = targetY;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [visible, targetY]);

  if (!visible) return null;

  return (
    <group
      ref={groupRef}
      position-x={targetX}
      position-z={targetZ}
      rotation={[0, rotationY, 0]}
    >
      <mesh geometry={furniture.geometry}>
        <meshStandardMaterial
          color={dimmed ? '#999999' : furniture.color}
          transparent
          opacity={dimmed ? 0.15 : 0.85}
        />
      </mesh>
      <lineSegments geometry={furniture.edgesGeometry}>
        <lineBasicMaterial color={dimmed ? '#aaaaaa' : '#333333'} transparent opacity={dimmed ? 0.1 : 0.4} />
      </lineSegments>
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

// 멀티 트럭 씬 (모든 트럭 항상 렌더링, visibleItemIds로 가시성 제어)
interface MultiTruckSceneProps {
  trucks: TruckPlacement[];
  visibleItemIds: Set<string>;
  loadedFurniture: Map<string, LoadedFurniture>;
  resetKey: number;
  highlightedFurnitureIds?: Set<string> | null;
}

const MultiTruckScene: React.FC<MultiTruckSceneProps> = ({
  trucks,
  visibleItemIds,
  loadedFurniture,
  resetKey,
  highlightedFurnitureIds,
}) => {
  return (
    <group>
      {trucks.map((truck, truckIdx) => {
        const xOffset = calculateTruckXOffset(trucks, truckIdx);

        return (
          <group key={truckIdx} position={[xOffset, 0, 0]}>
            <TruckContainer truckType={truck.type as TruckType} />
            {truck.placements.map((placement) => {
              const baseId = extractBaseId(placement.itemId);
              const furniture = loadedFurniture.get(baseId);
              if (!furniture) return null;

              const dimmed = !!highlightedFurnitureIds && !highlightedFurnitureIds.has(baseId);
              return (
                <FurnitureBox
                  key={`${resetKey}-${truckIdx}-${placement.itemId}`}
                  furniture={furniture}
                  placement={placement}
                  visible={visibleItemIds.has(placement.itemId)}
                  dimmed={dimmed}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

export interface Space3DHandle {
  play: () => void;
}

const Space3D = forwardRef<Space3DHandle, Space3DProps>(({
  furniture,
  truckType,
  autoPlay = false,
  instantResult = false,
  cameraDistanceMultiplier = 1.0,
  highlightedFurnitureIds,
  onAnimationComplete,
  onTrucksChange,
}, ref) => {
  const [loadedFurniture, setLoadedFurniture] = useState<Map<string, LoadedFurniture>>(new Map());
  const [trucks, setTrucks] = useState<TruckPlacement[]>([]);
  const [currentTruckIndex, setCurrentTruckIndex] = useState(0);
  const [visibleItemIds, setVisibleItemIds] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [packingMessage, setPackingMessage] = useState('');
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const simulationStateRef = useRef<'idle' | 'running' | 'completed'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 핀치 줌용 refs
  const orbitControlsRef = useRef<any>(null);
  const zoomDeltaRef = useRef<number>(0);
  const lastPinchDistRef = useRef<number | null>(null);

  const pinchResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gs) => gs.numberActiveTouches === 2,
      onMoveShouldSetPanResponder: (_, gs) => gs.numberActiveTouches === 2,
      onPanResponderGrant: () => { lastPinchDistRef.current = null; },
      onPanResponderMove: (e) => {
        const touches = e.nativeEvent.touches;
        if (touches.length !== 2) return;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDistRef.current != null) {
          zoomDeltaRef.current += (dist - lastPinchDistRef.current) / 200;
        }
        lastPinchDistRef.current = dist;
      },
      onPanResponderRelease: () => { lastPinchDistRef.current = null; },
      onPanResponderTerminate: () => { lastPinchDistRef.current = null; },
    })
  ).current;

  // 점진적 업데이트용 refs
  const pendingItemsRef = useRef<{ itemId: string; truckIdx: number }[]>([]);
  const prevTrucksRef = useRef<{ types: string; count: number }>({
    types: '',
    count: 0,
  });

  // scheduleNext 함수 ref (순환 의존성 방지)
  const scheduleNextRef = useRef<() => void>(() => {});

  const hasSimulation = furniture && furniture.length > 0;
  const currentTruck = trucks[currentTruckIndex];
  const currentTruckType = currentTruck?.type || truckType || '2.5ton';

  // 1. 가구 치수(m)로 BoxGeometry 생성
  useEffect(() => {
    if (!furniture || furniture.length === 0) {
      setLoadedFurniture(new Map());
      return;
    }

    const loaded = new Map<string, LoadedFurniture>();
    furniture.forEach((f) => {
      const id = String(f.furnitureId);
      const w = Math.max(f.width / 1000, 0.001);  // mm → m
      const d = Math.max(f.depth / 1000, 0.001);
      const h = Math.max(f.height / 1000, 0.001);
      loaded.set(id, {
        id,
        color: generateColor(f.label),
        geometry: new THREE.BoxGeometry(w, h, d),
        edgesGeometry: new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
        width: w,
        depth: d,
        height: h,
      });
    });

    setLoadedFurniture(loaded);
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

    const packT0 = performance.now();
    console.log(`[Packing] 시작 | 아이템: ${items.length}개`);

    let newTrucks: TruckPlacement[];
    let newMessage: string;

    if (truckType) {
      const result = optimizeOBB(items, truckType);
      console.log(`[Packing] 단일 트럭 완료 | ${(performance.now() - packT0).toFixed(0)}ms`);

      newTrucks = [{
        type: truckType,
        placements: result.placedItems,
        utilization: result.volumeUtilization,
      }];
      newMessage = result.message;
    } else {
      // 트럭 타입 미지정 → 멀티트럭 자동 최적화
      const result = packMultiTruck(items);
      console.log(`[Packing] 멀티트럭 완료 | ${result.trucks.length}대 | ${(performance.now() - packT0).toFixed(0)}ms`);

      newTrucks = result.trucks;
      newMessage = result.message;
    }

    // 이전 트럭 구성과 비교
    const newTruckTypes = newTrucks.map(t => t.type).join(',');
    const newTruckCount = newTrucks.length;
    const prevTypes = prevTrucksRef.current.types;
    const prevCount = prevTrucksRef.current.count;

    const isSameTruckConfig = (prevTypes === newTruckTypes && prevCount === newTruckCount);

    // 새 아이템 ID Set
    const newAllItemIds = new Set<string>();
    newTrucks.forEach(t => t.placements.forEach(p => newAllItemIds.add(p.itemId)));

    setTrucks(newTrucks);
    setPackingMessage(newMessage);

    if (instantResult) {
      // 즉시 결과 표시 — 애니메이션 없이 모든 아이템 한 번에 표시
      setVisibleItemIds(newAllItemIds);
      setSimulationState('completed');
      simulationStateRef.current = 'completed';
      onAnimationComplete?.();
      return;
    }

    if (!isSameTruckConfig) {
      // 트럭 구성 변경 → 전체 초기화
      console.log('[시뮬레이션] 트럭 구성 변경 → 전체 초기화');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setCurrentTruckIndex(0);
      setVisibleItemIds(new Set());
      setResetKey(k => k + 1);
      pendingItemsRef.current = [];
      setIsPlaying(false);
      setSimulationState('idle');
      simulationStateRef.current = 'idle';
    } else {
      // 트럭 구성 동일 → 점진적 업데이트
      setVisibleItemIds(prev => {
        // 삭제된 아이템 제거
        const updated = new Set<string>();
        prev.forEach(id => {
          if (newAllItemIds.has(id)) {
            updated.add(id);
          }
        });

        // 새 아이템 찾기 (pending에 추가)
        const newPending: { itemId: string; truckIdx: number }[] = [];
        newTrucks.forEach((truck, truckIdx) => {
          truck.placements.forEach(p => {
            if (!updated.has(p.itemId)) {
              newPending.push({ itemId: p.itemId, truckIdx });
            }
          });
        });

        if (newPending.length > 0 &&
            (simulationStateRef.current === 'running' || simulationStateRef.current === 'completed')) {
          // 카메라 이동 없이 새 아이템만 순차 visible 처리
          console.log(`[시뮬레이션] 점진적 업데이트: ${newPending.length}개 새 아이템 (카메라 유지)`);
          newPending.forEach((item, idx) => {
            setTimeout(() => {
              setVisibleItemIds(prev => {
                const next = new Set(prev);
                next.add(item.itemId);
                return next;
              });
            }, idx * 200);
          });
        }

        return updated;
      });
    }

    prevTrucksRef.current = { types: newTruckTypes, count: newTruckCount };
  }, [loadedFurniture, truckType, furniture, instantResult]);

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

  useEffect(() => {
    return () => {
      loadedFurniture.forEach((item) => {
        try {
          item.geometry.dispose();
          item.edgesGeometry.dispose();
        } catch (_) {}
      });
    };
  }, [loadedFurniture]);

  // autoPlay 처리: 데이터 준비 완료 시 자동 재생
  useEffect(() => {
    // simulationState가 idle이고 visible 아이템이 없을 때만 자동 재생
    if (autoPlay && trucks.length > 0 && !isPlaying && visibleItemIds.size === 0 && simulationState === 'idle') {
      play();
    }
  }, [autoPlay, trucks.length, visibleItemIds.size, simulationState]);

  // 최신 값을 참조하기 위한 ref
  const trucksRef = useRef(trucks);
  const currentTruckIndexRef = useRef(currentTruckIndex);

  useEffect(() => {
    trucksRef.current = trucks;
  }, [trucks]);

  useEffect(() => {
    currentTruckIndexRef.current = currentTruckIndex;
  }, [currentTruckIndex]);

  // 순차 애니메이션: pendingItemsRef에서 하나씩 꺼내 visibleItemIds에 추가
  const scheduleNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const pending = pendingItemsRef.current;

      if (pending.length === 0) {
        // 모든 pending 완료
        setIsPlaying(false);
        setSimulationState('completed');
        simulationStateRef.current = 'completed';
        onAnimationComplete?.();
        return;
      }

      // 다음 아이템 꺼내기
      const nextItem = pending.shift()!;
      const currentIdx = currentTruckIndexRef.current;

      // 트럭 전환이 필요한 경우
      if (nextItem.truckIdx !== currentIdx) {
        // 이 아이템을 다시 앞에 넣고 트럭 전환 후 재개
        pending.unshift(nextItem);

        timerRef.current = setTimeout(() => {
          setCurrentTruckIndex(nextItem.truckIdx);
          timerRef.current = setTimeout(() => scheduleNext(), 800); // 카메라 이동 대기
        }, 500);
        return;
      }

      // 아이템 visible 처리
      setVisibleItemIds(prev => {
        const next = new Set(prev);
        next.add(nextItem.itemId);
        return next;
      });

      // 다음 아이템 스케줄
      scheduleNext();
    }, 200);
  }, [onAnimationComplete]);

  // scheduleNext를 ref에 저장 (binPacking useEffect에서 사용)
  useEffect(() => {
    scheduleNextRef.current = scheduleNext;
  }, [scheduleNext]);

  const play = useCallback(() => {
    // 전체 초기화 → 처음부터 순차 애니메이션
    setCurrentTruckIndex(0);
    setVisibleItemIds(new Set());
    setResetKey(k => k + 1);
    setIsPlaying(true);
    setSimulationState('running');
    simulationStateRef.current = 'running';

    // 모든 아이템을 pending에 추가
    const allItems: { itemId: string; truckIdx: number }[] = [];
    trucks.forEach((truck, truckIdx) => {
      truck.placements.forEach(p => {
        allItems.push({ itemId: p.itemId, truckIdx });
      });
    });
    pendingItemsRef.current = allItems;

    // 약간의 딜레이 후 시작 (리셋 반영)
    setTimeout(() => {
      scheduleNext();
    }, 100);
  }, [scheduleNext, trucks]);

  useImperativeHandle(ref, () => ({ play }), [play]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTruckIndex(0);
    setVisibleItemIds(new Set());
    setResetKey(k => k + 1);
    setSimulationState('idle');
    simulationStateRef.current = 'idle';
    pendingItemsRef.current = [];
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

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
    let distance = maxDim * cameraDistanceMultiplier;
    if (trucks.length > 1) {
      // 전체 트럭 배치의 너비 계산
      const totalWidth = calculateTruckXOffset(trucks, trucks.length - 1) + dims.width / 2;
      distance = Math.max(distance, totalWidth * 1.2);
    }

    return [distance, distance * 0.8, distance];
  }, [hasSimulation, currentTruckType, trucks, cameraDistanceMultiplier]);

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
    <View style={styles.canvasContainer} {...pinchResponder.panHandlers}>
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
            visibleItemIds={visibleItemIds}
            loadedFurniture={loadedFurniture}
            resetKey={resetKey}
            highlightedFurnitureIds={highlightedFurnitureIds}
          />
        ) : (
          <TruckContainer truckType="2.5ton" />
        )}

        <PinchZoomController zoomDeltaRef={zoomDeltaRef} controlsRef={orbitControlsRef} />
        <AnimatedControls
          truckType={hasSimulation ? currentTruckType as TruckType : undefined}
          targetPosition={containerCenter}
          controlsRef={orbitControlsRef}
        />
      </Canvas>

      {/* 컨트롤 UI */}
      {hasSimulation && trucks.length === 0 && (
        <View style={styles.controlsOverlay}>
          <Text style={styles.loadingText}>배치 계산 중...</Text>
        </View>
      )}
      {hasSimulation && simulationState === 'running' && (
        <View style={styles.controlsOverlay}>
          <Text style={styles.loadingText}>적재 중...</Text>
        </View>
      )}
    </View>
  );
});

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
