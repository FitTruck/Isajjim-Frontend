import { UploadedImage } from './common';

// 각 화면으로 변동할 때의 매개변수들을 정의
export type RootStackParamList = {
  Main: undefined; // 메인으로 이동할 때는 매개변수 없음
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
};
