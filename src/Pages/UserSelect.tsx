import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import NextBtn, { NextBtn2Handle } from '../components/UserSelectPage/NextBtn2';
import AlertBox from '../components/common/AlertBox';
import Dropdown from '../components/UserSelectPage/Dropdown';
import AddressInput from '../components/UserSelectPage/AddressInput';
import MobileDatePicker from '../components/UserSelectPage/MobileDatePicker';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'UserSelect'>;

export default function UserSelect({ route }: Props) {
  const { images, estimateId } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const nextBtn2Ref = useRef<NextBtn2Handle>(null);
  const scrollRef = useRef<ScrollView>(null);

  const [mobileStep, setMobileStep] = useState<'departure' | 'arrival' | 'date'>('departure');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const handleToggle = (id: string) => setActiveDropdown(prev => prev === id ? null : id);

  const [movingDate, setMovingDate] = useState<string | null>(null);

  // 출발지
  const [adress1, setAdress1] = useState<string | null>(null);
  const [detailAddress1, setDetailAddress1] = useState<string | null>(null);
  const [buildingType1, setBuildingType1] = useState<string | null>(null);
  const [roomSize1, setRoomSize1] = useState<string | null>(null);
  const [floor1, setFloor1] = useState<string | null>(null);
  const [elevator1, setElevator1] = useState<boolean | null>(null);
  const [ladderTruck1, setLadderTruck1] = useState<string | null>(null);
  const [roomType1, setRoomType1] = useState<string | null>(null);
  const [duplex1, setDuplex1] = useState<boolean | null>(null);
  const [groundStair1, setGroundStair1] = useState<boolean | null>(null);
  const [parking1, setParking1] = useState<boolean | null>(null);

  // 도착지
  const [adress2, setAdress2] = useState<string | null>(null);
  const [detailAddress2, setDetailAddress2] = useState<string | null>(null);
  const [buildingType2, setBuildingType2] = useState<string | null>(null);
  const [roomSize2, setRoomSize2] = useState<string | null>(null);
  const [floor2, setFloor2] = useState<string | null>(null);
  const [elevator2, setElevator2] = useState<boolean | null>(null);
  const [ladderTruck2, setLadderTruck2] = useState<string | null>(null);
  const [roomType2, setRoomType2] = useState<string | null>(null);
  const [duplex2, setDuplex2] = useState<boolean | null>(null);
  const [groundStair2, setGroundStair2] = useState<boolean | null>(null);
  const [parking2, setParking2] = useState<boolean | null>(null);

  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const buildingTypeOptions = [
    { label: '빌라/연립', value: 'VILLA' },
    { label: '오피스텔', value: 'OFFICETEL' },
    { label: '주택', value: 'HOUSE' },
    { label: '아파트', value: 'APARTMENT' },
    { label: '상가/ 사무실', value: 'COMMERCIAL' },
  ];
  const roomSizeOptions = [
    { label: '10평 이하', value: 'UNDER_10' },
    { label: '10~15평', value: 'BETWEEN_10_15' },
    { label: '15~20평', value: 'BETWEEN_15_20' },
    { label: '20~25평', value: 'BETWEEN_20_25' },
    { label: '25~30평', value: 'BETWEEN_25_30' },
    { label: '30~40평', value: 'BETWEEN_30_40' },
    { label: '40~50평', value: 'BETWEEN_40_50' },
    { label: '50평 이상', value: 'OVER_50' },
  ];
  const floorOptions = [
    { label: '반지하', value: 'SEMI_BASEMENT' },
    ...Array.from({ length: 29 }, (_, i) => ({ label: `${i + 1}층`, value: `FL_${i + 1}` })),
    { label: '30층 이상', value: 'FL_30_OR_MORE' },
  ];
  const elevatorOptions = [{ label: '있음', value: true }, { label: '없음', value: false }];
  const ladderTruckOptions = [
    { label: '필요', value: 'REQUIRED' },
    { label: '필요없음', value: 'NOT_REQUIRED' },
    { label: '확인 필요', value: 'NEED_CONFIRM' },
  ];
  const roomTypeOptions = [
    { label: '원룸', value: 'STUDIO' },
    { label: '1.5룸', value: 'ONE_AND_HALF' },
    { label: '2룸', value: 'TWO_ROOM' },
    { label: '3룸', value: 'THREE_ROOM' },
    { label: '4룸', value: 'FOUR_ROOM' },
    { label: '5룸 이상', value: 'FIVE_PLUS' },
  ];
  const duplexOptions = [{ label: '있음', value: true }, { label: '없음', value: false }];
  const groundStairOptions = [{ label: '있음', value: true }, { label: '없음', value: false }];
  const parkingOptions = [{ label: '있음', value: true }, { label: '없음', value: false }];

  const nextBtnProps = {
    estimateId, images, onShowAlert: () => setIsAlertVisible(true),
    movingDate,
    data1: { address: adress1, detailAddress: detailAddress1, buildingType: buildingType1, roomSize: roomSize1, floor: floor1, elevator: elevator1, ladderTruck: ladderTruck1, roomType: roomType1, duplex: duplex1, groundStair: groundStair1, parking: parking1 },
    data2: { address: adress2, detailAddress: detailAddress2, buildingType: buildingType2, roomSize: roomSize2, floor: floor2, elevator: elevator2, ladderTruck: ladderTruck2, roomType: roomType2, duplex: duplex2, groundStair: groundStair2, parking: parking2 },
  };

  const departureForm = (
    <>
      <AddressInput label="출발지 주소" value={adress1} detailValue={detailAddress1} onSelect={setAdress1} onChangeDetail={setDetailAddress1} />
      <Dropdown label="건물 유형" value={buildingType1} options={buildingTypeOptions} onSelect={setBuildingType1} isOpen={activeDropdown === 'buildingType1'} onToggle={() => handleToggle('buildingType1')} />
      <Dropdown label="층수" value={floor1} options={floorOptions} onSelect={setFloor1} isOpen={activeDropdown === 'floor1'} onToggle={() => handleToggle('floor1')} />
      <Dropdown label="평수" value={roomSize1} options={roomSizeOptions} onSelect={setRoomSize1} isOpen={activeDropdown === 'roomSize1'} onToggle={() => handleToggle('roomSize1')} />
      <Dropdown label="방 구조" value={roomType1} options={roomTypeOptions} onSelect={setRoomType1} isOpen={activeDropdown === 'roomType1'} onToggle={() => handleToggle('roomType1')} />
      <Dropdown label="주차 공간" value={parking1} options={parkingOptions} onSelect={setParking1} isOpen={activeDropdown === 'parking1'} onToggle={() => handleToggle('parking1')} />
      <Dropdown label="엘리베이터" value={elevator1} options={elevatorOptions} onSelect={setElevator1} isOpen={activeDropdown === 'elevator1'} onToggle={() => handleToggle('elevator1')} />
      <Dropdown label="사다리차 사용" value={ladderTruck1} options={ladderTruckOptions} onSelect={setLadderTruck1} isOpen={activeDropdown === 'ladderTruck1'} onToggle={() => handleToggle('ladderTruck1')} />
      <Dropdown label="복층 여부" value={duplex1} options={duplexOptions} onSelect={setDuplex1} isOpen={activeDropdown === 'duplex1'} onToggle={() => handleToggle('duplex1')} />
      <Dropdown label="1층 별도 계단" value={groundStair1} options={groundStairOptions} onSelect={setGroundStair1} isOpen={activeDropdown === 'groundStair1'} onToggle={() => handleToggle('groundStair1')} />
    </>
  );

  const arrivalForm = (
    <>
      <AddressInput label="도착지 주소" value={adress2} detailValue={detailAddress2} onSelect={setAdress2} onChangeDetail={setDetailAddress2} />
      <Dropdown label="건물 유형" value={buildingType2} options={buildingTypeOptions} onSelect={setBuildingType2} isOpen={activeDropdown === 'buildingType2'} onToggle={() => handleToggle('buildingType2')} />
      <Dropdown label="층수" value={floor2} options={floorOptions} onSelect={setFloor2} isOpen={activeDropdown === 'floor2'} onToggle={() => handleToggle('floor2')} />
      <Dropdown label="평수" value={roomSize2} options={roomSizeOptions} onSelect={setRoomSize2} isOpen={activeDropdown === 'roomSize2'} onToggle={() => handleToggle('roomSize2')} />
      <Dropdown label="방 구조" value={roomType2} options={roomTypeOptions} onSelect={setRoomType2} isOpen={activeDropdown === 'roomType2'} onToggle={() => handleToggle('roomType2')} />
      <Dropdown label="주차 공간" value={parking2} options={parkingOptions} onSelect={setParking2} isOpen={activeDropdown === 'parking2'} onToggle={() => handleToggle('parking2')} />
      <Dropdown label="엘리베이터" value={elevator2} options={elevatorOptions} onSelect={setElevator2} isOpen={activeDropdown === 'elevator2'} onToggle={() => handleToggle('elevator2')} />
      <Dropdown label="사다리차 사용" value={ladderTruck2} options={ladderTruckOptions} onSelect={setLadderTruck2} isOpen={activeDropdown === 'ladderTruck2'} onToggle={() => handleToggle('ladderTruck2')} />
      <Dropdown label="복층 여부" value={duplex2} options={duplexOptions} onSelect={setDuplex2} isOpen={activeDropdown === 'duplex2'} onToggle={() => handleToggle('duplex2')} />
      <Dropdown label="1층 별도 계단" value={groundStair2} options={groundStairOptions} onSelect={setGroundStair2} isOpen={activeDropdown === 'groundStair2'} onToggle={() => handleToggle('groundStair2')} />
    </>
  );

  const isDeparture = mobileStep === 'departure';
  const isArrival = mobileStep === 'arrival';
  const isDate = mobileStep === 'date';

  const isDepartureComplete =
    !!adress1 && !!buildingType1 && !!floor1 && !!roomSize1 && !!roomType1 &&
    parking1 !== null && elevator1 !== null && !!ladderTruck1 && duplex1 !== null && groundStair1 !== null;

  const isArrivalComplete =
    !!adress2 && !!buildingType2 && !!floor2 && !!roomSize2 && !!roomType2 &&
    parking2 !== null && elevator2 !== null && !!ladderTruck2 && duplex2 !== null && groundStair2 !== null;

  const isStepComplete = isDeparture ? isDepartureComplete : isArrival ? isArrivalComplete : !!movingDate;
  const progress = isDeparture ? '50%' : isArrival ? '75%' : '100%';
  const title = isDeparture ? '출발지' : isArrival ? '도착지' : '이사 희망 날짜';
  const subtitle = isDate
    ? '손없는날을 피하면 저렴하게 이용할 수 있어요.'
    : '정확한 이사를 위해 정보를 입력해주세요.';

  const handleBack = () => {
    if (isDeparture) navigation.goBack();
    else if (isArrival) setMobileStep('departure');
    else setMobileStep('arrival');
  };

  const handleNext = () => {
    if (isDeparture) {
      setMobileStep('arrival');
      setActiveDropdown(null);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else if (isArrival) {
      setMobileStep('date');
      setActiveDropdown(null);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      nextBtn2Ref.current?.submit();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <ChevronLeft size={20} color="#423E3E" />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progress }]} />
        </View>
      </View>

      {/* 제목 */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.pageSubtitle}>{subtitle}</Text>
      </View>

      {/* 폼 */}
      <ScrollView
        ref={scrollRef}
        style={styles.formScroll}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        {isDeparture ? departureForm : isArrival ? arrivalForm : (
          <MobileDatePicker value={movingDate} onSelect={setMovingDate} />
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          style={[styles.nextButton, !isStepComplete && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextButtonText, !isStepComplete && styles.nextButtonDisabledText]}>다음으로</Text>
        </TouchableOpacity>
      </View>

      {/* NextBtn2 숨김 렌더링 (LoadingModal + SSE 로직 보유) */}
      <View style={{ height: 0, overflow: 'hidden' }}>
        <NextBtn ref={nextBtn2Ref} {...nextBtnProps} />
      </View>

      {isAlertVisible && (
        <AlertBox value="모든 항목을 선택해주세요." onClose={() => setIsAlertVisible(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 10,
  },
  backButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F36845',
    borderRadius: 8,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#423E3E',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#949494',
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 24,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  nextButton: {
    height: 48,
    backgroundColor: '#F36845',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  nextButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  nextButtonDisabledText: {
    color: '#949494',
  },
});
