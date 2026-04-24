import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MapPin, ChevronRight, FileText, CircleStop, Star, MessageCircle } from 'lucide-react-native';
import RequestDetailModal from "../common/RequestDetailModal";

interface EstimateCardProps {
  status: 'pending' | 'active' | 'moving' | 'completed'| 'cancelled' ;
  date: string;
  locations: { start: string; end: string };
  
  quoteInfo?: {
    isLowest?: boolean;
    price: string;
    rating: string;
    tags: string[];
    companyCount: number;
  };
  timelineStep?: number;
}

import { useEstimate, RequestData } from '../../context/EstimateContext';

export default function EstimateCard({ status, date, locations, quoteInfo, timelineStep = 2 }: EstimateCardProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { requestData, confirmedCompany } = useEstimate();
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const displayData: RequestData = requestData ? {
     ...requestData
  } : {
    // 데이터 없음 >>>> 없는 대로 두기
    estimateId: 0,
    movingDate: null,
    startLocation: {
      address: null, detailAddress: null, floor: null, elevator: null,
      buildingType: null, roomSize: null, ladderTruck: null, roomType: null,
      duplex: null, groundStair: null, parking: null
    },
    endLocation: {
      address: null, detailAddress: null, floor: null, elevator: null,
      buildingType: null, roomSize: null, ladderTruck: null, roomType: null,
      duplex: null, groundStair: null, parking: null
    },
    items: [],
    truckInfo: null,
    aiSummary: undefined
  };

  // Context에서 날짜와 위치 정보 가져오기 (있으면 사용, 없으면 props 사용)
  const contextDate = requestData?.movingDate;
  const contextStart = requestData?.startLocation?.address ? requestData.startLocation.address.split(' ').slice(0, 2).join(' ') : null;
  const contextEnd = requestData?.endLocation?.address ? requestData.endLocation.address.split(' ').slice(0, 2).join(' ') : null;

  const displayDate = contextDate || date;
  const displayStart = contextStart || locations.start;
  const displayEnd = contextEnd || locations.end;

  const isCancelled = status === 'cancelled';
  const isCompletedStatus = status === 'completed';
  const isMoving = status === 'moving';
  const isWaitingForQuotes = timelineStep === 2 || (quoteInfo && quoteInfo.companyCount === 0);

  // 상태 배지
  const renderStatusBadge = () => {
    if (isCancelled) {
      return (
        <View style={[styles.statusBadge, { borderColor: '#BDBDBD' }]}>
          <Text style={[styles.statusBadgeText, { color: '#ADADAD' }]}>취소된 이사</Text>
        </View>
      );
    }
    if (isCompletedStatus) {
      return (
        <View style={[styles.statusBadge, { borderColor: '#BDBDBD' }]}>
          <Text style={[styles.statusBadgeText, { color: '#ADADAD' }]}>완료된 이사</Text>
        </View>
      );
    }
    if (isMoving) {
      return (
        <View style={[styles.statusBadge, { borderColor: '#94E3B8', backgroundColor: '#F0FFF7' }]}>
          <Text style={[styles.statusBadgeText, { color: '#009443' }]}>이사 진행 중</Text>
        </View>
      );
    }
    if (status === 'pending') {
      return (
        <View style={[styles.statusBadge, { borderColor: '#F0893B' }]}>
          <Text style={[styles.statusBadgeText, { color: '#F0893B' }]}>견적 대기 중</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { borderColor: '#F0893B' }]}>
        <Text style={[styles.statusBadgeText, { color: '#F0893B' }]}>견적 받는 중</Text>
      </View>
    );
  };

  const renderTimeline = () => {
    // 1: 신청, 2: 견적, 3: 확정, 4: 이사
    const steps = [
      { num: 1, label: '신청' },
      { num: 2, label: '견적' },
      { num: 3, label: '확정' },
      { num: 4, label: '이사' }
    ];

    const currentStep = timelineStep ?? (isCompletedStatus ? 5 : (isMoving ? 4 : 2));

    return (
      <View style={styles.timelineContainer}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.num < currentStep;
          const isCurrent = step.num === currentStep;
          const isActive = isCompleted || isCurrent;
          
          return (
            <React.Fragment key={step.num}>
              {/* Step Circle & Label */}
              <View style={styles.stepContainer}>
                <View style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted, // Solid Orange
                  isCurrent && styles.circleCurrent,     // Border Orange
                  !isActive && styles.circleFuture       // Gray
                ]}>
                  {isCompleted ? (
                    <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold'}}>✓</Text>
                  ) : (
                    <Text style={[
                      styles.circleText,
                      isCurrent && { color: '#FF760F' },
                      !isActive && { color: '#BDBDBD' }
                    ]}>
                      {step.num}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.stepLabel,
                  isActive ? { color: '#FF760F' } : { color: '#BDBDBD' }
                ]}>
                  {step.label}
                </Text>
              </View>

              {/* Connector Line */}
              {!isLast && (
                <View style={[
                  styles.stepLine,
                  { backgroundColor: isCompleted ? '#FF760F' : '#E0E0E0' }
                ]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.cardContainer, isMobile && styles.mobileCardContainer]}>
      {/* 왼쪽 섹션 (이사 정보) */}
      <View style={[styles.leftSection, isMobile && styles.mobileLeftSection]}>
        {/* 헤더: 상태 배지 & 등록일 */}
        <View style={styles.headerRow}>
          <View>{renderStatusBadge()}</View>
          <Text style={styles.regDateText}>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')} 등록</Text>
        </View>

        {/* 날짜 행 */}
        <View style={styles.dateRow}>
          <Text style={styles.mainDateText}>{displayDate}</Text>
          <Text style={styles.subDateText}>이사 예정</Text>
        </View>

        {/* 위치 정보 */}
        <View style={styles.locationRow}>
          <MapPin color="#333" size={14} style={{ marginRight: 6, opacity: 0.5 }} />
          <Text style={styles.locationText}>{displayStart}</Text>
          <ChevronRight color="#333" size={10} style={{ marginHorizontal: 10, opacity: 0.5 }} />
          <Text style={styles.locationText}>{displayEnd}</Text>
        </View>

        {/* 타임라인 */}
        <View style={styles.timelineWrapper}>
          {renderTimeline()}
        </View>

        {/* 버튼들 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.requestButton}
          onPress={() => setIsRequestModalVisible(true)}>
            <FileText color="#555" size={14} style={{ marginRight: 6 }} />
            <Text style={styles.requestButtonText}>내 요청사항</Text>
          </TouchableOpacity>

          <RequestDetailModal 
            visible={isRequestModalVisible}
            onClose={() => setIsRequestModalVisible(false)}
            data={displayData}
          />

          {(status === 'active' || status === 'pending') && (
            <TouchableOpacity style={styles.stopButton}>
              <CircleStop color="#FF6B6B" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.stopButtonText}>견적 그만 받기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 오른쪽 섹션 (견적 정보) */}
      <View style={[
        styles.rightSection, 
        isMobile && styles.mobileRightSection, 
        (isCancelled || isCompletedStatus) && { backgroundColor: '#F4F4F4' },
        isMoving && { backgroundColor: 'white', padding: isMobile ? 15 : 0 },
        isWaitingForQuotes && { justifyContent: 'center', alignItems: 'center' }
      ]}>
        {isCancelled ? (
          // 취소된 이사
          <View style={styles.rightTextContent}>
            <Text style={styles.cancelledText}>상담이 취소된 내역입니다.</Text>
          </View>
        ) : isCompletedStatus ? (
          // 완료된 이사
          <View style={styles.rightTextContent}>
            <Text style={styles.cancelledText}>완료된 이사입니다.</Text>
          </View>
        ) : isMoving ? (
          // Step 4: 이사 진행 중 (무조건 확정 업체 정보 표시)
          <View style={[styles.rightTextContent, isMobile && { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 0 }]}> 
            <View style={[styles.confirmedProfileCircle, isMobile && { width: 60, height: 60, flex: 0, padding: 0 }]}>
              {confirmedCompany?.logo ? (
                <Image source={confirmedCompany.logo} style={styles.confirmedProfileImage} />
              ) : (
                <Text style={[styles.confirmedProfileText, isMobile && { fontSize: 24 }]}>{confirmedCompany?.name?.[0] ?? ''}</Text>
              )}
            </View>
            <View style={[styles.movingInfoContainer, isMobile && { alignItems: 'flex-start', paddingVertical: 0, flex: 1 }]}>
              <Text style={[styles.movingText, isMobile && { fontSize: 18 }]}>{confirmedCompany?.name ?? ''}</Text>
              <View style={styles.movingDetailRow}>
                 <Star color="#F0893B" size={14} fill="#F0893B" style={{ marginTop: 1 }} />
                 <Text style={styles.movingRating}>{confirmedCompany?.rating ?? '-'}</Text>
                 <View style={styles.verticalDivider} />
                 <Text style={styles.movingPrice}>{confirmedCompany?.price ?? ''}</Text>
              </View>
            </View>
          </View>
        ) : quoteInfo ? (

          isWaitingForQuotes ? (
            // Step2 : 견적 대기 중
            <View style={[styles.receivedInfo, { marginRight: 12 }]}>
              <View style={[styles.receivedIcon, isMobile && { width: 40, height: 40 }]}>
                <MessageCircle color="#333" size={isMobile ? 20 : 30} />
              </View>
              <View style={{marginLeft: 14}}>
                <Text style={styles.receivedLabel}>받은 견적서</Text>
                <Text style={styles.receivedCount}>{quoteInfo.companyCount}개 업체</Text>
              </View>
            </View>
          ) : (
            // Step 3 : 견적 받는 중
            <View style={isMobile ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' } : { width: '100%' }}>
              {/* 받은 견적서 개수 헤더 */}
              <View style={[styles.receivedInfo, !isMobile && { marginBottom: 12 }]}>
                <View style={[styles.receivedIcon, isMobile && { width: 46, height: 46 }]}>
                  <MessageCircle color="#333" size={isMobile ? 22 : 30} />
                </View>
                <View style={{marginLeft: 14}}>
                  <Text style={styles.receivedLabel}>받은 견적서</Text>
                  <Text style={[styles.receivedCount, isMobile && { fontSize: 16 }]}>{quoteInfo.companyCount}개 업체</Text>
                </View>
              </View>

              {/* 모바일: 태그 숨김 or 간소화 (여기선 숨김 for compactness) */}
              {!isMobile && (
                <View style={styles.tagsRow}>
                  {quoteInfo.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 최저가 / 가격 표시 */}
              <View style={[styles.quoteBox, isMobile && { marginTop: 0, padding: 0, borderWidth: 0, backgroundColor: 'transparent',  alignItems: 'flex-end' }]}>
                <View style={[styles.quoteBoxHeader, isMobile && { justifyContent: 'flex-end', flexDirection: 'column-reverse', alignItems: 'flex-end', gap: 2 }]}>

                  <View style={styles.ratingRow}>
                    <Star color="#F0893B" size={14} fill="#F0893B" />
                    <Text style={styles.ratingText}>{quoteInfo.rating}</Text>
                  </View>

                  {quoteInfo.isLowest ? (
                      <Text style={[styles.lowestLabel, isMobile && { fontSize: 13, color: '#333333' }]}>최저가 업체</Text>
                  ) : <View />}

                </View>
                
                <Text style={[styles.priceText, isMobile && { fontSize: 20, marginBottom: 0 }]}>{quoteInfo.price}</Text> 
              </View>
            </View>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // cardContainer definition removed from here as it was duplicated at bottom
  leftSection: {
    flex: 1,
    padding: 28,
    position: 'relative',
  },
  rightSection: {
    width: 250,
    borderLeftWidth: 1,
    borderLeftColor: '#D8D8D8',
    padding: 28,
    justifyContent: 'center',
  },
  
  // Header & Date
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 10,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  regDateText: {
    fontSize: 12,
    color: '#B2B2B2',
    marginLeft: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 3,
  },
  mainDateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginRight: 6,
    lineHeight: 24,
  },
  subDateText: {
    fontSize: 15,
    color: '#B2B2B2',
    marginBottom: 1
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, 
    justifyContent: 'flex-start',
  },
  mapIcon: {
    width: 14, 
    height: 14,
    marginRight: 6,
    opacity: 0.5,
  },
  locationText: {
    fontSize: 15,
    color: '#333333',
  },
  arrowIcon: {
    width: 10,
    height: 10,
    marginHorizontal: 10,
    opacity: 0.5,
  },
  // Timeline
  timelineWrapper: {
    marginBottom: 15,
    marginTop: 0,
    width: '100%',
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Top align to allow text below
    justifyContent: 'flex-start',
  },
  stepContainer: {
    alignItems: 'center',
    width: 30, // Fixed width for alignment
    zIndex: 1,
  },
  stepLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#BDBDBD' // Default gray
  },
  
  // Circle Styles
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'white',
  },
  circleCompleted: {
    backgroundColor: '#FF760F', // Solid Orange
    borderColor: '#FF760F',
  },
  circleCurrent: {
    borderColor: '#FF760F', // Orange Border
    borderWidth: 2,
    backgroundColor: 'white',
  },
  circleFuture: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5', // Light Gray bg
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BDBDBD',
  },

  // Connector Line
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginTop: 11, // Align with circle center (24/2 - 2/2 = 11)
    marginHorizontal: -2, // Pull closer to circles
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  btnIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  requestButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '500',
  },
  stopButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },

  // Right Side
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  quoteBox: {
    padding: 16,
    paddingBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0D5',
    backgroundColor: '#FFF6EF',
    marginTop: 5,
  },
  quoteBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
    lowestLabel: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '600',
  },
  priceText: {
    color: '#F0893B',
    fontSize: 26, 
    fontWeight: '700',
    textAlign: 'center', 
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 13,
    color: '#323232',
  },
  
  receivedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receivedIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  receivedLabel: {
    fontSize: 13,
    color: '#707070',
    marginBottom: 2,
  },
  receivedCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  cardContainer: {
    width: 700,
    height: 260,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D8D8D8',
  },
  tagText: {
    color: '#9F9F9F',
    fontSize: 11,
  },

  // 취소됨 상태 전용
  rightTextContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 15,
  },
  cancelledText: {
    color: '#606060',
    fontSize: 13,
  },
  movingInfoContainer: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  movingText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  movingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  movingRating: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#EAEAEA',
    marginHorizontal: 2,
  },
  movingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F0893B',
  },
  confirmedProfileCircle: {
      flex: 1,
      width: '100%',
      height: '100%',
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
  },
  confirmedProfileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 2
  },
  confirmedProfileText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#777',
  },
  
  // Mobile Styles
  mobileCardContainer: {
    width: '100%',
    height: 'auto',
    flexDirection: 'column',
  },
  mobileLeftSection: {
    width: '100%',
    padding: 20,
  },
  mobileRightSection: {
    width: '100%',
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#D8D8D8',
    padding: 20,
  },

});
