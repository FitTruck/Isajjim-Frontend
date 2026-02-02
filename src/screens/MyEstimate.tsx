import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image} from "react-native";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/common/Header";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import EstimateCard from "../components/MyEstimate/EstimateCard";
import SidePanel from "../components/MyEstimate/SidePanel";

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

        {/* 메인 Wrapper */}
        <View style={styles.mainWrapper}>
          
          {/* Page Content: 기준점 */}
          <View style={styles.pageContent}>

            {/* 타이틀 섹션 */}
            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>내 견적</Text>
              <Text style={styles.pageSubtitle}>내 정보를 바탕으로 견적을 받습니다.</Text>
            </View>


            <View style={styles.listContainer}>

              {/* 필터 버튼 */}
              <View style={styles.filterButtonContainer}>
                <TouchableOpacity style={styles.filterButton}>
                  <Image source={require('../../assets/filter.png')} style={styles.filterIcon} />
                  <Text style={styles.filterText}>필터</Text>
                </TouchableOpacity>
              </View>

              {/* 견적 리스트 (카드들) */}
              <View style={styles.cardList}>

                {/* 견적 대기 중 */}
                <EstimateCard 
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
                />

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
                    companyCount: 5
                  }}
                />

                {/* 이사 진행 중 */}
                <EstimateCard 
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
                />
              
                {/* 완료된 이사 */}
                <EstimateCard 
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
                />

                { /* 취소된 이사 */}
                <EstimateCard 
                  status="cancelled"
                  date="2026.03.02"
                  locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                  timelineStep={0}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 오른쪽 사이드 패널 (절대위치) */}
        <View style={styles.sideColumn}>
          <SidePanel />
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
  },
  pageContent: {
    width: '90%', // 반응형을 위해 퍼센트 사용하되
    maxWidth: 1600, // 사이드패널 공간 확보를 위해 넓게 잡음
    paddingTop: 80,
    position: 'relative', // 사이드패널 배치를 위한 기준
    alignItems: 'center',
    flexDirection: 'column',
  },
  
  // 타이틀 섹션
  titleContainer: {
    width: 700, 
    marginBottom: 50,
    flexDirection: 'column',
    alignItems: 'flex-start',
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

  listContainer: {
    width: 700,
    alignSelf: 'center',
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
    borderColor: '#B5B5B5',
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
    gap: 20, 
  },

  // 오른쪽 컬럼
  sideColumn: {
    position: 'absolute',
    right: 100,
    top: 170, 
    width: 307,
  }
});