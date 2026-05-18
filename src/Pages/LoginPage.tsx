import React, {useEffect} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import {BACKEND_DOMAIN} from '../utils/Server';
import {getLastProvider, setLastProvider} from '../auth/tokenStorage';
import {useAuth} from '../context/AuthContext';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';

type Provider = 'naver' | 'kakao' | 'google';

// 각 서비스별 아이콘 컴포넌트
const NaverIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18">
    <Path fill="#fff" d="M18 18h-5.9L5.9 9.3V18H0V0h5.9l6.2 8.7V0h5.9v18z" />
  </Svg>
);

const KakaoIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18">
    <Path fill="#000000" d="M9 2C4.03 2 0 5.06 0 8.84c0 2.45 1.69 4.6 4.23 5.86l-1.07 3.93c-.06.23.2.43.39.31l4.63-3.07c.27.02.55.04.82.04 4.97 0 9-3.06 9-6.84S13.97 2 9 2z" />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </Svg>
);

const PROVIDERS: { id: Provider; label: string; color: string; textColor: string; Icon: React.FC }[] = [
  { id: 'naver',  label: '네이버로 3초만에 시작하기', color: '#03A94D', textColor: '#FFFFFF', Icon: NaverIcon },
  { id: 'kakao',  label: '카카오 로그인',     color: '#FEE500', textColor: '#000000', Icon: KakaoIcon },
  { id: 'google', label: 'Google 로그인', color: '#fff',    textColor: '#1F1F1F', Icon: GoogleIcon },
];

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const lastProvider = getLastProvider();
  const hasHistory = !!lastProvider;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const openOAuth = (provider: Provider) => {
    setLastProvider(provider);
    if (Platform.OS === 'web') {
      const protocol = window.location.hostname === 'localhost' ? 'http' : 'https';
      const redirectUri = `${protocol}://${window.location.host}/oauth2/callback`;
      window.location.href = `${BACKEND_DOMAIN}/oauth2/authorization/${provider}?redirect_uri=${redirectUri}`;
    } else {
      const redirectUri = 'isajjim://oauth2/callback';
      const url = `${BACKEND_DOMAIN}/oauth2/authorization/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;
      WebBrowser.openBrowserAsync(url);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && Platform.OS === 'web') {
      const referrer = document.referrer;
      const currentHost = window.location.host;
      if (referrer && referrer.includes(currentHost)) {
        if (new URL(referrer).pathname !== '/login') {
          window.history.back();
        } else {
          navigation.navigate('Main');
        }
      } else {
        navigation.navigate('Main');
      }
    }
  }, [isAuthenticated, isLoading, navigation]);

  if (isLoading) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.hero, isMobile && styles.mobileHero]}>
        <Text style={[styles.title, isMobile && styles.mobileTitle]}>이삿찜</Text>
        <Text style={[styles.subtitle, isMobile && styles.mobileSubtitle]}>더 똑똑하게, 더 가볍게.</Text>
      </View>

      <View style={styles.buttons}>
        {PROVIDERS.map(({ id, label, color, textColor, Icon }) => {
          const isRecent = lastProvider === id;
          // 이전 로그인 기록(hasHistory)이 있으면 네이버 문구를 '네이버 로그인'으로 변경
          const displayLabel = (id === 'naver' && hasHistory) ? '네이버 로그인' : label;
          
          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.button, 
                { backgroundColor: color }, 
                id === 'google' && styles.buttonBorder,
              ]}
              onPress={() => { openOAuth(id); }}
              activeOpacity={0.85}
            >
              <View style={styles.iconContainer}>
                <Icon />
              </View>
              <Text style={[styles.buttonText, { color: textColor }]}>{displayLabel}</Text>
              {isRecent && (
                <View style={styles.recentBadge}>
                  <Text style={styles.recentBadgeText}>최근 로그인</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 60,
  },
  mobileHero: {
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  mobileTitle: {
    fontSize: 32,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  mobileSubtitle: {
    fontSize: 14,
  },
  buttons: {
    width: '100%',
    maxWidth: 360,
    gap: 14,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    position: 'absolute',
    left: 20,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBorder: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentBadge: {
    position: 'absolute',
    right: -10,
    top: -12,
    backgroundColor: '#F0893B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  recentBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});
