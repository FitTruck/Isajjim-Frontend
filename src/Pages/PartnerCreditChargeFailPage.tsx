import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XCircle } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { parseQueryString } from '../utils/queryString';

export default function PartnerCreditChargeFailPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [message, setMessage] = useState('결제가 취소되었어요.');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const params = parseQueryString(window.location.search);
    if (params.code === 'CREDIT-005') {
      setMessage('결제 승인에 실패했습니다.');
    } else if (params.message) {
      setMessage(params.message);
    }
  }, []);

  const goToCredits = () => {
    navigation.reset({ index: 0, routes: [{ name: 'PartnerCredits' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <XCircle size={48} color="#D93025" />
        <Text style={styles.title}>{message}</Text>
        <Text style={styles.subtitle}>처음부터 다시 시도해주세요.</Text>
        <TouchableOpacity style={styles.btn} onPress={goToCredits}>
          <Text style={styles.btnText}>크레딧 관리로 이동</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24, gap: 12,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#423E3E', textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#949494' },
  btn: {
    marginTop: 12, backgroundColor: '#F36845', height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
