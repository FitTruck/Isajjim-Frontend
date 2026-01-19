import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { commonStyles } from '../styles/commonStyles';

const mockResults = [
  {
    id: 1,
    imageSource: require('../../assets/2019030600071_1.jpg'),
    // 메타데이터 예시: 이미지 원본 크기
    width: 621,
    height: 369,
    items: [
      { name: '침대', option: '킹사이즈', count: 1 }
    ]
  },
  {
    id: 2,
    imageSource: require('../../assets/Dining_table_for_two.jpg'),
    // 메타데이터 예시: 세로가 긴 이미지
    width: 300,
    height: 400,
    items: [
      { name: '식탁', option: '2인용', count: 1 },
      { name: '의자', option: '기본', count: 2 }
    ]
  }
];

// 결과 카드
const ResultCard = ({ data }: { data: any }) => {

  // 값이 존재 한다면 비율 계산. 존재하지 않는다면 1.4로 고정
  const aspectRatio = (data.width && data.height)
    ? data.width / data.height 
    : 1.4; 

  return (
    <View style={styles.resultCardContainer}>

      {/* 동적 이미지 */}
      <Image source={data.imageSource} style={[styles.cardImage, { aspectRatio }]}/>

      <View style={styles.resultCardContent}>
        {data.items.map((item: any, index: number) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemDetailContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>{item.option}</Text>
            </View>
            <View>
              <TouchableOpacity>
                <Image source={require('../../assets/Minus.png')} style={styles.minus} />
              </TouchableOpacity>
              <Text style={styles.resultCardNumber}>{item.count}</Text>
              <TouchableOpacity>
                <Image source={require('../../assets/Plus.png')} style={styles.plus} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function Result() {
  // 프론트에서 전달받은 이미지 데이터 리스트 (현재는 Mock 데이터 사용)
  // 배열 형태이므로 개수 제한 없이 무한히 받을 수 있습니다.
  const results = mockResults; 

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
    alignItems: 'center',
    paddingBottom: 100,
  },

  resultCardContainer: {
    width: 621,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth:1,
    borderColor:'#EBEBEB',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 40, // 카드 간 간격 추가
  },
  cardImage: {
    width: '100%',
    height: undefined, // 높이를 undefined로 설정하여 aspectRatio에 따라 결정되도록 함
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  resultCardContent: {
    width: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    textAlign: 'left',
    paddingTop: 29,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemDetailContainer: {
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  itemSubtitle: {
    fontSize: 16,
    color: '#828282',
  },
  minus: {
    width: 24,
    height: 24,
  },
  plus: {
    width: 24,
    height: 24,
  },
  resultCardNumber: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 10,
  },
});