import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView, Platform, TextInput } from 'react-native';
import { Search, X } from 'lucide-react-native';

let WebView: any;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

interface AddressData {
  userSelectedType: string;
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: string;
}

interface AddressInputProps {
  label: string;
  value: string | null;
  detailValue: string | null;
  onSelect: (address: string) => void;
  onChangeDetail: (text: string) => void;
}

export default function AddressInput({ 
  label, 
  value, 
  detailValue, 
  onSelect, 
  onChangeDetail,
}: AddressInputProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleComplete = (data: AddressData) => {
    let addr = '';
    let extraAddr = '';

    if (data.userSelectedType === 'R') {
      addr = data.roadAddress;
    } else {
      addr = data.jibunAddress;
    }

    if (data.userSelectedType === 'R') {
      if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
        extraAddr += data.bname;
      }
      if (data.buildingName !== '' && data.apartment === 'Y') {
        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
      }
      if (extraAddr !== '') {
        extraAddr = ' (' + extraAddr + ')';
      }
    }

    const fullAddress = addr + extraAddr;
    // 선택한 주소값 보내기
    onSelect(fullAddress);
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {};
    }
  }, []);

  const openSearch = () => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.daum && window.daum.Postcode) {
        // @ts-ignore
        new window.kakao.Postcode({
          oncomplete: function(data: any) {
            handleComplete(data);
          }
        }).open();
      } else {
        alert("주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      }
    } else {
      setIsModalVisible(true);
    }
  };

  // --- 네이티브 구현 ---
  const kakaoAddressSource = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
        <style>html,body{margin:0;padding:0;height:100%;} #wrap{border:1px solid;width:100%;height:100%;}</style>
      </head>
      <body>
        <div id="wrap"></div>
        <script>
          const element_wrap = document.getElementById('wrap');
          new kakao.Postcode({
            oncomplete: function(data) {
              window.ReactNativeWebView.postMessage(JSON.stringify(data));
            },
            width : '100%',
            height : '100%'
          }).embed(element_wrap);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* 주소 메인 입력 */}
      <TouchableOpacity 
        style={styles.inputBox}
        // 새 창을 띄움 
        onPress={openSearch}
        activeOpacity={0.8}
      >
        <Text style={[styles.inputValue, !value && styles.placeholder]}>
          {value || "주소를 검색해 주세요"}
        </Text>
        <Search size={20} color="#999" />
      </TouchableOpacity>
      
      {/* 상세 주소 입력 */}
      <View style={[
        styles.inputBox, 
        styles.detailInputBox,
        isFocused && { borderColor: '#F0893B' }
      ]}>
        <TextInput 
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)} 
          style={[
            styles.textInput, 
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
          ]}
          value={detailValue || ''} // 보여지는 값임.
          // 변경된 텍스트를 자동으로 인자로 하여 보낸다고 함.
          onChangeText={onChangeDetail}
          placeholder="상세주소를 입력해주세요"
          placeholderTextColor="#999"
        />
      </View>

      {/* Native Modal */}
      {Platform.OS !== 'web' && (
        // 앱은 웹과 다르게 모달을 사용
        <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>주소 검색</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <WebView
              originWhitelist={['*']}
              source={{ html: kakaoAddressSource, baseUrl: 'https://isajjim.kro.kr' }}
              onMessage={(event: any) => handleAddressSelectNative(event)}
              style={{ flex: 1 }}
              domStorageEnabled={true}
            />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );

  function handleAddressSelectNative(event: any) {
    const data = JSON.parse(event.nativeEvent.data);
    handleComplete(data);
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  inputBox: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  detailInputBox: {
    marginTop: 0,
  },
  inputValue: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  textInput: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    height: '100%',
  },
  placeholder: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
});
