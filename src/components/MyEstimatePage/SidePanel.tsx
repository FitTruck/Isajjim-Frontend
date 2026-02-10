import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

export default function SidePanel() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const onGoMyChat = () => {
    navigation.navigate('MyChat');
  };

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      <Text style={[styles.title, isMobile && styles.mobileTitle]}>실시간 견적 상담</Text>
      
      <View style={[styles.infoBox, isMobile && styles.mobileInfoBox]}>
        <Text style={[styles.infoTitle, isMobile && styles.mobileInfoTitle]}>상담 및 진행 안내</Text>
        <Text style={[styles.infoText, isMobile && styles.mobileInfoText]}>
          채팅으로 나눈 모든 대화 내용은 AI에 의해 요약되며 계약 내용에 포함됩니다. 꼼꼼히 확인해 주세요.
        </Text>
      </View>

      <TouchableOpacity style={[styles.chatButton, isMobile && styles.mobileChatButton]} onPress={onGoMyChat}>
        <Text style={[styles.chatButtonText, isMobile && styles.mobileChatButtonText]}>업체와 채팅하기</Text>
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
  },
  mobileContainer: {
    width: '100%',
    height: 'auto',
    marginBottom: 20,
    padding: 15, // Reduced padding for mobile
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  mobileTitle: {
    fontSize: 16, // Reduced font size
    marginBottom: 10,
  },
  infoBox: {
    width: '100%',
    height: 135,
    backgroundColor: '#FFF6EF',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#FFE0D5',
    padding: 17,
    marginBottom: 15,
  },
  mobileInfoBox: {
    height: 'auto', // Allow height to adjust
    padding: 10,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#535353',
    marginBottom: 22,
    textAlign: 'center'
  },
  mobileInfoTitle: {
    fontSize: 13,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#333333',
    lineHeight: 20,
    textAlign: 'center',
  },
  mobileInfoText: {
    fontSize: 12,
    lineHeight: 16,
  },
  chatButton: {
    width: '100%',
    height: 42,
    backgroundColor: '#F0893B',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileChatButton: {
    height: 36, // Reduced height
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  mobileChatButtonText: {
    fontSize: 13,
  },
});
