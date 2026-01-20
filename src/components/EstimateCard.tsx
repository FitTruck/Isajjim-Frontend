import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const EstimateCard = () => {
  return (
    <View style={styles.container}>
      {/* 견적표 타이틀 */}
      <Text style={[styles.title, { top: 46 }]}>견적표</Text>

      {/* 용달 정보 섹션 */}
      <View style={{ width: 548, height: 109, left: 46, top: 112, position: 'absolute' }}>
        <Text style={styles.sectionHeader}>용달 정보</Text>
        <View style={styles.row}>
          <Text style={styles.itemLabel}>1톤</Text>
          <Text style={styles.itemValue}>1대</Text>
        </View>
      </View>

      {/* 박스 정보 섹션 */}
      <View style={{ width: 548, height: 133, left: 46, top: 221, position: 'absolute' }}>
        <Text style={styles.sectionHeader}>박스 정보</Text>
        <View style={[styles.row, { top: 48 }]}>
          <Text style={styles.itemLabel}>2호</Text>
          <Text style={styles.itemValue}>1개</Text>
        </View>
        <View style={[styles.row, { top: 85 }]}>
          <Text style={styles.itemLabel}>4호</Text>
          <Text style={styles.itemValue}>1개</Text>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 가격 비교하기 섹션 */}
      <Text style={[styles.title, { top: 400 }]}>가격 비교하기</Text>
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
    height: 613,
    position: 'relative',
    backgroundColor: 'white',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.10)',
    overflow: 'hidden',
    borderRadius: 10,
  },
  title: {
    width: 549,
    left: 46,
    position: 'absolute',
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
    top: 354.99,
    position: 'absolute',
    borderBottomWidth: 1,
    borderColor: 'rgba(209, 217, 224, 0.57)',
  },
  subtitle: {
    width: 515,
    left: 46,
    top: 451,
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
    top: 515,
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
