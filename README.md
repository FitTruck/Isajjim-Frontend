# 이삿짐 (isajjim)

AI 기반 이사 견적 산출 서비스 프론트엔드 프로젝트입니다.

## 🛠 환경 구성

이 프로젝트는 React Native (Expo) 및 TypeScript로 작성되었습니다.

### 필수 요구 사항

- Node.js (LTS 버전 권장)
- npm

### 설치 방법

1. 저장소를 클론합니다.

   ```bash
   git clone <repository-url>
   cd isajjim
   ```

2. 의존성 패키지를 설치합니다.
   ```bash
   npm install
   ```

## 🚀 실행 방법

### 웹 브라우저에서 실행

개발 서버를 시작하고 웹 브라우저에서 앱을 확인합니다.

```bash
npm run web
```

또는

```bash
npx expo start --web
```

### 환경 변수 및 설정

현재 Firebase 설정 및 백엔드 도메인은 소스 코드 내에 포함되어 있습니다.
(`src/utils/Server.ts`)

- **Backend API**: `http://api.isajjim.kro.kr:8080`
- **Firebase Project**: `knu-team-05`

## 📁 프로젝트 구조

```
src/
  ├── components/    # 재사용 가능한 UI 컴포넌트
  ├── screens/       # 앱의 주요 화면 (MainScreen, Result, UserSelect 등)
  ├── styles/        # 공통 스타일 정의
  ├── utils/         # 유틸리티 함수 및 서버 설정 (Server.ts)
  └── assets/        # 이미지 및 정적 리소스
App.tsx              # 앱 진입점
```
