import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { translateLabel, translateType } from '../../utils/Translator';
import { Minus, Plus } from 'lucide-react-native';

// 체크 마커 이미지
const checkObjectImage = require('../../../assets/check_object.png');

// 이미지 컨테이너 크기 (스타일과 동일하게 유지)
const IMAGE_CONTAINER_WIDTH = 670;
const IMAGE_CONTAINER_HEIGHT = 600;
const MARKER_SIZE = 20; // 마커 크기

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
    centerX?: number;
    centerY?: number;
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

  // 이미지 스케일 및 오프셋 계산 (resizeMode="contain" 기준)
  const imageLayout = useMemo(() => {
    if (!image?.width || !image?.height) {
      return { scale: 1, offsetX: 0, offsetY: 0, displayWidth: IMAGE_CONTAINER_WIDTH, displayHeight: IMAGE_CONTAINER_HEIGHT };
    }

    const originalWidth = image.width;
    const originalHeight = image.height;

    // contain 모드: 가로/세로 비율 유지하면서 컨테이너에 맞춤
    const scaleX = IMAGE_CONTAINER_WIDTH / originalWidth;
    const scaleY = IMAGE_CONTAINER_HEIGHT / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    const displayWidth = originalWidth * scale;
    const displayHeight = originalHeight * scale;

    // 컨테이너 중앙 정렬 시 오프셋
    const offsetX = (IMAGE_CONTAINER_WIDTH - displayWidth) / 2;
    const offsetY = (IMAGE_CONTAINER_HEIGHT - displayHeight) / 2;

    return { scale, offsetX, offsetY, displayWidth, displayHeight };
  }, [image?.width, image?.height]);

  // 좌표가 있는 아이템만 필터링 (마커 표시용)
  const itemsWithCoordinates = items.filter(
    item => item.centerX !== undefined && item.centerY !== undefined && item.quantity > 0
  );

  return (
    <View style={styles.resultCardContainer}>
      {/* Image Container with Markers */}
      <View style={styles.imageContainer}>
        <Image
          source={typeof image.localUri === 'string' ? { uri: image.localUri } : image.localUri}
          style={styles.cardImage}
          resizeMode="contain"
        />

        {/* 객체 위치 마커 오버레이 */}
        {itemsWithCoordinates.map((item) => {
          // 원본 좌표를 화면 좌표로 변환
          const screenX = imageLayout.offsetX + (item.centerX! * imageLayout.scale) - (MARKER_SIZE / 2);
          const screenY = imageLayout.offsetY + (item.centerY! * imageLayout.scale) - (MARKER_SIZE / 2);

          return (
            <Image
              key={`marker-${item.furnitureId}`}
              source={checkObjectImage}
              style={[
                styles.checkMarker,
                {
                  left: screenX,
                  top: screenY,
                }
              ]}
            />
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.resultCardContent}>
        <View>
          <Text style={styles.headerTitle}>가구 리스트</Text>
          <View style={styles.contentDivider} />
        </View>

        {/* 아이템 리스트 스크롤 영역 */}
        <ScrollView 
          style={{ flex: 1, width: '100%' }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
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
                    if (item.quantity <= 0) return; // 이미 0이면 무시
                    const newQuantity = item.quantity - 1;
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
        </ScrollView>
      </View>
    </View>
  );
};

export default ResultCard;

const styles = StyleSheet.create({
  resultCardContainer: {
    width: 970,
    height: IMAGE_CONTAINER_HEIGHT,
    borderRadius: 4,
    backgroundColor: 'white',
    
    borderWidth: 1,
    borderColor: '#eeeeee',
    flexDirection: 'row',
    overflow: 'hidden',
  },

  // 이미지 컨테이너 (마커 오버레이를 위한 상대 위치)
  imageContainer: {
    width: IMAGE_CONTAINER_WIDTH,
    height: IMAGE_CONTAINER_HEIGHT,
    position: 'relative',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    overflow: 'hidden',
  },

  // 이미지 부분(왼쪽)
  cardImage: {
    width: IMAGE_CONTAINER_WIDTH,
    height: IMAGE_CONTAINER_HEIGHT,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  // 체크 마커 스타일
  checkMarker: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    zIndex: 10,
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
