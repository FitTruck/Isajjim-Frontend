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
          <Text style={styles.mypageText}>Mypage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    paddingHorizontal: '5%',
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4', 
  },
  logoText: {
    fontSize: 26, 
    fontWeight: '700', 
    color: '#202124', 
    fontFamily: 'sans-serif', 
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  mypageText: { 
    fontSize: 15,
    fontWeight: '500',
    color: '#5F6368', 
  },
  loginButton: {
    backgroundColor: '#F0893B', 
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
