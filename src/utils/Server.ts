import { Platform } from 'react-native';

const PRODUCTION_DOMAIN = 'https://api.isajjim.kro.kr';

// 앱(네이티브) 환경은 항상 프로덕션 URL 사용
export const BACKEND_DOMAIN = Platform.OS === 'web'
  ? (process.env.EXPO_PUBLIC_BACKEND_DOMAIN ?? 'http://localhost:8080')
  : PRODUCTION_DOMAIN;