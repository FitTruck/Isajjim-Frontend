import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface EstimateCardProps {
  status: 'active' | 'moving' | 'cancelled'; // active=견적 받는 중, moving=이사 진행 중
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

export default function EstimateCard({ status, date, locations, quoteInfo, timelineStep = 2 }: EstimateCardProps) {
  
  const isCancelled = status === 'cancelled';
  const isMoving = status === 'moving';

  // 상태 배지
  const renderStatusBadge = () => {
    if (isCancelled) {
      return (
        <View style={[styles.statusBadge, { borderColor: '#BDBDBD' }]}>
          <Text style={[styles.statusBadgeText, { color: '#ADADAD' }]}>취소된 이사</Text>
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
    return (
      <View style={[styles.statusBadge, { borderColor: '#EA6500' }]}>
        <Text style={[styles.statusBadgeText, { color: '#EA6500' }]}>견적 받는 중</Text>
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

    const currentStep = timelineStep ?? (isMoving ? 3 : 2);

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
    <View style={styles.cardContainer}>
      {/* 왼쪽 섹션 (이사 정보) */}
      <View style={styles.leftSection}>
        {/* 헤더: 상태 배지 & 등록일 */}
        <View style={styles.headerRow}>
            <View>{renderStatusBadge()}</View>
            <Text style={styles.regDateText}>2026.01.29 등록</Text>
        </View>

        {/* 날짜 행 */}
        <View style={styles.dateRow}>
          <Text style={styles.mainDateText}>{date}</Text>
          <Text style={styles.subDateText}>이사 예정</Text>
        </View>

        {/* 위치 정보 */}
        <View style={styles.locationRow}>
            <Image source={require('../../../assets/mapsflag.png')} style={styles.mapIcon} resizeMode="contain" />
            <Text style={styles.locationText}>{locations.start}</Text>
            <Image source={require('../../../assets/arrow.png')} style={styles.arrowIcon} resizeMode="contain" />
            <Text style={styles.locationText}>{locations.end}</Text>
        </View>

        {/* 타임라인 */}
        <View style={styles.timelineWrapper}>
          {renderTimeline()}
        </View>

        {/* 버튼들 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.requestButton}>
            <Image source={require('../../../assets/docs.png')} style={styles.btnIcon} resizeMode="contain" />
            <Text style={styles.requestButtonText}>내 요청사항</Text>
          </TouchableOpacity>

          {!isMoving && !isCancelled && (
            <TouchableOpacity style={styles.stopButton}>
              <Image source={require('../../../assets/stop.png')} style={styles.btnIcon} resizeMode="contain" />
              <Text style={styles.stopButtonText}>견적 그만 받기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 오른쪽 섹션 (견적 정보) */}
      <View style={[styles.rightSection, isCancelled && { backgroundColor: '#F4F4F4' }]}>
          {isCancelled ? (
              <View style={styles.cancelledContent}>
                  <Text style={styles.cancelledText}>상담이 취소된 내역입니다.</Text>
              </View>
          ) : quoteInfo ? (
              <>
                  {/* 받은 견적서 개수 헤더 */}
                  <View style={styles.receivedInfo}>
                         <View style={styles.receivedIcon}>
                            <Image source={require('../../../assets/chat.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
                         </View>
                         <View style={{marginLeft: 14}}>
                            <Text style={styles.receivedLabel}>받은 견적서</Text>
                            <Text style={styles.receivedCount}>{quoteInfo.companyCount}개 업체</Text>
                         </View>
                  </View>

                  {/* 태그들 (견적 박스 위로 이동) */}
                  <View style={styles.tagsRow}>
                    {quoteInfo.tags.map((tag, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 최저가 / 가격 표시 */}
                  <View style={styles.quoteBox}>
                      <View style={styles.quoteBoxHeader}>
                        {quoteInfo.isLowest ? (
                            <Text style={styles.lowestLabel}>최저가 업체</Text>
                        ) : <View />}
                        
                        <View style={styles.ratingRow}>
                          <Image source={require('../../../assets/star.png')} style={{ width: 14, height: 14 }} resizeMode="contain" />
                          <Text style={styles.ratingText}>{quoteInfo.rating}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.priceText}>{quoteInfo.price}</Text> 
                  </View>
              </>
          ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 900,
    height: 280,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 20,
  },
  leftSection: {
    flex: 1,
    padding: 24,
    position: 'relative',
  },
  rightSection: {
    width: 350,
    borderLeftWidth: 1,
    borderLeftColor: '#D9D9D9',
    padding: 28,
    justifyContent: 'center',
  },
  
  // Header & Date
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 13,
    color: '#B2B2B2',
    marginLeft: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  mainDateText: {
    fontSize: 22,
    fontWeight: '700',
    color: 'black',
    marginRight: 8,
    lineHeight: 26,
  },
  subDateText: {
    fontSize: 14,
    color: '#B2B2B2',
    marginBottom: 2,
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, 
    justifyContent: 'flex-start',
  },
  mapIcon: {
    width: 14, 
    height: 14,
    marginRight: 8,
    opacity: 0.5,
  },
  locationText: {
    fontSize: 16,
    color: '#3D3D3A',
  },
  arrowIcon: {
    width: 10,
    height: 10,
    marginHorizontal: 12,
    opacity: 0.5,
  },
  // Timeline
  timelineWrapper: {
    marginBottom: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '500',
  },
  stopButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'flex-end', // Right align tags
    marginBottom: 8,
  },
  quoteBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0D5',
    backgroundColor: '#FFF6EF',
    marginTop: 'auto', 
    height: 100,
    justifyContent: 'space-between',
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
    color: 'black',
    fontSize: 15,
    fontWeight: '600',
  },
  priceText: {
    color: '#EA6500',
    fontSize: 26, 
    fontWeight: '700',
    textAlign: 'center', 
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 13,
    color: '#323232',
  },
  
  // Received Info
  receivedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    color: 'black',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  tagText: {
    color: '#9F9F9F',
    fontSize: 11,
  },

  // 취소됨 상태 전용
  cancelledContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  cancelledText: {
    color: '#606060',
    fontSize: 13,
  },

});
