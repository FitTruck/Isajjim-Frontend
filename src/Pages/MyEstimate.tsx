import { View, Text, StyleSheet, ScrollView, Image} from "react-native";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/common/Header";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import EstimateCard from "../components/MyEstimatePage/EstimateCard";
import SidePanel from "../components/MyEstimatePage/SidePanel";
import MyTouch from "../components/common/MyTouch";

type Props = NativeStackScreenProps<RootStackParamList, 'MyEstimate'>;

export default function MyEstimate({ navigation }: Props) {

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        contentContainerStyle={commonStyles.scrollContent}
        stickyHeaderIndices={[0]}
      >
        {/* Header */}
        <Header />

        {/* 페이지 전체 컨테이너 */}
        <View style={styles.mainWrapper}>

          {/* 타이틀 섹션 */}
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>내 견적</Text>
            <Text style={styles.pageSubtitle}>내 정보를 바탕으로 견적을 받습니다.</Text>
          </View>

          {/* leftrightContainer */}
          <View style={styles.leftrightContainer}>

            {/* 왼쪽 Content */}
            <View style={styles.leftContent}>

              {/* 필터 버튼 */}
              <View style={styles.filterButtonContainer}>
                <MyTouch style={styles.filterButton}>
                  <Image source={require('../../assets/filter.png')} style={styles.filterIcon} />
                  <Text style={styles.filterText}>필터</Text>
                </MyTouch>
              </View>

              {/* 견적 리스트 (카드들) */}
              <View style={styles.cardList}>

              {/* 견적 대기 중 */}
              {/* <EstimateCard 
                status="pending"
                date="2026.04.15"
                locations={{ start: '서울시 송파구', end: '서울시 강동구' }}
                timelineStep={2}
                quoteInfo={{
                  isLowest: false,
                  price: '1,030,000원',
                  rating: '3.5',
                  tags: ['사다리차', '엘레베이터'],
                  companyCount: 0
                }}
              /> */}

                {/* 견적 받는 중 */}
                <EstimateCard 
                  status="active"
                  date="2026.03.02"
                  locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                  timelineStep={3}
                  quoteInfo={{
                    isLowest: true,
                    price: '820,000원',
                    rating: '4.9',
                    tags: ['사다리차', '엘레베이터'],
                    companyCount: 3
                  }}
                />

              {/* 이사 진행 중 */}
              {/* <EstimateCard 
                status="moving"
                date="2026.03.02" 
                locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                timelineStep={4}
                quoteInfo={{
                  isLowest: false,
                  price: '1,030,000원',
                  rating: '3.5',
                  tags: ['사다리차', '엘레베이터'],
                  companyCount: 5
                }}
              /> */}
            
              {/* 완료된 이사 */}
              {/* <EstimateCard 
                status="completed"
                date="2026.03.02"
                locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                timelineStep={5}
                quoteInfo={{
                  isLowest: false,
                  price: '1,030,000원',
                  rating: '3.5',
                  tags: ['사다리차', '엘레베이터'],
                  companyCount: 5
                }}
              /> */}

              { /* 취소된 이사 */}
              {/* <EstimateCard 
                status="cancelled"
                date="2026.03.02"
                locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                timelineStep={0} 
              /> */}
              
              </View>
            </View>

            {/* 오른쪽 Content */}
            <View style={styles.rightContent}>
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
    marginTop: 50,
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
    paddingTop: 80,
  },
  leftrightContainer: {
    width: 1100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 150,
  },
  
  // 타이틀 섹션
  titleContainer: {
    left: -50,
    width: 700, 
    marginBottom: 30,
    flexDirection: 'column',
  },
  
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#323232',
    lineHeight: 34,
    marginBottom: 5,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#999999',
    fontWeight: '400',
  },

  leftContent: {
    width: 700,
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

  // 오른쪽 컬럼
  rightContent: {
    width: 307,
    marginTop: 52,
  }
});