# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

이삿짐 (Isajjim) - AI 기반 이사 견적 산출 서비스 프론트엔드. React Native (Expo) + TypeScript 프로젝트.

## Development Commands

```bash
npm install                        # 의존성 설치
npm run dev                        # Expo 개발 서버 시작 (모바일/웹)
npm run web                        # 웹 브라우저에서 실행
npm run start                      # 웹 모드로 시작 (npm run web과 동일)
npm run build:web                  # 웹 빌드
npx expo start --web --port 8081   # 특정 포트로 웹 실행

# 시뮬레이션 테스트
python3 cors_server.py             # 로컬 PLY 서버 실행 (테스트용)
# 브라우저에서 http://localhost:8081/simulation-test 접속
```

## Architecture

### Navigation Flow
`App.tsx`에서 React Navigation의 Native Stack Navigator를 사용하여 화면 전환을 관리:

- **Main** → **UserSelect** → **Result**: 메인 견적 요청 플로우
  - Main (MainScreen.tsx): 이미지 업로드
  - UserSelect: 출발지/도착지, 이사 날짜 입력
  - Result: 3D 시뮬레이션 + 견적 결과
- **MyEstimate**: 내 견적 목록
- **MyChat**: 채팅 기능
- **SimulationTest**: 3D 시뮬레이션 테스트 페이지 (개발용)

화면 간 파라미터 타입은 `src/types/navigation.ts`의 `RootStackParamList`에 정의됨. Web deep linking 지원 (`App.tsx`의 linking 설정).

### State Management
**EstimateContext** (`src/context/EstimateContext.tsx`):
- 전역 상태 관리용 React Context
- `requestData`: 견적 요청 데이터 (이미지, 위치 정보, 가구 목록 등)
- `estimateStatus`: 견적 상태 ('pending' | 'active' | 'moving' | 'completed' | 'cancelled')
- `confirmedCompany`: 확정된 이사업체 정보
- `useEstimate()` 훅으로 모든 페이지에서 접근 가능

### Key Integrations
- **Backend API**: `https://isajjim-backend-1079420824591.asia-northeast3.run.app`
  - 견적 요청: POST `/api/v1/estimates`
  - 견적 조회: GET `/api/v1/estimates/{id}`
  - Presigned URL 발급: POST `/api/v1/gcs/presigned`
  - SSE 연결로 AI 분석 실시간 수신 (`NextBtn2.tsx`)
- **Google Cloud Storage**: 이미지 직접 업로드 (Presigned URL 방식)
  - Firebase SDK는 설정만 (`src/utils/Server.ts`)
  - 실제 업로드는 GCS PUT 요청 (`NextBtn1.tsx`)
- **3D Visualization**: @react-three/fiber + drei + Three.js
  - PLY 파일 Point Cloud 렌더링
  - 트럭 컨테이너 시각화

### Directory Structure
- `App.tsx`: 네비게이션 설정 및 앱 진입점
- `src/Pages/`: 화면 컴포넌트 (Main, UserSelect, Result, MyEstimate, MyChat, SimulationTest)
- `src/components/`: 페이지별 하위 컴포넌트 (페이지명 폴더로 구분)
  - `MainPage/NextBtn1.tsx`: 이미지 업로드 + 백엔드 전송
  - `UserSelectPage/NextBtn2.tsx`: SSE 연결 + 견적 요청 완료
  - `ResultPage/`: 견적 결과 카드 컴포넌트
  - `common/`: Header, AlertBox 등 공통 컴포넌트
  - `Space/`: 3D 시뮬레이션 관련 컴포넌트
- `src/binPacking/`: 가구 적재 최적화 알고리즘 (Extreme Points)
- `src/context/`: React Context (EstimateContext)
- `src/types/`: TypeScript 타입 정의 (navigation, simulation, common)
- `src/utils/`: 서버 설정, 번역 유틸리티
- `src/styles/`: 공통 스타일 (commonStyles.ts)

