import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert, Platform } from 'react-native';
import { BACKEND_DOMAIN } from '../../utils/Server';
import LoadingModal from './LoadingModal';
import { useEstimate } from '../../context/EstimateContext';
import { MOCK_REQUEST_DATA } from '../../constants/mockData';

interface Props {
  navigation: any;
  estimateId: number;
  images: any;
  onShowAlert: () => void;
  movingDate: string | null;
  data1: {
    address: string | null;
    detailAddress: string | null;
    buildingType: string | null;
    roomSize: string | null;
    floor: string | null;
    elevator: boolean | null;
    ladderTruck: string | null;
    roomType: string | null;
    duplex: boolean | null;
    groundStair: boolean | null;
    parking: boolean | null;
  };
  data2: {
    address: string | null;
    detailAddress: string | null;
    buildingType: string | null;
    roomSize: string | null;
    floor: string | null;
    elevator: boolean | null;
    ladderTruck: string | null;
    roomType: string | null;
    duplex: boolean | null;
    groundStair: boolean | null;
    parking: boolean | null;
  };
}

export default function NextBtn2({ navigation, estimateId, images, onShowAlert, movingDate, data1, data2 }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setRequestData } = useEstimate();

  const mapToBackendValue = (data: any) => {
    return {
      "address": data.address,
      "detailAddress": data.detailAddress || " ",
      "buildingType": data.buildingType,
      "roomSize": data.roomSize,
      "floor": data.floor,
      "elevator": data.elevator,
      "ladderTruck": data.ladderTruck,
      "roomType": data.roomType,
      "duplex": data.duplex,
      "groundStair": data.groundStair, 
      "parking": data.parking,
    };
  };

  const validateData = (data: any) => {
    return Object.values(data).every(value => value !== null && value !== "");
  };

  const handlePressNext = async () => {
    // 상세주소가 비어 있을 수도 있어서 값 변환을 먼저 함.
    const startLocation = mapToBackendValue(data1);
    const endLocation = mapToBackendValue(data2);

    // 모든 값이 비어있는지 확인 (테스트용 목데이터 적용을 위함)
    const isAllEmpty = !movingDate && 
      // 모든 값이 null이거나 ""인 경우 true 반환
      Object.values(startLocation).every(v => v === null || v === "") && 
      Object.values(endLocation).every(v => v === null || v === "");

    if (isAllEmpty) {
      // 목데이터 적용 (constants/mockData.ts에서 가져옴)
      setRequestData(MOCK_REQUEST_DATA);

      // 가짜 결과 데이터 생성 (MOCK_REQUEST_DATA 기반)
      const mockResultOfUserSelect = {
        data: {
          items: [
            // 트럭 정보 매핑
            { 
              category: "TRUCK", 
              itemType: MOCK_REQUEST_DATA.truckInfo ? MOCK_REQUEST_DATA.truckInfo.type : "5톤", 
              quantity: MOCK_REQUEST_DATA.truckInfo ? MOCK_REQUEST_DATA.truckInfo.quantity : 1 
            }
          ],
          images: images // 기존 이미지 데이터 사용
        }
      };

      navigation.navigate('Result', {
        data: images,
        estimateId: estimateId,
        ResultOfUserSelect: mockResultOfUserSelect
      });
      return;
    }

    if (!validateData(startLocation) || !validateData(endLocation) || !movingDate) {
      const msg = "모든 항목을 선택해주세요.";
      if (Platform.OS === 'web') {
        onShowAlert();
      } else { 
        Alert.alert("알림", msg);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const BACKEND_URL = `${BACKEND_DOMAIN}/api/v1/estimates/${estimateId}`;
      
      const payload = {
        "date": movingDate,
        "startLocation": startLocation,
        "endLocation": endLocation
      };

      console.log("payload", payload);

      const response = await fetch(BACKEND_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("초기 수정 요청 실패");
      }

      const SSE_URL = `${BACKEND_DOMAIN}/api/v1/estimates/${estimateId}/sse`;
      const eventSource = new EventSource(SSE_URL);

      eventSource.addEventListener("sse", async (event) => {
        console.log("받은 SSE 데이터:", event.data);
        if (event.data === "COMPLETED") {
          const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          const ResultOfUserSelect = await response.json();

          // Context에 데이터 저장
          const truckItem = ResultOfUserSelect.data.items?.find((item: any) => item.category === "TRUCK");
          
          setRequestData({
            estimateId: estimateId,
            movingDate: movingDate,
            startLocation: startLocation,
            endLocation: endLocation,
            items: [], // Result 페이지에서 다시 로드하거나 여기서 items 정보가 있다면 추가
            truckInfo: truckItem ? { type: truckItem.itemType, quantity: truckItem.quantity } : null,
          });

          navigation.navigate('Result', {
            data: images,
            estimateId: estimateId,
            ResultOfUserSelect: ResultOfUserSelect
          });
          eventSource.close();
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
    <View style={styles.nextBtnContainer}>
      <LoadingModal visible={isSubmitting} />
      <TouchableOpacity 
        style={[
          styles.nextBtn, 
          isSubmitting && styles.nextBtnDisabled
        ]}
        onPress={handlePressNext}
        disabled={isSubmitting}
      >
          <Text style={styles.nextBtnText}>
            {isSubmitting ? '저장 중...' : '다음단계'}
          </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nextBtnContainer: {
    width: '100%', 
    alignItems: 'flex-end',
    position: 'relative',
    right: 330,
    marginBottom: 250,
  },
  nextBtn: {
    width: 100, 
    height: 50, 
    backgroundColor: '#F0893B', 
    borderRadius: 7,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#666',
    opacity: 0.7
  },
  nextBtnText: {
    color: 'white', 
    fontSize: 18, 
    fontWeight: 400
  }
});
