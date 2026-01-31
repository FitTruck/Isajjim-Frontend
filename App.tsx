import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 각 화면 컴포넌트 import
import Main from './src/screens/MainScreen';
import UserSelect from './src/screens/UserSelect';
import Result from './src/screens/Result';
import Compare from './src/screens/Compare';

// 각 화면의 매개변수 타입들을 정의하고 있는 타입 import
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const linking = {
    prefixes: ['http://localhost:8081', 'esatzzim://'],
    config: {
      screens: {
        Main: '',
        UserSelect: 'user-select',
        Result: 'result',
        Compare: 'compare',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator 
        initialRouteName="Main"
        screenOptions={{
          headerShown: false, // 헤더 숨김 (필요시 true로 변경 가능)
          contentStyle: { backgroundColor: 'white' }
        }}
      >
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="UserSelect" component={UserSelect} />
        <Stack.Screen 
          name="Result" 
          component={Result} 
          initialParams={{
            data: [{
              fileName: "test.jpg",
              mimeType: "image/jpeg",
              localUri: "https://via.placeholder.com/300",
              width: 500,
              height: 500
            }],
            estimateId: 999,
            ResultOfUserSelect: {
              data: {
                images: [{
                  furnitureList: [
                    { furnitureId: 101, label: "소파", type: "sofa", quantity: 1 },
                    { furnitureId: 102, label: "침대", type: "bed", quantity: 1 }
                  ]
                }],
                items: [
                  { category: "TRUCK", itemType: "1톤", quantity: 2 }
                ]
              }
            }
          }}
        />
        <Stack.Screen name="Compare" component={Compare} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
