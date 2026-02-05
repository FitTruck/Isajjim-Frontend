# 이삿짐 3D Bin Packing 알고리즘

이 문서는 이삿짐 적재 최적화 알고리즘의 기술적 배경과 독창적 구현을 설명합니다.

---

## 1. 논문 기반 알고리즘 (Extreme Points)

### 참고 논문

> **Crainic, T.G., Perboli, G., & Tadei, R. (2008)**
> *"Extreme Point-Based Heuristics for Three-Dimensional Bin Packing"*
> INFORMS Journal on Computing, 20(3), 368-384
> https://doi.org/10.1287/ijoc.1070.0250

### 핵심 개념

**Extreme Points (EP)**는 3D 공간에서 새로운 박스를 배치할 수 있는 후보 위치를 효율적으로 관리하는 휴리스틱입니다.

```
박스 배치 후 3개의 새 EP 생성:

        ┌─────────┐
        │         │ ← EP3 (+Y, 위쪽)
        │  박스   │
        └─────────┘──→ EP1 (+X, 오른쪽)
              │
              ▼
           EP2 (+Z, 앞쪽)
```

### 논문에서 차용한 요소

| 요소 | 설명 | 구현 위치 |
|------|------|-----------|
| EP 생성 규칙 | 배치된 박스의 +X, +Y, +Z 방향에 새 EP 생성 | `packer.ts:generateNewExtremePoints()` |
| EP 유효성 검사 | 다른 박스 내부에 있는 EP 제거 | `packer.ts:isEPValid()` |
| EP 우선순위 | 특정 축 순서로 정렬하여 배치 순서 결정 | `packer.ts:compareExtremePoints()` |
| 부피 순 정렬 | 큰 아이템부터 배치하여 공간 활용 최적화 | `packer.ts:extremePointsPack()` |

---

## 2. 독창적 구현 (이삿짐 도메인 특화)

### 2.1 Configurable 지지 규칙 (70% Support)

**문제**: 표준 EP 알고리즘은 물리적 안정성을 고려하지 않아 공중에 떠 있는 배치가 발생할 수 있음

**해결**: 바닥 면적의 70% 이상이 아래 박스에 의해 지지되어야 배치 허용

```typescript
// support.ts
export function checkSupport(
  x, y, z, w, d, placedBoxes,
  minRatio = 0.7  // 기본값 70%
): boolean {
  // 바닥 배치는 항상 허용
  if (y < FLOOR_THRESHOLD) return true;

  // 아래 박스들과의 겹침 면적 계산
  let supportedArea = 0;
  for (const box of placedBoxes) {
    if (Math.abs(box.y + box.height - y) < TOLERANCE) {
      supportedArea += calculate2DOverlap(x, z, w, d, box);
    }
  }

  return (supportedArea / (w * d)) >= minRatio;
}
```

**특징**:
- `supportRatio` 옵션으로 조절 가능 (0.0 ~ 1.0)
- 100%보다 낮은 70%를 기본값으로 사용하여 실용성과 안정성 균형
- 실제 이사 시 약간의 오버행은 허용되는 점 반영

```
        ┌─────────────┐
        │   새 박스    │  ← 바닥 면적의 70% 이상이
        └─────────────┘     아래 박스에 의해 지지되어야 함
              │
    ══════════╪══════════
    │ 아래 박스 (지지면) │
    ══════════════════════
```

---

### 2.2 가구 특화 회전 제약 (2-Orientation)

**문제**: 표준 EP는 6방향 회전을 허용하지만, 가구를 눕히면 파손 위험

**해결**: 수평 회전만 허용 (높이 축 고정)

```typescript
// types.ts
export enum Orientation {
  LWH = 0,  // 기본 방향: (width, depth, height)
  WLH = 2,  // 90도 수평 회전: (depth, width, height)
  // LHW, WHL, HLW, HWL은 사용하지 않음 (가구 전복 방지)
}

// packer.ts
const orientations = [Orientation.LWH, Orientation.WLH];
```

**비교**:
| 회전 방식 | 방향 수 | 적용 대상 |
|-----------|---------|-----------|
| 표준 EP | 6방향 | 균일한 박스 (택배 등) |
| **본 구현** | **2방향** | **가구 (전복 방지)** |

