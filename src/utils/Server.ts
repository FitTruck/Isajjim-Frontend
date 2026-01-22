import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// --- 데이터 ---
export interface UploadedImage {
  uri: string;
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
export const BACKEND_DOMAIN = "http://api.isajjim.kro.kr:8080";