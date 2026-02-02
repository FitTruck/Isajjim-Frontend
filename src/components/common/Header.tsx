import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

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
      <TouchableOpacity style={styles.logoContainer} onPress={onGoHome}>
        <Image source={require('../../../assets/Logo.png')} style={styles.logoIcon} />
        <Text style={[styles.logoText, isMobile && styles.mobileLogoText]}>이삿찜</Text>
      </TouchableOpacity>

      <View style={[styles.headerRight, isMobile && styles.mobileHeaderRight]}>  
        {/* 내 견적: 조건부 렌더링 */}
        {route.name === 'MyEstimate' ? (
          <TouchableOpacity onPress={onGoMyEstimate} style={styles.menuItem}>
            <Text style={[styles.mypageText, isMobile && styles.mobileMypageText, { color: '#EA6500', fontWeight: '700' }]}>내 견적</Text>
            <View style={styles.activeBar} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onGoMyEstimate} style={styles.menuItem}>
            <Text style={[styles.mypageText, isMobile && styles.mobileMypageText]}>내 견적</Text>
          </TouchableOpacity>
        )}

        {/* 채팅: 조건부 렌더링 */}
        {route.name === 'MyChat' ? (
          <TouchableOpacity onPress={onGoMyChat} style={styles.menuItem}>
            <Text style={[styles.mypageText, isMobile && styles.mobileMypageText, { color: '#EA6500', fontWeight: '700' }]}>채팅</Text>
            {true && <View style={styles.Badge} />}
            <View style={styles.activeBar} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onGoMyChat} style={styles.menuItem}>
            <Text style={[styles.mypageText, isMobile && styles.mobileMypageText]}>채팅</Text>
            {true && <View style={styles.Badge} />}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.mypageText, isMobile && styles.mobileMypageText]}>문의하기</Text>
        </TouchableOpacity>
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
  
});
