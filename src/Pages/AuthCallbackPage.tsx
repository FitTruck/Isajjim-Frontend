import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';

type AuthCallbackRouteProp = RouteProp<RootStackParamList, 'AuthCallback'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AuthCallbackPage() {
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AuthCallbackRouteProp>();

  useEffect(() => {
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (Platform.OS === 'web') {
      // 웹: window.location.search에서 직접 파싱 (쿼리스트링이 있을 때)
      const params = new URLSearchParams(window.location.search);
      accessToken = params.get('accessToken');
      refreshToken = params.get('refreshToken');
    }

    // React Navigation이 쿼리 파라미터를 route.params로 전달한 경우 fallback
    if (!accessToken && route.params?.accessToken) {
      accessToken = route.params.accessToken;
      refreshToken = route.params.refreshToken ?? null;
    }

    if (accessToken && refreshToken) {
      login(accessToken, refreshToken);
      navigation.reset({ index: 0, routes: [{ name: 'Intro' }] });
    } else {
      // 토큰이 없으면 로그인 페이지로
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#555" />
      <Text style={styles.text}>로그인 처리 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 15,
    color: '#888',
  },
});
