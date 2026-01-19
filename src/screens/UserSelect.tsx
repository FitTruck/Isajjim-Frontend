import React, { useState } from 'react'; // 상태를 저장하게 해줌
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { commonStyles } from '../styles/commonStyles';

// 원래 HTML 스타일을 나타내는 절대 위치 버튼을 위한 도우미 컴포넌트
const AbsoluteButton = ({ 
  x, y, width, height, label, value, selectedValue, onSelect 
}: { // 타입정의(타입스크립트)
  x: number, y: number, width: number, height: number, label: string, 
  value: string, selectedValue: string | null, onSelect: (v: string) => void 
}) => {
  const isSelected = selectedValue === value;
  return (
    <TouchableOpacity
      style={[
        styles.absoluteCard,
        { left: x, top: y, width, height },
        isSelected ? styles.cardSelected : styles.cardUnselected
      ]}
      onPress={() => onSelect(value)}
    >
      <Text style={[
        styles.cardText, 
        isSelected ? styles.textSelected : styles.textUnselected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function UserSelect() { // 변수들 정의
  const [buildingType, setBuildingType] = useState<string | null>(null);
  // [상태 변수, 변경 함수]
  // useState : 상태의 변경을 화면에 반영하게 함
  // <타입 | null>(초기값) : 가능한 타입 정의. 소괄호는 초기값 의미.
  const [roomStructure, setRoomStructure] = useState<string | null>(null);
  const [houseSize, setHouseSize] = useState<string | null>(null); 
  const [roomFloor, setRoomFloor] = useState<string | null>(null); 
  const [stairs, setStairs] = useState<string | null>(null);
  const [elevator, setElevator] = useState<string | null>(null);
  const [parking, setParking] = useState<string | null>(null);
  const [ladder, setLadder] = useState<string | null>(null);

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <View style={commonStyles.mainWrapper}>
          
          {/* 헤더 */}
          <View style={commonStyles.header}>
            <Text style={commonStyles.logoText}>이삿짐</Text>
            <View style={commonStyles.headerRight}>
              <TouchableOpacity>
                <Text style={commonStyles.mypageText}>Mypage</Text>
              </TouchableOpacity>
              <TouchableOpacity style={commonStyles.loginButton}>
                <Text style={commonStyles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

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
                  <AbsoluteButton
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="빌라/연립" 
                    value="빌라/연립" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="오피스텔" 
                    value="오피스텔" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                  <AbsoluteButton 
                    x={0} 
                    y={94} 
                    width={238} 
                    height={94} 
                    label="주택" 
                    value="주택" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={94} 
                    width={238} 
                    height={94} 
                    label="아파트" 
                    value="아파트" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                  <AbsoluteButton 
                    x={0} 
                    y={187} 
                    width={238} 
                    height={94} 
                    label="상가/ 사무실" 
                    value="상가/ 사무실" 
                    selectedValue={buildingType} 
                    onSelect={setBuildingType} 
                  />
                </View>
              </View>

              {/* 방 구조 */}
              <View style={{ width: 477, height: 324 }}>
                <Text style={styles.sectionTitle}>방 구조</Text>
                <View style={{ position: 'absolute', top: 43, left: 0 }}>
                  <AbsoluteButton 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="원룸" 
                    value="원룸" 
                    selectedValue={roomStructure} 
                    onSelect={setRoomStructure} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="1.5룸" 
                    value="1.5룸" 
                    selectedValue={roomStructure} 
                    onSelect={setRoomStructure} 
                  />
                  <AbsoluteButton 
                    x={0} 
                    y={93} 
                    width={238} 
                    height={94} 
                    label="2룸" 
                    value="2룸" 
                    selectedValue={roomStructure} 
                    onSelect={setRoomStructure} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={93} 
                    width={238} 
                    height={94} 
                    label="3룸" 
                    value="3룸" 
                    selectedValue={roomStructure} 
                    onSelect={setRoomStructure} 
                  />
                  <AbsoluteButton 
                    x={0} 
                    y={186} 
                    width={238} 
                    height={94} 
                    label="4룸" 
                    value="4룸" 
                    selectedValue={roomStructure} 
                    onSelect={setRoomStructure} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={186} 
                    width={238} 
                    height={94} 
                    label="5룸 이상" 
                    value="5룸 이상" 
                    selectedValue={roomStructure} 
                    onSelect={setRoomStructure} 
                  />
                </View>
              </View>
            </View>

            {/* Row 2: 집 평수 & 복층 */}
            <View style={[styles.selectSectionRow, {height: 150}]}>
              {/* 집 평수 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>집 평수</Text>
                <View style={[styles.customInputBox, { top: 48 }]}>
                  <Text style={styles.customInputValue}>{houseSize || '선택하세요'}</Text>
                  <TouchableOpacity style={styles.selectButtonInline}>
                    <Text style={styles.selectButtonInlineText}>선택</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 복층 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>복층</Text>
                <View style={{ position: 'absolute', top: 43, left: 0 }}>
                  <AbsoluteButton 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="있음" 
                    value="있음" 
                    selectedValue={roomFloor} 
                    onSelect={setRoomFloor} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="없음" 
                    value="없음" 
                    selectedValue={roomFloor} 
                    onSelect={setRoomFloor} 
                  />
                </View>
              </View>
            </View>

            {/* Row 3: 층 & 1층 별도 계단 */}
            <View style={[styles.selectSectionRow, {height: 150}]}>
              {/* 층 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>층</Text>
                <View style={[styles.customInputBox, { top: 48 }]}>
                  <Text style={styles.customInputValue}>{stairs || '선택하세요'}</Text> 
                  <TouchableOpacity style={styles.selectButtonInline}>
                    <Text style={styles.selectButtonInlineText}>선택</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 1층 별도 계단 */}
              <View style={{ width: 477, height: 150 }}>
                <Text style={styles.sectionTitle}>1층 별도 계단</Text>
                <View style={{ 
                  position: 'absolute', 
                  top: 43, 
                  left: 0 
                }}>
                  <AbsoluteButton 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="있음" 
                    value="있음" 
                    selectedValue={stairs} 
                    onSelect={setStairs} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="없음" 
                    value="없음" 
                    selectedValue={stairs} 
                    onSelect={setStairs} 
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
                  <AbsoluteButton 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="있음" 
                    value="있음" 
                    selectedValue={elevator} 
                    onSelect={setElevator} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="없음" 
                    value="없음" 
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
                  <AbsoluteButton 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="있음" 
                    value="있음" 
                    selectedValue={parking} 
                    onSelect={setParking} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="없음" 
                    value="없음" 
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
                  <AbsoluteButton 
                    x={0} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="필요" 
                    value="필요" 
                    selectedValue={ladder} 
                    onSelect={setLadder} 
                  />
                  <AbsoluteButton 
                    x={238} 
                    y={0} 
                    width={238} 
                    height={94} 
                    label="필요없음" 
                    value="필요없음" 
                    selectedValue={ladder} 
                    onSelect={setLadder} 
                  />
                  <AbsoluteButton 
                    x={0} 
                    y={93} 
                    width={238} 
                    height={94} 
                    label="확인 필요" 
                    value="확인 필요" 
                    selectedValue={ladder} 
                    onSelect={setLadder} 
                  />
                </View>
              </View>
            </View>

            {/* 다음 단계 버튼 */}
            <View style={{ width: '60%', alignItems: 'flex-end', marginTop: 40 }}>
              <TouchableOpacity style={{
                  width: 124, 
                  height: 62, 
                  backgroundColor: 'black', 
                  borderRadius: 8,
                  justifyContent: 'center', 
                  alignItems: 'center'
              }}>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: '500' }}>다음단계</Text>
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
  absoluteCard: {
    position: 'absolute',
    borderWidth: 1, 
    borderColor: '#AFAFAF',
    justifyContent: 'center', 
    alignItems: 'center'
  },
  cardSelected: {
    backgroundColor: 'black'
  },
  cardUnselected: {
    backgroundColor: 'white'
  },
  cardText: {
    fontSize: 22, 
    fontWeight: '500'
  },
  textSelected: { 
    color: 'white' 
  },
  textUnselected: { 
    color: 'black' 
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
    backgroundColor: 'black', 
    borderRadius: 8, 
    paddingHorizontal: 32, 
    paddingVertical: 14
  },
  selectButtonInlineText: {
    color: 'white', 
    fontSize: 20, 
    fontWeight: '500'
  }
});