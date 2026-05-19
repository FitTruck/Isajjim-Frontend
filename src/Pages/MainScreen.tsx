import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { commonStyles } from '../styles/commonStyles';
import { UploadedImage } from '../types/common';

import Header from '../components/common/Header';
import UploadBox from '../components/MainPage/UploadBox';
import NextBtn1 from '../components/MainPage/NextBtn1';
import AlertBox from '../components/common/AlertBox';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

export default function Main() {
  const [imageList, setImageList] = useState<UploadedImage[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const onFilesSelected = (newImages: UploadedImage[]) => {
    setImageList((prev) => [...prev, ...newImages]);
  };

  if (isMobile) {
    return (
      <View style={[styles.mobileContainer, { paddingTop: insets.top }]}>
        {/* 헤더: 뒤로가기 + 진행 바 */}
        <View style={styles.mobileHeader}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={8}>
            <ChevronLeft size={20} color="#1F2024" />
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* 제목 */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>집 사진을 촬영 또는 업로드</Text>
          <Text style={styles.pageSubtitle}>
            각 방마다 가구와 짐들이 잘 보이도록 촬영해주세요.{'\n'}
            서랍 속 잔짐이 보이도록 찍어주면 더 좋아요.
          </Text>
        </View>

        {/* 업로드 영역 */}
        <View style={styles.uploadSection}>
          <UploadBox onFilesSelected={onFilesSelected} selectedImages={imageList} />
        </View>

        {/* 하단 버튼 */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <NextBtn1 imageList={imageList} onShowAlert={() => setIsAlertVisible(true)} />
        </View>

        {isAlertVisible && (
          <AlertBox
            value="이미지를 최소 1장 이상 업로드해주세요."
            onClose={() => setIsAlertVisible(false)}
          />
        )}
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Header />
      {isAlertVisible && (
        <AlertBox
          value="이미지를 최소 1장 이상 업로드해주세요."
          onClose={() => setIsAlertVisible(false)}
        />
      )}
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <View style={commonStyles.mainWrapper}>
          <View style={commonStyles.mainSection}>
            <Text style={commonStyles.mainTitle}>사진을 찍어서 이사 견적내기</Text>
            <Text style={commonStyles.mainSubtitle}>간단한 견적내기 시작</Text>
            <UploadBox onFilesSelected={onFilesSelected} selectedImages={imageList} />
            <NextBtn1 imageList={imageList} onShowAlert={() => setIsAlertVisible(true)} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Mobile layout ────────────────────────────────────
  mobileContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 10,
  },
  backButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8E9F1',
    overflow: 'hidden',
  },
  progressFill: {
    width: '25%',
    height: '100%',
    backgroundColor: '#006FFD',
    borderRadius: 8,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2024',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71727A',
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  uploadSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: '#fff',
  },

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

  // --- Mobile ---
  mobileMainSection: {
    marginTop: 50,
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