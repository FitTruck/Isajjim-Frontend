import { UploadedImage } from './common';

// 각 화면으로 변동할 때의 매개변수들을 정의
export type RootStackParamList = {
  Main: undefined;
  UserSelect: { 
    images: UploadedImage[];
    estimateId: number;
  };
  Result: { 
    data: UploadedImage[];
    estimateId: number | null;
    ResultOfUserSelect: any; 
  };
  Compare: undefined;
};
