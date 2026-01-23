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
  // useRef : Estimate 컴포넌트가 리렌더링 되어도 변수값 유지
  // useRef가 반환하는 값의 속성 중에 current가 있고 그 current값은 Animated.Value(0)의 값임
  // Animated.Value(x) -> 값을 자연스럽게 그라데이션으로 변경 
  const updatingOpacity = useRef(new Animated.Value(0)).current; // 0인 상태로 시작하는 애니메이션 숫자
  const doneOpacity = useRef(new Animated.Value(1)).current; // 1인 상태로 시작하는 애니메이션 숫자

  useEffect(() => {
    if (status === 'updating') {
      // 체크 -> 생성중... (애니메이션 없이 즉시 변경)
      updatingOpacity.setValue(1); //setValue: 변수 값을 즉시 변경하는 리액트 내부 함수
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
      {/* '견적표' 타이틀 및 상태 */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>견적표</Text>
        
        {/* 상태 텍스트들을 절대 위치로 겹쳐놓고 투명도만 조절하여 자연스럽게 교체 */}
        <View style={styles.statusWrapper}>
          <Animated.Text style={[{ 
            opacity: updatingOpacity 
          }, styles.updatingStatusText]}>
            견적서 생성중...
          </Animated.Text>
          <Animated.View style={[{ 
            opacity: doneOpacity 
          }, styles.doneStatusIconWrapper]}>
            <Image 
              source={require('../../assets/Check.png')} 
              style={styles.checkIcon}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </View>

      {/* 용달 정보 섹션 */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionHeader}>용달 정보</Text>
        <View style={styles.row}>
          <Text style={styles.itemLabel}>{data.truckType || '오류'}</Text>
          <Text style={styles.itemValue}>{data.truckQuantity || '오류'}</Text>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 가격 비교하기 섹션 */}
      <View style={styles.compareSection}>
        <Text style={styles.compareTitle}>가격 비교하기</Text>
        <Text style={styles.subtitle}>AI 및 사용자 설정으로 산출된 견적 업로드 !</Text>
      </View>

      {/* 비교하기 버튼 */}
      <TouchableOpacity style={styles.compareButton}>
        <Text style={styles.compareButtonText}>비교하기</Text>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 30,
  },
  statusWrapper: {
    justifyContent: 'center',
    height: 30,
    width: 28,
    position: 'relative',
  },
  updatingStatusText: {
    position: 'absolute',
    fontSize: 12,
    color: 'gray',
    width: 100, 
    right: 0,
    textAlign: 'left',
  },
  doneStatusIconWrapper: {
    position: 'absolute',
    right: 0,
    width: 20,
    height: 20,
  },
  checkIcon: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    width: '100%',
    marginTop: 10,
  },
  sectionHeader: {
    width: '100%',
    marginBottom: 10,
    color: 'black',
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 24,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemLabel: {
    color: '#828282',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 20,
  },
  itemValue: {
    textAlign: 'right',
    color: '#828282',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
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
    color: 'black',
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 28,
  },
  subtitle: {
    width: '100%',
    marginTop: 8,
    color: '#828282',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
  },
  compareButton: {
    width: '100%',
    height: 40,
    marginTop: 20,
    backgroundColor: '#F0893B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});

export default EstimateCard;
