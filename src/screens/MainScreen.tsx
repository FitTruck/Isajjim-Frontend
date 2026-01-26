import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, BACKEND_DOMAIN } from '../utils/Server';
import { commonStyles } from '../styles/commonStyles';
import { UploadedImage } from '../utils/Server';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/common/Header';


// app.tsx로부터 전달받을 함수의 자료형 정의
interface MainProps {
  onNavigateNext: (images: UploadedImage[], estimateId: number) => void; //app.tsx에 정의되어 있는 함수임. images를 갖고 이동하는 함수.
  onGoHome: () => void;
}

export default function Main({ onNavigateNext, onGoHome }: MainProps) {
  const [imageList, setImageList] = useState<UploadedImage[]>([]); 
  const [statusMessage, setStatusMessage] = useState(''); 
  const [isProcessing, setIsProcessing] = useState(false);

  // await을 쓸려면 부모 함수에 async이 있어야함.
  const handleWebUpload = async () => {
    // await: 사용자가 사진을 고를 때까지 다음 줄로 넘어가지 않음
    // result는 사용자가 선택한 이미지들의 정보(assets, canceled)를 담은 객체
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // 이미지 파일만
      allowsMultipleSelection: true, // 다중 선택 활성화
      quality: 1,
    });
  
    // result의 가장 상위 속성은 assets, canceled가 있다고 보면 됨. assets는 이미지 하나의 정보이고, canceled는 이미지 선택을 취소했는지 여부를 나타냄
    if (!result.canceled) { // 취소하지 않았다면~
      // 로컬 이미지 추가
      const newImages = result.assets.map(asset => ({
        localUri: asset.uri,
        width: asset.width,
        height: asset.height,
        // firebaseUri는 아직 없음
      } as UploadedImage));

      setImageList((prev) => [...prev, ...newImages]);
      setStatusMessage(`${newImages.length + imageList.length}개의 파일 선택 완료`);
    }
  };

  // '다음 단계' 버튼 눌렀을 때
  const handleNextStep = async () => {
    if (isProcessing) return; // '다음단계'버튼을 여러번 누르는 걸 대비

    setIsProcessing(true); // 처리 중으로 상태 변경
    setStatusMessage('서버에 이미지 전송 중...');

    try {
      const uploadedImages = await Promise.all(imageList.map(async (img) => {

        try {
           // 고유 ID 생성
           const tempId = uuidv4();
           
           const response = await fetch(img.localUri);
           const blob = await response.blob(); 

           // firebase storage에 업로드
           const storageRef = ref(storage, `web_uploads/${tempId}`);
           await uploadBytes(storageRef, blob); 
           const uri = await getDownloadURL(storageRef); // 업로드된 파일의 URL

           return {
             ...img, // 다른 것들은 그대로 놔두고
             firebaseUri: uri // firebaseUri 만 변경해.
           };
        } catch (err) {
          console.error(`firebase에 이미지 업로드 실패 (${img.localUri}):`, err);
          throw err;
        }
      }));

      // uploadedImages는 firebaseUri가 추가된 완전체임
      setImageList(uploadedImages);

      const BACKEND_URL = `${BACKEND_DOMAIN}/api/v1/estimates`; 

      // response: 서버가 보낸 응답. 데이터 및 데이터 외적인 정보가 포함됨.
      const response = await fetch(BACKEND_URL, { //fetch를 통해서 데이터를 보낸다.
        method: 'POST', //Post방식 : 요청하는 형식대로 값 보내고, 값 받아오기
        headers: { // headers: 보낼 데이터에 대한 메타데이터를 적는 곳임 
          'Content-Type': 'application/json', 
          // 보낼 데이터가 json임을 명시. 'content-type'은 사용자 지정 속성이 아님
          // 데이터 형식을 표현할 때, json은 application/json으로 표기해야함.
        },
        body: JSON.stringify({ // 보내는 데이터의 내용물
          imageUrls: uploadedImages.map(img => img.firebaseUri),  // imageList는 이전 값이므로 uploadedImages를 사용해야함
        })
      });
      
      const responseData = await response.json(); // 자동으로 자료형이 any라서 따로 자료형 설정 없어도 된다. 

      if (responseData.data.estimateId) { 
        // app.tsx로 이미지와 estimatedId를 보냄 (uploadedImages에는 이제 firebaseUri가 다 있음)
        onNavigateNext(imageList as UploadedImage[], responseData.data.estimateId); 
      } else {
        console.error('estimateId를 받아오지 못함');
        setStatusMessage('서버 전송 실패');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setStatusMessage('서버 전송 중 오류 발생.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <Header onGoHome={onGoHome} />

      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* Main Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* 메인 섹션 */}
          <View style={commonStyles.mainSection}>
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
              {/* 이미지가 다시 업로드 되면 imageList도 업데이트 되니까 선택한 이미지가 모두 드러나게 되어있음 */}
              {imageList.map((item) => (
                <View style={styles.imageCard}>
                  <Image source={{ uri: item.localUri }} style={styles.thumbnail} />
                </View>
              ))}
            </View>

            {imageList.length > 0 && ( //&& 이후를 return문이라 생각하면 됨
              <TouchableOpacity 
                style={[styles.uploadButton, isProcessing && styles.disabledButton]} 
                onPress={handleNextStep}
                disabled={isProcessing} // 버튼 활성화를 처리 상태로 정함
              >
                <Text style={styles.uploadButtonText}>
                  {isProcessing ? '처리 중...' : '다음단계'}
                </Text>
              </TouchableOpacity>
            )}
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
    backgroundColor: '#D97757', // New main color
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
    color: '#3D3D3A',
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
    color: '#3D3D3A',
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
    color: '#3D3D3A',
    marginTop: 10,
    marginBottom: 25,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 25,
    fontWeight: '500', //medium
    color: '#3D3D3A',
    textAlign: 'center',
    lineHeight: 30,
  },

  // --- 3단계 견적 확인 ---
  stepSection: {
    width: '100%',
    height: 548,
    backgroundColor: '#EAE7E4', // Slightly darker warm beige
    alignItems: 'center',
  },
  stepTitleContainer: {
    width: 764,
    alignItems: 'center',
  },
  stepTitleText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#3D3D3A',
    textAlign: 'center',
    marginTop: 47,
    lineHeight: 44,
  },
});