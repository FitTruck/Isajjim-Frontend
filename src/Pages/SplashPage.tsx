import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export default function SplashPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }, 1000);
    return () => clearTimeout(timer);
  }, [navigation, isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.tagline}>사진 1장으로 끝내는 AI 이사 견적, 이삿찜</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 128,
    height: 128,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 83,
    height: 69,
    resizeMode: 'contain',
  },
  tagline: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.08,
    textAlign: 'center',
  },
});
