import Reactotron from 'reactotron-react-native';
import { Platform } from 'react-native';

// Android 에뮬레이터는 10.0.2.2, 실기기는 adb reverse 후 localhost 사용
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

Reactotron.configure({ host: HOST, port: 9090 })
  .useReactNative({
    networking: {
      ignoreUrls: /symbolicate/,
    },
  })
  .connect();

export default Reactotron;
