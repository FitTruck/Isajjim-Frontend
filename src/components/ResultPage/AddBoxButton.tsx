import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { Box, Plus } from 'lucide-react-native';
import MyTouch from '../common/MyTouch';

interface AddBoxButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

export default function AddBoxButton({ onPress, style }: AddBoxButtonProps) {
  return (
    <MyTouch style={[styles.container, style]} onPress={onPress}>
      <Box size={18} color="#666" style={styles.icon} />
      <Text style={styles.text}>박스 추가하기</Text>
      <Plus size={14} color="#666" style={styles.plusIcon} />
    </MyTouch>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginTop: 10,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  plusIcon: {
    marginLeft: 6,
  }
});
