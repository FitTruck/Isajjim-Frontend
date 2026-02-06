import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Truck } from 'lucide-react-native';
import AddBoxButton from './AddBoxButton';

interface TruckData {
  type: string;
  quantity: number;
}

interface NextBtn3Props {
  data: TruckData[];
  status: 'prev' | 'updating' | 'done';
  onNavigateNext: () => void;
  onAddBox: () => void;
}

// 트럭 타입 한글 변환
const getTruckLabel = (type: string): string => {
  const labels: Record<string, string> = {
    '1ton': '1톤 트럭',
    '2.5ton': '2.5톤 트럭',
    '5ton': '5톤 트럭',
  };
  return labels[type] || type;
};

// 트럭 타입에서 톤수 추출 (정렬용)
const getTruckTonnage = (type: string): number => {
  const match = type.match(/^([\d.]+)ton$/);
  return match ? parseFloat(match[1]) : Infinity;
};

const NextBtn3 = ({ data, status, onNavigateNext, onAddBox }: NextBtn3Props) => {
  const updatingOpacity = useRef(new Animated.Value(0)).current; 
  // 1인 상태로 시작하는 애니메이션 숫자
  const doneOpacity = useRef(new Animated.Value(1)).current; 

  // result화면에서 받아오는 status값이 변경될 때마다 실행되는 함수임. 컴포넌트도 다시 그림
  useEffect(() => {
    if (status === 'updating') {
      updatingOpacity.setValue(1); // 값을 1로 즉시 변경
      doneOpacity.setValue(0); // 즉시 0으로 변경
    } else if (status === 'done') {
      Animated.parallel([
        // 값을 부드럽게 0으로 변경
        Animated.timing(updatingOpacity, { 
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // 값을 부드럽게 1로 변경
        Animated.timing(doneOpacity, { 
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else { // result페이지가 로딩 되자마자의 초기 상태.
      updatingOpacity.setValue(0);
      doneOpacity.setValue(1);
    }
  }, [status]);

  return (
    <View style={styles.container}>
      {/* 용달 정보 섹션 */}
      <View style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <View style={styles.headerTitleRow}>
            <Truck size={24} color="#333" style={{ marginRight: 8 }} />
            <Text style={styles.sectionHeader}>용달 정보</Text>
          </View>
          
          <View style={styles.statusWrapper}>
            <Animated.Text style={[{ 
              opacity: updatingOpacity 
            }, styles.updatingStatusText]}>
              계산중...
            </Animated.Text>
            <Animated.View style={[{ 
              opacity: doneOpacity 
            }, styles.doneStatusIconWrapper]}>
              {/* 계산 완료 시 아무것도 표시하지 않음 */}
            </Animated.View>
          </View>
        </View>

        {/* 유효한 트럭 정보만 표시 (type이 있고 quantity > 0), 톤수 오름차순 정렬 */}
        {data.filter(truck => truck.type && truck.quantity > 0).length > 0 ? (
          data
            .filter(truck => truck.type && truck.quantity > 0)
            .sort((a, b) => getTruckTonnage(a.type) - getTruckTonnage(b.type))
            .map((truck, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.truckType}>{getTruckLabel(truck.type)}</Text>
              <Text style={styles.truckQuantity}>{truck.quantity}대</Text>
            </View>
            ))
        ) : (
          <Text style={styles.loadingText}>시뮬레이션을 시작하면 계산됩니다</Text>
        )}
      </View>

      <AddBoxButton onPress={onAddBox} />

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 업로드 버튼 */}
      <TouchableOpacity style={styles.compareButton} onPress={onNavigateNext}>
        <Text style={styles.compareButtonText}>최종 견적 확인하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 24,
  },
  infoSection: {
    width: '100%',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
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
    color: '#333333',
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
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  truckType: {
    fontSize: 15,
    fontWeight: '500',
    color: '#535353',
    lineHeight: 20,
  },
  truckQuantity: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    color: '#333333',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#828282',
    lineHeight: 20,
  },
  divider: {
    width: '100%',
    marginTop: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(209, 217, 224, 0.57)',
  },
  compareButton: {
    width: '100%',
    height: 42,
    backgroundColor: '#F0893B',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
});

export default NextBtn3;
