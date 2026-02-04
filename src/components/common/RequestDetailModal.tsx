import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { X, Sparkles } from 'lucide-react-native';
import { RequestData, LocationInfo } from '../../context/EstimateContext';

interface RequestDetailModalProps {
  visible: boolean;
  onClose: () => void;
  data: RequestData;
}

export default function RequestDetailModal({ visible, onClose, data }: RequestDetailModalProps) {
  
  const renderLocationInfo = (title: string, info: LocationInfo) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>주소</Text>
        <Text style={styles.value}>
          {info?.address || '-'} {info?.detailAddress || ''}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>층수</Text>
        <Text style={styles.value}>{info?.floor ? `${info.floor}층` : '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>엘리베이터</Text>
        <Text style={styles.value}>{info?.elevator ? '있음' : '없음'}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>내 요청사항</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            {/* 이사 일시 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>이사 예정일</Text>
              <Text style={styles.dateValue}>{data.movingDate || '-'}</Text>
            </View>

            <View style={styles.divider} />

            {/* 출발지 정보 */}
            {renderLocationInfo("출발지 정보", data.startLocation)}

            <View style={styles.divider} />

            {/* 도착지 정보 */}
            {renderLocationInfo("도착지 정보", data.endLocation)}

            <View style={styles.divider} />

            {/* 짐 목록 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>분석된 이삿짐 목록</Text>
              {data.items && data.items.length > 0 ? (
                data.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>{item.quantity}개</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>등록된 짐이 없습니다.</Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* 트럭 정보 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>추천 차량</Text>
              {data.truckInfo ? (
                <View style={styles.row}>
                  <Text style={styles.truckType}>{data.truckInfo.type}</Text>
                  <Text style={styles.truckQuantity}>{data.truckInfo.quantity}대</Text>
                </View>
              ) : (
                <Text style={styles.emptyText}>추천 차량 정보가 없습니다.</Text>
              )}
            </View>

            {/* AI 요약 (영수증 하단 느낌) */}
            <View style={styles.receiptFooterDivider}>
              {[...Array(20)].map((_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>
            
            <View style={styles.aiSection}>
              <View style={styles.aiHeader}>
                <Sparkles size={16} color="#F0893B" />
                <Text style={styles.aiTitle}>AI 요약 (확정 사항)</Text>
              </View>
              <Text style={styles.aiContent}>
                {data.aiSummary ? data.aiSummary : "아직 확정된 대화 내용이 없습니다.\n업체와 상담하여 특이사항을 확정해주세요."}
              </Text>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
  },
  dateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#555',
  },
  value: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  truckType: {
    fontSize: 15,
    color: '#333',
  },
  truckQuantity: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
  },
  receiptFooterDivider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 24,
  },
  dash: {
    width: 8,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
  },
  aiSection: {
    backgroundColor: '#FFF8F0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EA6500',
  },
  aiContent: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
});
