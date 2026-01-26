import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HeaderProps {
  onGoHome: () => void;
}

export default function Header({ onGoHome }: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onGoHome}>
        <Text style={styles.logoText}>이삿찜</Text>
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity>
          <Text style={styles.mypageText}>마이페이지</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 80, 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100, 
    backgroundColor: 'rgb(250, 249, 245)', 
    paddingHorizontal: '5%',
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(221, 215, 208, 1)', 
  },
  logoText: {
    fontSize: 26, 
    fontWeight: '700', 
    color: '#3D3D3A', 
    fontFamily: 'sans-serif', 
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  mypageText: { 
    fontSize: 15,
    fontWeight: '500',
    color: '#3D3D3A', 
  },
  loginButton: {
    backgroundColor: '#D97757', 
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4, 
  },
  loginButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
