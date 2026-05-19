import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import MyTouch from './MyTouch';

export default function Header() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const baseHeight = isMobile ? 50 : 65;

  return (
    <View style={[
      styles.header,
      isMobile && styles.mobileHeader,
      { paddingTop: insets.top, height: baseHeight + insets.top },
    ]}>
      <View style={[styles.headerContent, isMobile && styles.mobileHeaderContent]}>
        <MyTouch
          style={styles.logoContainer}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        >
          <Image source={require('../../../assets/logo.png')} style={styles.logoIcon} />
          <Text style={[styles.logoText, isMobile && styles.mobileLogoText]}>이삿찜</Text>
        </MyTouch>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: (Platform.OS === 'web' ? '100vw' : '100%') as any,
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
  mobileHeader: {
    paddingHorizontal: 20,
  },
  headerContent: {
    width: '100%',
    maxWidth: 1240,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileHeaderContent: {},
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
    color: '#333333',
    letterSpacing: -0.5,
  },
  mobileLogoText: {
    fontSize: 20,
  },
});
