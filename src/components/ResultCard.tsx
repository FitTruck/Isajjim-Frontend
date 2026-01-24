import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { translateLabel, translateType } from '../utils/Translator';

interface ResultCardProps {
  image: {
    localUri: string;
    width: number;
    height: number;
  }; 
  
  items: Array<{ // 각 item에 대한 정보 배열
    furnitureId: number;
    label: string;
    type: string;
    quantity: number;
  }>;

  // 수량 변경 함수를 쓸 때, '어떤 가구'의 수량을 변경했는지 알려주기 위해 furnitureId를 인자로 받음.
  // 그리고 '얼마만큼' 변경했는지 알려주기 위해 newQuantity를 인자로 받음.
  onQuantityChange: (furnitureId: number, newQuantity: number) => void;
}

// 이미지 하나에 대한 ResultCard를 생성하는 컴포넌트임 image와 items 쌍이 하나만 있는 거임.
// Result.tsx의 컴포넌트를 쓰는 구간을 보면 정확히 알 수 있음 
const ResultCard = ({ image, items, onQuantityChange }: ResultCardProps) => {
  const ratio = image.width / image.height; // 사진 비율 계산

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
      {/* 이미지 */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: image.localUri }} 
          style={[styles.cardImage, { aspectRatio: ratio }]} // 이미지 비율을 잘 쓰고 있음
          resizeMode="cover" 
        />
      </View>

      <View style={styles.resultCardContent}>
        {translatedItems.map((item) => ( // 번역된 가구명을 사용해서 한다.
          <View key={item.furnitureId} style={styles.itemContainer}>
            <View style={styles.itemDetailContainer}>
              <Text style={styles.itemTitle}>{item.label}</Text>
              <Text style={styles.itemSubtitle}>{item.type}</Text>
            </View>
            <View style={styles.itemCountContainer}>
              <TouchableOpacity 
                style={styles.minusButton}
                onPress={() => {
                  const newQuantity = Math.max(0, item.quantity - 1);
                  onQuantityChange(item.furnitureId, newQuantity);
                }}
              >
                <Image source={require('../../assets/Minus.png')} style={styles.minus} />
              </TouchableOpacity>
              <Text style={styles.resultCardNumber}>{item.quantity}</Text>
              <TouchableOpacity 
                style={styles.plusButton}
                onPress={() => {
                  const newQuantity = item.quantity + 1;
                  onQuantityChange(item.furnitureId, newQuantity);
                }}
              >
                <Image source={require('../../assets/Plus.png')} style={styles.plus} />
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
    width: 520,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'flex-start', // 높이가 콘텐츠에 맞춰지도록 설정
  },
  imageWrapper: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)', // 그림자를 wrapper에 적용
    zIndex: 0, // 아래 텍스트 영역보다 위에 오도록 설정
    backgroundColor: 'white', // 그림자가 컨테이너 배경에 묻히지 않게 함
  },
  cardImage: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  resultCardContent: {
    width: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#fffdfaff', // 우아한 리넨 베이지 색상
    alignItems: 'center',
    textAlign: 'left',
    paddingTop: 29,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  itemDetailContainer: {
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 20,
    fontFamily : 'inter',
    fontWeight: 600,
    color: '#000',
  },
  itemSubtitle: {
    fontSize: 15,
    fontFamily : 'inter',
    fontWeight: 500,
    color: '#828282',
  },
  itemCountContainer: {
    width: 200,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 0px 2px 0.4px rgba(0, 0, 0, 0.25)',
  },
  minusButton: {
    width: 58,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderColor: '#e2e2e2ff',
  },
  minus: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 58,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 0.5,
    borderColor: '#e2e2e2ff',
  },
  plus: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCardNumber: {
    flex: 1,
    fontSize: 28,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
});
