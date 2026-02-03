import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, useWindowDimensions } from 'react-native';

import { commonStyles } from '../styles/commonStyles';
import { UploadedImage } from '../types/common';

import Header from '../components/common/Header';
import UploadBox from '../components/MainPage/UploadBox';
import NextBtn1 from '../components/MainPage/NextBtn1';
import AlertBox from '../components/common/AlertBox';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export default function Main({ navigation }: Props) {

  const [imageList, setImageList] = useState<UploadedImage[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [msg, setAlertMsg] = useState(''); // 이 부분 해결.
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Mobile breakpoint

  // UploadBox에서 이미지 정보 가져오면 imageList업데이트 하라는거임.
  const onFilesSelected = (newImages : UploadedImage[]) => {
    setImageList((prev) => [...prev, ...newImages]); // 이전꺼에다가 받아온 이미지의 딕셔너리 배열을 더함.
  }

  return (
    <View style={commonStyles.container}>
      {/* 알림 박스 */}
      {isAlertVisible && (
        // 이런 식으로 쓰면 경고 메세지를 하나 밖에 못 띄움. 차리리 함수화 하던가, value를 변수로 해서 useState로 관리해줘도 됨. 아니면 함수로 만들어서 쓰면 될듯.
        <AlertBox 
          value="이미지를 최소 1장 이상 업로드해주세요." 
          onClose={() => setIsAlertVisible(false)}
        />
      )}

      <ScrollView contentContainerStyle={[
        commonStyles.scrollContent,
        isMobile && { paddingTop: 20 }
      ]}
      stickyHeaderIndices={[0]} // 자식 컴포넌트들 중 첫 번째 컴포넌트를 고정시키겠다.
      >
        {/* Header */}
        <Header />

        {/* Main Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* 메인 섹션 */}
          <View style={[
              commonStyles.mainSection, 
              isMobile && styles.mobileMainSection
            ]}>
            <Text style={[
              commonStyles.mainTitle,
              isMobile && styles.mobileMainTitle
            ]}>사진을 찍어서 이사 견적내기</Text>
            <Text style={[
              commonStyles.mainSubtitle,
              isMobile && styles.mobileMainSubtitle
            ]}>간단한 견적내기 시작</Text>

            <UploadBox
            // onFileSelected라는 함수는 newImages라는 매개변수가 있다는 점~
              onFilesSelected={onFilesSelected}
            />

            {/* 선택된 이미지 표시 */}
            <View style={[styles.imageGrid, isMobile && styles.mobileImageGrid]}>
              {imageList.map((item) => (
                <View style={[styles.imageCard, isMobile && styles.mobileImageCard]}>
                  <Image source={{ uri: item.localUri }} style={styles.thumbnail} />
                </View>
              ))}
            </View>
            
            {/* 다음 단계 버튼 */}
            <NextBtn1
              imageList={imageList}
              // 넘어갈 때, 이미지 정보, estimatedId가 같이 넘어감
              onNavigateNext={(images, id) => navigation.navigate('UserSelect', { images, estimateId: id })}
              onShowAlert={() => setIsAlertVisible(true)}
            />
          </View>

          {/* 왜 이삿짐인가요? 섹션 */}
          <View style={[styles.whyTitleSection, isMobile && styles.mobileWhyTitleSection]}>
            <Text style={[styles.sectionTitle, isMobile && styles.mobileSectionTitle]}>왜 이삿짐인가요?</Text>
          </View>

          {/* 카드 섹션 */}
          <View style={[styles.featuresSection, isMobile && styles.mobileFeaturesSection]}>
            <View style={[styles.card, isMobile && styles.mobileCard]}>
              <Text style={[styles.cardTitle, isMobile && styles.mobileCardTitle]}>2D 사진 분석</Text>
              <Text style={[styles.cardDesc, isMobile && styles.mobileCardDesc]}>방 안의 짐을 사진으로 찍기만 하세요. AI가 물품의 크기와 수량을 자동으로 인식합니다.</Text>
            </View>

            <View style={[styles.card, isMobile && styles.mobileCard]}>
              <Text style={[styles.cardTitle, isMobile && styles.mobileCardTitle]}>AI 자동 견적</Text>
              <Text style={[styles.cardDesc, isMobile && styles.mobileCardDesc]}>수천 건의 데이터를 학습한 AI가 실제 이사 비용에 가장 근접한 견적을 산출합니다</Text>
            </View>

            <View style={[styles.card, isMobile && styles.mobileCard]}>
              <Text style={[styles.cardTitle, isMobile && styles.mobileCardTitle]}>즉시 확인</Text>
              <Text style={[styles.cardDesc, isMobile && styles.mobileCardDesc]}>상담 대기 시간 없이, 즉시 견적을 받아보세요.</Text>
            </View>
          </View>

          {/* 3단계 견적 확인 */}
          <View style={[styles.stepSection, isMobile && styles.mobileStepSection]}>
            <View style={[styles.stepTitleContainer, isMobile && styles.mobileStepTitleContainer]}>
              <Text style={[styles.stepTitleText, isMobile && styles.mobileStepTitleText]}>3단계로 끝나는 견적 확인</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  imageGrid: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  mobileImageGrid: {
    marginTop: 20,
    justifyContent: 'center',
    gap: 10,
  },
  imageCard: {
    width: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mobileImageCard: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
  mobileWhyTitleSection: {
    marginTop: 60,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  mobileSectionTitle: {
    fontSize: 24,
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
  mobileFeaturesSection: {
    marginTop: 30,
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 60,
    gap: 16,
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
  mobileCard: {
    width: '100%',
    height: 'auto',
    padding: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: '600', //semibold
    color: '#333333',
    marginTop: 10,
    marginBottom: 25,
    textAlign: 'center',
  },
  mobileCardTitle: {
    fontSize: 18,
    marginTop: 0,
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: 25,
    fontWeight: '500', //medium
    color: '#333333',
    textAlign: 'center',
    lineHeight: 30,
  },
  mobileCardDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#62625D',
  },

  // --- 3단계 견적 확인 ---
  stepSection: {
    width: '100%',
    height: 548,
    backgroundColor: '#EAE7E4', // Slightly darker warm beige
    alignItems: 'center',
  },
  mobileStepSection: {
    height: 'auto',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  stepTitleContainer: {
    width: 764,
    alignItems: 'center',
  },
  mobileStepTitleContainer: {
    width: '100%',
  },
  stepTitleText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginTop: 47,
    lineHeight: 44,
  },
  mobileStepTitleText: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: 0,
  },

  // --- 3D Loading Simulation ---
  loadingSection: {
    width: '100%',
    marginVertical: 40,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // 이 줄이 쉼표가 없어서 추가해야 함
    color: '#1D1D1F',
  },
  loadingContainer: {
    width: '50%',
    height: 600,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
  },

  // --- Mobile ---
  mobileMainSection: {
    marginTop: 110,
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  mobileMainTitle: {
    fontSize: 28,
  },
  mobileMainSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },

  // --- Mobile Overrides for Footer (Local) ---
  mobileFooter: {
    height: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  mobileFooterLine: {
    left: 20,
    right: 20, // width 100% with absolute needs left/right
    width: 'auto', // override 100%
  },
  mobileFooterLogo: {
    fontSize: 20,
    marginTop: 20,
  },
  mobileFooterLinksRow: {
    position: 'relative', // un-float
    right: 'auto',
    top: 'auto',
    flexDirection: 'column',
    marginTop: 20,
    gap: 20,
  },
  mobileFooterColumn: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 12,
  },
  mobileSocialIcons: {
    position: 'relative',
    left: 'auto',
    top: 'auto',
    marginTop: 30,
  },
});