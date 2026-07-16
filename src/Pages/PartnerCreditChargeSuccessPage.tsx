import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { handleChargeSuccess, ChargeSuccessResult } from '../utils/creditCharge';
import { parseQueryString } from '../utils/queryString';
import { formatWon } from '../utils/format';

type ViewState =
  | { phase: 'processing' }
  | { phase: 'success'; result: ChargeSuccessResult }
  | { phase: 'error'; message: string }
  | { phase: 'invalid' };

export default function PartnerCreditChargeSuccessPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [state, setState] = useState<ViewState>({ phase: 'processing' });

  useEffect(() => {
    process();
  }, []);

  const process = async () => {
    if (Platform.OS !== 'web') {
      setState({ phase: 'invalid' });
      return;
    }
    const params = parseQueryString(window.location.search);
    if (!params.paymentKey || !params.orderId || !params.amount) {
      setState({ phase: 'invalid' });
      return;
    }
    try {
      const result = await handleChargeSuccess({
        paymentKey: params.paymentKey,
        orderId: params.orderId,
        amount: params.amount,
      });
      setState({ phase: 'success', result });
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'CREDIT-001') {
        setState({ phase: 'error', message: '충전 정보를 찾을 수 없어요. 처음부터 다시 시도해주세요.' });
      } else if (code === 'CREDIT-005') {
        setState({ phase: 'error', message: '결제 승인에 실패했습니다. 처음부터 다시 시도해주세요.' });
      } else {
        setState({ phase: 'error', message: '결제 처리 중 문제가 발생했어요.' });
      }
    }
  };

  const goToCredits = () => {
    navigation.reset({ index: 0, routes: [{ name: 'PartnerCredits' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {state.phase === 'processing' && (
          <ActivityIndicator size="large" color="#F36845" />
        )}

        {state.phase === 'success' && (
          <>
            <CheckCircle2 size={48} color="#1E8E5A" />
            <Text style={styles.title}>
              {state.result.status === 'confirmed' ? '충전이 완료됐어요' : '이미 처리된 충전이에요'}
            </Text>
            {state.result.status === 'confirmed' && (
              <Text style={styles.subtitle}>{formatWon(state.result.chargedCredit)} 충전됨</Text>
            )}
            <Text style={styles.balanceText}>현재 잔액 {formatWon(state.result.balance)}</Text>
            <TouchableOpacity style={styles.btn} onPress={goToCredits}>
              <Text style={styles.btnText}>크레딧 관리로 이동</Text>
            </TouchableOpacity>
          </>
        )}

        {state.phase === 'error' && (
          <>
            <XCircle size={48} color="#D93025" />
            <Text style={styles.title}>{state.message}</Text>
            <TouchableOpacity style={styles.btn} onPress={goToCredits}>
              <Text style={styles.btnText}>크레딧 관리로 이동</Text>
            </TouchableOpacity>
          </>
        )}

        {state.phase === 'invalid' && (
          <>
            <Text style={styles.title}>잘못된 접근이에요</Text>
            <TouchableOpacity style={styles.btn} onPress={goToCredits}>
              <Text style={styles.btnText}>크레딧 관리로 이동</Text>
            </TouchableOpacity>
          </>
        )}
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
  subtitle: { fontSize: 14, fontWeight: '600', color: '#423E3E' },
  balanceText: { fontSize: 13, color: '#949494' },
  btn: {
    marginTop: 12, backgroundColor: '#F36845', height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
