import { UploadedImage } from './common';

// 각 화면으로 변동할 때의 매개변수들을 정의
export type RootStackParamList = {
  Splash: undefined;

  Upload: undefined; // 업로드 페이지
  UserSelect: { // UserSelect로 이동할 때는 images와 estimateId가 필요함
    images: UploadedImage[];
    estimateId: number;
  };
  Result: { // Result로 이동할 때는 data와 estimateId와 ResultOfUserSelect가 필요함
    data: UploadedImage[];
    estimateId: number | null;
    ResultOfUserSelect: any;
  };
  MyEstimate: undefined; // MyEstimate로 이동할 때는 매개변수 없음
  MyChat: undefined; // MyChat으로 이동할 때는 매개변수 없음
  EstimateOffers: undefined;
  ChatRoom: {
    roomId?: number;
    targetId?: number;
    targetName: string;
    mockInitialMessage?: string;
  };
  FinalEstimate: {
    simulationTrucks: { type: string; quantity: number }[];
  };
  Terms: undefined;
  PrivacyPolicy: undefined;
  SimulationTest: undefined; // 시뮬레이션 테스트 페이지
  Main: undefined; // 메인 페이지
  PartnerSearch: undefined;
  PartnerApplication: undefined;
  PartnerCredits: undefined;
  ChargeSuccess: undefined; // 웹 전용 진입 경로 — 파라미터는 window.location.search에서 파싱
  ChargeFail: undefined;
  Settings: undefined;
  PersonalInfo: undefined;
  NotificationSettings: undefined;
  // 인증 관련 화면
  Login: undefined;
  AuthCallback: { accessToken?: string; refreshToken?: string };
  AuthFailed: undefined;
};
