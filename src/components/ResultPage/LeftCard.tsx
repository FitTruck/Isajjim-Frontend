import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { translateLabel, translateType } from '../../utils/Translator';
import { Minus, Plus } from 'lucide-react-native';

interface ResultCardProps {
  image: {
    localUri: any;
    width: number;
    height: number;
  }; 
  
  items: Array<{ // 각 item에 대한 정보 배열
    furnitureId: number;
    label: string;
    type: string;
    quantity: number;
  }>;

  onQuantityChange: (furnitureId: number, newQuantity: number) => void;
}

const ResultCard = ({ image, items, onQuantityChange }: ResultCardProps) => {

  // props로 받은 items를 직접 수정하지 않고, 렌더링 시 변환된 값을 사용하도록 함
  // 만약 데이터 자체를 변환해야 한다면 원본을 건드리지 않기 위해 map을 새로 돌리는 것이 좋음
  // 변수까지도 새로 지정함.
  const translatedItems = items.map(item => ({
    ...item,
    label: translateLabel(item.label),
    type: translateType(item.type)
  }));

  return (
    <View style={styles.resultCardContainer}>
      {/* Image */}
      <Image
        source={typeof image.localUri === 'string' ? { uri: image.localUri } : image.localUri} 
        style={styles.cardImage} 
        resizeMode="contain" 
      />

      {/* Content */}
      <View style={styles.resultCardContent}>
        <Text style={styles.headerTitle}>가구 리스트</Text>
        <View style={styles.contentDivider} />

        {/* 아이템 하나 당 생김새 정의 */}
        {translatedItems.map((item) => (
          <View key={item.furnitureId} style={styles.itemContainer}>
            
            {/* 아이템 정보 */}
            <View style={styles.itemDetailContainer}>
              <Text style={styles.itemTitle}>{item.label}</Text>
              <Text style={styles.itemSubtitle}>{item.type}</Text>
            </View>

            {/* 수량 조절 버튼 */}
            <View style={styles.itemCountContainer}>

              {/* - 버튼 */}
              <TouchableOpacity 
                style={styles.countButton}
                onPress={() => {
                  const newQuantity = Math.max(0, item.quantity - 1);
                  onQuantityChange(item.furnitureId, newQuantity);
                }}
              >
                <Minus size={20} color="#333" />
              </TouchableOpacity>

              {/* 수량 */}
              <Text style={styles.resultCardNumber}>{item.quantity}</Text>
              
              {/* + 버튼 */}
              <TouchableOpacity 
                style={styles.countButton}
                onPress={() => {
                  const newQuantity = item.quantity + 1;
                  onQuantityChange(item.furnitureId, newQuantity);
                }}
              >
                <Plus size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </View>
    </View>
  );
};

export default ResultCard;

const styles = StyleSheet.create({
  resultCardContainer: {
    width: 970,
    borderRadius: 16,
    backgroundColor: 'white',
    
    borderWidth: 1,
    borderColor: '#eeeeee',
    flexDirection: 'row',
    overflow: 'hidden',
  },

  // 이미지 부분(왼쪽)
  cardImage: {
    width: 670, 
    height: 600,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  // Content 부분(오른쪽)
  resultCardContent: {
    width: 300,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
    marginTop: 4,
  },
  contentDivider: {
    height: 2,
    backgroundColor: '#F0F0F0',
    marginBottom: 24,
    width: 40,
    borderRadius: 2,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
  },
  itemDetailContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontFamily : 'inter', 
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    fontFamily : 'inter', 
    fontWeight: '500',
    color: '#9E9E9E',
  },
  itemCountContainer: {
    width: 104,
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
  resultCardNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    width: 20,
  },
});
