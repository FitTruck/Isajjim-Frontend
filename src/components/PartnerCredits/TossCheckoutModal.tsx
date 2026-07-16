import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { ChargeReadyResponse } from '../../types/partnerCredit';
import { parseQueryString } from '../../utils/queryString';

let WebView: any;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

interface TossCheckoutModalProps {
  visible: boolean;
  chargeData: ChargeReadyResponse | null;
  onClose: () => void;
  onSuccess: (params: { paymentKey: string; orderId: string; amount: string }) => void;
  onFail: (params: { code?: string; message?: string }) => void;
}

export default function TossCheckoutModal({
  visible, chargeData, onClose, onSuccess, onFail,
}: TossCheckoutModalProps) {
  const handledRef = useRef(false);

  const handleShow = () => {
    handledRef.current = false;
  };

  const tryIntercept = (url: string): boolean => {
    if (!chargeData || handledRef.current) return false;

    if (url.startsWith(chargeData.successUrl)) {
      handledRef.current = true;
      const q = parseQueryString(url.split('?')[1] ?? '');
      onSuccess({ paymentKey: q.paymentKey, orderId: q.orderId, amount: q.amount });
      return true;
    }
    if (url.startsWith(chargeData.failUrl)) {
      handledRef.current = true;
      const q = parseQueryString(url.split('?')[1] ?? '');
      onFail({ code: q.code, message: q.message });
      return true;
    }
    return false;
  };

  const html = chargeData ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://js.tosspayments.com/v1/payment"></script>
      </head>
      <body>
        <script>
          var tossPayments = TossPayments(${JSON.stringify(chargeData.clientKey)});
          tossPayments.requestPayment('카드', {
            amount: ${JSON.stringify(chargeData.amount)},
            orderId: ${JSON.stringify(chargeData.orderId)},
            orderName: ${JSON.stringify(chargeData.orderName)},
            successUrl: ${JSON.stringify(chargeData.successUrl)},
            failUrl: ${JSON.stringify(chargeData.failUrl)}
          });
        </script>
      </body>
    </html>
  ` : '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleShow}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>결제</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <X size={22} color="#423E3E" />
          </TouchableOpacity>
        </View>
        {chargeData && (
          <WebView
            originWhitelist={['*']}
            source={{ html, baseUrl: 'https://isajjim.kro.kr' }}
            domStorageEnabled
            style={{ flex: 1 }}
            onShouldStartLoadWithRequest={(request) => !tryIntercept(request.url)}
            onNavigationStateChange={(navState) => tryIntercept(navState.url)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  title: { fontSize: 14, fontWeight: '700', color: '#423E3E' },
  closeBtn: { width: 32, alignItems: 'flex-end' },
});
