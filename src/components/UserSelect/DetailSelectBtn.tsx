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
    borderColor: '#AFAFAF',
    justifyContent: 'center', 
    alignItems: 'center'
  },
  cardSelected: {
    backgroundColor: '#D97757'
  },
  cardUnselected: {
    backgroundColor: 'white'
  },
  cardText: {
    fontSize: 22, 
    fontWeight: '500'
  },
  textSelected: { 
    color: 'white' 
  },
  textUnselected: { 
    color: '#3D3D3A' 
  },
});

export default DetailSelectBtn;
