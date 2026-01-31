import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

export default function Header() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
        <TouchableOpacity onPress={onGoMyEstimate}>
          <Text style={[styles.mypageText, isMobile && styles.mobileMypageText]}>내 견적</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onGoMyChat}>
          <Text style={[styles.mypageText, isMobile && styles.mobileMypageText]}>채팅</Text>
          {true && <View style={styles.Badge}></View>}
        </TouchableOpacity>
        <TouchableOpacity>
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
    borderBottomColor: 'rgb(233, 227, 220)', 
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
    color: '#3D3D3A', 
    fontFamily: 'sans-serif', 
    letterSpacing: -0.5,
  },
  mobileLogoText: {
    fontSize: 20,
  },
  headerRight: {
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
    color: '#3D3D3A', 
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
    top: 5,
    right: -11,
  },
  
});
