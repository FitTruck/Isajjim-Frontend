import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions, Pressable } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import MyTouch from "./MyTouch";

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
        (isActive) && { color: '#EA6500', fontWeight: '700' }
      ]}>
        {label}
      </Text>
      {showBadge && <View style={styles.Badge} />}
      {isActive && <View style={styles.activeBar} />}
    </Pressable>
  );
};

export default function Header() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  const onGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
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
      <MyTouch style={styles.logoContainer} onPress={onGoHome}>
        <Image source={require('../../../assets/Logo.png')} style={styles.logoIcon} />
        <Text style={[styles.logoText, isMobile && styles.mobileLogoText]}>이삿찜</Text>
      </MyTouch>

      <View style={[styles.headerRight, isMobile && styles.mobileHeaderRight]}>  
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
          showBadge={true}
        />

        <HoverableMenuItem 
          label="문의하기" 
          onPress={() => {}} 
          isMobile={isMobile} 
        />
      </View> 
      
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 65, 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100, 
    backgroundColor: 'rgb(255, 255, 255)', 
    paddingHorizontal: '20%',
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 237, 243, 1)', 
  },
  mobileHeader: {
    height: 50,
    paddingHorizontal: 16,
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
    fontFamily: 'sans-serif', 
    letterSpacing: -0.5,
  },
  mobileLogoText: {
    fontSize: 20,
  },
  headerRight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  mobileHeaderRight: {
    gap: 12,
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
    backgroundColor: '#FF8383',
    position: 'absolute',
    top: 23,
    right: -11,
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
    height: 5,
    backgroundColor: '#EA6500',
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
  
});
