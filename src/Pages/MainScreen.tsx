import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { UploadedImage } from '../types/common';

import UploadBox from '../components/MainPage/UploadBox';
import NextBtn1 from '../components/MainPage/NextBtn1';
import AlertBox from '../components/common/AlertBox';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

export default function Main() {
  const [imageList, setImageList] = useState<UploadedImage[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const onFilesSelected = (newImages: UploadedImage[]) => {
    setImageList((prev) => [...prev, ...newImages]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더: 뒤로가기 + 진행 바 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main' as any)}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={20} color="#423E3E" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
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
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  progressFill: {
    width: '25%',
    height: '100%',
    backgroundColor: '#F36845',
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
    color: '#423E3E',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#949494',
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
});
