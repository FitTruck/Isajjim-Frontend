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
      {/* Header */}
      <Header />

      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* 메인 Wrapper */}
        <View style={styles.mainWrapper}>
          
          {/* Page Content: 기준점 */}
          <View style={styles.pageContent}>

            {/* 중앙정렬 컨테이너*/}
            <View style={styles.centerContainer}>

              {/* 타이틀 섹션 */}
              <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>내 견적</Text>
                <View style={styles.subtitleRow}>
                  <View style={styles.subtitleBar} />
                  <Text style={styles.pageSubtitle}>업체에게 받은 견적서를 확인하세요</Text>
                </View>
              </View>

              {/* 필터 버튼 */}
              <View style={styles.filterButtonContainer}>
                <TouchableOpacity style={styles.filterButton}>
                  <Image source={require('../../assets/filter.png')} style={styles.filterIcon} />
                  <Text style={styles.filterText}>필터</Text>
                </TouchableOpacity>
              </View>

              {/* 견적 리스트 (카드들) */}
              <View style={styles.cardList}>
                {/* Card 1: 견적 받는 중 */}
                <EstimateCard 
                  status="active"
                  date="2026.03.02"
                  locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                  timelineStep={2} // Estimate
                  quoteInfo={{
                    isLowest: true,
                    price: '820,000원',
                    rating: '4.9',
                    tags: ['사다리차', '엘레베이터'],
                    companyCount: 5
                  }}
                />

                {/* Card 2: 이사 진행 중 */}
                <EstimateCard 
                  status="moving"
                  date="2026.03.02" 
                  locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                  timelineStep={3} // Confirmed/Moving
                  quoteInfo={{
                    isLowest: false, // Normal
                    price: '1,030,000원',
                    rating: '3.5',
                    tags: ['사다리차', '엘레베이터'],
                    companyCount: 5
                  }}
                />

                {/* Card 3: 취소된 이사 */}
                <EstimateCard 
                  status="cancelled"
                  date="2026.03.02"
                  locations={{ start: '서울시 강남구', end: '경기도 성남시' }}
                  timelineStep={1}
                />
              </View>
            </View>

            {/* 오른쪽 사이드 패널 (절대위치) */}
            <View style={styles.sideColumn}>
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
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
  },
  pageContent: {
    width: '90%', // 반응형을 위해 퍼센트 사용하되
    maxWidth: 1600, // 사이드패널 공간 확보를 위해 넓게 잡음
    paddingTop: 80,
    position: 'relative', // 사이드패널 배치를 위한 기준
  },
  
  // 중앙 컨텐츠 컨테이너
  centerContainer: {
    width: 900, // 리스트 너비에 맞춤
    alignSelf: 'center', // 화면 중앙 정렬
  },

  titleSection: {
    marginBottom: 60,
    width: '100%', 
    // left : 300 // Remove manual offset
  },
  pageTitle: {
    fontSize: 60,
    fontWeight: '700',
    color: '#3D3D3A',
    marginBottom: 20,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 22, 
  },
  subtitleBar: {
    width: 7,
    height: 27,
    backgroundColor: '#FADDC3',
    marginRight: 15,
    position: 'absolute',
    left: -22,
  },
  pageSubtitle: {
    fontSize: 20,
    color: '#62625D',
    fontWeight: '400',
  },

  filterButtonContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  filterButton: {
    width: 110,
    height: 40,
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
    fontSize: 20,
    fontWeight: '500',
    color: '#434343',
    marginRight: 5,
    textAlign: 'center',
    marginBottom: 2,
  },
  filterIcon: {
    width: 21,
    height: 21,
    opacity: 0.6,
  },
  
  cardList: {
    gap: 20, 
  },

  // 오른쪽 컬럼
  sideColumn: {
    position: 'absolute',
    right: 0,
    top: 250, // 타이틀(약100) + 마진(60) + 필터(47+20) = 대략 227+a. 눈대중으로 조정
    width: 307,
  }
});