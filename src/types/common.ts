export interface UploadedImage {
  fileName: string;
  mimeType: string;
  firebaseUri?: string; // ?를 붙임으로써 항상 값이 채워질 필요는 없는 값이됨. 나중에 채워도 되는 값이 된다는 뜻.
  localUri: string;
  width: number;
  height: number;
}
