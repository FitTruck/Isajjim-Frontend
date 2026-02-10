import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, Pressable, Platform } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import MyTouch from "./MyTouch";
import { useEstimate } from '../../context/EstimateContext';

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
      {isActive && <View style={styles.activeBar} />}
    </Pressable>
  );
};

export default function Header() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { estimateStatus } = useEstimate();

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


  return (
    <View style={[styles.header, isMobile && styles.mobileHeader]}>
      <View style={[styles.headerContent, isMobile && styles.mobileHeaderContent]}>
        <MyTouch style={styles.logoContainer} onPress={onGoHome}>
          <Image source={require('../../../assets/Logo.png')} style={styles.logoIcon} />
          <Text style={[styles.logoText, isMobile && styles.mobileLogoText]}>이삿찜</Text>
        </MyTouch>

        <View style={[styles.headerRight, isMobile && styles.mobileHeaderRight]}>  
          {route.name === 'Intro' ? (
             <MyTouch style={styles.introStartButton} onPress={onGoHome}>
                <Text style={styles.introStartButtonText}>시작하기</Text>
             </MyTouch>
          ) : (
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
                showBadge={estimateStatus === 'active'}
              />

              <HoverableMenuItem 
                label="문의하기" 
                onPress={() => {}} 
                isMobile={isMobile} 
              />
            </>
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
    alignSelf: 'stretch', // Ensure header fills width even if parent is centered
    // position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    // @ts-ignore
    backdropFilter: 'blur(7px)',
    paddingHorizontal: 50, // 왼쪽/오른쪽 여백 축소
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center', // 내부 컨텐츠 중앙 정렬
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
    // position: 'absolute' 제거하여 flex layout 따르도록 수정
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // 오른쪽 정렬
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
  
  introStartButton: {
    backgroundColor: '#F0893B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introStartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
