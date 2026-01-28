import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

interface HeaderProps {
  onGoHome: () => void;
}

export default function Header({ onGoHome }: HeaderProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[styles.header, isMobile && styles.mobileHeader]}>
      <TouchableOpacity onPress={onGoHome}>
        <Text style={[styles.logoText, isMobile && styles.mobileLogoText]}>이삿찜</Text>
      </TouchableOpacity>
      <View style={[styles.headerRight, isMobile && styles.mobileHeaderRight]}>
        <TouchableOpacity>
          <Text style={[styles.mypageText, isMobile && styles.mobileMypageText]}>마이페이지</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.loginButton, isMobile && styles.mobileLoginButton]}>
          <Text style={[styles.loginButtonText, isMobile && styles.mobileLoginButtonText]}>로그인</Text>
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
    paddingHorizontal: '5%',
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
    gap: 24,
  },
  mobileHeaderRight: {
    gap: 12,
  },
  mypageText: { 
    fontSize: 15,
    fontWeight: '500',
    color: '#3D3D3A', 
  },
  mobileMypageText: {
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: '#F0893B', 
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4, 
  },
  mobileLoginButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  mobileLoginButtonText: {
    fontSize: 12,
  },
});
