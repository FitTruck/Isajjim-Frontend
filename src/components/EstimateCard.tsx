// React Hooks 및 Animated 추가 import
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';

interface EstimateCardProps {
  data: {
    truckType: string;
    truckQuantity: number;
  }
  status: 'idle' | 'updating' | 'done';
}

const EstimateCard = ({ data, status }: EstimateCardProps) => {
  // 애니메이션을 위한 투명도 값 (0 ~ 1)
  // 초기 상태(idle)에서는 체크 표시가 보여야 하므로 doneOpacity는 1로 시작
  const updatingOpacity = useRef(new Animated.Value(0)).current;
  const doneOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'updating') {
      // 체크 -> 생성중... (애니메이션 없이 즉시 변경)
      updatingOpacity.setValue(1);
      doneOpacity.setValue(0);
    } else if (status === 'done') {
      // 생성중... -> 체크 (부드럽게 페이드 효과)
      Animated.parallel([
        Animated.timing(updatingOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(doneOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // idle 상태 (초기 상태 혹은 리셋): 체크 표시만 보임
      updatingOpacity.setValue(0);
      doneOpacity.setValue(1);
    }
  }, [status]);

  return (
    <View style={styles.container}>
      {/* 견적표 타이틀 및 상태 */}
      <View style={{ position: 'absolute', top: 46, left: 46, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.title}>견적표</Text>
        
        {/* 상태 텍스트들을 절대 위치로 겹쳐놓고 투명도만 조절하여 자연스럽게 교체 */}
        <View style={{ marginLeft: 15, justifyContent: 'center' }}>
          <Animated.Text style={{ 
            opacity: updatingOpacity, 
            position: 'absolute', 
            fontSize: 16, 
            color: 'gray',
            width: 150 // 텍스트 겹침 방지용 너비 확보
          }}>
            견적서 생성중...
          </Animated.Text>
          <Animated.View style={{ 
            opacity: doneOpacity, 
            position: 'absolute',
            top: -2, // 이미지 높이 보정
            width: 28,
            height: 28,
          }}>
            <Image 
              source={require('../../assets/Check.png')} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </View>

      {/* 용달 정보 섹션 */}
      <View style={{ width: 548, height: 109, left: 46, top: 112, position: 'absolute' }}>
        <Text style={styles.sectionHeader}>용달 정보</Text>
        <View style={[styles.row, { top: 48 }]}>
          <Text style={styles.itemLabel}>{data?.truckType || '-'}</Text>
          <Text style={styles.itemValue}>{data?.truckQuantity || 0}대</Text>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 가격 비교하기 섹션 */}
      <Text style={[styles.title, { top: 285 }]}>가격 비교하기</Text>
      <Text style={styles.subtitle}>AI 및 사용자 설정으로 산출된 견적 업로드 !</Text>

      {/* 비교하기 버튼 */}
      <TouchableOpacity style={styles.compareButton}>
        <Text style={styles.compareButtonText}>비교하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 640,
    height: 500,
    right: 80,
    position: 'absolute',
    backgroundColor: 'white',
    boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    borderRadius: 10,
  },
  title: {
    color: 'black',
    fontSize: 40,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 44,
  },
  sectionHeader: {
    width: 221,
    height: 60,
    left: 0,
    top: 0,
    position: 'absolute',
    color: 'black',
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 36,
    textAlignVertical: 'center',
  },
  row: {
    width: 548,
    height: 37,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    width: 58.44,
    height: 33,
    left: 32,
    color: '#828282',
    fontSize: 21,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 31.5,
  },
  itemValue: {
    width: 259.1,
    height: 37,
    textAlign: 'right',
    color: '#828282',
    fontSize: 21,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 31.5,
  },
  divider: {
    width: 549,
    height: 0,
    left: 46,
    top: 240,
    position: 'absolute',
    borderBottomWidth: 1,
    borderColor: 'rgba(209, 217, 224, 0.57)',
  },
  subtitle: {
    width: 515,
    left: 46,
    top: 336,
    position: 'absolute',
    color: '#828282',
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 36,
  },
  compareButton: {
    width: 548,
    height: 52,
    left: 46,
    top: 400,
    position: 'absolute',
    backgroundColor: 'black',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 24,
  },
});

export default EstimateCard;
