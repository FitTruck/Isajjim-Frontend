import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert, Platform } from 'react-native';
import { BACKEND_DOMAIN } from '../../utils/Server';
import LoadingModal from './LoadingModal';

interface Props {
  navigation: any;
  estimateId: number;
  images: any;
  onShowAlert: () => void;
  data: {
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

export default function NextBtn2({ navigation, estimateId, images, onShowAlert, data }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
      buildingType,
      roomSize,
      floor,
      elevator,
      ladderTruck,
      roomType,
      duplex,
      groundStair,
      parking
  } = data;

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
    // 유효성 검사
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
        onShowAlert();
      } else { 
        Alert.alert("알림", msg);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const BACKEND_URL = `${BACKEND_DOMAIN}/api/v1/estimates/${estimateId}`;
      const payload = mapToBackendValue();

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
    width: '60%', 
    alignItems: 'flex-end', 
    marginTop: 40
  },
  nextBtn: {
    width: 124, 
    height: 62, 
    backgroundColor: '#F0893B', 
    borderRadius: 8,
    justifyContent: 'center', 
    alignItems: 'center',
    // 그림자 추가 (선택사항)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextBtnDisabled: {
    backgroundColor: '#666',
    opacity: 0.7
  },
  nextBtnText: {
    color: 'white', 
    fontSize: 20, 
    fontWeight: '500'
  }
});
