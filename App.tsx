import { useState } from 'react';
import Main from './src/screens/MainScreen';
import UserSelect from './src/screens/UserSelect';
import Result from './src/screens/Result'
import { UploadedImage } from './src/utils/Server';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'user-select' | 'result'>('main');// 현재 화면 상태를 관리
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);// MainScreen에서 전달받은 이미지url과 width, height 정보
  const [estimateId, setEstimateId] = useState<number | null>(null); // MainScreen에서 백엔드에게 받은 견적서id
  const [ResultOfUserSelect, setResultOfUserSelect] = useState<any>(null); // UserSelect에서 받은 resultCard에 들어갈 값과 estimateCard에 들어갈 값 
  const [mainKey, setMainKey] = useState(0); // MainScreen 리셋을 위한 키


  // UserSelect로 가는 로직
  const handleNavigateToUserSelect = (images: UploadedImage[], id: number) => {
    // main에서 이미지를 저장할 때 app.tsx에서의 uploadedImages 변수로 관리한다.
    // 그리고 이 변수인 uploadedImages를 UserSelect로 전달한다.
    // 따라서 main에서 userselect로 가는 함수의 파라미터에 images가 들어간다고 해서 userselect가 이미지를 쓴다는 것이 아니다. -> 올바른 로직이라는 것
    setUploadedImages(images);
    setEstimateId(id); // ID 저장
    
    setCurrentScreen('user-select');
  };

  // Result화면으로 가는 로직
  const handleNavigateToResult = (data: any) => {
    setResultOfUserSelect(data);
    setCurrentScreen('result');
  };

  const handleReset = () => {
    setUploadedImages([]); // 업로드한 이미지 정보 초기화 key만 바꾼다고 해서 업로드한 이미지까지 초기화 되는 것은 아님.
    setEstimateId(null); // 견적 ID 초기화
    setCurrentScreen('main'); // 현재화면 변수를 main으로 변경 default가 main화면이라고 약속된 것이  아니니까 따로 지정을 해야함.
    setMainKey(prev => prev + 1); // 키를 변경하여 MainScreen을 새로 고침 (내부 상태 초기화)
  };

  return (
    <>
      {/* Main, UserSelect, Result 밑에 있는 속성들은 각 함수를 실행할 때의 파라미터로 생각하면 된다. */}
      {currentScreen === 'main' && (
        <Main
          key={mainKey} // key는 리액트 자체의 속성으로, 컴포넌트를 식별하는 데 사용
          // key로 화면의 고유값을 설정해야함. 만약에 key가 같으면 브라우저가 같은 화면이라 인식하고 굳이 이미지를 지워야할 필요를 못 인식한다.
          onNavigateNext={handleNavigateToUserSelect} 
          onGoHome={handleReset} // 홈 버튼 눌렀을 때 초기화 되도록 함.
        />
      )}
      {currentScreen === 'user-select' && (
        <UserSelect 
          estimatedId={estimateId} //userselect에 전달할 ID
          onNavigateNext={handleNavigateToResult} 
          onGoHome={handleReset}
        />
      )}
      {currentScreen === 'result' && (
        <Result 
          data={uploadedImages} 
          estimateId={estimateId}
          ResultOfUserSelect={ResultOfUserSelect}
          onGoHome={handleReset}
        />
      )}
    </>
  );
}
