import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import { commonStyles } from '../styles/commonStyles';
import { BackendImage } from '../utils/firebase';

import { v4 as uuidv4 } from 'uuid';

// MainProps 정의
type MainProps = {
  onNavigateToResult?: (images: BackendImage[]) => void;
};

export default function Main({ onNavigateToResult }: MainProps) {
  
  const [imageList, setImageList] = useState<BackendImage[]>([]); // 빈 배열로 초기화
  const [statusMessage, setStatusMessage] = useState('');
  
  const handleWebUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ // await: 이 함수가 완료될 때까지 다음 실행 멈춤
      mediaTypes: ['images'], // 이미지 파일만
      allowsMultipleSelection: true, // 다중 선택 활성화
      quality: 1, // 원본 화질
    });
  
    // 이미지 선택을 취소하지 않고, 이미지를 선택할 때만 실행
    if (!result.canceled) {
      setStatusMessage('업로드 중...');
      const uploadedResults: BackendImage[] = []; // 업로드된 이미지들을 저장할 배열 생성

      try {
        // 선택된 이미지들을 하나씩 반복 처리
        for (const asset of result.assets) {
          // UUID를 사용하여 고유 ID 생성
          const uniqueId = uuidv4();
          
          // 이미지 데이터를 blob으로 변환
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          // firebase storage에 업로드
          const storageRef = ref(storage, `web_uploads/${uniqueId}`);
          await uploadBytes(storageRef, blob);
          const downloadUrl = await getDownloadURL(storageRef);

          uploadedResults.push({
            image_url: downloadUrl,
          });
        }

        setImageList((prev) => [...prev, ...uploadedResults]);
        setStatusMessage(`${uploadedResults.length}개의 파일 업로드 완료`);
      } catch (error) {
        console.error("Upload Error:", error);
        setStatusMessage('업로드 실패');
      }
    }
  };

  const handleNextStep = () => {
    if (onNavigateToResult) {
      onNavigateToResult(imageList);
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* Main Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* Header */}
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
                  <View key={item.image_id} style={styles.imageCard}>
                    <Image source={{ uri: item.image_data }} style={styles.thumbnail} />
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.uploadButton} onPress={handleNextStep}>
                <Text style={styles.uploadButtonText}>다음단계</Text>
              </TouchableOpacity>
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
    marginTop: 559,
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