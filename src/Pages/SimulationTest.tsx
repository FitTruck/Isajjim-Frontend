/**
 * 시뮬레이션 테스트 페이지
 *
 * 테스트용 데이터로 3D 적재 시뮬레이션 확인
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Space3D from '../components/Space/Space3D';
import { SimulationFurniture, TruckType } from '../types/simulation';

// 모든 테스트용 가구 데이터 (19개, 단위: mm)
const ALL_FURNITURE: SimulationFurniture[] = [
  // BED 타입들
  { furnitureId: 1, label: 'BED', type: 'SINGLE_BED', quantity: 1, width: 2000, depth: 1000, height: 500 },
  { furnitureId: 2, label: 'BED', type: 'SINGLE_BED', quantity: 1, width: 2000, depth: 1000, height: 500 },
  { furnitureId: 3, label: 'BED', type: 'SINGLE_BED', quantity: 1, width: 2000, depth: 1000, height: 500 },
  { furnitureId: 4, label: 'BED', type: 'SINGLE_BED', quantity: 1, width: 2000, depth: 1000, height: 500 },
  { furnitureId: 5, label: 'BED', type: 'SINGLE_BED', quantity: 1, width: 2000, depth: 1000, height: 500 },
  { furnitureId: 6, label: 'BED', type: 'SINGLE_BED', quantity: 1, width: 2000, depth: 1000, height: 500 },
  { furnitureId: 7, label: 'BED', type: 'SINGLE_BED', quantity: 1, width: 2000, depth: 1000, height: 500 },
  { furnitureId: 8, label: 'BED', type: 'SINGLE_BED', quantity: 1, width: 2000, depth: 1000, height: 500 },
  // SOFA 타입들
  { furnitureId: 9,  label: 'SOFA', type: 'THREE_SEATER_SOFA', quantity: 1, width: 2200, depth: 900, height: 850 },
  { furnitureId: 10, label: 'SOFA', type: 'THREE_SEATER_SOFA', quantity: 1, width: 2200, depth: 900, height: 850 },
  // NIGHTSTAND
  { furnitureId: 11, label: 'NIGHTSTAND', type: 'NIGHTSTAND', quantity: 1, width: 500, depth: 400, height: 550 },
  { furnitureId: 12, label: 'NIGHTSTAND', type: 'NIGHTSTAND', quantity: 1, width: 500, depth: 400, height: 550 },
  // COFFEE_TABLE
  { furnitureId: 13, label: 'COFFEE_TABLE', type: 'COFFEE_TABLE', quantity: 1, width: 1200, depth: 600, height: 450 },
  { furnitureId: 14, label: 'COFFEE_TABLE', type: 'COFFEE_TABLE', quantity: 1, width: 1200, depth: 600, height: 450 },
  // CABINET
  { furnitureId: 15, label: 'CABINET', type: 'CABINET', quantity: 1, width: 800, depth: 450, height: 1800 },
  // CHAIR_STOOL
  { furnitureId: 16, label: 'CHAIR', type: 'CHAIR_STOOL', quantity: 1, width: 450, depth: 450, height: 850 },
  // MONITOR_TV
  { furnitureId: 17, label: 'TV', type: 'MONITOR_TV', quantity: 1, width: 1200, depth: 100, height: 700 },
  // POTTED_PLANT
  { furnitureId: 18, label: 'PLANT', type: 'POTTED_PLANT', quantity: 1, width: 400, depth: 400, height: 600 },
  { furnitureId: 19, label: 'PLANT', type: 'POTTED_PLANT', quantity: 1, width: 400, depth: 400, height: 600 },
];

export default function SimulationTest() {
  // 'auto'면 멀티트럭 자동 최적화, 그 외는 고정 트럭
  const [truckMode, setTruckMode] = useState<'auto' | TruckType>('auto');
  const [furnitureCount, setFurnitureCount] = useState(ALL_FURNITURE.length);
  const insets = useSafeAreaInsets();

  const activeFurniture = ALL_FURNITURE.slice(0, furnitureCount);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: 15 + insets.top }]}>
        <Text style={styles.title}>3D 적재 시뮬레이션 테스트</Text>
        <Text style={styles.subtitle}>총 {ALL_FURNITURE.length}개 가구</Text>
      </View>

      {/* 컨트롤 패널 */}
      <View style={styles.controlPanel}>
        {/* 트럭 타입 선택 */}
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>트럭:</Text>
          <View style={styles.buttonGroup}>
            {/* 자동 최적화 버튼 */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                truckMode === 'auto' && styles.typeButtonAuto,
              ]}
              onPress={() => setTruckMode('auto')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  truckMode === 'auto' && styles.typeButtonTextActive,
                ]}
              >
                자동
              </Text>
            </TouchableOpacity>
            {(['1ton', '2.5ton', '5ton'] as TruckType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  truckMode === type && styles.typeButtonActive,
                ]}
                onPress={() => setTruckMode(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    truckMode === type && styles.typeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 가구 개수 조절 */}
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>가구: {furnitureCount}개</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => setFurnitureCount(Math.max(1, furnitureCount - 1))}
            >
              <Text style={styles.countButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => setFurnitureCount(Math.min(ALL_FURNITURE.length, furnitureCount + 1))}
            >
              <Text style={styles.countButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.countButton, { width: 60 }]}
              onPress={() => setFurnitureCount(ALL_FURNITURE.length)}
            >
              <Text style={styles.countButtonText}>전체</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 가구 목록 */}
      <ScrollView horizontal style={styles.furnitureListContainer}>
        <View style={styles.furnitureList}>
          {activeFurniture.map((f, i) => (
            <View key={f.furnitureId} style={styles.furnitureItem}>
              <Text style={styles.furnitureLabel}>{i + 1}. {f.label}</Text>
              <Text style={styles.furnitureSize}>
                {f.width}x{f.depth}x{f.height}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 3D 뷰어 */}
      <View style={styles.viewer}>
        <Space3D
          furniture={activeFurniture}
          truckType={truckMode === 'auto' ? undefined : truckMode}
          autoPlay={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 15,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  controlPanel: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1e293b',
    gap: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  typeButtonAuto: {
    backgroundColor: '#10b981',
  },
  typeButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  countButton: {
    width: 32,
    height: 32,
    backgroundColor: '#334155',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  furnitureListContainer: {
    maxHeight: 50,
    backgroundColor: '#1e293b',
  },
  furnitureList: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  furnitureItem: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  furnitureLabel: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  furnitureSize: {
    color: '#94a3b8',
    fontSize: 9,
  },
  viewer: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
