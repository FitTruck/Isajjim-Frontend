import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function PersonalInfoPage() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <ChevronLeft size={20} color="#1F2024" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>개인정보 수정</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>준비중인 기능이에요!</Text>
        <Text style={styles.subtitle}>더 나은 경험을 위해 개발중입니다...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  backBtn: { width: 32, justifyContent: 'center' },
  navTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 14, fontWeight: '700', color: '#1F2024',
    marginRight: 32,
  },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24, gap: 10,
  },
  title: {
    fontSize: 24, fontWeight: '800', color: '#1F2024',
    textAlign: 'center', letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12, fontWeight: '500', color: '#71727A',
    textAlign: 'center', lineHeight: 16, letterSpacing: 0.1,
  },
});
