import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

interface RoomSizeDetailProps {
  value: string | null;
  onSelect: (value: string) => void;
}

export default function RoomSizeDetail({ value, onSelect }: RoomSizeDetailProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // 집 평수 옵션 생성
  const roomSize = [
    { label: '10평 이하', value: "UNDER_10" },
    { label: '10~15평', value: "BETWEEN_10_15" },
    { label: '15~20평', value: "BETWEEN_15_20" },
    { label: '20~25평', value: "BETWEEN_20_25" },
    { label: '25~30평', value: "BETWEEN_25_30" },
    { label: '30~40평', value: "BETWEEN_30_40" }, 
    { label: '40~50평', value: "BETWEEN_40_50" },
    { label: '50평 이상', value: "OVER_50" },
  ];

  // 현재 선택된 평수의 라벨 찾기
  const selectedRoomSizeLabel = roomSize.find(opt => opt.value === value)?.label || '선택하세요';

  return (
    <>
      <View style={styles.customInputBox}>
        <Text style={[styles.customInputValue, value ? { color: '#3D3D3A' } : {}]}>
          {selectedRoomSizeLabel}
        </Text> 
        <TouchableOpacity 
          style={styles.selectButtonInline}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.selectButtonInlineText}>선택</Text>
        </TouchableOpacity>
      </View>

      {/* 평수 선택 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>집 평수 선택</Text>
            <FlatList
              data={roomSize}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 300, width: '100%' }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    value === item.value && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    value === item.value && styles.modalItemTextSelected
                  ]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // 사용자 지정 입력 박스 스타일 (UserSelect에서 가져옴)
  customInputBox: {
    width: 476, 
    height: 86,
    backgroundColor: 'white',
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 8,
    position: 'absolute',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingLeft: 30, 
    paddingRight: 10,
    top: 48
  },
  customInputValue: {
    fontSize: 25, 
    fontWeight: '500', 
    color: '#3D3D3A'
  },
  selectButtonInline: {
    backgroundColor: '#D97757', 
    borderRadius: 8, 
    paddingHorizontal: 32, 
    paddingVertical: 14
  },
  selectButtonInlineText: {
    color: 'white', 
    fontSize: 20, 
    fontWeight: '500'
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '40%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#3D3D3A'
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalItemSelected: {
    backgroundColor: '#f0f0f0'
  },
  modalItemText: {
    fontSize: 18,
    color: '#3D3D3A'
  },
  modalItemTextSelected: {
    color: '#3D3D3A',
    fontWeight: 'bold'
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: 'black',
    borderRadius: 8
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
