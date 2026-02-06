# 이삿짐 (Isajjim) Frontend

AI 기반 이사 견적 산출 서비스 프론트엔드입니다. 사용자가 이삿짐 사진을 업로드하면 AI가 가구를 인식하고, 3D 적재 시뮬레이션을 통해 최적의 트럭 배치를 시각화합니다.

## 주요 기능

- 이삿짐 사진 업로드 및 AI 가구 인식
- 3D 적재 시뮬레이션 (Point Cloud 렌더링)
- 멀티트럭 자동 최적화 (Bin Packing 알고리즘)
- 실시간 견적 산출

---

## 환경 구성

### 필수 요구 사항

- Node.js (LTS 버전 권장)
- npm

### 설치 방법

```bash
# 저장소 클론
git clone <repository-url>
cd Isajjim-Frontend

# 의존성 설치
npm install
```

### 실행 방법

```bash
# 웹 브라우저에서 실행
npm run web

# 또는
npx expo start --web --port 8081
```

### 환경 변수

| 항목 | 값 | 위치 |
|------|-----|------|
| Backend API | `https://api.isajjim.kro.kr` | `src/utils/Server.ts` |
| Firebase Project | `knu-team-05` | `src/utils/Server.ts` |

---

## 시스템 아키텍처

### 전체 흐름

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Main     │───▶│ UserSelect  │───▶│   Result    │───▶│ MyEstimate  │
│  (이미지)    │    │  (정보입력)  │    │ (견적결과)   │    │  (견적목록)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │
      ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Backend API                                  │
│  POST /estimates → SSE 연결 → GET /estimates/{id}                   │
└─────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AI 서버 응답                                    │
│  - 가구 인식 결과 (label, type, quantity)                            │
│  - 절대 크기 PLY 파일 URL (ply_url)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 3D 적재 시뮬레이션 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                         사용자 페이지                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Result.tsx                    SimulationTest.tsx                   │
│  (실제 서비스)                   (테스트용)                            │
│       │                              │                              │
│       └──────────┬───────────────────┘                              │
│                  ▼                                                  │
│           Space3D.tsx  ←── 3D 시뮬레이션 메인 컴포넌트                 │
│                  │                                                  │
│    ┌─────────────┼─────────────┐                                    │
│    ▼             ▼             ▼                                    │
│ TruckContainer  FurniturePoints  Controls                          │
│ (트럭 적재함)    (가구 렌더링)     (카메라)                            │
└─────────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      binPacking 모듈                                 │
├─────────────────────────────────────────────────────────────────────┤
│  packer.ts                                                          │
│  ├── extremePointsPack()   ← Extreme Points 알고리즘                 │
│  ├── optimizeOBB()         ← 단일 트럭 배치                          │
│  └── packMultiTruck()      ← 멀티트럭 자동 최적화                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

