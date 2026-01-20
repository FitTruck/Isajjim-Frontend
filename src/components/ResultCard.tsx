import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ResultCardProps {
  data: {
    imageSource: any;
    width?: number;
    height?: number;
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
    if (data.imageSource && data.imageSource.uri) {
      Image.getSize(data.imageSource.uri, (width, height) => {
        setRatio(width / height);
      }, (error) => {
        console.error('Image size detection failed:', error);
      });
    }
  }, [data.imageSource]);

  return (
    <View style={styles.resultCardContainer}>
      {/* 동적 이미지: 비율을 상태값으로 관리하여 이미지 높이가 자동 조절되게 함 */}
      <Image 
        source={data.imageSource} 
        style={[styles.cardImage, { aspectRatio: ratio }]}
        resizeMode="cover" 
      />

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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
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
    backgroundColor: '#FFFFFF',
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
    width: 24,
    height: 24,
    resizeMode: 'contain',
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
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  resultCardNumber: {
    flex: 1,
    fontSize: 29,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
});
