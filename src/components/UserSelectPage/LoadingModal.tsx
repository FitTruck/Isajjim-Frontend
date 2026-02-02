import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingModalProps {
  visible: boolean;
}

const LoadingModal = ({ visible }: LoadingModalProps) => {
  const message = "AI가 견적을 분석 중입니다...";
  const subMessage = "잠시만 기다려주세요.";

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
    >
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>{message}</Text>
          <Text style={styles.loadingSubText}>{subMessage}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검은 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#333333',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 20,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubText: {
    marginTop: 10,
    color: '#cccccc',
    fontSize: 14,
  },
});

export default LoadingModal;