```
Backend JSON Response
         │
         │  { furnitureList: [{ ply_url, label, ... }] }
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. PLY 로드 (plyLoader.ts)                                         │
│     - AI 서버가 제공한 절대 크기 PLY 파일 로드                         │
│     - 바운딩박스 크기 = 히트박스 (스케일링 불필요)                      │
└─────────────────────────────────────────────────────────────────────┘
         │
         │  LoadedFurniture { id, geometry, width, depth, height }
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Bin Packing (packer.ts)                                         │
│     - packMultiTruck(): 최적 트럭 자동 선택 + 멀티트럭 지원            │
│     - Extreme Points 알고리즘으로 3D 배치 계산                        │
│     - 70% 지지 규칙 적용                                             │
└─────────────────────────────────────────────────────────────────────┘
         │
         │  TruckPlacement[] { type, placements[], utilization }
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. 3D 렌더링 (Space3D.tsx)                                         │
│     - Three.js + @react-three/fiber                                 │
│     - 트럭 컨테이너 + 가구 Point Cloud 렌더링                         │
│     - 순차 애니메이션 (떨어지는 효과)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Backend API 응답 형식

### GET /api/v1/estimates/{estimateId}

```json
{
  "data": {
    "images": [
      {
        "furnitureList": [
          {
            "furnitureId": 1,
            "label": "BED",
            "type": "SINGLE_BED",
            "quantity": 1,
            "ply_url": "https://storage.googleapis.com/.../1_BED.ply"
          },
          {
            "furnitureId": 2,
            "label": "SOFA",
            "type": "THREE_SEATER_SOFA",
            "quantity": 1,
            "ply_url": "https://storage.googleapis.com/.../2_SOFA.ply"
          }
        ]
      }
    ],
    "items": [
      {
        "category": "TRUCK",
        "itemType": "2.5ton",
        "quantity": 1
      }
    ]
  }
}
```

### 시뮬레이션에 필수인 필드

| 필드 | 설명 | 비고 |
|------|------|------|
| `furnitureId` | 가구 식별자 | 필수 |
| `label` | 가구 라벨 | UI 표시용 |
| `ply_url` | PLY 파일 URL | **시뮬레이션 핵심** |

> **Note**: `width`, `depth`, `height`, `volume` 필드는 사용되지 않습니다. PLY 파일의 바운딩박스를 직접 사용합니다.

---

## 트럭 사양

| 타입 | 너비 (cm) | 깊이 (cm) | 높이 (cm) |
|------|----------|----------|----------|
| 1ton | 170 | 280 | 170 |
| 2.5ton | 200 | 430 | 190 |
| 5ton | 230 | 620 | 240 |

---

## 프로젝트 구조

```
Isajjim-Frontend/
├── App.tsx                          # 앱 진입점 및 라우터 설정
├── cors_server.py                   # 로컬 PLY 서버 (테스트용)
│
├── src/
│   ├── Pages/                       # 화면 컴포넌트
│   │   ├── Main.tsx                 # 메인 (이미지 업로드)
│   │   ├── UserSelect.tsx           # 사용자 정보 입력
│   │   ├── Result.tsx               # 견적 결과 + 3D 시뮬레이션
│   │   ├── MyEstimate.tsx           # 내 견적 목록
│   │   ├── MyChat.tsx               # 채팅
│   │   └── SimulationTest.tsx       # 시뮬레이션 테스트 페이지
│   │
│   ├── components/
│   │   ├── common/                  # 공통 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   └── AlertBox.tsx
│   │   │
│   │   ├── MainPage/                # Main 페이지 컴포넌트
│   │   │   └── NextBtn1.tsx         # 이미지 업로드 → 백엔드 전송
│   │   │
│   │   ├── UserSelectPage/          # UserSelect 페이지 컴포넌트
│   │   │   └── NextBtn2.tsx         # SSE 연결 → 결과 수신
│   │   │
│   │   ├── ResultPage/              # Result 페이지 컴포넌트
│   │   │   ├── ResultCard.tsx
│   │   │   └── UploadCard.tsx
│   │   │
│   │   └── Space/                   # 3D 시뮬레이션 컴포넌트
│   │       ├── Space3D.tsx          # 메인 3D 컴포넌트
│   │       ├── TruckContainer.tsx   # 트럭 적재함 렌더링
│   │       ├── PorterTruck.tsx      # 대기 상태 트럭 모델
│   │       ├── FurnitureMesh.tsx    # 가구 렌더링 (레거시)
│   │       ├── hooks/
│   │       │   └── useSimulationAnimation.ts
│   │       └── utils/
│   │           └── plyLoader.ts     # PLY 파일 로딩 유틸리티
│   │
│   ├── binPacking/                  # 3D Bin Packing 알고리즘
│   │   ├── packer.ts                # 핵심 배치 알고리즘
│   │   │   ├── extremePointsPack()  # Extreme Points 알고리즘
│   │   │   ├── optimizeOBB()        # 단일 트럭 배치
│   │   │   └── packMultiTruck()     # 멀티트럭 자동 최적화
│   │   ├── types.ts                 # 타입 정의
│   │   ├── constants.ts             # 트럭 프리셋
│   │   ├── support.ts               # 지지/충돌 검사
│   │   └── assets/                  # 테스트용 PLY 파일
│   │       └── aligned/             # 정렬된 PLY 파일
│   │
│   ├── types/
│   │   ├── navigation.ts            # 네비게이션 타입
│   │   └── simulation.ts            # 시뮬레이션 타입
│   │
│   ├── styles/
│   │   └── commonStyles.ts          # 공통 스타일
│   │
│   └── utils/
│       ├── Server.ts                # 백엔드/Firebase 설정
│       └── translate.ts             # 번역 유틸리티
│
└── assets/                          # 정적 리소스 (이미지 등)
```

---

## 핵심 컴포넌트 상세

### Space3D.tsx

3D 시뮬레이션의 메인 컴포넌트입니다.

```typescript
interface Space3DProps {
  furniture?: SimulationFurniture[];  // 가구 목록
  truckType?: TruckType;              // 미지정 시 자동 최적화
  autoPlay?: boolean;                 // 자동 재생
  onAnimationComplete?: () => void;   // 완료 콜백
}
```

**주요 로직:**
1. PLY 로드 → 바운딩박스 크기 추출
2. `packMultiTruck()` 호출 → 최적 트럭 배치 계산
3. Three.js로 3D 렌더링 + 순차 애니메이션

### packer.ts

Bin Packing 알고리즘 구현입니다.

| 함수 | 설명 |
|------|------|
| `extremePointsPack()` | Extreme Points 알고리즘으로 단일 트럭 배치 |
| `optimizeOBB()` | 지정 트럭 또는 자동 선택 (단일) |
| `packMultiTruck()` | 멀티트럭 자동 최적화 |

**알고리즘 특징:**
- Extreme Points (EP) 기반 배치
- 70% 지지 규칙 적용
- 수평 회전만 허용 (LWH, WLH)
- 부피 순 정렬 (큰 것 먼저)

---

## 개발/테스트

### 시뮬레이션 테스트 페이지

```bash
# 1. PLY 서버 실행 (테스트용)
python3 cors_server.py

# 2. Expo 실행
npx expo start --web --port 8081

# 3. 브라우저에서 접속
http://localhost:8081/simulation-test
```

### 테스트 페이지 기능

- **자동**: 멀티트럭 자동 최적화 모드
- **1ton / 2.5ton / 5ton**: 고정 트럭 모드
- 가구 개수 조절 (1~19개)
- 19개 테스트 가구 포함

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React Native (Expo) |
| Language | TypeScript |
| 3D Rendering | Three.js, @react-three/fiber, @react-three/drei |
| Navigation | React Navigation |
| Storage | Google Cloud Storage |
| API | REST + SSE |

---

## 좌표계 변환

| 소스 | 단위 | 변환 |
|------|------|------|
| PLY 파일 | m | 그대로 사용 |
| binPacking | cm | ÷100 → m |
| Three.js | m | 그대로 사용 |

---

## 라이선스

MIT License
