import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, BACKEND_DOMAIN } from '../utils/Server';
import { commonStyles } from '../styles/commonStyles';
import { UploadedImage } from '../types/reuseableData';
import { v4 as uuidv4 } from 'uuid';


// app.tsx로부터 전달받을 함수의 자료형 정의
interface MainProps {
  onNavigateNext: (images: UploadedImage[], estimateId: number) => void; //app.tsx에 정의되어 있는 함수임. images를 갖고 이동하는 함수.
  onGoHome: () => void;
}

export default function Main({ onNavigateNext, onGoHome }: MainProps) {
  // imageList는 UploadedImage 타입의 객체들의 배열
  // imageList는 useState를 사용하여 초기값은 빈 배열로 설정
  // imageList는 화면에 표시됨
  const [imageList, setImageList] = useState<UploadedImage[]>([]); 
  
  
  // statusMessage라는 객체를 만들고, 초기값은 빈 문자열로 설정. 값 변경은 setStatusMessage 함수를 사용
  // statusMessage는 string 타입
  // statusMessage는 화면에 표시됨
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // handleWebUpload 함수 정의
  // async: 순서대로 기다려야 하는 작업이 있음을 나타냄. await와 함께 사용
  const handleWebUpload = async () => {
    // ImagePicker.launchImageLibraryAsync: 이미지 선택 창을 띄우고 이미지를 선택할 때까지 다음 실행 멈춤
    // launchImageLibraryAsync는 비동기 함수이므로 await와 함께 사용
    // await: 사용자가 사진을 고를 때까지 다음 줄로 넘어가지 않음
    // launchImageLibraryAsync는 사용자가 선택한 이미지들의 정보를 담은 객체를 반환하는 함수
    // result는 사용자가 선택한 이미지들의 정보를 담은 객체
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ['images'], // 이미지 파일만
      allowsMultipleSelection: true, // 다중 선택 활성화
      quality: 1, // 원본 화질
    });
  
    // result의 가장 상위 속성은 assets, canceled가 있다고 보면 됨. assets는 이미지 하나의 정보이고, canceled는 이미지 선택을 취소했는지 여부를 나타냄
    if (!result.canceled) {
      setStatusMessage('업로드 중...');
      const uploadedResults: UploadedImage[] = []; 
      // 업로드된 이미지들을 저장할 배열 생성

      try {
        // 선택된 이미지들을 하나씩 반복 처리
        // asset : 사용자가 선택한 이미지 하나의 정보를 담은 객체
        for (const asset of result.assets) {
          // 고유 ID 생성 (중복 방지)
          const tempId = uuidv4();
          
          // 이미지 데이터를 blob으로 변환
          const response = await fetch(asset.uri); // "브라우저의 메모리로 올라간 브라우저 메모리 주소"를 인자로 하여 이미지의 상태 정보를 가져옴
          const blob = await response.blob(); // 이미지를 이진수로 데이터 덩어리로 변환

          // firebase storage에 업로드
          const storageRef = ref(storage, `web_uploads/${tempId}`); // 저장소 내의 위치와 저장할 파일명을 하나로 묶어 storageRef라는 객체로 만든 것.
          // storage는 ../utils/firebase.ts에 정의되어 있음
          await uploadBytes(storageRef, blob); // 경로 및 blob을 인자로 하여 storage에 업로드

          const uri = await getDownloadURL(storageRef); // 업로드된 파일의 URL을 가져옴

          uploadedResults.push({
            id: tempId, // 생성한 id
            uri: uri, // 업로드된 이미지의 URL
            width: asset.width, // 이미지의 너비
            height: asset.height, // 이미지의 높이
          });
        }

        setImageList((prev) => [...prev, ...uploadedResults]); //imageList 객체 갱신함 "파일 선택하기" 버튼을 여러번 눌러서 이미지 추가가 가능하도록 함 
        setStatusMessage(`${uploadedResults.length}개의 파일 업로드 완료`);

      } catch {
        setStatusMessage('업로드 실패');
      }
    }
  };

  const handleNextStep = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStatusMessage('서버에 분석 요청 중...');

    try {
      // 실제 백엔드 API 주소로 변경
      const BACKEND_URL = `${BACKEND_DOMAIN}/api/v1/estimates`; 

      // response: 서버가 보낸 응답. 데이터 및 데이터 외적인 정보가 포함됨.
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: imageList.map(img => img.uri),
        })
      });
      
      const responseData = await response.json(); // 자동으로 자료형이 any라서 따로 자료형 설정 없어도 된다. 

      if (responseData?.data?.estimateId) { 
        onNavigateNext(imageList, responseData.data.estimateId); // app.tsx로 이미지와 id를 보냄
      } else {
        console.error('Server Error:', responseData);
        setStatusMessage('서버 전송 실패0: ' + (responseData.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Network Error:', error);
      setStatusMessage('서버 전송 중 오류 발생. 백엔드 서버를 확인해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* Main Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* Header */}
          <View style={commonStyles.header}>
            <TouchableOpacity onPress={onGoHome}>
              <Text style={commonStyles.logoText}>이삿찜</Text>
            </TouchableOpacity>
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
              <Text style={commonStyles.mainTitle}>사진을 찍어서 이사 견적내기</Text>
              <Text style={commonStyles.mainSubtitle}>간단한 견적내기 시작</Text>

              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={handleWebUpload}
              >
                <Text style={styles.uploadButtonText}>파일 선택하기</Text>
              </TouchableOpacity>

              <Text style={styles.statusText}>{statusMessage}</Text>

              <View style={styles.imageGrid}>
                {imageList.map((item) => (
                  <View key={item.id} style={styles.imageCard}>
                    <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                  </View>
                ))}
              </View>

              {imageList.length > 0 && (
                <TouchableOpacity 
                  style={[styles.uploadButton, isProcessing && styles.disabledButton]} 
                  onPress={handleNextStep}
                  disabled={isProcessing}
                >
                  <Text style={styles.uploadButtonText}>
                    {isProcessing ? '처리 중...' : '다음단계'}
                  </Text>
                </TouchableOpacity>
              )}

            </View>
          </View>

          {/* 왜 이삿짐인가요? 섹션 */}
          <View style={styles.whyTitleSection}>
            <Text style={styles.sectionTitle}>왜 이삿짐인가요?</Text>
          </View>

          {/* 카드 섹션 */}
          <View style={styles.featuresSection}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>2D 사진 분석</Text>
              <Text style={styles.cardDesc}>방 안의 짐을 사진으로 찍기만 하세요. AI가 물품의 크기와 수량을 자동으로 인식합니다.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>AI 자동 견적</Text>
              <Text style={styles.cardDesc}>수천 건의 데이터를 학습한 AI가 실제 이사 비용에 가장 근접한 견적을 산출합니다</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>즉시 확인</Text>
              <Text style={styles.cardDesc}>상담 대기 시간 없이, 즉시 견적을 받아보세요.</Text>
            </View>
          </View>

          {/* 3단계 견적 확인 */}
          <View style={styles.stepSection}>
            <View style={styles.stepTitleContainer}>
              <Text style={styles.stepTitleText}>3단계로 끝나는 견적 확인</Text>
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
  // --- 이미지 업로드 버튼 ---
  uploadButton: {
    backgroundColor: 'black',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  
  statusText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  imageGrid: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  imageCard: {
    width: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  thumbnail: {
    width: '100%',
    height: 100,
  },

  // --- 왜 이삿찜 ---
  whyTitleSection: {
    marginTop: 500,
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
  },
  featuresSection: {
    marginTop: 47,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 523,
  },
  card: {
    width: 394,
    height: 250,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F7F7F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: '600', //semibold
    color: 'black',
    marginTop: 10,
    marginBottom: 25,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 25,
    fontWeight: '500', //medium
    color: '#828282',
    textAlign: 'center',
    lineHeight: 30,
  },

  // --- 3단계 견적 확인 ---
  stepSection: {
    width: '100%',
    height: 548,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
  },
  stepTitleContainer: {
    width: 764,
    alignItems: 'center',
  },
  stepTitleText: {
    fontSize: 40,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
    marginTop: 47,
    lineHeight: 44,
  },
});