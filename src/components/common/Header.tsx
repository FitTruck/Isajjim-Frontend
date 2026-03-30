import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, Pressable, Platform } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import MyTouch from "./MyTouch";
import { useEstimate } from '../../context/EstimateContext';
import { useAuth } from '../../context/AuthContext';
import { getAccessToken, getRefreshToken, setRedirectPath } from '../../auth/tokenStorage';
import { BACKEND_DOMAIN } from '../../utils/Server';

// 호버 효과가 적용된 메뉴 아이템 컴포넌트
const HoverableMenuItem = ({ label, onPress, isActive, isMobile, showBadge = false }: { label: string, onPress: () => void, isActive?: boolean, isMobile: boolean, showBadge?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore
      onHoverIn={() => setIsHovered(true)}
      // @ts-ignore
      onHoverOut={() => setIsHovered(false)}
      style={styles.menuItem}
    >
      <View
        style={[
          styles.hoverBackground,
          isHovered && { opacity: 1 }
        ]}
      />
      <Text style={[
        styles.mypageText,
        isMobile && styles.mobileMypageText,
        (isActive) && { color: '#F0893B', fontWeight: '600' }
      ]}>
        {label}
      </Text>
      {showBadge && <View style={[styles.Badge, isMobile && styles.mobileBadge]} />}
      {isActive && <View style={[styles.activeBar, isMobile && styles.mobileActiveBar]} />}
    </Pressable>
  );
};

export default function Header() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { estimateStatus, chatList } = useEstimate();
  const { isAuthenticated, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileWrapperRef = useRef<any>(null);

  // 읽지 않은 채팅이 있는지 확인
  const hasUnreadChats = chatList.some(chat => chat.isUnread);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    if (!profileMenuOpen || Platform.OS !== 'web') return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileWrapperRef.current && !profileWrapperRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileMenuOpen]);

  const onGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Intro' }],
    });
  };

  const onGoMyEstimate = () => {
    navigation.navigate('MyEstimate');
  };

  const onGoMyChat = () => {
    navigation.navigate('MyChat');
  };

  const onGoMyPage = () => {
    setProfileMenuOpen(false);
    // 마이페이지 화면이 구현되면 아래 주석 해제
    // navigation.navigate('MyPage');
  };

  const onLogout = async () => {
    setProfileMenuOpen(false);
    try {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();
      const url = `${BACKEND_DOMAIN}/api/v1/auth/logout${refreshToken ? `?refreshToken=${refreshToken}` : ''}`;
      await fetch(url, {
        method: 'POST',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
    } catch (_) {
      // 로그아웃 API 실패해도 토큰은 삭제
    } finally {
      logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Intro' }],
      });
    }
  };

  return (
    <View style={[styles.header, isMobile && styles.mobileHeader]}>
      <View style={[styles.headerContent, isMobile && styles.mobileHeaderContent]}>
        <MyTouch style={styles.logoContainer} onPress={onGoHome}>
          <Image source={require('../../../assets/Logo.png')} style={styles.logoIcon} />
          <Text style={[styles.logoText, isMobile && styles.mobileLogoText]}>이삿찜</Text>
        </MyTouch>

        <View style={[styles.headerRight, isMobile && styles.mobileHeaderRight]}>
          {isAuthenticated && (
            <>
              <HoverableMenuItem
                label="내 견적"
                onPress={onGoMyEstimate}
                isActive={route.name === 'MyEstimate'}
                isMobile={isMobile}
              />

              <HoverableMenuItem
                label="채팅"
                onPress={onGoMyChat}
                isActive={route.name === 'MyChat'}
                isMobile={isMobile}
                showBadge={estimateStatus === 'active' || hasUnreadChats}
              />
            </>
          )}

          {isAuthenticated ? (
            <View ref={profileWrapperRef} style={styles.profileWrapper}>
              <Pressable onPress={() => setProfileMenuOpen(prev => !prev)} style={styles.profileButton}>
                <View style={styles.profileAvatar}>
                  <View style={styles.profileAvatarHead} />
                  <View style={styles.profileAvatarBody} />
                </View>
              </Pressable>

              {profileMenuOpen && (
                <View style={styles.profileMenu}>
                  <Pressable style={styles.profileMenuItem} onPress={onGoMyPage}>
                    <Text style={styles.profileMenuText}>마이페이지</Text>
                  </Pressable>
                  <View style={styles.profileMenuDivider} />
                  <Pressable style={styles.profileMenuItem} onPress={onLogout}>
                    <Text style={[styles.profileMenuText, styles.logoutText]}>로그아웃</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <MyTouch
              style={styles.loginButton}
              onPress={() => {
                setRedirectPath(route.name);
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.loginButtonText}>로그인</Text>
            </MyTouch>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: (Platform.OS === 'web' ? '100vw' : '100%') as any,
    height: 65,
    alignSelf: 'stretch',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    // @ts-ignore
    backdropFilter: 'blur(7px)',
    paddingHorizontal: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 237, 243, 0.5)',
  },
  headerContent: {
    width: '100%',
    maxWidth: 1240,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  mobileHeaderContent: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  mobileHeader: {
    height: 50,
    paddingHorizontal: 20,
  },
  logoContainer: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    marginTop: 10,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.5,
  },
  mobileLogoText: {
    fontSize: 20,
  },
  headerRight: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 40,
  },
  mobileHeaderRight: {
    gap: 15,
  },
  mypageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  mobileMypageText: {
    fontSize: 13,
  },
  Badge: {
    width: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: '#F36845',
    position: 'absolute',
    top: 23,
    right: -11,
  },
  mobileBadge: {
    width: 5,
    height: 5,
    top: 20,
    right: -8,
  },
  menuItem: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeBar: {
    position: 'absolute',
    bottom: 0,
    width: 70,
    height: 4,
    backgroundColor: '#F0893B',
  },
  mobileActiveBar: {
    width: 50,
    height: 3,
  },
  hoverBackground: {
    position: 'absolute',
    width: 70,
    height: '100%',
    backgroundColor: '#FFF6EF',
    borderRadius: 4,
    zIndex: -1,
    opacity: 0,
    // @ts-ignore
    transition: 'opacity 0.2s ease-out',
  },

  // 로그인 버튼
  loginButton: {
    backgroundColor: '#F0893B',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },

  // 프로필 아이콘 & 드롭다운
  profileWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  profileAvatarHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#AAAAAA',
    position: 'absolute',
    top: 6,
  },
  profileAvatarBody: {
    width: 24,
    height: 14,
    borderRadius: 12,
    backgroundColor: '#AAAAAA',
    marginBottom: -2,
  },
  profileMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    // @ts-ignore
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    zIndex: 200,
    minWidth: 130,
    overflow: 'hidden',
  },
  profileMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  profileMenuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  logoutText: {
    color: '#E53935',
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 10,
  },
});
