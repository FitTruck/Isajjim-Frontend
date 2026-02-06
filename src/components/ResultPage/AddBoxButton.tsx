import React, { useState } from 'react';
import { Text, StyleSheet, View, Pressable, ViewStyle } from 'react-native';
import { Plus, Minus, LucideIcon } from 'lucide-react-native';

interface AddBoxButtonProps {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  style?: ViewStyle;
}

interface QuantityButtonProps {
  onPress: () => void;
  icon: LucideIcon;
  disabled?: boolean;
}

const QuantityButton = ({ onPress, icon: Icon, disabled }: QuantityButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      // @ts-ignore
      onHoverIn={() => setIsHovered(true)}
      // @ts-ignore
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.countButton,
        !disabled && isHovered && styles.hoveredButton,
        !disabled && pressed && styles.pressedButton,
      ]}
    >
      <Icon size={20} color="#333" />
    </Pressable>
  );
};

export default function AddBoxButton({ quantity, onAdd, onRemove, style }: AddBoxButtonProps) {
  return (
    <View style={[styles.container, style]}>
      {/* 아이템 이름 (박스) */}
      <View style={styles.itemDetailContainer}>
        <Text style={styles.itemTitle}>박스</Text>
      </View>

      {/* 수량 조절 버튼 (LeftCard 스타일 그대로 적용) */}
      <View style={styles.itemCountContainer}>
        <QuantityButton 
          icon={Minus} 
          onPress={onRemove}
          disabled={quantity <= 0}
        />

        <Text style={styles.resultCardNumber}>{quantity}</Text>
        
        <QuantityButton 
          icon={Plus} 
          onPress={onAdd}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    // LeftCard에서는 borderBottom이 있지만 여기선 없어도 깔끔할 듯, 혹은 추가 가능
    paddingVertical: 5,
  },
  itemDetailContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: 'inter', 
    fontWeight: '500',
    color: '#535353',
    // marginBottom 제거 (수직 중앙 정렬 위해)
  },
  itemCountContainer: {
    width: 120,
    height: 38,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  countButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hoveredButton: {
    backgroundColor: '#FFF0E0', 
  },
  pressedButton: {
    backgroundColor: '#E0E0E0',
  },
  resultCardNumber: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    width: 20,
  },
});
