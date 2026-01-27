import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image as RNImage } from "react-native";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/common/Header";

// app.tsx로부터 전달받을 함수의 자료형 정의
interface CompareProps {
  onGoHome: () => void;
}

export default function Compare({ onGoHome }: CompareProps) {
  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <Header onGoHome={onGoHome} />

      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* 메인 Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* 메인섹션 */}
          <View style={commonStyles.mainSection}>
            <Text style={commonStyles.mainTitle}>업체별 견적 비교</Text>
            <Text style={commonStyles.mainSubtitle}>업체와 연결하기</Text>
          </View>

          {/* 견적 비교 섹션 */}
          <View style={styles.compareSection}>
            
            <View style={styles.filterContainer}>
              <Text style={styles.searchFilterTitle}>상세검색</Text>

              {/* 지역 필터 */}
              <View style={styles.filterRow}>
                <View style={styles.filterLabelCol}>
                  <Text style={styles.filterLabelText}>지역</Text>
                </View>
                <View style={styles.filterContentCol}>
                  <View style={[styles.filterChip, { backgroundColor: 'rgba(202, 182, 159, 0.30)', width: 50 }]}>
                    <Text style={styles.filterChipText}>서울</Text>
                  </View>
                  <View style={[styles.filterChip, { backgroundColor: 'rgba(202, 182, 159, 0.30)', width: 58 }]}>
                    <Text style={styles.filterChipText}>종로구</Text>
                  </View>
                </View>
              </View>

              {/* 평점 필터 */}
              <View style={styles.filterRow}>
                <View style={styles.filterLabelCol}>
                  <Text style={styles.filterLabelText}>평점</Text>
                </View>
                <View style={styles.filterContentCol}>
                  <View style={[styles.filterChip, { backgroundColor: 'rgba(202, 182, 159, 0.30)', width: 86 }]}>
                    <Text style={styles.filterChipText}>별점높은순</Text>
                  </View>
                  <View style={[styles.filterChip, { backgroundColor: '#ffffff', width: 86 }]}>
                    <Text style={styles.filterChipText}>별점낮은순</Text>
                  </View>
                </View>
              </View>

              {/* 가격 필터 */}
              <View style={styles.filterRow}>
                <View style={styles.filterLabelCol}>
                  <Text style={styles.filterLabelText}>가격</Text>
                </View>
                <View style={styles.filterContentCol}>
                  <View style={[styles.filterChip, { backgroundColor: 'rgba(202, 182, 159, 0.30)', width: 86 }]}>
                    <Text style={styles.filterChipText}>가격높은순</Text>
                  </View>
                  <View style={[styles.filterChip, { backgroundColor: '#ffffff', width: 86 }]}>
                    <Text style={styles.filterChipText}>가격낮은순</Text>
                  </View>
                </View>
              </View>

              {/* 경력 필터 */}
              <View style={[styles.filterRow, { borderBottomWidth: 1 }]}>
                <View style={styles.filterLabelCol}>
                  <Text style={styles.filterLabelText}>경력</Text>
                </View>
                <View style={styles.filterContentCol}>
                   <View style={[styles.filterChip, { backgroundColor: 'rgba(250, 249, 245, 0.30)', width: 69 }]}>
                    <Text style={styles.filterChipText}>1년 이하</Text>
                  </View>
                  <View style={[styles.filterChip, { backgroundColor: 'rgba(202, 182, 159, 0.30)', width: 61 }]}>
                    <Text style={styles.filterChipText}>1~3년</Text>
                  </View>
                  <View style={[styles.filterChip, { backgroundColor: '#ffffff', width: 67 }]}>
                    <Text style={styles.filterChipText}>5~10년</Text>
                  </View>
                  <View style={[styles.filterChip, { backgroundColor: '#ffffff', width: 80 }]}>
                    <Text style={styles.filterChipText}>10년 이상</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 업체 목록 */}
            <View style={styles.companyListContainer}>
              
              {/* Company 1 */}
              <View style={styles.companyCard}>
                <Text style={styles.companyName}>백마익스프레스</Text>
                <RNImage source={require('../../assets/back.png')} style={styles.companyImage} />
                <Text style={styles.companyInfo}>
                  이메일 : Back’sExpress@gmail.com{'\n'}
                  문의 : 010-1234-5678{'\n'}
                  위치 : 강원도 춘천시 강원대학길 1 (효자동) 강원대학교 춘천캠퍼스{'\n'}
                  경력 : 20년{'\n'}
                  별점 : ⭐⭐⭐⭐⭐
                </Text>
                <Text style={styles.companyPrice}>200,000원 ~</Text>
                <TouchableOpacity style={[styles.connectButton, { opacity: 0.87 }]}>
                  <Text style={styles.connectButtonText}>연결하기</Text>
                </TouchableOpacity>
              </View>

              {/* Company 2 */}
              <View style={styles.companyCard}>
                <Text style={styles.companyName}>이사해드림</Text>
                <RNImage source={require('../../assets/smallisa.png')} style={styles.companyImage} />
                <Text style={styles.companyInfo}>
                  이메일 : isaHae@naver.com{'\n'}
                  문의 : 010-1234-5678{'\n'}
                  위치 : 서울특별시 종로구 창신동 123-456{'\n'}
                  경력 : 20년{'\n'}
                  별점 : ⭐⭐⭐⭐⭐
                </Text>
                <Text style={styles.companyPrice}>200,000원 ~</Text>
                <TouchableOpacity style={styles.connectButton}>
                  <Text style={styles.connectButtonText}>연결하기</Text>
                </TouchableOpacity>
              </View>

              {/* Company 3  */}
              <View style={styles.companyCard}>
                <Text style={styles.companyName}>2424</Text>
                <RNImage source={require('../../assets/2424.png')} style={styles.companyImage} />
                <Text style={styles.companyInfo}>
                  이메일 : Back’sExpress@gmail.com{'\n'}
                  문의 : 010-1234-5678{'\n'}
                  위치 : 강원특별자치도 춘천시 효자동 123-456{'\n'}
                  경력 : 20년{'\n'}
                  별점 : ⭐⭐⭐⭐⭐
                </Text>
                <Text style={styles.companyPrice}>200,000원 ~</Text>
                <TouchableOpacity style={styles.connectButton}>
                  <Text style={styles.connectButtonText}>연결하기</Text>
                </TouchableOpacity>
              </View>

               {/* Company 4 */}
               <View style={styles.companyCard}>
                <Text style={styles.companyName}>개인 용달</Text>
                <RNImage source={require('../../assets/개인용달.png')} style={styles.companyImage} />
                <Text style={styles.companyInfo}>
                  이메일 : Back’sExpress@gmail.com{'\n'}
                  문의 : 010-1234-5678{'\n'}
                  위치 : 강원특별자치도 춘천시 효자동 123-456{'\n'}
                  경력 : 20년{'\n'}
                  별점 : ⭐⭐⭐⭐⭐
                </Text>
                <Text style={styles.companyPrice}>200,000원 ~</Text>
                <TouchableOpacity style={styles.connectButton}>
                  <Text style={styles.connectButtonText}>연결하기</Text>
                </TouchableOpacity>
              </View>

               {/* Company 5 */}
               <View style={styles.companyCard}>
                <Text style={styles.companyName}>김이사</Text>
                <RNImage source={require('../../assets/김이사.png')} style={styles.companyImage} />
                <Text style={styles.companyInfo}>
                  이메일 : Back’sExpress@gmail.com{'\n'}
                  문의 : 010-1234-5678{'\n'}
                  위치 : 강원특별자치도 춘천시 효자동 123-456{'\n'}
                  경력 : 20년{'\n'}
                  별점 : ⭐⭐⭐⭐⭐
                </Text>
                <Text style={styles.companyPrice}>200,000원 ~</Text>
                <TouchableOpacity style={styles.connectButton}>
                  <Text style={styles.connectButtonText}>연결하기</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </View>
      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  compareSection: {
    marginTop: 80,
    width: '100%', 
    alignItems: 'center',
    paddingBottom: 100
  },
  
  // 검색 필터 스타일
  filterContainer: {
    width: 838,
    marginBottom: 100, // 간격
  },
  searchFilterTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3D3D3A',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  filterRow: {
    flexDirection: 'row',
    width: '100%',
    height: 40,
    borderTopWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#E5E5E5',
  },
  filterLabelCol: {
    width: 114,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterLabelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3D3D3A',
  },
  filterContentCol: {
    width: 724,
    height: '100%',
    backgroundColor: '#ffffffff',
    borderLeftWidth: 1,
    borderLeftColor: '#D9D9D9', // Optional implicit border
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  filterChip: {
    height: 27,
    borderRadius: 61,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(202, 182, 159, 0.3)',
    overflow: 'hidden',
  },
  filterChipText: {
    fontSize: 15,
    color: '#3D3D3A',
    fontWeight: '400',
  },

  // 업체 목록 스타일
  companyListContainer: {
    width: 1023,
    gap: 0, // Cards are stacked with borders
  },
  companyCard: {
    width: '100%',
    height: 242,
    borderTopWidth: 1,
    borderColor: '#D9D9D9',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  companyName: {
    position: 'absolute',
    left: 234,
    top: 24,
    fontSize: 24,
    fontWeight: '600',
    color: '#3D3D3A',
  },
  companyImage: {
    position: 'absolute',
    left: 17,
    top: 21,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  companyInfo: {
    position: 'absolute',
    left: 234,
    top: 62,
    width: 496,
    fontSize: 15,
    fontWeight: '500',
    color: '#3D3D3A',
    lineHeight: 20,
  },
  companyPrice: {
    position: 'absolute',
    left: 234,
    top: 187,
    fontSize: 25,
    fontWeight: '800',
    color: '#3D3D3A',
  },
  connectButton: {
    position: 'absolute',
    left: 903,
    top: 190,
    width: 91,
    height: 31,
    backgroundColor: '#F0893B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    lineHeight: 24,
  },
});