  import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface DetailSelectBtnProps {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: any;
  selectedValue: any;
  onSelect: (v: any) => void;
}

const DetailSelectBtn = ({ 
  x, y, width, height, label, value, selectedValue, onSelect 
}: DetailSelectBtnProps) => {
  const isSelected = selectedValue === value;
  return (
    <TouchableOpacity
      style={[
        styles.absoluteCard,
        { left: x, top: y, width, height },
        isSelected ? styles.cardSelected : styles.cardUnselected
      ]}
      onPress={() => onSelect(value)}
    >
      <Text style={[
        styles.cardText, 
        isSelected ? styles.textSelected : styles.textUnselected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  absoluteCard: {
    position: 'absolute',
    borderWidth: 1, 
    borderColor: '#E6E6E6', // 더 연한 회색
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 8, // 둥근 모서리 추가
    // 약한 그림자 추가
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: 'white'
  },
  cardSelected: {
    backgroundColor: '#F0893B',
    borderColor: '#F0893B',
    zIndex: 1, // 선택된 카드가 위로 올라오도록
  },
  cardUnselected: {
    backgroundColor: 'white',
    borderColor: '#E6E6E6'
  },
  cardText: {
    fontSize: 20, // 폰트 사이즈 약간 조정
    fontWeight: '600'
  },
  textSelected: { 
    color: 'white' 
  },
  textUnselected: { 
    color: '#3D3D3A' 
  },
});

export default DetailSelectBtn;
