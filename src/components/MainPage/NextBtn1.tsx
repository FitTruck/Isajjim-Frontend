import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text,useWindowDimensions, Platform, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { v4 as uuidv4 } from 'uuid';
import { UploadedImage } from '../../types/common';
import api from '../../api/axiosInstance';
import { useEstimate } from '../../context/EstimateContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

interface NextBtnProps {
  imageList: UploadedImage[];
  onShowAlert: () => void;
}

export default function NextBtn1({ imageList, onShowAlert }: NextBtnProps) {
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { requestData, setRequestData } = useEstimate();

  const handleNextStep = async () => {
    // '다음단계' 중복 클릭 방지 : 이미 눌렀다면 isLoading = true이므로 리턴.
    if (isLoading) return;

    if (imageList.length === 0) {
      if(Platform.OS === 'web') {
        onShowAlert();
      } else {
        Alert.alert('알림', '이미지를 최소 1장 이상 업로드해주세요.');
      }
      
      return;
    }

    setIsLoading(true);
    try {
      // 이미지 업로드용 Presigned Url 발급
      const presignedResponse = await api.post('/api/v1/gcs/presigned', {
        fileNames: imageList.map(img => img.fileName || `${uuidv4()}.jpg`)
      });

      const { data } = presignedResponse.data;
      const { urls } = data; // 백엔드에서 내려준 presignedUrl, fileUrl, key 목록

      // GCS에 이미지 병렬 업로드 (Firebase SDK 대신 직접 PUT)
      const uploadedImages = await Promise.all(imageList.map(async (img, index) => {
        try {
          const { presignedUrl, fileUrl } = urls[index];

          let uploadUri = img.localUri;
          let manipWidth = img.width;
          let manipHeight = img.height;

          // [모바일 환경] 이미지 정규화 및 EXIF 회전 보정
          // ImageManipulator를 거치면 EXIF 회전값이 이미지 픽셀 데이터에 반영되어 저장됨 (Flatten)
          if (Platform.OS !== 'web') {
            const manipResult = await ImageManipulator.manipulateAsync(
              img.localUri,
              [], // 변환 없음 (단순 재저장)
              { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
            );
            uploadUri = manipResult.uri;
            manipWidth = manipResult.width;
            manipHeight = manipResult.height;
          }

          // 로컬 파일을 Blob으로 변환
          const response = await fetch(uploadUri);
          const blob = await response.blob(); 
          
          // GCS에 직접 PUT 요청
          await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': img.mimeType,
            },
            body: blob
          });

          // 이전에 localUri, width, height가 이미 저장되어 있었음.
          // 중요: manipulateAsync를 거친 후의 실제 width, height로 업데이트해야 좌표 계산이 정확함.
          return {
            ...img,
            width: manipWidth,
            height: manipHeight,
            firebaseUri: fileUrl // 이미지 접근 URL
          };
        } catch (err) {
          console.error(`이미지 업로드 실패 (${img.localUri}):`, err);
          throw err;
        }
      }));

      // 백엔드 서버에 값 전달
      const response = await api.post('/api/v1/estimates', {
        // firebaseUri만 보냄
        imageUrls: uploadedImages.map(img => img.firebaseUri),
      });

      // responseData에 data: {estimateId: 123} 이런식으로 있을거임.
      const responseData = response.data;

      // Context에 estimateId 저장
      if (responseData.data && responseData.data.estimateId) {
        setRequestData({
          ...requestData, // 기존 데이터 유지 (있다면) - 초기엔 null일 수 있으므로 주의 필요하지만, 여기선 초기화 개념
          estimateId: responseData.data.estimateId,
          images: uploadedImages, // 업로드된 이미지 정보도 저장
        });
        console.log('Context에 estimateId 저장됨:', responseData.data.estimateId);
        console.log('Context에 uploadedImages 저장됨:', uploadedImages);

        // 지금까지의 requestData
        console.log('requestData:', requestData);
      }

      // 다음 페이지로 넘어가기
      if (responseData.data.estimateId) { 
        // 넘어갈 때, 이미지 정보, estimatedId가 같이 넘어감
        navigation.navigate('UserSelect', { images: uploadedImages, estimateId: responseData.data.estimateId });
      } else {
        console.error('estimateId 또는 uploadedImages배열을 받아오지 못함');
      }
    } catch (error) {
    console.error('Network Error:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.nextBtn, isMobile && styles.mobileNextBtn, isLoading && styles.nextBtnDisabled]} 
      onPress={handleNextStep}
    >
      <Text style={[styles.nextBtnText, isMobile && styles.mobileNextBtnText]}>다음 단계</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nextBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#F0893B',
    borderRadius: 4,
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 0,
  },
  mobileNextBtn: {
    backgroundColor: '#F0893B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 0,
  },
  nextBtnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '400',
  },
  mobileNextBtnText: {
    fontSize: 15,
  },
  nextBtnDisabled: {
    backgroundColor: '#666',
    opacity: 0.7
  }
});
