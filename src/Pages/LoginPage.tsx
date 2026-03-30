import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { BACKEND_DOMAIN } from '../utils/Server';
import { setLastProvider, getLastProvider } from '../auth/tokenStorage';

type Provider = 'naver' | 'kakao' | 'google';

const PROVIDERS: { id: Provider; label: string; color: string; textColor: string }[] = [
  { id: 'naver',  label: '네이버로 시작하기',   color: '#03C75A', textColor: '#fff' },
  { id: 'kakao',  label: '카카오로 시작하기',   color: '#FEE500', textColor: '#000' },
  { id: 'google', label: 'Google로 시작하기',   color: '#fff',    textColor: '#333' },
];

const openOAuth = (provider: Provider) => {
  setLastProvider(provider);
  const url = `${BACKEND_DOMAIN}/oauth2/authorization/${provider}`;
  if (Platform.OS === 'web') {
    // 웹: 현재 탭에서 OAuth 리다이렉트
    window.location.href = url;
  } else {
    // 모바일: 외부 브라우저 열기
    Linking.openURL(url);
  }
};

export default function LoginPage() {
  const lastProvider = getLastProvider();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>이삿찜</Text>
        <Text style={styles.subtitle}>AI가 견적을 찾아드립니다</Text>
      </View>

      <View style={styles.buttons}>
        {PROVIDERS.map(({ id, label, color, textColor }) => {
          const isRecent = lastProvider === id;
          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.button, 
                { backgroundColor: color }, 
                id === 'google' && styles.buttonBorder,
                isRecent && styles.recentButton
              ]}
              onPress={() => openOAuth(id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
              {isRecent && (
                <View style={styles.recentBadge}>
                  <Text style={styles.recentBadgeText}>최근 로그인</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#888',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  buttonBorder: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recentButton: {
    // 최근 로그인 버튼에 약간의 효과를 줄 수 있음
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentBadge: {
    position: 'absolute',
    right: 12,
    top: -10,
    backgroundColor: '#F0893B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 10,
  },
  recentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
