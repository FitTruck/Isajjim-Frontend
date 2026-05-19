import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { getRedirectPath, clearRedirectPath } from '../auth/tokenStorage';
import { getAgreeTerms, postAgreeTerms } from '../api/terms';
import TermsModal from '../components/common/TermsModal';

type AuthCallbackRouteProp = RouteProp<RootStackParamList, 'AuthCallback'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AuthCallbackPage() {
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AuthCallbackRouteProp>();
  const [showTerms, setShowTerms] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string>('Main');

  const goToTarget = (route: string) => {
    navigation.reset({ index: 0, routes: [{ name: route as any }] });
  };

  useEffect(() => {
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (Platform.OS === 'web') {
      const params = new URLSearchParams(window.location.search);
      accessToken = params.get('accessToken');
      refreshToken = params.get('refreshToken');
    }

    if (!accessToken && route.params?.accessToken) {
      accessToken = route.params.accessToken;
      refreshToken = route.params.refreshToken ?? null;
    }

    if (accessToken && refreshToken) {
      login(accessToken, refreshToken);

      const redirectPath = getRedirectPath();
      clearRedirectPath();
      const destination = (redirectPath && redirectPath !== 'Login' && redirectPath !== 'AuthCallback')
        ? redirectPath
        : 'Main';
      setTargetRoute(destination);

      getAgreeTerms()
        .then((agreed) => {
          if (agreed) {
            goToTarget(destination);
          } else {
            setShowTerms(true);
          }
        })
        .catch(() => {
          // agree-terms API 실패 시 홈으로 이동
          goToTarget(destination);
        });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, []);

  const handleTermsConfirm = async () => {
    await postAgreeTerms();
    goToTarget(targetRoute);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!showTerms && (
        <>
          <ActivityIndicator size="large" color="#555" />
          <Text style={styles.text}>로그인 처리 중...</Text>
        </>
      )}
      <TermsModal visible={showTerms} onConfirm={handleTermsConfirm} />
    </SafeAreaView>
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
