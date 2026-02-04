import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
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
      
      {/* 주소 (독립) */}
      <View style={styles.receiptRow}>
        <Text style={styles.receiptLabel}>주소</Text>
        <Text style={styles.receiptValue}>
          {info?.address ? `${info.address} ${info.detailAddress || ''}`.trim() : '-'}
        </Text>
      </View>

      <View style={styles.dashedLine} />

      {/* 2열 배치 (영수증 스타일: 한 줄에 2개 항목) */}
      
      {/* 1. 건물 유형 | 평수 */}
      <View style={styles.pairRow}>
        <View style={styles.pairItem}>
          <Text style={styles.pairLabel}>건물 유형</Text>
          <Text style={styles.pairValue}>{info?.buildingType ? (BuildingTypeMap[info.buildingType] || info.buildingType) : '-'}</Text>
        </View>
        <View style={styles.pairItemRight}>
          <Text style={styles.pairLabel}>평수</Text>
          <Text style={styles.pairValue}>{info?.roomSize ? (RoomSizeMap[info.roomSize] || info.roomSize) : '-'}</Text>
        </View>
      </View>

      {/* 2. 방 구조 | 층수 */}
      <View style={styles.pairRow}>
        <View style={styles.pairItem}>
          <Text style={styles.pairLabel}>방 구조</Text>
          <Text style={styles.pairValue}>{info?.roomType ? (RoomTypeMap[info.roomType] || info.roomType) : '-'}</Text>
        </View>
        <View style={styles.pairItemRight}>
          <Text style={styles.pairLabel}>층수</Text>
          <Text style={styles.pairValue}>{info?.floor ? info.floor.replace('FL_', '').replace('_OR_MORE', '') + (info.floor.includes('BASEMENT') ? '' : '층') : '-'}</Text>
        </View>
      </View>

      {/* 3. 엘리베이터 | 주차 */}
      <View style={styles.pairRow}>
        <View style={styles.pairItem}>
          <Text style={styles.pairLabel}>엘리베이터</Text>
          <Text style={styles.pairValue}>{getBoolText(info?.elevator)}</Text>
        </View>
        <View style={styles.pairItemRight}>
          <Text style={styles.pairLabel}>주차</Text>
          <Text style={styles.pairValue}>{getBoolText(info?.parking)}</Text>
        </View>
      </View>

      {/* 4. 사다리차 | 1층 계단 */}
      <View style={styles.pairRow}>
        <View style={styles.pairItem}>
          <Text style={styles.pairLabel}>사다리차</Text>
          <Text style={styles.pairValue}>{info?.ladderTruck ? (LadderTruckMap[info.ladderTruck] || info.ladderTruck) : '-'}</Text>
        </View>
        <View style={styles.pairItemRight}>
          <Text style={styles.pairLabel}>1층 계단</Text>
          <Text style={styles.pairValue}>{getBoolText(info?.groundStair)}</Text>
        </View>
      </View>

      {/* 5. 복층 (단독) */}
      <View style={styles.pairRow}>
        <View style={styles.pairItem}>
          <Text style={styles.pairLabel}>복층</Text>
          <Text style={styles.pairValue}>{getBoolText(info?.duplex)}</Text>
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
              {data.aiSummary ? (
                <Markdown style={markdownStyles}>
                  {data.aiSummary}
                </Markdown>
              ) : (
                <Text style={styles.aiContent}>
                  아직 확정된 대화 내용이 없습니다.{'\n'}업체와 상담하여 특이사항을 확정해주세요.
                </Text>
              )}
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  strong: {
    fontWeight: 'bold',
    color: '#333',
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500, // 모달 너비 증가
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
    paddingVertical: 18, // 패딩 증가
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 22, // 20 -> 22
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20, // 18 -> 20
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  dateValue: {
    fontSize: 24, // 22 -> 24
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 8,
  },
  label: {
    fontSize: 16, 
    color: '#555',
    minWidth: 70, 
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 24,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 17, // 16 -> 17
    color: '#333',
  },
  itemQuantity: {
    fontSize: 17, // 16 -> 17
    color: '#333',
    fontWeight: '500',
  },
  truckType: {
    fontSize: 17, // 16 -> 17
    color: '#333',
  },
  truckQuantity: {
    fontSize: 17, // 16 -> 17
    fontWeight: '500',
    color: '#333',
  },
  emptyText: {
    fontSize: 15,
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
    fontSize: 18, // 16 -> 18
    fontWeight: 'bold',
    color: '#EA6500',
  },
  aiContent: {
    fontSize: 16, // 15 -> 16
    color: '#555',
    lineHeight: 24,
  },
  // 영수증 스타일 (Receipt Style)
  receiptRow: {
    marginBottom: 16,
  },
  receiptLabel: {
    fontSize: 16, // 15 -> 16
    color: '#888',
    marginBottom: 6,
  },
  receiptValue: {
    fontSize: 19, // 17 -> 19
    color: '#333',
    fontWeight: '600',
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderStyle: 'dashed',
    marginVertical: 16,
    width: '100%',
  },
  pairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pairItem: {
    flex: 1,
    paddingRight: 8,
  },
  pairItemRight: {
    flex: 1,
    paddingLeft: 8,
    // alignItems: 'flex-end' 제거하여 좌측 정렬로 변경
  },
  pairLabel: {
    fontSize: 15, // 14 -> 15
    color: '#999',
    marginBottom: 4,
  },
  pairValue: {
    fontSize: 18, // 16 -> 18
    color: '#333',
    fontWeight: '600',
  },
});
