import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert, Platform } from 'react-native';
import { BACKEND_DOMAIN } from '../../utils/Server';
import LoadingModal from './LoadingModal';

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

  const mapToBackendValue1 = (data: any) => {
    return {
      // 여기서 buildingType'1' 같이 안 쓴 이유는 위에 Props정의할 때, 숫자를 뺏기 때문임.
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

  const mapToBackendValue2 = (data: any) => {
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
    const startLocation = mapToBackendValue1(data1);
    const endLocation = mapToBackendValue2(data2);

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
