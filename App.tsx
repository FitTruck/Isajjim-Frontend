import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EstimateProvider } from './src/context/EstimateContext';
import { AuthProvider } from './src/context/AuthContext';
import { navigationRef } from './src/auth/navigationRef';

// 각 화면 컴포넌트 import
import Main from './src/Pages/MainScreen';
import UserSelect from './src/Pages/UserSelect';
import Result from './src/Pages/Result';
import MyEstimate from './src/Pages/MyEstimate';
import MyChat from './src/Pages/MyChat';
import SimulationTest from './src/Pages/SimulationTest';
import Intro from './src/Pages/Intro';
import LoginPage from './src/Pages/LoginPage';
import AuthCallbackPage from './src/Pages/AuthCallbackPage';
import AuthFailedPage from './src/Pages/AuthFailedPage';

// 각 화면의 매개변수 타입들을 정의하고 있는 타입 import
import { RootStackParamList } from './src/types/navigation';

// createNativeStackNavigator: 네비게이션 엔진을 생성하는 함수임.
// 두 가지 컴포넌트를 갖고 있다.
// 1. Stack.Navigator: 네비게이션의 전체적인 설정을 담당하는 부분
// 2. Stack.Screen: 각 스크린을 정의하는 자식 컴포넌트다.
// <RootStackParamList>: 각 화면으로 이동할 때 어떤 데이터를 전달하는지 명시해놓았다. 이 설정이 없다면 화면 전환시에 데이터가 없어도 오류 감지를 못한다. 즉, 화면 전환시에 필요한 데이터를 명시함으로써 데이터가 없다면 오류를 내도록 의도한 것이다.
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  // 얘가 있어야 뒤로가기가 됨.
  const linking = {
    prefixes: ['http://localhost:8081', 'isajjim://'],
    config: {
      // 주소에 뜨는 경로
      screens: {
        Intro: 'intro',
        Main: 'main',
        UserSelect: 'user-select',
        Result: 'result',
        MyEstimate: 'my-estimate',
        MyChat: 'my-chat',
        SimulationTest: 'simulation-test',
        // 인증 관련 경로
        Login: 'login',
        AuthCallback: 'auth/register',
        AuthFailed: 'auth/failed',
      },
    },
  };

  return (
    // NavigationContainer: 앱의 네비게이션 트리를 관리하는 최상위 컴포넌트
    <AuthProvider>
      <EstimateProvider>
        <NavigationContainer linking={linking} ref={navigationRef}>
          {/* Stack.Navigator: 각 화면을 스택처럼 쌓아 관리 */}
          <Stack.Navigator
            initialRouteName="Intro" // 첫 화면의 name
            screenOptions={{
              headerShown: false, // 헤더 숨김
              contentStyle: { backgroundColor: 'white' },
              title: '이삿찜'
            }}
          >
            {/* Stack.Screen: 각 화면을 정의. 각각의 component에는 컴포넌트 명을 써야함 */}
            {/* name은 MainScreen이나 UserSelect에서 부를 때 파라미터와 일치해야함 */}
            <Stack.Screen name="Intro" component={Intro} />
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="UserSelect" component={UserSelect} />
            <Stack.Screen name="Result" component={Result} />
            <Stack.Screen name="MyEstimate" component={MyEstimate} />
            <Stack.Screen name="MyChat" component={MyChat} />
            <Stack.Screen name="SimulationTest" component={SimulationTest} />
            {/* 인증 화면 */}
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="AuthCallback" component={AuthCallbackPage} />
            <Stack.Screen name="AuthFailed" component={AuthFailedPage} />
          </Stack.Navigator>
        </NavigationContainer>
      </EstimateProvider>
    </AuthProvider>
  );
}
