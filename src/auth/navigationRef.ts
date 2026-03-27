import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

// Axios 인터셉터 등 React 컴포넌트 외부에서 네비게이션이 필요할 때 사용
export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

export const navigateTo = (name: keyof RootStackParamList, params?: any) => {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.navigate(name as any, params);
  }
};

export const resetToLogin = () => {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }
};