### Data Flow: Image Upload to Simulation

1. **Main (NextBtn1.tsx)**:
   - 사용자가 이미지 업로드
   - Presigned URL 발급: `POST /api/v1/gcs/presigned`
   - GCS에 이미지 직접 PUT 업로드
   - 견적 요청: `POST /api/v1/estimates` (이미지 URL 포함)
   - estimateId 받아서 UserSelect로 이동

2. **UserSelect (NextBtn2.tsx)**:
   - 사용자 정보 입력 (출발지, 도착지, 날짜)
   - SSE 연결: `GET /api/v1/estimates/{estimateId}/sse`
   - AI 분석 결과 실시간 수신 (가구 인식, PLY URL 등)
   - 완료되면 Result로 이동

3. **Result**:
   - 백엔드 응답에서 `furnitureList` 추출 (furnitureId, label, type, ply_url)
   - Space3D 컴포넌트에 가구 목록 전달
   - 3D 시뮬레이션 + 견적 결과 표시

### 3D Simulation Architecture

**Space3D.tsx** - 메인 시뮬레이션 컴포넌트:
1. **PLY 로딩** (`plyLoader.ts`):
   - AI 서버가 제공한 PLY 파일 (절대 크기) 로드
   - 바운딩박스 크기를 직접 사용 (스케일링 불필요)
   - `plyCache`로 중복 로드 방지

2. **Bin Packing** (`binPacking/packer.ts`):
   - `packMultiTruck()`: 멀티트럭 자동 최적화
   - `extremePointsPack()`: Extreme Points 알고리즘 기반 배치
   - 70% 지지 규칙 적용, 수평 회전만 허용 (LWH, WLH)

3. **3D 렌더링**:
   - `TruckContainer.tsx`: 트럭 적재함 렌더링 (EdgeGeometry로 외곽선)
   - `FurniturePoints`: Point Cloud 렌더링 (PLY geometry 사용)
   - 순차 애니메이션: 가구가 위에서 떨어지는 효과 (easeOutCubic)

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
- **binPacking**: 센티미터(cm) 단위, Three.js 렌더링 시 ÷100 → m 변환
- **Three.js**: 미터(m) 단위

## Backend API Response Format

### GET /api/v1/estimates/{estimateId}
시뮬레이션에 필요한 핵심 필드:
- `furnitureId`: 가구 고유 ID (필수)
- `label`: 가구 라벨 (UI 표시용, 예: "BED", "SOFA")
- `type`: 가구 타입 (예: "SINGLE_BED", "THREE_SEATER_SOFA")
- `quantity`: 수량
- `ply_url`: PLY 파일 URL (시뮬레이션 핵심 - AI 서버가 제공)

**중요**: `width`, `depth`, `height`, `volume` 필드는 무시됨. PLY 파일의 바운딩박스를 직접 사용.

### Truck Types
트럭 사양 (`TRUCK_DIMENSIONS` in `src/types/simulation.ts`):
- **1ton**: 170cm(W) × 280cm(D) × 170cm(H)
- **2.5ton**: 200cm(W) × 430cm(D) × 190cm(H)
- **5ton**: 230cm(W) × 620cm(D) × 240cm(H)

Space3D 컴포넌트에서 `truckType` prop 미지정 시 자동 최적화 모드 (멀티트럭 가능).

## Testing & Development

### Simulation Test Page
`SimulationTest.tsx`에서 3D 시뮬레이션 단독 테스트 가능:
- 로컬 PLY 파일 사용 (`src/binPacking/assets/aligned/`)
- 트럭 타입 선택 (자동/1ton/2.5ton/5ton)
- 가구 개수 조절 (1~19개)
- 실시간 Bin Packing 결과 확인

### Translation Utility
`src/utils/Translator.ts`: 백엔드 영문 라벨 → 한글 변환
- 예: "SINGLE_BED" → "싱글침대"
- Result 페이지에서 가구 목록 표시 시 사용
