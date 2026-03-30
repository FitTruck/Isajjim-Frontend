import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert, Platform } from 'react-native';
import { BACKEND_DOMAIN } from '../../utils/Server';
import api from '../../api/axiosInstance';
import LoadingModal from './LoadingModal';
import { useEstimate } from '../../context/EstimateContext';
import { translateLabel } from '../../utils/Translator';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

interface Props {
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

// 나중에 onShowAlert 쓸거임
export default function NextBtn2({ estimateId, images, onShowAlert, movingDate, data1, data2 }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
    let targetDate = movingDate;
    const startLocation = mapToBackendValue(data1);
    const endLocation = mapToBackendValue(data2);
    
    if (!validateData(startLocation) || !validateData(endLocation) || !targetDate) {
      // const msg = "모든 항목을 선택해주세요.";
      // if (Platform.OS === 'web') {
      //   onShowAlert();
      // } else { 
      //   Alert.alert("알림", msg);
      // }
      // return;
      targetDate = "2026-02-03";
      startLocation.address = "서울특별시 강남구 테헤란로 123";
      startLocation.detailAddress = "402호";
      startLocation.buildingType = "APARTMENT";
      startLocation.roomSize = "UNDER_10";
      startLocation.floor = "FL_4";
      startLocation.elevator = true;
      startLocation.ladderTruck = "REQUIRED";
      startLocation.roomType = "STUDIO";
      startLocation.duplex = false;
      startLocation.groundStair = false;
      startLocation.parking = true;
      endLocation.address = "서울특별시 종로구 창신동 123";
      endLocation.detailAddress = "402호";
      endLocation.buildingType = "APARTMENT";
      endLocation.roomSize = "UNDER_10";
      endLocation.floor = "FL_4";
      endLocation.elevator = true;
      endLocation.ladderTruck = "REQUIRED";
      endLocation.roomType = "STUDIO";
      endLocation.duplex = false;
      endLocation.groundStair = false;
      endLocation.parking = true;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        "date": targetDate,
        "startLocation": startLocation,
        "endLocation": endLocation
      };

      console.log("payload", payload);

      const patchResponse = await api.patch(`/api/v1/estimates/${estimateId}`, payload);
      console.log("받은 응답:", patchResponse);

      const SSE_URL = `${BACKEND_DOMAIN}/api/v1/estimates/${estimateId}/sse`;
      const eventSource = new EventSource(SSE_URL);

      // SSE이벤트 받게 되면 실행됨
      eventSource.addEventListener("sse", async (event) => {
        console.log("받은 SSE 데이터:", event.data);
        if (event.data === "COMPLETED") {
          const furnitureInfoRes = await api.get(`/api/v1/estimates/${estimateId}`);
          const furnitureInfo = furnitureInfoRes.data;
          console.log("가구 정보: ", furnitureInfo);

          // 가구 목록 추출 및 매핑
          const initialItems = furnitureInfo.data.images?.flatMap((img: any) => 
            img.furnitureList?.map((f: any) => ({
              name: translateLabel(f.label),
              quantity: f.quantity
            })) || []
          ) || [];

          // 저장소로 보낼 값
          setRequestData({
            estimateId: estimateId,
            movingDate: targetDate,
            startLocation: startLocation,
            endLocation: endLocation,
            items: initialItems, // 가구 목록 저장
            truckInfo: { type: '', quantity: 0 }, // 트럭 정보는 Result 페이지에서 계산됨
            images: images,
            analysisResult: furnitureInfo
          });

          // Result 페이지로 이동 함수
          navigation.navigate('Result');
          
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
          <Text style={styles.nextBtnText}>다음 단계</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nextBtnContainer: {
    width: '100%', 
    maxWidth: 1240, // 600 * 2 + 40 (gap)
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 250,
  },
  nextBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#F0893B',
    borderRadius: 4,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#666',
    opacity: 0.7
  },
  nextBtnText: {
    color: 'white', 
    fontSize: 17, 
    fontWeight: 400
  }
});
