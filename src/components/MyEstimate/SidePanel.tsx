import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

export default function SidePanel() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onGoMyChat = () => {
    navigation.navigate('MyChat');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>실시간 견적 상담</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>상담 및 진행 안내</Text>
        <Text style={styles.infoText}>
          채팅으로 나눈 모든 대화 내용은 AI에 의해 요약되며 계약 내용에 포함됩니다. 꼼꼼히 확인해 주세요.
        </Text>
      </View>

      <TouchableOpacity style={styles.chatButton} onPress={onGoMyChat}>
        <Text style={styles.chatButtonText}>업체와 채팅하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 307,
    height: 297,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    padding: 29,
    // shadowing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    height: 135,
    backgroundColor: '#FFF6EF',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#FFE0D5',
    padding: 17,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#535353',
    marginBottom: 22, // rough spacing
    textAlign: 'center'
  },
  infoText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#333333',
    lineHeight: 19.5,
    textAlign: 'center', // Design looks centered
  },
  chatButton: {
    width: '100%',
    height: 42,
    backgroundColor: '#EA6500',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#FF8A32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
});