---

### 2.3 자연스러운 방향 우선 배치 (Natural Orientation)

**문제**: 같은 점수의 배치가 여러 개일 때 어떤 방향을 선택할지 기준 필요

**해결**: `depth >= width`인 방향을 선호하여 가구가 자연스럽게 보이도록 배치

```typescript
// packer.ts:findBestPlacement()
// 점수 계산 (낮을수록 우선)
const natural = d >= w ? 0 : 1;  // 자연스러운 방향이면 0점
const score: [number, number, number, number] = [
  cz,      // 1순위: Z (뒤쪽부터)
  cx,      // 2순위: X (왼쪽부터)
  cy,      // 3순위: Y (아래쪽부터)
  natural  // 4순위: 자연스러운 방향
];
```

**예시**:
```
소파 (200cm x 90cm x 85cm)

[자연스러운 배치]        [부자연스러운 배치]
 ┌──────────────┐         ┌────┐
 │              │         │    │
 │    소파      │   vs    │소파│
 │              │         │    │
 └──────────────┘         │    │
  depth(200) > width(90)  └────┘
       ✓ 선호              ✗ 비선호
```

---

### 2.4 Corner-First 배치 전략

**문제**: EP 기반 배치는 최적 위치를 찾지만, 첫 아이템 위치가 불안정할 수 있음

**해결**: 첫 번째 아이템을 트럭 뒤쪽-왼쪽 코너에 강제 배치

```typescript
// packer.ts:extremePointsPack()
let cornerPhaseDone = !cornerFirst;

for (const item of sortedItems) {
  // Phase 1: Corner-first 배치 (첫 아이템만)
  if (!cornerPhaseDone) {
    const cornerResult = tryCornerPlacement(item, placed, truckW, truckD, truckH);
    if (cornerResult) {
      // 뒤쪽-왼쪽 코너에 배치
      cornerPhaseDone = true;
      continue;
    }
  }

  // Phase 2: EP 기반 일반 배치
  findBestPlacement(item, extremePoints, ...);
}
```

**효과**:
```
    ┌──────────────────────────────────┐
    │                                  │
    │                                  │
    │                                  │
    │ ┌────────┐                       │
    │ │ 첫번째 │  ← Corner-first       │
    │ │  박스  │     (뒤쪽-왼쪽)        │
    └─┴────────┴───────────────────────┘
      ↑
    트럭 뒤쪽 (운전석 반대편)
```

- 실제 이사 시 큰 가구를 먼저 구석에 배치하는 관행 반영
- 공간 활용 극대화 및 안정적인 초기 배치

---

### 2.5 멀티 트럭 자동 최적화

**문제**: 표준 EP는 단일 컨테이너만 고려, 실제 이사는 여러 트럭이 필요할 수 있음

**해결**: 자동 트럭 조합 선택 + 마지막 트럭 다운사이징

```typescript
// packer.ts:packMultiTruck()
export function packMultiTruck(items: OBBItem[]): MultiTruckResult {
  // 1단계: 단일 트럭 시도 (작은 것부터)
  for (const truckType of ['1ton', '2.5ton', '5ton']) {
    const result = extremePointsPack(items, TRUCK_PRESETS[truckType]);
    if (result.success) {
      return { trucks: [{ type: truckType, ... }], ... };
    }
  }

  // 2단계: 멀티 트럭 모드 (5톤 우선 채우기)
  const trucks = [];
  let remainingItems = [...items];

  while (remainingItems.length > 0) {
    // 5톤으로 최대한 채우기
    const fiveTonResult = extremePointsPack(remainingItems, TRUCK_PRESETS['5ton']);
    trucks.push({ type: '5ton', placements: fiveTonResult.placedItems });

    // 배치된 아이템 제거
    remainingItems = remainingItems.filter(item => !placed.has(item.id));

    // 3단계: 마지막 트럭 다운사이징
    if (remainingItems.length > 0) {
      for (const smallerTruck of ['1ton', '2.5ton', '5ton']) {
        if (canFitAll(remainingItems, smallerTruck)) {
          trucks.push({ type: smallerTruck, ... });
          remainingItems = [];
          break;
        }
      }
    }
  }

  return { trucks, ... };
}
```

