import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// ResultCard에 필요한 값들 미리 정의
interface ResultCardProps {
  data: {
    image: { uri: string }; // 다시 uri로 원복
    width: number;
    height: number;
    items: Array<{
      name: string;
      option: string;
      count: number;
    }>;
  };
}

const ResultCard = ({ data }: ResultCardProps) => {
  const [ratio, setRatio] = React.useState(1.5); // 기본 비율

  React.useEffect(() => {
    if (data.image && data.image.uri) {
      Image.getSize(data.image.uri, (width, height) => {
        setRatio(width / height);
      }, (error) => {
        console.error('Image size detection failed:', error);
      });
    }
  }, [data.image]);

  return (
    <View style={styles.resultCardContainer}>
      {/* 이미지 */}
      <View style={styles.imageWrapper}>
        <Image 
          // React Native의 Image 컴포넌트는 내부적으로 'uri'라는 키를 요구하므로 맵핑해줍니다.
          source={{ uri: data.image.uri }} 
          style={[styles.cardImage, { aspectRatio: ratio }]}
          resizeMode="cover" 
        />
      </View>

      <View style={styles.resultCardContent}>
        {data.items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemDetailContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>{item.option}</Text>
            </View>
            <View style={styles.itemCountContainer}>
              <TouchableOpacity style={styles.minusButton}>
                <Image source={require('../../assets/Minus.png')} style={styles.minus} />
              </TouchableOpacity>
              <Text style={styles.resultCardNumber}>{item.count}</Text>
              <TouchableOpacity style={styles.plusButton}>
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
