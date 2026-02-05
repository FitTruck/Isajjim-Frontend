# 3D Bin Packing 적재 알고리즘

이삿짐 트럭 적재 최적화를 위한 3D Bin Packing 라이브러리.
Python `obb_packer.py`의 Extreme Points 알고리즘을 TypeScript로 변환.

> **알고리즘 상세 문서**: 논문 기반 알고리즘과 독창적 구현에 대한 자세한 설명은 [ALGORITHM.md](./ALGORITHM.md)를 참조하세요.

## 목차

1. [시스템 개요](#시스템-개요)
2. [알고리즘 상세](#알고리즘-상세)
3. [파일 구조](#파일-구조)
4. [API 레퍼런스](#api-레퍼런스)
5. [사용 예시](#사용-예시)
6. [좌표계](#좌표계)

---

## 시스템 개요

### 핵심 기능

- **Extreme Points (EP) 알고리즘**: 3D 공간에서 최적 배치 위치 탐색
- **70% 지지 규칙**: 공중 배치 방지 (바닥 면적의 70% 이상 지지 필요)
- **멀티 트럭 지원**: 단일 트럭 초과 시 자동으로 추가 트럭 할당
- **자동 트럭 선택**: 가장 작은 적합 트럭 자동 선택 (1ton → 2.5ton → 5ton)

### 트럭 규격 (cm)

| 트럭 타입 | 너비(W) | 깊이(D) | 높이(H) | 용량 |
|----------|---------|---------|---------|------|
| 1ton     | 170     | 280     | 170     | 8.1m³ |
| 2.5ton   | 200     | 430     | 190     | 16.3m³ |
| 5ton     | 230     | 620     | 240     | 34.2m³ |

---

## 알고리즘 상세

### 1. Extreme Points (EP) 알고리즘

박스 배치 후 새로운 배치 후보 위치(EP)를 생성하는 휴리스틱 알고리즘.

```
                    ┌─────────────────────┐
                    │     트럭 적재함      │
                    │                     │
    ┌───────┐       │   EP3 (+Y, 위쪽)    │
    │ 박스  │───────┼──────►              │
    │       │       │                     │
    └───────┘       │   EP1 (+X, 오른쪽)  │
        │           │───────►             │
        ▼           │                     │
    EP2 (+Z, 앞쪽)  │                     │
                    └─────────────────────┘
```

#### EP 생성 규칙

박스 배치 후 3개의 새 EP 생성:
- **EP1**: 박스 오른쪽 (+X 방향)
- **EP2**: 박스 앞쪽 (+Z 방향)
- **EP3**: 박스 위쪽 (+Y 방향)

#### EP 우선순위 (점수 계산)

낮을수록 우선 배치: `Z → X → Y` 순서

1. **Z 좌표** (뒤쪽부터)
2. **X 좌표** (왼쪽부터)
3. **Y 좌표** (아래쪽부터)
4. **자연스러운 방향** (depth >= width)

### 2. 70% 지지 규칙

공중에 떠 있는 배치를 방지하기 위한 물리적 안정성 검사.

```
        ┌─────────────┐
        │   새 박스    │  ← 바닥 면적의 70% 이상이
        └─────────────┘     아래 박스에 의해 지지되어야 함
              │
    ══════════╪══════════
    │ 아래 박스 (지지면) │
    ══════════════════════
```

#### 검사 로직

```typescript
// 바닥 배치 (y = 0): 항상 지지됨
// 공중 배치 (y > 0): 아래 박스들의 윗면과 70% 이상 겹쳐야 함

supportRatio = (지지 면적) / (바닥 면적)
isSupported = supportRatio >= 0.7
```

### 3. 회전 (Orientation)

수평 회전만 허용 (가구 전복 방지):

| Orientation | 설명 | 변환 |
|-------------|------|------|
| `LWH (0)` | 기본 방향 | (width, depth, height) |
| `WLH (2)` | 90도 수평 회전 | (depth, width, height) |

### 4. Corner-First 배치

첫 번째 아이템을 트럭 뒤쪽-왼쪽 코너에 배치하여 공간 활용 최적화.

```
    ┌──────────────────────────────────┐
    │                                  │
    │                                  │
    │                                  │
    │                                  │
    │ ┌────────┐                       │
    │ │ 첫번째 │  ← Corner-first      │
    │ │  박스  │     (뒤쪽-왼쪽)       │
    └─┴────────┴───────────────────────┘
      ↑
    트럭 뒤쪽
```

### 5. 멀티 트럭 알고리즘

```
┌─────────────────────────────────────────────────────────┐
│                    멀티 트럭 선택 흐름                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 단일 트럭 시도 (1ton → 2.5ton → 5ton)               │
│     │                                                   │
│     ├─ 성공 → 해당 트럭 1대 반환                        │
│     │                                                   │
│     └─ 실패 → 멀티 트럭 모드                            │
│                                                         │
│  2. 멀티 트럭 모드                                      │
│     │                                                   │
│     ├─ 5ton 트럭으로 최대한 적재                        │
│     │                                                   │
│     ├─ 남은 아이템 → 최적 트럭 선택 (적재율 기준)       │
│     │                                                   │
│     └─ 반복 (미배치 아이템이 없을 때까지)               │
│                                                         │
│  3. 마지막 트럭 최적화                                  │
│     │                                                   │
│     └─ 적재율이 낮으면 더 작은 트럭으로 교체 시도       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 파일 구조

```
src/binPacking/
├── index.ts           # 모듈 진입점 (exports)
├── types.ts           # TypeScript 타입 정의
├── constants.ts       # 트럭 규격, 상수
├── packer.ts          # EP 알고리즘 메인 로직
├── support.ts         # 지지 규칙, 충돌/경계 검사
├── multiTruck.ts      # 멀티 트럭 선택 로직
├── server.ts          # Express 시각화 서버
├── data/
│   ├── index.ts            # 데이터 모듈 exports
│   ├── sampleFurniture.ts  # 샘플 가구 데이터
│   └── serverConstants.ts  # 서버용 트럭 규격 (m 단위)
├── __tests__/
│   └── packer.test.ts      # Jest 단위 테스트
├── ALGORITHM.md       # 알고리즘 상세 문서
└── README.md          # 이 문서
```

### 파일별 역할

| 파일 | 역할 | 주요 함수/타입 |
|------|------|----------|
| `index.ts` | 모듈 exports | - |
| `types.ts` | 타입 정의 | `OBBItem`, `PlacedBox`, `PackingResult` |
| `constants.ts` | 상수 정의 | `TRUCK_PRESETS`, `TRUCK_ORDER` |
| `packer.ts` | 핵심 알고리즘 | `extremePointsPack()`, `optimizeOBB()`, `packMultiTruck()` |
| `support.ts` | 물리 검사 | `checkSupport()`, `checkOverlap()`, `checkBoundary()` |
| `multiTruck.ts` | 멀티 트럭 | `selectTrucksForAllItems()`, `optimizeOBBMulti()` |
| `server.ts` | 시각화 서버 | Express API 엔드포인트 |
| `data/` | 테스트 데이터 | `TRUCK_SPECS_M`, `getSampleFurniture()` |

---

## API 레퍼런스

### 주요 함수

#### `optimizeOBB(items, truckType?, options?)`

단일 트럭 패킹 (트럭 자동 선택 또는 지정)

```typescript
function optimizeOBB(
  items: OBBItem[],
  truckType?: string,        // '1ton' | '2.5ton' | '5ton' | undefined
  options?: PackingOptions
): PackingResult
```

#### `packMultiTruck(items, options?)`

멀티 트럭 패킹 (자동 최적 조합)

```typescript
function packMultiTruck(
  items: OBBItem[],
  options?: PackingOptions
): MultiTruckResult
```

#### `extremePointsPack(items, truckDims, options?)`

저수준 EP 알고리즘 직접 호출

```typescript
function extremePointsPack(
  items: OBBItem[],
  truckDims: TruckPreset,
  options?: PackingOptions
): PackingResult
```

### 타입 정의

#### `OBBItem` (입력)

```typescript
interface OBBItem {
  id: string;
  width: number;   // X축 (cm)
  depth: number;   // Z축 (cm)
  height: number;  // Y축 (cm)
}
```

#### `PlacedBox` (배치 결과)

```typescript
interface PlacedBox {
  itemId: string;
  x: number;           // 중심 X
  y: number;           // 바닥 Y
  z: number;           // 중심 Z
  width: number;       // 회전 적용된 너비
  depth: number;       // 회전 적용된 깊이
  height: number;      // 높이
  orientation: Orientation;
}
```

#### `PackingResult` (단일 트럭)

```typescript
interface PackingResult {
  success: boolean;
  truckType: string;
  placedItems: PlacedBox[];
  unplacedItems: string[];
  volumeUtilization: number;  // 적재율 (%)
  message: string;
}
```

#### `MultiTruckResult` (멀티 트럭)

```typescript
interface MultiTruckResult {
  success: boolean;
  trucks: TruckPlacement[];
  totalTrucks: number;
  unplacedItems: string[];
  message: string;
}

interface TruckPlacement {
  type: string;
  placements: PlacedBox[];
  utilization: number;
}
```

#### `PackingOptions`

```typescript
interface PackingOptions {
  supportRatio?: number;   // 지지 비율 (기본 0.7 = 70%)
  allowTilt?: boolean;     // 6방향 회전 (기본 false, 미구현)
  cornerFirst?: boolean;   // 코너 우선 배치 (기본 true)
}
```

---

## 사용 예시

### 기본 사용

```typescript
import { optimizeOBB, packMultiTruck } from '@/binPacking';

// 가구 목록 (cm 단위)
const items = [
  { id: 'sofa', width: 200, depth: 90, height: 85 },
  { id: 'table', width: 120, depth: 80, height: 75 },
  { id: 'chair_1', width: 50, depth: 50, height: 90 },
  { id: 'chair_2', width: 50, depth: 50, height: 90 },
];

// 1. 자동 트럭 선택 (가장 작은 적합 트럭)
const result = optimizeOBB(items);
console.log(result.truckType);       // '2.5ton'
console.log(result.volumeUtilization); // 45.2

// 2. 특정 트럭 지정
const result2 = optimizeOBB(items, '5ton');

// 3. 멀티 트럭 (모든 아이템 배치)
const multiResult = packMultiTruck(items);
console.log(multiResult.totalTrucks);  // 1
console.log(multiResult.trucks[0].type); // '2.5ton'
```

### Space3D와 연동

```typescript
// Result.tsx에서 사용
const simulationFurniture = results.flatMap(r =>
  r.contents.filter(c => c.ply_url).map(c => ({
    furnitureId: c.furnitureId,
    width: c.width,    // mm → cm 변환 필요 시 /10
    depth: c.depth,
    height: c.height,
    ply_url: c.ply_url,
  }))
);

// Space3D 컴포넌트가 내부적으로 binPacking 호출
<Space3D
  furniture={simulationFurniture}
  onTrucksChange={(trucks) => setSimulationTrucks(trucks)}
/>
```

---

## 좌표계

### 트럭 좌표계

트럭 중심이 원점 (0, 0, 0):

```
        Y (높이)
        │
        │     ┌───────────────┐
        │    /               /│
        │   /     트럭      / │
        │  /     적재함    /  │
        │ └───────────────┘   │
        │ │               │   │
        │ │    (0,0,0)    │  /
        │ │       ●───────┼─/───► X (좌우)
        │ │      /        │/
        │ └─────/─────────┘
        │      /
        │     /
        └────/─────────────────► Z (앞뒤)
```

### 좌표 범위

| 축 | 범위 | 설명 |
|----|------|------|
| X | `-width/2` ~ `+width/2` | 좌(-) ↔ 우(+) |
| Y | `0` ~ `height` | 바닥(0) ↔ 천장(height) |
| Z | `-depth/2` ~ `+depth/2` | 뒤(-) ↔ 앞(+) |

### PlacedBox 좌표

- `x`, `z`: 박스 **중심** 좌표
- `y`: 박스 **바닥** 좌표 (중심이 아님!)

```
예: 100x100x100 박스가 (x=0, y=0, z=0)에 배치되면
    - 실제 위치: X(-50~50), Y(0~100), Z(-50~50)
    - 박스 중심: (0, 50, 0)
```

---

## 성능 고려사항

### 시간 복잡도

- 단일 트럭: `O(n² × e)` (n=아이템 수, e=EP 수)
- 멀티 트럭: `O(t × n² × e)` (t=트럭 수)

### 최적화 전략

1. **부피 순 정렬**: 큰 아이템 먼저 배치
2. **EP 필터링**: 무효 EP 즉시 제거
3. **Early exit**: 모든 아이템 배치 성공 시 즉시 반환

---

## 한계 및 향후 개선

### 현재 한계

- 수평 회전만 지원 (6방향 회전 미지원)
- 무게 중심 고려 안 함
- 아이템 간 우선순위 미지원

### 향후 개선 가능

- [ ] 무게 기반 배치 (무거운 물건 아래)
- [ ] 깨지기 쉬운 물품 보호
- [ ] 접근성 고려 (자주 사용하는 물건 앞쪽)
- [ ] 6방향 회전 지원

---

## 시각화 서버

`server.ts`는 독립 실행 가능한 Express 서버로, 웹 기반 3D 시뮬레이터를 제공합니다.

### 실행 방법

```bash
npx ts-node src/binPacking/server.ts
```

### API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 시뮬레이터 HTML 페이지 |
| GET | `/api/trucks` | 트럭 프리셋 조회 |
| GET | `/api/data/:estimateId` | 샘플 가구 데이터 |
| POST | `/api/optimize` | 단일 트럭 최적화 |
| POST | `/api/optimize-multi` | 멀티 트럭 최적화 |

### API 요청 예시

```bash
# 단일 트럭 최적화
curl -X POST http://localhost:3001/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "sofa", "width": 2.0, "depth": 0.9, "height": 0.85},
      {"id": "table", "width": 1.2, "depth": 0.8, "height": 0.75}
    ],
    "unit": "m"
  }'

# 멀티 트럭 최적화
curl -X POST http://localhost:3001/api/optimize-multi \
  -H "Content-Type: application/json" \
  -d '{
    "items": [...],
    "unit": "m",
    "support_ratio": 0.7
  }'
```

---

## 테스트

```bash
# Jest 테스트 실행
npm test -- --testPathPattern=binPacking
```

테스트 커버리지:
- 기본 배치 로직
- 70% 지지 규칙
- 트럭 경계 검사
- 멀티 트럭 최적화
- 대량 아이템 처리

---

## 참고 논문

이 구현은 다음 논문의 Extreme Points 알고리즘을 기반으로 합니다:

> **Crainic, T.G., Perboli, G., & Tadei, R. (2008)**
> *"Extreme Point-Based Heuristics for Three-Dimensional Bin Packing"*
> INFORMS Journal on Computing, 20(3), 368-384
> https://doi.org/10.1287/ijoc.1070.0250

이 논문은 3D Bin Packing 문제에서 Extreme Points 개념을 활용한 휴리스틱 알고리즘을 제안하며, 박스 배치 후 새로운 후보 위치(EP)를 효율적으로 생성하는 방법을 설명합니다.

---

## 독창적 구현

표준 EP 알고리즘 대비 이삿짐 도메인에 특화된 독창적 구현:

### 1. Configurable 지지 규칙 (70% Support)

```typescript
// 표준 EP: 지지 검사 없음 또는 100% full support
// 본 구현: 70% 지지로 실용성과 안정성 균형
checkSupport(x, y, z, w, d, placed, 0.7)
```

- 바닥 면적의 70% 이상이 아래 박스에 의해 지지되어야 배치 허용
- `supportRatio` 옵션으로 조절 가능 (기본값 0.7)
- 이사짐의 실제 적재 안정성을 고려한 실용적 기준

### 2. 가구 특화 회전 제약

```typescript
// 표준 EP: 6방향 회전 (LWH, LHW, WLH, WHL, HLW, HWL)
// 본 구현: 수평 회전만 허용 (LWH, WLH)
const orientations = [Orientation.LWH, Orientation.WLH];
```

- 가구 전복 방지 (높이 축 고정)
- 실제 이사 시 가구를 눕히지 않는 관행 반영

### 3. 자연스러운 방향 우선 배치

```typescript
// depth >= width인 방향 선호 (점수에서 가산점)
const natural = d >= w ? 0 : 1;
const score = [cz, cx, cy, natural];  // 낮을수록 우선
```

- 가구가 트럭 안에서 자연스럽게 보이도록 배치
- 소파, 침대 등이 긴 방향으로 배치되도록 유도

### 4. Corner-First 배치 전략

```typescript
// 첫 번째 아이템을 뒤쪽-왼쪽 코너에 강제 배치
if (!cornerPhaseDone) {
  tryCornerPlacement(item, placed, truckW, truckD, truckH);
}
```

- 공간 활용 극대화
- 이사 시 큰 가구를 먼저 구석에 배치하는 실제 관행 반영

### 5. 멀티 트럭 자동 최적화

```typescript
// 표준 EP: 단일 컨테이너만 고려
// 본 구현: 자동 트럭 조합 + 마지막 트럭 다운사이징

// 1. 단일 트럭 시도 (작은 것부터)
for (const truckType of ['1ton', '2.5ton', '5ton']) { ... }

// 2. 실패 시 5톤으로 채우고 남은 아이템에 최적 트럭 선택
while (remainingItems.length > 0) {
  pack5Ton(remainingItems);
  trySmallestFittingTruck(remainingItems);
}
```

- 비용 최적화 (불필요한 큰 트럭 방지)
- 실제 이사 견적 산출에 필요한 트럭 조합 자동 계산
