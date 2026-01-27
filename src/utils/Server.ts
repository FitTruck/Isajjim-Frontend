import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// --- 데이터 ---
export interface UploadedImage {
  fileName: string;
  mimeType: string;
  firebaseUri?: string; // ?를 붙임으로써 항상 값이 채워질 필요는 없는 값이됨. 나중에 채워도 되는 값이 된다는 뜻. >> 이것 때문에 편한게 됨 
  localUri: string;
  width: number;
  height: number;
}

// --- firebase 설정 ---
const firebaseConfig = {
  projectId: "knu-team-05",
  storageBucket: 'knu-team-05.firebasestorage.app' // 버킷 경로
}

// --- 초기화 및 도구 내보내기 ---
const app = initializeApp(firebaseConfig); // 실행되면 firebaseStorage와 연결됨. app에는 그냥 firebaseConfig의 값들과 부가적인 정보가 담겨있음. firebaseConfig로 만들어진 열쇠라고 보면 됨.

export const storage = getStorage(app); // storage: getStorage함수를 통해 firebase와 연결된 저장소 자체가 되어버림.

// --- 백엔드 도메인 설정 ---
export const BACKEND_DOMAIN = "https://api.isajjim.kro.kr";