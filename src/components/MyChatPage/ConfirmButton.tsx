import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import api from '../../api/axiosInstance';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (isLoading || isConfirmed) return;
    setIsLoading(true);
    console.log('handleConfirm clicked'); // 디버깅용

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

      const response = await api.post('/api/v1/estimates/chat-summary', JSON.stringify(chatHistoryString), {
        headers: { 'Content-Type': 'application/json' },
      });
      const responseData = response.data;

      // AI 요약 콘솔에 찍기
      console.log('AI 요약본:', responseData.data.summary);

      setIsConfirmed(true);
      setIsLoading(false);
      
      if (onConfirm && responseData.data && responseData.data.summary) {
        // 요약본을 반영하도록 하는 함수
        onConfirm(responseData.data.summary);
      }

    } catch (error) {
      console.error('Error sending chat history:', error);
      setIsLoading(false);
      if (Platform.OS === 'web') {
        window.alert('전송 중 오류가 발생했습니다.');
      } else {
        Alert.alert('오류', '전송 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.confirmButton, isLoading && styles.disabledButton]} 
      onPress={handleConfirm}
      disabled={isLoading || isConfirmed}
    >
      <Text style={styles.confirmButtonText}>
        {isLoading ? '진행중' : (isConfirmed ? '확정' : '확정하기')}
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
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.7
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '400',
  },
});
