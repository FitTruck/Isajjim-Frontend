import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { UploadedImage, BACKEND_DOMAIN } from '../../utils/Server';
import AlertBox from '../common/AlertBox';

interface NextBtnProps {
  imageList: UploadedImage[];
  onNavigateNext: (images: UploadedImage[], estimateId: number) => void;
}

export default function NextBtn({ imageList, onNavigateNext }: NextBtnProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const handleNextStep = async () => {
    // '다음단계' 중복 클릭 방지 : 이미 눌렀다면 isLoading = true이므로 리턴.
    if (isLoading) return;

    if (imageList.length === 0) {
      setIsAlertVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      // 이미지 업로드용 Presigned Url 발급
      const presignedResponse = await fetch(`${BACKEND_DOMAIN}/api/v1/gcs/presigned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileNames: imageList.map(img => img.fileName || `${uuidv4()}.jpg`)
        })
      });

      const { data } = await presignedResponse.json();
      const { urls } = data; // 백엔드에서 내려준 presignedUrl, fileUrl, key 목록

      // GCS에 이미지 병렬 업로드 (Firebase SDK 대신 직접 PUT)
      const uploadedImages = await Promise.all(imageList.map(async (img, index) => {
        try {
          const { presignedUrl, fileUrl } = urls[index];

          // 로컬 파일을 Blob으로 변환
          const response = await fetch(img.localUri);
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
          return {
            ...img,
            firebaseUri: fileUrl // 이미지 접근 URL
          };
        } catch (err) {
          console.error(`이미지 업로드 실패 (${img.localUri}):`, err);
          throw err;
        }
      }));

      // 백엔드 서버에 값 전달
      const BACKEND_URL = `${BACKEND_DOMAIN}/api/v1/estimates`; 
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
          imageUrls: uploadedImages.map(img => img.firebaseUri),
        })
      });

      // responseData에 data: {estimateId: 123} 이런식으로 있을거임.
      const responseData = await response.json();

      // 다음 페이지로 넘어가기
      if (responseData.data.estimateId) { 
        // 이게 잘 실행되면 밑의 코드들은 실행 안됨
        onNavigateNext(uploadedImages, responseData.data.estimateId);
      } else {
        console.error('estimateId 또는 uploadedImages배열을 받아오지 못함');
      }
    } catch (error) {
    console.error('Network Error:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.nextBtn} 
      onPress={handleNextStep}
    >
      {isAlertVisible && (
        <AlertBox
          value="이미지를 최소 1장 이상 업로드해주세요."
          onClose={() => setIsAlertVisible(false)}
        />
      )}
      <Text style={styles.nextBtnText}>
        {isLoading ? '처리중...' : '다음단계'}
      </Text>
      {isAlertVisible && (
        <AlertBox value="이미지를 최소 1장 이상 업로드해주세요." />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nextBtn: {
    backgroundColor: '#F0893B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -50,
  },
  nextBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  }
});
