# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

이삿찜 (Isajjim) - AI 기반 이사 견적 산출 서비스 프론트엔드. React Native (Expo) + TypeScript 프로젝트.

## Development Commands

```bash
npm install                        # 의존성 설치
npm run dev                        # Expo 개발 서버 시작 (모바일/웹)
npm run web                        # 웹 브라우저에서 실행 (= npm start)
npm run build:web                  # 웹 프로덕션 빌드
npm run android                    # 안드로이드 네이티브 실행
npm run ios                        # iOS 네이티브 실행
npx expo start --web --port 8081   # 특정 포트로 웹 실행

# Bin Packing 알고리즘 단위 테스트
npx jest src/binPacking/__tests__/packer.test.ts

# 시뮬레이션 로컬 테스트
python3 cors_server.py             # 로컬 PLY 서버 실행 (포트 8082, CORS 허용)
# 브라우저에서 http://localhost:8081/simulation-test 접속
```

## Environment Variables

```bash
# .env.local (개발)
EXPO_PUBLIC_BACKEND_DOMAIN=http://localhost:8080

# .env.production (프로덕션)
EXPO_PUBLIC_BACKEND_DOMAIN=https://api.isajjim.kro.kr
```

`EXPO_PUBLIC_` 접두사로 클라이언트 코드에서 접근 가능. `src/api/axiosInstance.ts`에서 baseURL로 사용.

## Architecture

### Navigation Flow
`App.tsx`에서 React Navigation의 Native Stack Navigator를 사용하여 화면 전환을 관리:

- **인증 플로우**: `Login` → `AuthCallback` (토큰 수신) → `Main`
  - 실패 시: `AuthFailed`
- **메인 견적 플로우**: `Main` → `Upload` → `UserSelect` → `Result`
  - Main (`Main.tsx`): 인트로/랜딩 페이지
  - Upload (`MainScreen.tsx`): 이미지 업로드
  - UserSelect: 출발지/도착지, 이사 날짜 입력
  - Result: 3D 시뮬레이션 + 견적 결과
- **MyEstimate**: 내 견적 목록
- **MyChat**: 채팅 기능
- **SimulationTest**: 3D 시뮬레이션 단독 테스트 페이지 (개발용)

화면 간 파라미터 타입은 `src/types/navigation.ts`의 `RootStackParamList`에 정의됨. Web deep linking 지원 (`App.tsx`의 linking 설정, prefix: `isajjim://`).

### State Management

**EstimateContext** (`src/context/EstimateContext.tsx`):
- `requestData`: 견적 요청 데이터 (이미지, 위치 정보, 가구 목록 등)
- `estimateStatus`: `'pending' | 'active' | 'moving' | 'completed' | 'cancelled'`
- `confirmedCompany`: 확정된 이사업체 정보
- `chatList`: 채팅 목록 (데모 데이터 3개 사전 포함)
- `useEstimate()` 훅으로 모든 페이지에서 접근 가능

**AuthContext** (`src/context/AuthContext.tsx`):
- 인증 상태 관리
- `src/auth/tokenStorage.ts`: 토큰 영속성 레이어
- `src/auth/navigationRef.ts`: React 컴포넌트 외부에서 네비게이션 접근

### HTTP Client

`src/api/axiosInstance.ts`: axios 기반 HTTP 클라이언트
- `EXPO_PUBLIC_BACKEND_DOMAIN`을 baseURL로 사용
- 인증 인터셉터 포함 (Authorization 헤더 자동 주입)
- 토큰 만료 시 자동 갱신 처리

### Key Integrations

- **Backend API**: `EXPO_PUBLIC_BACKEND_DOMAIN` (기본값: `https://isajjim-backend-1079420824591.asia-northeast3.run.app`)
  - 견적 요청: `POST /api/v1/estimates`
  - 견적 조회: `GET /api/v1/estimates/{id}`
  - Presigned URL 발급: `POST /api/v1/presigned-url`
  - SSE 연결로 AI 분석 실시간 수신 (`NextBtn2.tsx`)
- **Google Cloud Storage**: 이미지 직접 업로드 (Presigned URL 방식, `NextBtn1.tsx`)
- **3D Visualization**: `@react-three/fiber` + `drei` + `three`
  - PLY 파일 Point Cloud 렌더링
  - 트럭 컨테이너 시각화

### Data Flow: Image Upload to Simulation

1. **Upload (`NextBtn1.tsx`)**:
   - Presigned URL 발급: `POST /api/v1/presigned-url`
   - 이미지 PUT 업로드
   - 견적 요청: `POST /api/v1/estimates` (이미지 URL 포함)
   - estimateId 받아서 UserSelect로 이동

