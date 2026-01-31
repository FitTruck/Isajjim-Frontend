// React Hooks 및 Animated 추가 import
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { translateTruckType } from '../../utils/Translator';

interface EstimateCardProps {
  data: {
    truckType: string;
    truckQuantity: number;
  }
  status: 'prev' | 'updating' | 'done';
  onNavigateNext: () => void;
}

const EstimatedCard = ({ data, status, onNavigateNext }: EstimateCardProps) => {
  // useRef : Estimate 컴포넌트가 리렌더링 되어도 변수값 유지
  // useRef가 반환하는 값의 속성 중에 current가 있고 그 current값은 Animated.Value(0)의 값임
  // Animated.Value(x) -> 값을 자연스럽게 그라데이션으로 변경 
  const updatingOpacity = useRef(new Animated.Value(0)).current; 
  // 0인 상태로 시작하는 애니메이션 숫자
  // updatingOpacity : 견적서 생성중... 텍스트의 투명도임.
  const doneOpacity = useRef(new Animated.Value(1)).current; 
  // 1인 상태로 시작하는 애니메이션 숫자
  // doneOpacity : 체크 아이콘의 투명도임.

  // result화면에서 받아오는 status값이 변경될 때마다 실행되는 함수임. 컴포넌트도 다시 그림
  useEffect(() => {
    if (status === 'updating') {
      // 체크 -> 생성중... (애니메이션 없이 즉시 변경)
      updatingOpacity.setValue(1); //setValue(1) : 변수 값을 1로 즉시 변경(견적서 생성중... 텍스트를 보이게 하는 opacity 속성값으로 쓸 변수를 1로 바꿈)
      doneOpacity.setValue(0); //setValue(0) : 변수 값을 0으로 즉시 변경(체크 아이콘을 보이게 하는 opacity 속성값으로 쓸 변수를 0으로 바꿈)
    } else if (status === 'done') {
      // 생성중... -> 체크 (부드럽게 페이드 효과)
      Animated.parallel([
        Animated.timing(updatingOpacity, { //updatingOpacity 변수를 200ms동안 0으로 바꿈
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(doneOpacity, { //doneOpacity 변수를 400ms동안 1로 바꿈
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // prev 상태 (초기 상태 혹은 리셋): 체크 표시만 보임
      updatingOpacity.setValue(0);
      doneOpacity.setValue(1);
    }
  }, [status]);

  const translatedTruckType = translateTruckType(data.truckType);

  return (
    <View style={styles.container}>
      {/* 용달 정보 섹션 */}
      <View style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <Text style={styles.sectionHeader}>용달 정보</Text>
          
          <View style={styles.statusWrapper}>
            <Animated.Text style={[{ 
              opacity: updatingOpacity 
            }, styles.updatingStatusText]}>
              생성중...
            </Animated.Text>
            <Animated.View style={[{ 
              opacity: doneOpacity 
            }, styles.doneStatusIconWrapper]}>
              <Image 
                source={require('../../../assets/Check.png')} 
                style={styles.checkIcon}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.truckType}>{translatedTruckType}</Text>
          <Text style={styles.truckQuantity}>{data.truckQuantity}대</Text>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 이사 정보 업로드 섹션 */}
      <View style={styles.compareSection}>
        <Text style={styles.compareTitle}>이사 정보 업로드</Text>
        <Text style={styles.subtitle}>사용자 설정 및 AI로 산출된 정보를 업로드</Text>
      </View>

      {/* 업로드 버튼 */}
      <TouchableOpacity style={styles.compareButton} onPress={onNavigateNext}>
        <Text style={styles.compareButtonText}>업로드</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 310,
    padding: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    borderRadius: 4,
    alignSelf: 'flex-end',
    right: 80,
  },
  infoSection: {
    width: '100%',
    marginTop: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  sectionHeader: {
    color: '#3D3D3A',
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    lineHeight: 24,
  },
  statusWrapper: {
    justifyContent: 'center',
    height: 24,
    width: 24, // 아이콘 크기에 맞게 조정
    position: 'relative',
  },
  updatingStatusText: {
    position: 'absolute',
    fontSize: 12,
    color: '#3D3D3A',
    width: 80, 
    right: 0,
    textAlign: 'right',
  },
  doneStatusIconWrapper: {
    position: 'absolute',
    right: 0,
    width: 24,
    height: 24,
  },
  checkIcon: {
    width: '100%',
    height: '100%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  truckType: {
    color: '#828282',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
  },
  truckQuantity: {
    textAlign: 'right',
    color: '#828282',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
  },
  divider: {
    width: '100%',
    marginTop: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(209, 217, 224, 0.57)',
  },
  compareSection: {
    marginTop: 10,
  },
  compareTitle: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '700',
    lineHeight: 28,
  },
  subtitle: {
    width: '100%',
    marginTop: 8,
    color: '#828282',
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 16,
  },
  compareButton: {
    width: '100%',
    height: 48,
    marginTop: 20,
    backgroundColor: '#ED8B3F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
});

export default EstimatedCard;
