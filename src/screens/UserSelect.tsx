import React, { useState } from 'react'; // 상태를 저장하게 해줌
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Modal, ActivityIndicator } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { BACKEND_DOMAIN } from '../utils/Server';
import FloorDetail from '../components/FloorDetail';
import RoomSizeDetail from '../components/RoomSizeDetail';
import LoadingModal from '../components/LoadingModal';
import Header from '../components/Header';
import DetailSelectBtn from '../components/DetailSelectBtn';

// app.tsx로부터 전달받을 함수의 자료형 정의
interface UserSelectProps {
  estimatedId: number | null;
  onNavigateNext: (data: any) => void;
  onGoHome: () => void;
}

export default function UserSelect({ estimatedId, onNavigateNext, onGoHome }: UserSelectProps) {
  const [buildingType, setBuildingType] = useState<string | null>(null);
  const [roomSize, setRoomSize] = useState<string | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const [elevator, setElevator] = useState<boolean | null>(null);
  const [ladderTruck, setLadderTruck] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<string | null>(null);
  const [duplex, setDuplex] = useState<boolean | null>(null);
  const [groundStair, setGroundStair] = useState<boolean | null>(null);
  const [parking, setParking] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


  // 백엔드 ENUM 값으로 매핑하는 함수
  const mapToBackendValue = () => {
    return {
      buildingType: buildingType,
      roomSize: roomSize,
      floor: floor,
      elevator: elevator,
      ladderTruck: ladderTruck,
      roomType: roomType,
      duplex: duplex,
      groundStair: groundStair, 
      parking: parking,
    };
  };

  const handlePressNext = async () => {
    // 유효성 검사: 하나라도 null이면 경고
    if (
      !buildingType || 
      !roomSize || 
      !floor || 
      !roomType || 
      !ladderTruck ||
      elevator === null ||
      duplex === null ||
      groundStair === null ||
      parking === null
    ) {
      const msg = "모든 항목을 선택해주세요.";
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else { // 앱인 경우인데, 일단 남겨둠
        Alert.alert("알림", msg);
      }
      return;
    }

    // 로딩 모달
    setIsSubmitting(true);

    try {
      const BACKEND_URL = `${BACKEND_DOMAIN}/api/v1/estimates/${estimatedId}`;
      const payload = mapToBackendValue();

      // PATCH 요청 보내기
      const response = await fetch(BACKEND_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("초기 수정 요청 실패");
      }

      // SSE 연결
      const SSE_URL = `${BACKEND_DOMAIN}/api/v1/estimates/${estimatedId}/sse`;
      const eventSource = new EventSource(SSE_URL);

      eventSource.addEventListener("sse", async (event) => {
        console.log("받은 SSE 데이터:", event.data); // "COMPLETED" 확인용
        // 서버에서 완료 신호를 보내주는 경우에 다음 화면으로
        if (event.data === "COMPLETED") {
          const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          const ResultOfUserSelect = await response.json();

          onNavigateNext(ResultOfUserSelect);
          eventSource.close(); // 연결 종료
          setIsSubmitting(false);
        }
      });

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        Alert.alert("오류", "실시간 연결 중 문제가 발생했습니다.");
        setIsSubmitting(false);
      };
    } catch (error) {
      console.error("Process Error:", error);
      Alert.alert("오류", "업로드 중 문제가 발생했습니다.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={commonStyles.container}>
      {/* 로딩 모달 */}
      <LoadingModal visible={isSubmitting} />

      {/* 헤더 */}
      <Header onGoHome={onGoHome} />

      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <View style={commonStyles.mainWrapper}>

          {/* 메인 섹션 */}
          <View style={commonStyles.mainSection}>
            <View style={commonStyles.mainContent}>
              <Text style={commonStyles.mainTitle}>필수 기재 사항</Text>
              <Text style={commonStyles.mainSubtitle}>정확한 견적을 위해 필요한 사항입니다</Text>
            </View>
          </View>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 선택 섹션 컨테이너 */}
          <View style={styles.selectSectionContainer}>
            
            {/* Row 1: 건물 종류 & 방 구조 */}
            <View style={[styles.selectSectionRow, {height: 324}]}>
              {/* 건물 종류 */}
              <View style={{ width: 477, height: 324 }}>
                <Text style={styles.sectionTitle}>건물종류</Text>
                <View style={{ 
                  position: 'absolute', 
                  top: 43, left: 0, 
                  width: 476, height: 281, 
                  backgroundColor: '#EBEBEB' }}>
                  <DetailSelectBtn
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="빌라/연립" 
                    value="VILLA" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} // onSelect라는 것은 setBuildingType을 실행하는 것.
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="오피스텔" 
                    value="OFFICETEL" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                  <DetailSelectBtn 
                    x={0} 
                    y={94} 
                    width={238} 
                    height={94} 
                    label="주택" 
                    value="HOUSE" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={94} 
                    width={238} 
                    height={94} 
                    label="아파트" 
                    value="APARTMENT" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                  <DetailSelectBtn 
                    x={0} 
                    y={187} 
                    width={238} 
                    height={94} 
                    label="상가/ 사무실" 
                    value="COMMERCIAL" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                </View>
              </View>

              {/* 방 구조 */}
              <View style={{ width: 477, height: 324 }}>
                <Text style={styles.sectionTitle}>방 구조</Text>
                <View style={{ position: 'absolute', top: 43, left: 0 }}>
                  <DetailSelectBtn 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="원룸" 
                    value="STUDIO" 
                    selectedValue={roomType} 
                    onSelect={setRoomType} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="1.5룸" 
                    value="ONE_AND_HALF" 
                    selectedValue={roomType} 
                    onSelect={setRoomType} 
                  />
                  <DetailSelectBtn 
                    x={0} 
                    y={93} 
                    width={238} 
                    height={94} 
                    label="2룸" 
                    value="TWO_ROOM" 
                    selectedValue={roomType} 
                    onSelect={setRoomType} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={93} 
                    width={238} 
                    height={94} 
                    label="3룸" 
                    value="THREE_ROOM" 
                    selectedValue={roomType} 
                    onSelect={setRoomType} 
                  />
                  <DetailSelectBtn 
                    x={0} 
                    y={186} 
                    width={238} 
                    height={94} 
                    label="4룸" 
                    value="FOUR_ROOM" 
                    selectedValue={roomType} 
                    onSelect={setRoomType} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={186} 
                    width={238} 
                    height={94} 
                    label="5룸 이상" 
                    value="FIVE_PLUS" 
                    selectedValue={roomType} 
                    onSelect={setRoomType} 
                  />
                </View>
              </View>
            </View>

            {/* Row 2: 집 평수 & 복층 */}
            <View style={[styles.selectSectionRow, {height: 150}]}>
              {/* 집 평수 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>집 평수</Text>
                <RoomSizeDetail value={roomSize} onSelect={setRoomSize} />
              </View>

              {/* 복층 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>복층</Text>
                <View style={{ position: 'absolute', top: 43, left: 0 }}>
                  <DetailSelectBtn 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="있음" 
                    value={true} 
                    selectedValue={duplex} 
                    onSelect={setDuplex} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="없음" 
                    value={false} 
                    selectedValue={duplex} 
                    onSelect={setDuplex} 
                  />
                </View>
              </View>
            </View>

            {/* Row 3: 층 & 1층 별도 계단 */}
            <View style={[styles.selectSectionRow, {height: 150}]}>
              {/* 층 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>층</Text>
                <FloorDetail value={floor} onSelect={setFloor} />
              </View>

              {/* 1층 별도 계단 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>1층 별도 계단</Text>
                <View style={{ 
                  position: 'absolute', 
                  top: 43, 
                  left: 0 
                }}>
                  <DetailSelectBtn 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="있음" 
                    value={true} 
                    selectedValue={groundStair} 
                    onSelect={setGroundStair} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="없음" 
                    value={false} 
                    selectedValue={groundStair} 
                    onSelect={setGroundStair} 
                  />
                </View>
              </View>
            </View>

            {/* Row 4: 엘리베이터 & 주차 공간 */}
            <View style={[styles.selectSectionRow, {height: 150}]}>
              {/* 엘리베이터 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>엘리베이터</Text>
                <View style={{ 
                  position: 'absolute', 
                  top: 43, 
                  left: 0 
                }}>
                  <DetailSelectBtn 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="있음" 
                    value={true} 
                    selectedValue={elevator} 
                    onSelect={setElevator} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="없음" 
                    value={false} 
                    selectedValue={elevator} 
                    onSelect={setElevator} 
                  />
                </View>
              </View>

              {/* 주차 공간 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>주차 공간</Text>
                <View style={{ 
                  position: 'absolute', 
                  top: 43, left: 0 
                }}>
                  <DetailSelectBtn 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="있음" 
                    value={true} 
                    selectedValue={parking} 
                    onSelect={setParking} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="없음" 
                    value={false} 
                    selectedValue={parking} 
                    onSelect={setParking} 
                  />
                </View>
              </View>
            </View>

            {/* Row 5: 사다리차 */}
            <View style={[styles.selectSectionRow, {height: 230}]}>
              <View style={{ width: 477, height: 230 }}>
                <Text style={styles.sectionTitle}>사다리차</Text>
                <View style={{ 
                  position: 'absolute', 
                  top: 43, left: 0, 
                  width: 476, height: 187, 
                  backgroundColor: '#EBEBEB' 
                }}>
                  <DetailSelectBtn 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="필요" 
                    value="REQUIRED" 
                    selectedValue={ladderTruck} 
                    onSelect={setLadderTruck} 
                  />
                  <DetailSelectBtn 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="필요없음" 
                    value="NOT_REQUIRED" 
                    selectedValue={ladderTruck} 
                    onSelect={setLadderTruck} 
                  />
                  <DetailSelectBtn 
                    x={0} 
                    y={93} 
                    width={238} 
                    height={94} 
                    label="확인 필요" 
                    value="NEED_CONFIRM" 
                    selectedValue={ladderTruck} 
                    onSelect={setLadderTruck} 
                  />
                </View>
              </View>
            </View>

            {/* 다음 단계 버튼 */}
            <View style={{ width: '60%', alignItems: 'flex-end', marginTop: 40 }}>
              <TouchableOpacity 
                style={{
                  width: 124, 
                  height: 62, 
                  backgroundColor: isSubmitting ? '#666' : '#F0893B', 
                  borderRadius: 8,
                  justifyContent: 'center', 
                  alignItems: 'center',
                  opacity: isSubmitting ? 0.7 : 1
                }}
                onPress={handlePressNext}
                disabled={isSubmitting}
              >
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: '500' }}>
                    {isSubmitting ? '저장 중...' : '다음단계'}
                  </Text>
              </TouchableOpacity>
            </View>
          </View>


          {/* footer */}
          <View style={commonStyles.footer}>
            <View style={commonStyles.footerLine} />
            <Text style={commonStyles.footerLogo}>Site name</Text>

            <View style={commonStyles.footerLinksRow}>
              <View style={commonStyles.footerColumn}>
                <Text style={commonStyles.footerTopic}>Topic</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
              </View>
              <View style={commonStyles.footerColumn}>
                <Text style={commonStyles.footerTopic}>Topic</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
              </View>
              <View style={commonStyles.footerColumn}>
                <Text style={commonStyles.footerTopic}>Topic</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
              </View>
            </View>

            <View style={commonStyles.socialIcons}>
              {[1, 2, 3, 4].map((i: number) => (
                <View key={i} style={commonStyles.socialIconPlaceholder} />
              ))}
            </View>
          </View>

        </View>
      </ScrollView>

    </View>
    
  );
}

const styles = StyleSheet.create({
  divider: {
    position: 'absolute', 
    left: 0, 
    right: 0, 
    top: 453, 
    height: 26, 
    backgroundColor: '#F7F7F7'
  },

  selectSectionContainer: {
    marginTop: 150,
    width: '100%', 
    alignItems: 'center',
    paddingBottom: 100 // 하단 여백 추가
  },
  selectSectionRow: {
    width: '60%', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 65
  },

  // 공통 카드 스타일
  sectionTitle: {
    fontSize: 25, 
    fontWeight: '700', 
    color: 'black', 
    marginBottom: 10
  },


  // 사용자 지정 입력 박스 스타일
  customInputBox: {
    width: 476, 
    height: 86,
    backgroundColor: 'white',
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 8,
    position: 'absolute',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingLeft: 30, 
    paddingRight: 10
  },
  customInputValue: {
    fontSize: 25, 
    fontWeight: '500', 
    color: '#AFAFAF'
  },
  selectButtonInline: {
    backgroundColor: '#F0893B', 
    borderRadius: 8, 
    paddingHorizontal: 32, 
    paddingVertical: 14
  },
  selectButtonInlineText: {
    fontWeight: '500'
  }
});