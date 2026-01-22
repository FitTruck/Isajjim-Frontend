import React, { useState }  from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ResultCardProps {
  image: {
    uri: string;
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

  // label을 영어로 받으니까 그걸 한글로 변환하는 로직이 필요할 지 모름. 모든 레이블에 대해 한글로 변환해야함.
  // 이런 식의 로직이 들어가게 될 수도 있다는 것임. 그러면 이 파일로 보내기 전에 만들자. 새로운 번역로직파일 만들어야함.
  for (let i = 0; i < items.length; i++) {
    if (items[i].label === "TV") {
      items[i].label = "텔레비전";
    }
    if (items[i].label === "SOFA") {
      items[i].label = "소파";
    }
    if (items[i].label === "BED") {
      items[i].label = "침대";
    }
  }

  return (
    <View style={styles.resultCardContainer}>
      {/* 이미지 */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: image.uri }} 
          style={[styles.cardImage, { aspectRatio: ratio }]} // 이미지 비율을 잘 쓰고 있음
          resizeMode="cover" 
        />
      </View>

      <View style={styles.resultCardContent}>
        {items.map((item) => (
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
    fontWeight: 'bold',
    color: '#000',
  },
  itemSubtitle: {
    fontSize: 16,
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