2. **UserSelect (`NextBtn2.tsx`)**:
   - 출발지, 도착지, 날짜 입력
   - SSE 연결: `GET /api/v1/estimates/{estimateId}/sse`
   - AI 분석 결과 실시간 수신 (가구 인식, PLY URL 등)
   - 완료되면 Result로 이동

3. **Result**:
   - 백엔드 응답에서 `furnitureList` 추출 (`furnitureId`, `label`, `type`, `ply_url`)
   - `Space3D` 컴포넌트에 가구 목록 전달
   - 3D 시뮬레이션 + 견적 결과 표시

### 3D Simulation Architecture

**`Space3D.tsx`** - 메인 시뮬레이션 컴포넌트:

1. **PLY 로딩** (`src/components/Space/utils/plyLoader.ts`):
   - AI 서버가 제공한 PLY 파일 (절대 크기, 미터 단위) 로드
   - 바운딩박스 크기를 직접 사용 (스케일링 불필요)
   - 전역 `plyCache` Map으로 중복 로드 방지
   - `ply_url === 'BOX_PLACEHOLDER'`인 경우 50×30×35cm 박스 자동 생성

2. **Bin Packing** (`src/binPacking/packer.ts`):
   - `packMultiTruck()`: 멀티트럭 자동 최적화
   - `extremePointsPack()`: Extreme Points 알고리즘 기반 배치
   - 70% 지지 규칙 적용, 수평 회전만 허용 (LWH, WLH)
   - 단위: cm (Three.js 렌더링 시 ÷100 → m 변환)

3. **3D 렌더링**:
   - `TruckContainer.tsx`: 트럭 적재함 (EdgeGeometry 외곽선)
   - `FurniturePoints`: Point Cloud 렌더링 (PLY geometry 사용)
   - 순차 애니메이션: 가구가 위에서 떨어지는 효과 (`easeOutCubic`)
   - 멀티트럭 시 1.5m 간격으로 트럭 배치

4. **카메라 제어**:
   - `AnimatedControls`: OrbitControls 기반 카메라 애니메이션
   - 트럭 타입에 따라 거리 자동 조절
   - 멀티트럭 시 중심점 자동 계산

**점진적 업데이트 로직** (가구 수량 변경 시):
- 트럭 구성(타입/개수)이 동일하면 기존 가구 유지, 새 가구만 애니메이션
- 트럭 구성이 변경되면 전체 초기화 후 처음부터 애니메이션
- `prevTrucksRef`로 이전 상태 비교, `scheduleNextRef`로 순환 의존성 방지

### Coordinate System
- **PLY 파일**: 미터(m) 단위, AI 서버가 절대 크기로 제공
- **binPacking**: 센티미터(cm) 단위
- **Three.js**: 미터(m) 단위 (binPacking 결과 ÷100 변환)

## Backend API Response Format

### GET /api/v1/estimates/{estimateId}
시뮬레이션에 필요한 핵심 필드:
- `furnitureId`: 가구 고유 ID
- `label`: UI 표시용 라벨 (예: `"BED"`, `"SOFA"`)
- `type`: 가구 타입 (예: `"SINGLE_BED"`, `"THREE_SEATER_SOFA"`)
- `quantity`: 수량
- `ply_url`: PLY 파일 URL (AI 서버 제공, `'BOX_PLACEHOLDER'` 가능)

**중요**: `width`, `depth`, `height`, `volume` 필드는 무시됨. PLY 파일의 바운딩박스를 직접 사용.

### Truck Types
트럭 사양 (`TRUCK_DIMENSIONS` in `src/types/simulation.ts`):
- **1ton**: 170cm(W) × 280cm(D) × 170cm(H)
- **2.5ton**: 200cm(W) × 430cm(D) × 190cm(H)
- **5ton**: 230cm(W) × 620cm(D) × 240cm(H)

`Space3D`에서 `truckType` prop 미지정 시 자동 최적화 모드 (멀티트럭 가능).

## Testing & Development

### Bin Packing Unit Tests
`src/binPacking/__tests__/packer.test.ts` - 알고리즘 단위 테스트:
```bash
npx jest src/binPacking/__tests__/packer.test.ts
```

### Simulation Test Page
`SimulationTest.tsx` - 3D 시뮬레이션 단독 테스트:
- 로컬 PLY 파일 사용 (`src/binPacking/assets/aligned/`)
- 트럭 타입 선택 (자동/1ton/2.5ton/5ton)
- 가구 개수 조절 (1~19개)

### Translation Utility
`src/utils/Translator.ts`: 백엔드 영문 타입 → 한글 변환
- 예: `"SINGLE_BED"` → `"싱글침대"`
- Result 페이지 가구 목록 표시 시 사용