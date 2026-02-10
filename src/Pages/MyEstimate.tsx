import { View, Text, StyleSheet, ScrollView, Image, Platform, useWindowDimensions } from "react-native";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/common/Header";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import EstimateCard from "../components/MyEstimatePage/EstimateCard";
import SidePanel from "../components/MyEstimatePage/SidePanel";
import MyTouch from "../components/common/MyTouch";
import { useEstimate } from '../context/EstimateContext';
import { useState, useEffect } from "react";
import { dummyChatList } from "./MyChat";

type Props = NativeStackScreenProps<RootStackParamList, 'MyEstimate'>;

export default function MyEstimate({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { estimateStatus, setEstimateStatus } = useEstimate();
  
  // 시뮬레이션 상태 관리
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'active' | 'moving' | 'completed'| 'cancelled'>('pending');
  const [quoteInfo, setQuoteInfo] = useState<{
    isLowest: boolean;
    price: string;
    rating: string;
    tags: string[];
    companyCount: number;
  }>({
    isLowest: false,
    price: '-',
    rating: '-',
    tags: [],
    companyCount: 0
  });

  // 외부에서 상태가 변경되었을 때 처리 (moving/completed/cancelled)
  useEffect(() => {
    if (estimateStatus === 'moving' || estimateStatus === 'completed' || estimateStatus === 'cancelled') {
      setCurrentStatus(estimateStatus);
    }
  }, [estimateStatus]);

  // 시뮬레이션 로직 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    // 0초: 견적 대기 중 (pending)
    setCurrentStatus('pending');
    setQuoteInfo(prev => ({ ...prev, companyCount: 0 }));

    // 3초 후: 견적 받는 중 (active) + 1개 (2424닷컴)
    const timer1 = setTimeout(() => {
      setCurrentStatus('active');
      setEstimateStatus('active'); // Context 상태도 업데이트
      const company1 = dummyChatList.find(c => c.companyName === '2424닷컴');
      if (company1) {
        setQuoteInfo({
          isLowest: true,
          price: company1.price,
          rating: company1.rating,
          tags: ['사다리차', '엘레베이터'],
          companyCount: 1
        });
      }
    }, 3000);

    // 5초 후: 2개 (백마익스프레스)
    const timer2 = setTimeout(() => {
      const company2 = dummyChatList.find(c => c.companyName === '백마익스프레스');
      if (company2) {
        setQuoteInfo(prev => ({
            ...prev,
            price: company2.price,
            rating: company2.rating,
            companyCount: 2
        }));
      }
    }, 5000);

    // 7초 후: 3개 (작은 짐 이사)
    const timer3 = setTimeout(() => {
      const company3 = dummyChatList.find(c => c.companyName === '작은 짐 이사');
      if (company3) {
         setQuoteInfo(prev => ({
            ...prev,
            price: company3.price,
            rating: company3.rating,
            companyCount: 3
        }));
      }
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 최종적으로 보여줄 상태
  const displayStatus = estimateStatus === 'active' || estimateStatus === 'pending' ? currentStatus : estimateStatus;

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        contentContainerStyle={[
          commonStyles.scrollContent, 
          Platform.OS === 'web' && { width: '100vw', overflowX: 'hidden' } as any,
          isMobile && { paddingHorizontal: 0 }
        ]}
        stickyHeaderIndices={[0]}
      >
        {/* Header */}
        <Header />

        {/* 페이지 전체 컨테이너 */}
        <View style={[styles.mainWrapper, isMobile && styles.mobileMainWrapper]}>

          {/* 타이틀 섹션 */}
          <View style={[styles.titleContainer, isMobile && styles.mobileTitleContainer]}>
            <Text style={[styles.pageTitle, isMobile && styles.mobilePageTitle]}>내 견적</Text>
            <Text style={styles.pageSubtitle}>내 정보를 바탕으로 견적을 받습니다.</Text>
          </View>

          {/* leftrightContainer */}
          <View style={[styles.leftrightContainer, isMobile && styles.mobileLeftRightContainer]}>

            {/* 왼쪽 Content */}
            <View style={[styles.leftContent, isMobile && styles.mobileLeftContent]}>

              {/* 필터 버튼 */}
              <View style={styles.filterButtonContainer}>
                <MyTouch style={styles.filterButton}>
                  <Image source={require('../../assets/filter.png')} style={styles.filterIcon} />
                  <Text style={styles.filterText}>필터</Text>
                </MyTouch>
              </View>

              {/* 견적 리스트 (카드들) */}
              <View style={[styles.cardList, isMobile && styles.mobileCardList]}>

              <EstimateCard 
                status={displayStatus}
                date="2026.03.02" // 예시 날짜
                locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                timelineStep={displayStatus === 'moving' ? 4 : (displayStatus === 'completed' ? 5 : (displayStatus === 'active' ? 3 : 2))}
                quoteInfo={quoteInfo}
              />
               
              </View>
            </View>

            {/* 오른쪽 Content */}
            <View style={[styles.rightContent, isMobile && styles.mobileRightContent]}>
              <SidePanel />
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    marginTop: 80,
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
  },
  mobileMainWrapper: {
    marginTop: 0,
    paddingTop: 40,
    marginBottom: 40,
  },
  leftrightContainer: {
    width: 1240,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
  },
  mobileLeftRightContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  // 타이틀 섹션
  titleContainer: {
    width: 1240,
    paddingLeft: 100, 
    marginBottom: 30,
    flexDirection: 'column',
  },
  mobileTitleContainer: {
    width: '100%',
    paddingLeft: 24,
    marginBottom: 20,
  },
  
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#323232',
    lineHeight: 34,
    marginBottom: 5,
  },
  mobilePageTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#999999',
    fontWeight: '400',
  },

  leftContent: {
    width: 700,
    marginLeft: 100,
  },
  mobileLeftContent: {
    width: '100%',
    marginLeft: 0,
    paddingHorizontal: 20,
  },

  filterButtonContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  filterButton: {
    width: 85,
    height: 33,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingLeft: 8,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#434343',
    marginRight: 5,
    textAlign: 'center',
    marginBottom: 2,
  },
  filterIcon: {
    width: 17,
    height: 17,
    opacity: 0.6,
  },
  
  cardList: {
    gap: 15, 
  },
  mobileCardList: {
    width: '100%',
  },

  // 오른쪽 컬럼
  rightContent: {
    width: 307,
    marginTop: 52,
  },
  mobileRightContent: {
    width: '100%',
    marginTop: 40,
    paddingHorizontal: 20,
  }
});