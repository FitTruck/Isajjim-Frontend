import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EstimateProvider } from './src/context/EstimateContext';
import { AuthProvider } from './src/context/AuthContext';
import { navigationRef } from './src/auth/navigationRef';
import { useFonts } from 'expo-font';
import { Text, Platform, View } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 각 화면 컴포넌트 import
import UploadScreen from './src/Pages/MainScreen';
import UserSelect from './src/Pages/UserSelect';
import Result from './src/Pages/Result';
import MyEstimate from './src/Pages/MyEstimate';
import MyChat from './src/Pages/MyChat';
import SimulationTest from './src/Pages/SimulationTest';
import Main from './src/Pages/Main';
import LoginPage from './src/Pages/LoginPage';
import AuthCallbackPage from './src/Pages/AuthCallbackPage';
import AuthFailedPage from './src/Pages/AuthFailedPage';
import SplashPage from './src/Pages/SplashPage';
import SettingsPage from './src/Pages/SettingsPage';
import PersonalInfoPage from './src/Pages/PersonalInfoPage';
import NotificationSettingsPage from './src/Pages/NotificationSettingsPage';
import PartnerSearchPage from './src/Pages/PartnerSearchPage';

// 각 화면의 매개변수 타입들을 정의하고 있는 타입 import
import { RootStackParamList } from './src/types/navigation';

const PRETENDARD_FONTS = {
  'Pretendard-Thin':       require('./assets/fonts/Pretendard-Thin.otf'),
  'Pretendard-ExtraLight': require('./assets/fonts/Pretendard-ExtraLight.otf'),
  'Pretendard-Light':      require('./assets/fonts/Pretendard-Light.otf'),
  'Pretendard-Regular':    require('./assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium':     require('./assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold':   require('./assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold':       require('./assets/fonts/Pretendard-Bold.otf'),
  'Pretendard-ExtraBold':  require('./assets/fonts/Pretendard-ExtraBold.otf'),
  'Pretendard-Black':      require('./assets/fonts/Pretendard-Black.otf'),
};

const PRETENDARD_WEIGHT_MAP = [
  { weight: 100, src: require('./assets/fonts/Pretendard-Thin.otf') },
  { weight: 200, src: require('./assets/fonts/Pretendard-ExtraLight.otf') },
  { weight: 300, src: require('./assets/fonts/Pretendard-Light.otf') },
  { weight: 400, src: require('./assets/fonts/Pretendard-Regular.otf') },
  { weight: 500, src: require('./assets/fonts/Pretendard-Medium.otf') },
  { weight: 600, src: require('./assets/fonts/Pretendard-SemiBold.otf') },
  { weight: 700, src: require('./assets/fonts/Pretendard-Bold.otf') },
  { weight: 800, src: require('./assets/fonts/Pretendard-ExtraBold.otf') },
  { weight: 900, src: require('./assets/fonts/Pretendard-Black.otf') },
];

function injectPretendardCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pretendard-css')) return;
  let css = '';
  for (const { weight, src } of PRETENDARD_WEIGHT_MAP) {
    if (typeof src === 'string') {
      css += `@font-face{font-family:'Pretendard';font-weight:${weight};src:url('${src}') format('opentype');}\n`;
    }
  }
  if (!css) return;
  const el = document.createElement('style');
  el.id = 'pretendard-css';
  el.textContent = css;
  document.head.appendChild(el);
}

if (!(Text as any).defaultProps) (Text as any).defaultProps = {};
(Text as any).defaultProps.style = {
  fontFamily: Platform.OS === 'web' ? 'Pretendard' : 'Pretendard-Regular',
};

// createNativeStackNavigator: 네비게이션 엔진을 생성하는 함수임.
// 두 가지 컴포넌트를 갖고 있다.
// 1. Stack.Navigator: 네비게이션의 전체적인 설정을 담당하는 부분
// 2. Stack.Screen: 각 스크린을 정의하는 자식 컴포넌트다.
// <RootStackParamList>: 각 화면으로 이동할 때 어떤 데이터를 전달하는지 명시해놓았다. 이 설정이 없다면 화면 전환시에 데이터가 없어도 오류 감지를 못한다. 즉, 화면 전환시에 필요한 데이터를 명시함으로써 데이터가 없다면 오류를 내도록 의도한 것이다.
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts(PRETENDARD_FONTS);

  useEffect(() => {
    if (fontsLoaded && Platform.OS === 'web') injectPretendardCSS();
  }, [fontsLoaded]);


  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

  // 얘가 있어야 뒤로가기가 됨.
  const linking = {
    prefixes: ['http://localhost:8081', 'isajjim://'],
    config: {
      // 주소에 뜨는 경로
      screens: {
        Main: '',
        Upload: 'upload',
        UserSelect: 'user-select',
        Result: 'result',
        MyEstimate: 'my-estimate',
        MyChat: 'my-chat',
        SimulationTest: 'simulation-test',
        // 인증 관련 경로
        Login: 'login',
        AuthCallback: 'oauth2/callback',
        AuthFailed: 'auth/failed',
      },
    },
  };

  return (
    // NavigationContainer: 앱의 네비게이션 트리를 관리하는 최상위 컴포넌트
    <SafeAreaProvider>
    <AuthProvider>
      <EstimateProvider>
        <NavigationContainer linking={linking} ref={navigationRef}>
          {/* Stack.Navigator: 각 화면을 스택처럼 쌓아 관리 */}
          <Stack.Navigator
            initialRouteName="Splash" // 첫 화면의 name
            screenOptions={{
              headerShown: false, // 헤더 숨김
              contentStyle: { backgroundColor: 'white' },
              title: '이삿찜'
            }}
          >
            {/* Stack.Screen: 각 화면을 정의. 각각의 component에는 컴포넌트 명을 써야함 */}
            {/* name은 MainScreen이나 UserSelect에서 부를 때 파라미터와 일치해야함 */}
            <Stack.Screen name="Splash" component={SplashPage} />
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="Upload" component={UploadScreen} />
            <Stack.Screen name="UserSelect" component={UserSelect} />
            <Stack.Screen name="Result" component={Result} />
            <Stack.Screen name="MyEstimate" component={MyEstimate} />
            <Stack.Screen name="MyChat" component={MyChat} />
            <Stack.Screen name="SimulationTest" component={SimulationTest} />
            <Stack.Screen name="PartnerSearch" component={PartnerSearchPage} />
            <Stack.Screen name="Settings" component={SettingsPage} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoPage} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsPage} />
            {/* 인증 화면 */}
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="AuthCallback" component={AuthCallbackPage} />
            <Stack.Screen name="AuthFailed" component={AuthFailedPage} />
          </Stack.Navigator>
        </NavigationContainer>
      </EstimateProvider>
    </AuthProvider>
    </SafeAreaProvider>
  );
}
