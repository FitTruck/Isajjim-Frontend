/**
 * 멀티 트럭 선택 로직
 *
 * 모든 아이템을 배치할 수 있는 최소 트럭 조합 선택
 * - 단일 트럭 시도: 1ton → 2.5ton → 5ton (작은 것부터)
 * - 멀티 트럭: 5ton으로 최대한 채우고, 나머지는 1ton → 2.5ton → 5ton 순으로
 * - 우선순위: 1t → 2.5t → 5t → 5t+1t → 5t+2.5t → 5t+5t → 5t+5t+1t → ...
 */

import { OBBItem, MultiTruckResult, TruckPlacement, PackingOptions } from './types';
import { TRUCK_PRESETS, TRUCK_ORDER, DEFAULT_SUPPORT_RATIO } from './constants';
import { extremePointsPack } from './packer';

/**
 * 트럭에 아이템을 배치하고 결과 반환
 */
function packIntoTruck(
  items: OBBItem[],
  truckType: string,
  options: { supportRatio: number; cornerFirst: boolean }
): TruckPlacement | null {
  const truckDims = TRUCK_PRESETS[truckType];
  const result = extremePointsPack(items, truckDims, options);

  if (result.placedItems.length === 0) {
    return null;
  }

  const truckVolume = truckDims.width * truckDims.depth * truckDims.height;
  const placedVolume = result.placedItems.reduce(
    (sum, p) => sum + p.width * p.depth * p.height,
    0
  );
  const utilization = truckVolume > 0 ? (placedVolume / truckVolume) * 100 : 0;

  return {
    type: truckType,
    placements: result.placedItems,
    utilization: Math.round(utilization * 10) / 10,
  };
}

/**
 * 모든 아이템을 배치할 수 있는 최소 트럭 조합 선택
 *
 * 우선순위:
 * 1. 트럭 대수 최소화
 * 2. 같은 대수면 5ton으로 최대한 채우고 나머지는 작은 트럭으로
 */
export function selectTrucksForAllItems(
  items: OBBItem[],
  options: PackingOptions = {}
): MultiTruckResult {
  const { supportRatio = DEFAULT_SUPPORT_RATIO, cornerFirst = true } = options;
  const packOptions = { supportRatio, cornerFirst };

  // 1. 단일 트럭 시도 (작은 것부터: 1ton → 2.5ton → 5ton)
  for (const truckType of TRUCK_ORDER) {
    const truckDims = TRUCK_PRESETS[truckType];
    const result = extremePointsPack(items, truckDims, packOptions);

    if (result.success) {
      const truckVolume = truckDims.width * truckDims.depth * truckDims.height;
      const placedVolume = result.placedItems.reduce(
        (sum, p) => sum + p.width * p.depth * p.height,
        0
      );
      const utilization = truckVolume > 0 ? (placedVolume / truckVolume) * 100 : 0;

      return {
        success: true,
        trucks: [
          {
            type: truckType,
            placements: result.placedItems,
            utilization: Math.round(utilization * 10) / 10,
          },
        ],
        totalTrucks: 1,
        unplacedItems: [],
        message: `1대 트럭 사용: ${truckType}`,
      };
    }
  }

  // 2. 멀티 트럭: 먼저 5ton으로 채우고, 남은 아이템에 대해서만 작은 트럭 체크
  const trucksResult: TruckPlacement[] = [];
  let remainingItems = [...items];

  while (remainingItems.length > 0) {
    // 5ton으로 최대한 채우기 (먼저 실행)
    const fiveTonPlacement = packIntoTruck(remainingItems, '5ton', packOptions);

    if (!fiveTonPlacement || fiveTonPlacement.placements.length === 0) {
      // 5ton에도 아무것도 못 넣음 - 실패
      break;
    }

    trucksResult.push(fiveTonPlacement);

    // 배치된 아이템 제거
    const placedIds = new Set(fiveTonPlacement.placements.map((p) => p.itemId));
    remainingItems = remainingItems.filter((item) => !placedIds.has(item.id));

    // 남은 아이템이 작은 트럭에 전부 들어가는지 확인 (마지막 트럭 최적화)
    if (remainingItems.length > 0) {
      for (const truckType of TRUCK_ORDER) {
        const truckDims = TRUCK_PRESETS[truckType];
        const result = extremePointsPack(remainingItems, truckDims, packOptions);

        if (result.success) {
          // 모든 남은 아이템이 이 트럭에 들어감
          const placement = packIntoTruck(remainingItems, truckType, packOptions);
          if (placement) {
            trucksResult.push(placement);
            remainingItems = [];
            break;
          }
        }
      }
    }
  }

  // 결과 메시지 생성
  const truckNames = trucksResult.map((t) => t.type);
  const message = `${trucksResult.length}대 트럭 사용: ${truckNames.join(' + ')}`;

  const unplacedIds = remainingItems.map((item) => item.id);

  return {
    success: unplacedIds.length === 0,
    trucks: trucksResult,
    totalTrucks: trucksResult.length,
    unplacedItems: unplacedIds,
    message,
  };
}

/**
 * 멀티 트럭 OBB 최적화 메인 함수
 *
 * 자동으로 최소 트럭 조합을 선택하여 모든 아이템을 배치합니다.
 */
export function optimizeOBBMulti(items: OBBItem[], options: PackingOptions = {}): MultiTruckResult {
  return selectTrucksForAllItems(items, options);
}
