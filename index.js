import { registerRootComponent } from 'expo';
import App from './App'; // App.tsx를 불러옵니다.

// Expo가 Native와 Web 환경 모두에서 적절한 진입점을 찾도록 해줍니다.
registerRootComponent(App);