import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { BACKEND_DOMAIN } from '../../utils/Server';
import { useEstimate } from '../../context/EstimateContext';

interface Message {
  id: string;
  type: 'text' | 'quote' | 'intro';
  text?: string;
  isMe: boolean;
  time: string;
  price: string;
}

interface ConfirmButtonProps {
  messages: Message[];
  onConfirm?: (summary: string) => void;
}

export default function ConfirmButton({ messages, onConfirm }: ConfirmButtonProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { requestData } = useEstimate();

  const handleConfirm = async () => {
    console.log('handleConfirm clicked'); // 디버깅용

    const estimateId = requestData?.estimateId;
    console.log('estimateId:', estimateId); // 디버깅용

    if (!estimateId) {
      console.log('estimateId is missing'); // 디버깅용
      Alert.alert("오류", "견적 정보를 찾을 수 없습니다.");
      return;
    }

    // 채팅 내역을 하나의 문자열로 변환
    const chatHistoryString = messages
      .filter(msg => msg.type !== 'quote')
      .map(msg => {
        const speaker = msg.isMe ? '이용자' : '업체';
        return `${speaker}: ${msg.text}`;
      })
      .join('\n');

    try {
      console.log('--- 전송될 채팅 ---');
      console.log(chatHistoryString);

      const response = await fetch(`${BACKEND_DOMAIN}/api/v1/estimates/${estimateId}/chat-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatHistoryString) // 문자열을 JSON 형식으로 전송
      });
      const responseData = await response.json();
      console.log('AI 요약본:', responseData);

      setIsConfirmed(true);
      
      if (onConfirm && responseData.data && responseData.data.summary) {
        // 요약본을 반영하도록 하는 함수
        onConfirm(responseData.data.summary);
      }

    } catch (error) {
      console.error('Error sending chat history:', error);
      if (Platform.OS === 'web') {
        window.alert('전송 중 오류가 발생했습니다.');
      } else {
        Alert.alert('오류', '전송 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <TouchableOpacity 
      style={styles.confirmButton} 
      onPress={handleConfirm}
      disabled={isConfirmed}
    >
      <Text style={styles.confirmButtonText}>
        {isConfirmed ? '확정' : '확정하기'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    width: 90,
    backgroundColor: '#F0893B',
    borderRadius: 6,
    paddingHorizontal: 'auto',
    paddingVertical: 7,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '400',
  },
});
