import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, ScrollView } from 'react-native';
import Header from '../components/common/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import MyTouch from '../components/common/MyTouch';
import { ArrowUpRight } from 'lucide-react-native';
import ImageComparisonSlider from '../components/IntroPage/ImageComparisonSlider';

type Props = NativeStackScreenProps<RootStackParamList, 'Intro'>;

export default function Intro({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  const handleStart = () => {
    navigation.navigate('Main'); 
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[
          styles.contentWrapper, 
          isMobile && styles.mobileContentWrapper,
          { minHeight: height } // Ensure full height
        ]}>
          
          {/* Left Side: Text Content */}
          <View style={[styles.textSection, isMobile && styles.mobileTextSection]}>
            <View style={styles.textContent}>
              <Text style={[styles.title, isMobile && styles.mobileTitle]}>
                AI 견적 산출 서비스{'\n'}
                <Text style={{ color: '#F0893B', textAlign: 'right'}}>이삿찜</Text>
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
          </View>

          {/* 기술 표현 영역 */}
          <View style={[styles.visualSection, isMobile && styles.mobileVisualSection]}>
            <View style={styles.imageContainer}>
              <ImageComparisonSlider 
                beforeImage={require('../../assets/intro.jpg')} 
                afterVideo={require('../../assets/intro.mov')} 
                width={888}
                initialSlide={0.8}
              />
            </View>
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
  contentWrapper: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: 80, 
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
  },
  mobileContentWrapper: {
    flexDirection: 'column-reverse', 
    justifyContent: 'flex-end',
    paddingTop: 100,
    paddingBottom: 40,
  },
  
  // Left Section
  textSection: {
    flex: 0.8,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  mobileTextSection: {
    flex: 0,
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 40,
    alignItems: 'center',
  },
  textContent: {
    maxWidth: 600,
    textAlign: 'left',
  },

  // Right Section
  visualSection: {
    flex: 1.2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 40,
  },
  mobileVisualSection: {
    flex: 0,
    width: '100%',
    height: 400, 
    paddingRight: 24,
    paddingLeft: 24,
  },
  
  imageContainer: {
    width: 888,
    height: '80%', 
    maxHeight: 700,
    backgroundColor: '#ffffffff',
    borderRadius: 30,
    overflow: 'hidden', 
    position: 'relative',
  },
  techImage: {
    width: '100%',
    height: '100%',
  },
  techBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    // @ts-ignore
    backdropFilter: 'blur(10px)',
  },
  techBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Typography
  title: {
    fontSize: 64,
    fontWeight: '600',
    color: '#111',
    marginBottom: 24,
    lineHeight: 80,
    textAlign: 'left',
  },
  mobileTitle: {
    fontSize: 36,
    lineHeight: 46,
    textAlign: 'center',
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
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },

  // Button
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
    alignSelf: 'center', // Center btn on mobile
    paddingHorizontal: 24,
    paddingVertical: 12,
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
