import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { BackendImage } from '../utils/firebase';
import ResultCard from '../components/ResultCard';
import EstimateCard from '../components/EstimateCard';

interface ResultProps {
  data: BackendImage[];
}

export default function Result({ data }: ResultProps) {
  // 프론트에서 전달받은 이미지 데이터 리스트
  const results = data.map((img, index) => ({
    id: index.toString(),
    imageSource: { uri: img.image_url },
    items: [
      // 임시 더미 데이터 (시각적 확인용)
      { name: '스마트 침대', option: '킹사이즈 / 프레임 포함', count: 1 },
      { name: '원목 책상', option: '1200x600 / 오크', count: 1 },
      { name: '사무용 의자', option: '블랙 / 헤드레스트', count: 2 },
    ], 
  })); 

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* Main Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* Header */}
          <View style={commonStyles.header}>
            <Text style={commonStyles.logoText}>이삿짐</Text>
            <View style={commonStyles.headerRight}>
              <TouchableOpacity>
                <Text style={commonStyles.mypageText}>Mypage</Text>
              </TouchableOpacity>
              <TouchableOpacity style={commonStyles.loginButton}>
                <Text style={commonStyles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 메인 섹션 */}
          <View style={commonStyles.mainSection}>
            <View style={commonStyles.mainContent}>
              <Text style={commonStyles.mainTitle}>AI 결과 확인하기</Text>
              <Text style={commonStyles.mainSubtitle}>이미지 분석 결과</Text>
            </View>
          </View>

          {/* 구분선 */}
          <View style={styles.divider}/>

          {/* 결과 섹션 컨테이너 */}
          <View style={styles.resultSectionContainer}>
            
            {results.map((result) => ( // 객체 이름을 result로 설정
              <ResultCard key={result.id} data={result} />
            ))}

          </View>

          {/* 견적표 카드 추가 */}
          <EstimateCard />

          {/* footer */}
          <View style={[commonStyles.footer, { display: 'none',} ]}>
            <View style={commonStyles.footerLine} />
            <Text style={commonStyles.footerLogo}>Site name</Text>

            <View style={commonStyles.footerLinksRow}>
              <View style={commonStyles.footerColumn}>
                <Text style={commonStyles.footerTopic}>Topic</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
              </View>
              <View style={commonStyles.footerColumn}>
                <Text style={commonStyles.footerTopic}>Topic</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
              </View>
              <View style={commonStyles.footerColumn}>
                <Text style={commonStyles.footerTopic}>Topic</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
                <Text style={commonStyles.footerPage}>Page</Text>
              </View>
            </View>

            <View style={commonStyles.socialIcons}>
              {[1, 2, 3, 4].map((i: number) => (
                <View key={i} style={commonStyles.socialIconPlaceholder} />
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    position: 'absolute', 
    left: 0, 
    right: 0, 
    top: 453, 
    height: 26, 
    backgroundColor: '#F7F7F7'
  },

  resultSectionContainer: {
    marginTop: 150,
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingBottom: 100,
    paddingHorizontal: 80, // 헤더/푸터와 맞추기 위해 패딩 추가
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 70,
    columnGap: 60,
  },
});
