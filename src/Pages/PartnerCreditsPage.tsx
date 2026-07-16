import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList,
  ActivityIndicator, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { ChargeReadyResponse, CreditTransaction } from '../types/partnerCredit';
import {
  chargeReady, getCreditBalance, getCreditTransactions,
} from '../api/partnerCreditApi';
import { handleChargeSuccess } from '../utils/creditCharge';
import { formatWon } from '../utils/format';
import { loadTossPayments } from '../utils/loadTossScript';
import TossCheckoutModal from '../components/PartnerCredits/TossCheckoutModal';

type Phase = 'loading' | 'ready' | 'error' | 'forbidden';

const PRESET_AMOUNTS = [10000, 30000, 50000, 100000];

export default function PartnerCreditsPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [phase, setPhase] = useState<Phase>('loading');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [amountInput, setAmountInput] = useState('');
  const [isCharging, setIsCharging] = useState(false);
  const [chargeData, setChargeData] = useState<ChargeReadyResponse | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const goBackSafely = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const fetchInitial = async () => {
    setPhase('loading');
    try {
      const [balanceRes, txRes] = await Promise.all([
        getCreditBalance(),
        getCreditTransactions(0, 20),
      ]);
      setBalance(balanceRes.balance);
      setTransactions(txRes.content);
      setPage(0);
      setHasNext(1 < txRes.totalPages);
      setPhase('ready');
    } catch (err: any) {
      if (err?.response?.data?.code === 'COMMON-004') {
        setPhase('forbidden');
      } else {
        setPhase('error');
      }
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasNext) return;
    setIsLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getCreditTransactions(next, 20);
      setTransactions(prev => [...prev, ...res.content]);
      setPage(next);
      setHasNext(next + 1 < res.totalPages);
    } catch {
      // 다음 페이지 로드 실패는 조용히 무시 (아래로 스크롤 시 재시도 가능)
    } finally {
      setIsLoadingMore(false);
    }
  };

  const refreshAfterCharge = async (newBalance: number) => {
    setBalance(newBalance);
    try {
      const txRes = await getCreditTransactions(0, 20);
      setTransactions(txRes.content);
      setPage(0);
      setHasNext(1 < txRes.totalPages);
    } catch {
      // 내역 갱신 실패는 조용히 무시
    }
  };

  const parsedAmount = Number(amountInput.replace(/[^0-9]/g, ''));
  const isValidAmount = Number.isInteger(parsedAmount) && parsedAmount > 0;

  const handleChargePress = async () => {
    if (!isValidAmount || isCharging) return;
    setIsCharging(true);
    try {
      const data = await chargeReady(parsedAmount);
      if (Platform.OS === 'web') {
        const TossPayments = await loadTossPayments();
        const tossPayments = TossPayments(data.clientKey);
        tossPayments.requestPayment('카드', {
          amount: data.amount,
          orderId: data.orderId,
          orderName: data.orderName,
          successUrl: data.successUrl,
          failUrl: data.failUrl,
        });
      } else {
        setChargeData(data);
        setCheckoutVisible(true);
      }
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'CREDIT-004') {
        Alert.alert('알림', '충전 금액을 확인해주세요.');
      } else if (code === 'COMMON-004') {
        setPhase('forbidden');
      } else {
        Alert.alert('오류', '충전 요청에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsCharging(false);
    }
  };

  const handleCheckoutClose = () => {
    setCheckoutVisible(false);
    setChargeData(null);
  };

  const handleCheckoutSuccess = async (params: { paymentKey: string; orderId: string; amount: string }) => {
    setCheckoutVisible(false);
    setChargeData(null);
    try {
      const result = await handleChargeSuccess(params);
      await refreshAfterCharge(result.balance);
      Alert.alert(
        '충전 완료',
        result.status === 'confirmed'
          ? `${formatWon(result.chargedCredit)} 충전이 완료됐어요.`
          : '이미 처리된 충전이에요.',
      );
      setAmountInput('');
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'CREDIT-001') {
        Alert.alert('알림', '충전 정보를 찾을 수 없어요. 처음부터 다시 시도해주세요.');
      } else if (code === 'CREDIT-005') {
        Alert.alert('알림', '결제 승인에 실패했습니다. 처음부터 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '결제 처리 중 문제가 발생했어요.');
      }
    }
  };

  const handleCheckoutFail = (params: { code?: string; message?: string }) => {
    setCheckoutVisible(false);
    setChargeData(null);
    Alert.alert('결제 실패', params.message || '결제가 취소되었어요.');
  };

  const renderNavBar = () => (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={goBackSafely} style={styles.backBtn} hitSlop={8}>
        <ChevronLeft size={20} color="#423E3E" />
      </TouchableOpacity>
      <Text style={styles.navTitle}>크레딧 관리</Text>
    </View>
  );

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        {renderNavBar()}
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#F36845" />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'forbidden') {
    return (
      <SafeAreaView style={styles.container}>
        {renderNavBar()}
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>파트너 전용 기능이에요</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={goBackSafely}>
            <Text style={styles.retryBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        {renderNavBar()}
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>정보를 불러오지 못했어요</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchInitial}>
            <Text style={styles.retryBtnText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderNavBar()}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={56}
      >
        <FlatList
          data={transactions}
          keyExtractor={item => String(item.transactionId)}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListHeaderComponent={(
            <View style={styles.headerSection}>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>보유 크레딧</Text>
                <Text style={styles.balanceValue}>{formatWon(balance)}</Text>
              </View>

              <View style={styles.chargeSection}>
                <Text style={styles.sectionLabel}>크레딧 충전</Text>
                <View style={styles.chipRow}>
                  {PRESET_AMOUNTS.map(preset => (
                    <TouchableOpacity
                      key={preset}
                      style={styles.chip}
                      onPress={() => setAmountInput(String(preset))}
                    >
                      <Text style={styles.chipText}>{formatWon(preset)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  value={amountInput}
                  onChangeText={(t) => setAmountInput(t.replace(/[^0-9]/g, ''))}
                  placeholder="충전할 금액을 입력하세요"
                  placeholderTextColor="#B0B0B0"
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={[styles.chargeBtn, (!isValidAmount || isCharging) && styles.chargeBtnDisabled]}
                  onPress={handleChargePress}
                  disabled={!isValidAmount || isCharging}
                >
                  <Text style={styles.chargeBtnText}>{isCharging ? '처리 중...' : '충전하기'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionLabel}>거래 내역</Text>
            </View>
          )}
          renderItem={({ item }) => <TransactionRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          ListEmptyComponent={(
            <Text style={styles.emptyText}>거래 내역이 없어요.</Text>
          )}
          ListFooterComponent={isLoadingMore ? (
            <ActivityIndicator color="#F36845" style={{ marginVertical: 12 }} />
          ) : null}
          contentContainerStyle={styles.scrollContent}
        />
      </KeyboardAvoidingView>

      <TossCheckoutModal
        visible={checkoutVisible}
        chargeData={chargeData}
        onClose={handleCheckoutClose}
        onSuccess={handleCheckoutSuccess}
        onFail={handleCheckoutFail}
      />
    </SafeAreaView>
  );
}

const TX_TYPE_META: Record<CreditTransaction['type'], { label: string; isPositive: boolean }> = {
  CHARGE: { label: '충전', isPositive: true },
  REFUND: { label: '환불', isPositive: false },
  CONSUME: { label: '소모', isPositive: false },
};

function TransactionRow({ item }: { item: CreditTransaction }) {
  const meta = TX_TYPE_META[item.type];
  const dateText = item.createdDate.replace('T', ' ').slice(0, 16);
  return (
    <View style={styles.txRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.txType}>{meta.label}</Text>
        <Text style={styles.txDate}>{dateText}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.txAmount, { color: meta.isPositive ? '#1E8E5A' : '#D93025' }]}>
          {meta.isPositive ? '+' : '-'}{formatWon(item.creditAmount)}
        </Text>
        <Text style={styles.txBalance}>잔액 {formatWon(item.balanceAfter)}</Text>
      </View>
    </View>
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
    fontSize: 14, fontWeight: '700', color: '#423E3E',
    marginRight: 32,
  },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errorTitle: { fontSize: 14, fontWeight: '600', color: '#423E3E' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 12, borderWidth: 2, borderColor: '#F36845',
  },
  retryBtnText: { fontSize: 13, fontWeight: '600', color: '#F36845' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  headerSection: { gap: 20, marginBottom: 8 },
  balanceCard: {
    backgroundColor: '#FAF5F0', borderRadius: 16,
    paddingVertical: 24, paddingHorizontal: 20, gap: 6,
  },
  balanceLabel: { fontSize: 12, fontWeight: '600', color: '#949494' },
  balanceValue: { fontSize: 28, fontWeight: '800', color: '#423E3E' },
  chargeSection: { gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#423E3E' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: '#E8E8E8',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#423E3E' },
  input: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8',
    paddingHorizontal: 14, fontSize: 14, color: '#423E3E',
  },
  chargeBtn: {
    backgroundColor: '#F36845', height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  chargeBtnDisabled: { opacity: 0.5 },
  chargeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA' },
  emptyText: { fontSize: 13, color: '#949494', textAlign: 'center', paddingVertical: 24 },
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 14,
  },
  txType: { fontSize: 13, fontWeight: '600', color: '#423E3E' },
  txDate: { fontSize: 11, color: '#949494', marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txBalance: { fontSize: 11, color: '#949494', marginTop: 2 },
});
