import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';

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

  const handleConfirm = async () => {
    const chatHistory = messages
      // 견적서 제외
      .filter(msg => msg.type !== 'quote')
      .map(msg => ({
        sender: msg.isMe ? 'user' : 'company',
        text: msg.text || '',
        time: msg.time,
        type: msg.type
      }));

    try {
      console.log('--- 전송될 채팅 데이터 ---');
      console.log(JSON.stringify(chatHistory, null, 2));

      // const response = await fetch(`${BACKEND_DOMAIN}/api/v1/gcs/presigned`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fileNames: imageList.map(img => img.fileName || `${uuidv4()}.jpg`)
      //   })
      // });
      // const data = await response.json();
      
      const mockSummary = "• 5톤 트럭 진입 가능 여부: 골목 진입 가능하나 사전 공간 확보 필요\n• 특수 작업 필요 물품: 도자기 (고가, 특수포장 요망)\n• 출발지 작업 조건: 사다리차 사용 공간 확보 완료\n• 기타: 에어컨 이전 설치 불필요";

      setIsConfirmed(true);
      
      if (onConfirm) {
        onConfirm(mockSummary);
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
