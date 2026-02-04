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
  
  // 헬퍼 맵
  const BuildingTypeMap: {[key: string]: string} = {
    "VILLA": "빌라/연립", "OFFICETEL": "오피스텔", "HOUSE": "주택", "APARTMENT": "아파트", "COMMERCIAL": "상가/사무실"
  };
  const RoomSizeMap: {[key: string]: string} = {
    "UNDER_10": "10평 이하", "BETWEEN_10_15": "10~15평", "BETWEEN_15_20": "15~20평", "BETWEEN_20_25": "20~25평", 
    "BETWEEN_25_30": "25~30평", "BETWEEN_30_40": "30~40평", "BETWEEN_40_50": "40~50평", "OVER_50": "50평 이상"
  };
  const RoomTypeMap: {[key: string]: string} = {
    "STUDIO": "원룸", "ONE_AND_HALF": "1.5룸", "TWO_ROOM": "2룸", "THREE_ROOM": "3룸", "FOUR_ROOM": "4룸", "FIVE_PLUS": "5룸 이상"
  };
  const LadderTruckMap: {[key: string]: string} = {
    "REQUIRED": "필요", "NOT_REQUIRED": "필요없음", "NEED_CONFIRM": "확인 필요"
  };

  const renderLocationInfo = (title: string, info?: LocationInfo) => {
    const getBoolText = (val?: boolean | null) => val === true ? '있음' : val === false ? '없음' : '-';
    
    return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      {/* 주소 (전체 너비) */}
      <View style={styles.fullRow}>
        <Text style={styles.gridLabel}>주소</Text>
        <Text style={styles.gridValue}>
          {info?.address ? `${info.address} ${info.detailAddress || ''}`.trim() : '-'}
        </Text>
      </View>

      {/* 그리드 컨테이너 */}
      <View style={styles.gridContainer}>
        {/* 건물 유형 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>건물 유형</Text>
          <Text style={styles.gridValue}>{info?.buildingType ? (BuildingTypeMap[info.buildingType] || info.buildingType) : '-'}</Text>
        </View>

        {/* 평수 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>평수</Text>
          <Text style={styles.gridValue}>{info?.roomSize ? (RoomSizeMap[info.roomSize] || info.roomSize) : '-'}</Text>
        </View>

        {/* 방 구조 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>방 구조</Text>
          <Text style={styles.gridValue}>{info?.roomType ? (RoomTypeMap[info.roomType] || info.roomType) : '-'}</Text>
        </View>

        {/* 층수 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>층수</Text>
          <Text style={styles.gridValue}>{info?.floor ? info.floor.replace('FL_', '').replace('_OR_MORE', '') + (info.floor.includes('BASEMENT') ? '' : '층') : '-'}</Text>
        </View>

        {/* 엘리베이터 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>엘리베이터</Text>
          <Text style={styles.gridValue}>{getBoolText(info?.elevator)}</Text>
        </View>

        {/* 주차 공간 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>주차 공간</Text>
          <Text style={styles.gridValue}>{getBoolText(info?.parking)}</Text>
        </View>

        {/* 사다리차 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>사다리차</Text>
          <Text style={styles.gridValue}>{info?.ladderTruck ? (LadderTruckMap[info.ladderTruck] || info.ladderTruck) : '-'}</Text>
        </View>

        {/* 복층 여부 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>복층</Text>
          <Text style={styles.gridValue}>{getBoolText(info?.duplex)}</Text>
        </View>

        {/* 1층 별도 계단 */}
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>1층 계단</Text>
          <Text style={styles.gridValue}>{getBoolText(info?.groundStair)}</Text>
        </View>
      </View>
    </View>
    );
  };

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
    borderRadius: 4,
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
    alignItems: 'center', // 수직 중앙 정렬 추가
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#555',
    minWidth: 70, // 라벨 최소 너비 확보
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
  // 그리드 스타일
  fullRow: {
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // 2열 배치 (간격 고려)
    marginBottom: 16,
  },
  gridLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
});
