# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

이삿짐 (Isajjim) - AI 기반 이사 견적 산출 서비스 프론트엔드. React Native (Expo) + TypeScript 프로젝트.

## Development Commands

```bash
npm install          # 의존성 설치
npm run dev          # Expo 개발 서버 시작 (모바일/웹)
npm run web          # 웹 브라우저에서 실행
npm run start        # 웹 모드로 시작 (npm run web과 동일)
npm run build:web    # 웹 빌드
```

## Architecture

### Navigation Flow
`App.tsx`에서 React Navigation의 Native Stack Navigator를 사용하여 화면 전환을 관리. 5개의 주요 화면:

- **Main** → **UserSelect** → **Result**: 견적 요청 플로우 (이미지 업로드 → 사용자 정보 입력 → 결과 확인)
- **MyEstimate**: 내 견적 목록
- **MyChat**: 채팅 기능

화면 간 파라미터 타입은 `src/types/navigation.ts`의 `RootStackParamList`에 정의됨.

### Key Integrations
- **Firebase Storage**: 이미지 업로드용 (`src/utils/Server.ts`에서 설정)
- **Backend API**: `https://api.isajjim.kro.kr`
- **3D Visualization**: @react-three/fiber + drei를 사용한 트럭 시각화 (`src/components/Space/`)

### Directory Structure
- `src/Pages/`: 화면 컴포넌트
- `src/components/`: 페이지별 하위 컴포넌트 (페이지명 폴더로 구분)
- `src/components/common/`: 공통 컴포넌트 (Header, AlertBox)
- `src/components/Space/`: 3D 트럭 시뮬레이션 컴포넌트
- `src/binPacking/`: 가구 적재 최적화 알고리즘
- `src/types/`: TypeScript 타입 정의
- `src/utils/`: 서버 설정, 번역 유틸리티

### 3D Simulation (`src/components/Space/Space3D.tsx`)

트럭 적재 시뮬레이션의 핵심 컴포넌트. 주요 동작:

- **PLY 로딩**: AI 서버에서 제공하는 PLY 파일을 로드하고 캐시 (`plyCache`)
- **binPacking**: 가구 수량에 따라 트럭 배치 최적화 실행
- **애니메이션**: 가구가 위에서 떨어지는 적재 애니메이션

**점진적 업데이트 로직** (가구 수량 변경 시):
- 트럭 구성(타입/개수)이 동일하면 기존 가구 유지, 새 가구만 애니메이션
- 트럭 구성이 변경되면 전체 초기화 후 처음부터 애니메이션
- `prevTrucksRef`로 이전 상태 비교, `scheduleNextRef`로 순환 의존성 방지