**알고리즘 흐름**:
```
┌─────────────────────────────────────────────────────────┐
│                    멀티 트럭 선택 흐름                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 단일 트럭 시도 (1ton → 2.5ton → 5ton)               │
│     │                                                   │
│     ├─ 성공 → 해당 트럭 1대 반환 (비용 최소화)          │
│     │                                                   │
│     └─ 실패 → 멀티 트럭 모드                            │
│                                                         │
│  2. 멀티 트럭 모드                                      │
│     │                                                   │
│     ├─ 5ton 트럭으로 최대한 적재                        │
│     │                                                   │
│     ├─ 남은 아이템 → 최적 트럭 선택 (다운사이징)        │
│     │                                                   │
│     └─ 반복 (미배치 아이템이 없을 때까지)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**예시**:
```
입력: 가구 20개 (총 부피 25m³)

시도 1: 1톤 (8.1m³) → 실패
시도 2: 2.5톤 (16.3m³) → 실패
시도 3: 5톤 (34.2m³) → 실패 (일부 미배치)

멀티 트럭 모드:
  - 5톤 #1: 18개 배치 (적재율 78%)
  - 남은 2개 → 1톤으로 충분 → 1톤 선택 (다운사이징)

결과: 5톤 1대 + 1톤 1대 (2.5톤 대신 1톤 선택으로 비용 절감)
```

---

## 3. EP 우선순위 커스터마이징 (Z → X → Y)

**표준 EP**: 다양한 우선순위 가능 (논문에서 여러 변형 제시)

**본 구현**: `Z → X → Y` 순서로 고정

```typescript
// packer.ts:compareExtremePoints()
function compareExtremePoints(a: ExtremePoint, b: ExtremePoint): number {
  if (a.z !== b.z) return a.z - b.z;  // 1순위: Z (뒤쪽부터)
  if (a.x !== b.x) return a.x - b.x;  // 2순위: X (왼쪽부터)
  return a.y - b.y;                    // 3순위: Y (아래쪽부터)
}
```

**이유**:
- **Z 우선**: 트럭 뒤쪽(운전석 반대편)부터 채워서 하차 시 편의성
- **X 우선**: 왼쪽부터 채워서 균형 유지
- **Y 우선**: 아래쪽부터 채워서 안정성 확보

```
트럭 적재 순서:
    ┌─────────────────────┐
    │ 7   8   9           │  ← 나중에 적재
    │ 4   5   6           │
    │ 1   2   3           │  ← 먼저 적재 (뒤쪽-왼쪽-아래)
    └─────────────────────┘
      ↑ 트럭 뒤쪽
```

---

## 4. 구현 요약

| 구분 | 표준 EP (논문) | 본 구현 (이삿짐 특화) |
|------|----------------|----------------------|
| 지지 검사 | 없음 | **70% 지지 규칙** |
| 회전 | 6방향 | **2방향 (수평만)** |
| 방향 선호 | 없음 | **자연스러운 방향 우선** |
| 첫 배치 | EP 기반 | **Corner-First** |
| 컨테이너 | 단일 | **멀티 트럭 자동 최적화** |
| EP 우선순위 | 다양 | **Z→X→Y (고정)** |

---

## 5. 파일 매핑

| 독창적 구현 | 파일 | 함수/상수 |
|-------------|------|-----------|
| 70% 지지 규칙 | `support.ts` | `checkSupport()`, `DEFAULT_SUPPORT_RATIO` |
| 2방향 회전 | `types.ts`, `packer.ts` | `Orientation`, `getRotatedDims()` |
| 자연스러운 방향 | `packer.ts` | `findBestPlacement()` 내 score 계산 |
| Corner-First | `packer.ts` | `tryCornerPlacement()`, `cornerFirst` 옵션 |
| 멀티 트럭 | `packer.ts` | `packMultiTruck()` |
| EP 우선순위 | `packer.ts` | `compareExtremePoints()` |
