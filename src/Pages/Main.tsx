import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import Header from '../components/common/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import MyTouch from '../components/common/MyTouch';
import { ArrowUpRight } from 'lucide-react-native';
import ImageComparisonSlider from '../components/IntroPage/ImageComparisonSlider';
import { useAuth } from '../context/AuthContext';
import { setRedirectPath } from '../auth/tokenStorage';
import BottomTabBar, { TabKey } from '../components/common/BottomTabBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export default function Main({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      navigation.navigate('Upload');
    } else {
      setRedirectPath('Upload');
      navigation.navigate('Login');
    }
  };

  const textContent = (
    <View style={[styles.textContent, isMobile && styles.mobileTextContent]}>
      <Text style={[styles.title, isMobile && styles.mobileTitle]}>
        AI 견적 산출 서비스{'\n'}
        <Text style={{ color: '#F0893B' }}>이삿찜</Text>
      </Text>
      <Text style={[styles.subtitle, isMobile && styles.mobileSubtitle]}>
        이삿짐 사진을 업로드하면{'\n'}
        AI가 가구를 자동으로 분석하여{'\n'}
        최적의 이사 견적을 알려드립니다.
      </Text>
      <MyTouch
        style={[styles.startButton, isMobile && styles.mobileStartButton]}
        onPress={handleStart}
      >
        <Text style={[styles.startButtonText, isMobile && styles.mobileStartButtonText]}>시작하기</Text>
        <ArrowUpRight size={20} color="white" strokeWidth={3} />
      </MyTouch>
    </View>
  );

  // 모바일: paddingHorizontal 20 양쪽 = 40 제외한 정확한 픽셀값 전달
  const sliderWidth = isMobile ? width - 40 : undefined;
  const sliderHeight = isMobile ? 240 : undefined;

  const imageContent = (
    <View style={[styles.imageContainer, isMobile && styles.mobileImageContainer]}>
      <ImageComparisonSlider
        beforeImage={require('../../assets/intro.jpg')}
        afterImage={require('../../assets/intro_3d.gif')}
        initialSlide={0.8}
        width={sliderWidth}
        height={sliderHeight}
      />
    </View>
  );

  const handleTabPress = (tab: TabKey) => {
    if (tab === 'estimate') navigation.navigate('MyEstimate');
    else if (tab === 'chat') navigation.navigate('MyChat');
    else if (tab === 'settings') navigation.navigate('Settings');
  };

  if (isMobile) {
    return (
      <View style={styles.container}>
        <Header />
        <ScrollView contentContainerStyle={styles.mobileScrollContent}>
          <View style={styles.mobileVisualSection}>
            {imageContent}
          </View>
          <View style={styles.mobileTextSection}>
            {textContent}
          </View>
        </ScrollView>
        <BottomTabBar activeTab="home" onTabPress={handleTabPress} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <View style={styles.contentWrapper}>
          <View style={styles.textSection}>
            {textContent}
          </View>
          <View style={styles.visualSection}>
            {imageContent}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // ── Desktop ──────────────────────────────────────────
  contentWrapper: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: 100,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
  },
  textSection: {
    flex: 0.8,
    paddingHorizontal: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 40,
  },
  textContent: {
    maxWidth: 600,
  },
  visualSection: {
    flex: 1.2,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingRight: 40,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },

  // ── Mobile ───────────────────────────────────────────
  mobileScrollContent: {
    flexGrow: 1,
    paddingTop: 50,   // 모바일 헤더 높이
    paddingBottom: 40,
  },
  mobileVisualSection: {
    width: '100%',
    height: 240,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  mobileImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  mobileTextSection: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mobileTextContent: {
    width: '100%',
    alignItems: 'center',
  },

  // ── Typography ───────────────────────────────────────
  title: {
    fontSize: 64,
    fontWeight: '600',
    color: '#111',
    marginBottom: 24,
    lineHeight: 80,
    textAlign: 'left',
  },
  mobileTitle: {
    fontSize: 34,
    lineHeight: 44,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#666',
    marginBottom: 40,
    lineHeight: 32,
    textAlign: 'left',
  },
  mobileSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
  },

  // ── Button ───────────────────────────────────────────
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 27,
    paddingVertical: 10,
    backgroundColor: '#F0893B',
    borderRadius: 50,
    shadowColor: '#F0893B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    alignSelf: 'flex-start',
  },
  mobileStartButton: {
    alignSelf: 'center',
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  mobileStartButtonText: {
    fontSize: 16,
  },
});
