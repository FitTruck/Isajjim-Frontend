import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingModalProps {
  visible: boolean;
}

const LoadingModal = ({ visible }: LoadingModalProps) => {
  const message = "AI가 견적을 분석 중입니다";

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
    >
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#F0893B" />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: 'white',
    paddingVertical: 35,
    paddingHorizontal: 45,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  loadingText: {
    marginTop: 20,
    color: '#333333', // 진한 회색
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
});

export default LoadingModal;
