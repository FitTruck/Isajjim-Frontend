import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import React, { useMemo, useState } from 'react';
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
import { LucideIcon } from 'lucide-react-native';

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
        // disabled 스타일 제거 (요청사항: disable되어도 스타일 동일)
        !disabled && isHovered && styles.hoveredButton,
        !disabled && pressed && styles.pressedButton,
      ]}
    >
      <Icon size={20} color="#333" />
    </Pressable>
  );
};

const ResultCard = ({ image, items, onQuantityChange }: ResultCardProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768; // Mobile breakpoint
  
  // 모바일에서 이미지 컨테이너 크기 조정
  const mobileImageWidth = windowWidth - 40; // 좌우 패딩 20px씩
  const mobileImageHeight = mobileImageWidth * (IMAGE_CONTAINER_HEIGHT / IMAGE_CONTAINER_WIDTH);

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
      const containerWidth = isMobile ? mobileImageWidth : IMAGE_CONTAINER_WIDTH;
      const containerHeight = isMobile ? mobileImageHeight : IMAGE_CONTAINER_HEIGHT;
      return { scale: 1, offsetX: 0, offsetY: 0, displayWidth: containerWidth, displayHeight: containerHeight };
    }

    const originalWidth = image.width;
    const originalHeight = image.height;

    const containerWidth = isMobile ? mobileImageWidth : IMAGE_CONTAINER_WIDTH;
    const containerHeight = isMobile ? mobileImageHeight : IMAGE_CONTAINER_HEIGHT;

    // contain 모드: 가로/세로 비율 유지하면서 컨테이너에 맞춤
    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    const displayWidth = originalWidth * scale;
    const displayHeight = originalHeight * scale;

    // 컨테이너 중앙 정렬 시 오프셋
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;

    return { scale, offsetX, offsetY, displayWidth, displayHeight };
  }, [image?.width, image?.height, isMobile, mobileImageWidth, mobileImageHeight]);

  // 좌표가 있는 아이템만 필터링 (마커 표시용)
  const itemsWithCoordinates = items.filter(
    item => item.centerX !== undefined && item.centerY !== undefined && item.quantity > 0
  );



  return (
    <View style={[styles.resultCardContainer, isMobile && styles.mobileResultCardContainer]}>
      {/* Image Container with Markers */}
      <View style={[
        styles.imageContainer,
        isMobile && {
          width: mobileImageWidth,
          height: mobileImageHeight,
        }
      ]}>
        <Image
          source={typeof image.localUri === 'string' ? { uri: image.localUri } : image.localUri}
          style={[
            styles.cardImage,
            isMobile && {
              width: mobileImageWidth,
              height: mobileImageHeight,
            }
          ]}
          resizeMode="contain"
        />

        {/* 객체 위치 마커 오버레이 */}
        {itemsWithCoordinates.map((item) => {
          // EXIF rotation 불일치 감지 및 좌표 보정
          // 브라우저: EXIF 자동 보정 (세로 이미지 → width < height)
          // AI 서버: EXIF 미보정 (세로 이미지 → width > height, 좌표가 반대)
          let cx = item.centerX!;
          let cy = item.centerY!;

          if (cx > image.width || cy > image.height) {
            // EXIF rotation 불일치 → 좌표 swap
            [cx, cy] = [cy, cx];
          }

          // 화면 좌표 변환
          let screenX = imageLayout.offsetX + (cx * imageLayout.scale) - (MARKER_SIZE / 2);
          let screenY = imageLayout.offsetY + (cy * imageLayout.scale) - (MARKER_SIZE / 2);

          // 안전장치: 이미지 표시 영역 내로 clamp
          const minX = imageLayout.offsetX;
          const maxX = imageLayout.offsetX + imageLayout.displayWidth - MARKER_SIZE;
          const minY = imageLayout.offsetY;
          const maxY = imageLayout.offsetY + imageLayout.displayHeight - MARKER_SIZE;
          screenX = Math.max(minX, Math.min(screenX, maxX));
          screenY = Math.max(minY, Math.min(screenY, maxY));

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
      <View style={[styles.resultCardContent, isMobile && styles.mobileResultCardContent]}>
        <View>
          <Text style={styles.headerTitle}>가구 목록</Text>
          <View style={styles.contentDivider} />
        </View>

        {/* 아이템 리스트 스크롤 영역 */}
        <ScrollView 
          style={isMobile ? { width: '100%', maxHeight: 200 } : { flex: 1, width: '100%' }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={isMobile ? { flexGrow: 0, paddingBottom: 20 } : { paddingBottom: 20 }}
        >
          {translatedItems.length > 0 ? (
            translatedItems.map((item) => (
              <View key={item.furnitureId} style={styles.itemContainer}>
                
                {/* 아이템 정보 */}
                <View style={styles.itemDetailContainer}>
                  <Text style={styles.itemTitle}>{item.label}</Text>
                </View>
  
                {/* 수량 조절 버튼 */}
                <View style={styles.itemCountContainer}>
  
                  {/* - 버튼 */}
                  <QuantityButton 
                    icon={Minus} 
                    onPress={() => {
                      if (item.quantity <= 0) return;
                      const newQuantity = item.quantity - 1;
                      onQuantityChange(item.furnitureId, newQuantity);
                    }}
                    disabled={item.quantity <= 0}
                  />
  
                  {/* 수량 */}
                  <Text style={styles.resultCardNumber}>{item.quantity}</Text>
                  
                  {/* + 버튼 */}
                  <QuantityButton 
                    icon={Plus} 
                    onPress={() => {
                      const newQuantity = item.quantity + 1;
                      onQuantityChange(item.furnitureId, newQuantity);
                    }}
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>인식된 가구가 없습니다.</Text>
            </View>
          )}
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
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    width: 20,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },

  // Mobile Styles
  mobileResultCardContainer: {
    width: '100%',
    height: 'auto',
    flexDirection: 'column',
    borderRadius: 8,
  },
  mobileResultCardContent: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
