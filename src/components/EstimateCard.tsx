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
    width: 640,
    height: 'auto',
    right: 80,
    padding: 46,
    position: 'absolute',
    backgroundColor: 'white',
    boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: 'black',
    fontSize: 40,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 44,
  },
  statusWrapper: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  updatingStatusText: {
    position: 'absolute',
    fontSize: 16,
    color: 'gray',
    width: 150, // 텍스트 겹침 방지용 너비 확보
  },
  doneStatusIconWrapper: {
    position: 'absolute',
    top: -2,
    width: 28,
    height: 28,
  },
  checkIcon: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    width: 548,
    marginTop: 30,
  },
  sectionHeader: {
    width: 221,
    height: 55,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  itemLabel: {
    width: 200,
    height: 33,
    left: 0,
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
    marginTop: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(209, 217, 224, 0.57)',
  },
  compareSection: {
    marginTop: 30,
  },
  compareTitle: {
    color: 'black',
    fontSize: 40,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 44,
  },
  subtitle: {
    width: 515,
    marginTop: 8,
    color: '#828282',
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 36,
  },
  compareButton: {
    width: 548,
    height: 52,
    marginTop: 30,
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
