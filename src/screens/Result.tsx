import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { UploadedImage, BACKEND_DOMAIN } from '../utils/Server';
import ResultCard from '../components/ResultCard';
import EstimateCard from '../components/EstimateCard';

// app.tsx로부터 전달받을 함수의 자료형 정의
interface ResultProps {
  data: UploadedImage[];
  estimateId: number | null;
  resultData: any;
  onGoHome: () => void;
}

export default function Result({ data, estimateId, resultData, onGoHome }: ResultProps) {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // resultData 매핑 로직
    const mappedResults = (resultData?.data?.images) 
    ? resultData.data.images.map((img: any) => ({
        id: img.imageId || Math.random(),
        image: { uri: img.imageUrl },
        width: 100, 
        height: 100,
        items: img.furnitureList ? img.furnitureList.map((f: any) => ({
          id: f.furnitureId,
          name: f.label, 
          option: f.type, 
          count: f.count
        })) : []
      }))
    : data.map(img => ({
        id: img.id,
        image: { uri: img.uri },
        width: img.width,
        height: img.height,
        items: []
      }));
      setResults(mappedResults);
  }, [data, resultData]);

  const handleUpdateQuantity = async (furnitureId: number, delta: number) => {
    if (!estimateId) return;

    // 1. 현재 상태에서 해당 가구 찾기 및 낙관적 업데이트 준비 (옵션)
    // 여기서는 간단히 서버 요청 후 업데이트 방식을 사용하거나, 
    // 서버가 변경된 전체 리스트를(혹은 견적을) 준다고 가정하고 처리합니다.
    
    // 타겟 찾기
    let currentCount = 0;
    results.forEach(img => {
      img.items.forEach((item: any) => {
        if (item.id === furnitureId) currentCount = item.count;
      });
    });

    const newCount = currentCount + delta;
    if (newCount < 0) return; // 0개 미만 방지

    try {
      // furniture에는 furnitureId로 처리해야함
      const response = await fetch(`${BACKEND_DOMAIN}/api/v1/estimates/${estimateId}/furniture`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          furnitureId: furnitureId,
          count: newCount
        }),
      });

      const json = await response.json();

      if (response.ok && json.code === 'OK') {
        // 성공 시 서버에서 받은 최신 데이터로 업데이트
        // 만약 서버가 전체 데이터를 다시 준다면 setResults로 매핑하여 업데이트
        // 여기서는 예시로 로컬 상태만 업데이트하거나, 서버 응답 구조에 따라 처리가 필요합니다.
        // 현재는 로컬 상태 업데이트로 구현:
        setResults(prev => prev.map(img => ({
          ...img,
          items: img.items.map((item: any) => 
            item.id === furnitureId ? { ...item, count: newCount } : item
          )
        })));
      } else {
        Alert.alert("업데이트 실패", json.message || "알 수 없는 오류");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "서버 통신 중 오류가 발생했습니다.");
    }
  };
  // estimateCard에 쓸거
  const estimateCardData = {
    truckType: resultData.truckType,
    truckQuantity: resultData.quantity,
    boxType: resultData.boxType,
    boxQuantity: resultData.quantity,
  }


  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* Main Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* Header */}
          <View style={commonStyles.header}>
            <TouchableOpacity onPress={onGoHome}>
              <Text style={commonStyles.logoText}>이삿찜</Text>
            </TouchableOpacity>
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
              <ResultCard 
                key={result.id} 
                data={result} 
                onQuantityChange={handleUpdateQuantity}
              />
            ))}

          </View>

          {/* 견적표 카드 추가 */}
          <View style={styles.estimateCardContainer}>
            <EstimateCard />
          </View>

          {/* footer */}
          <View style={commonStyles.footer}>
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
    maxWidth: 1740,
    alignSelf: 'center',
    justifyContent: 'center', // 가로 방향 중앙 정렬
    paddingBottom: 100,
    paddingHorizontal: 20, // 화면이 아주 작을 때를 위한 최소한의 여백만 남김
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 70,
    columnGap: 70,
  },

  estimateCardContainer: {
    marginTop: 200,
    width: '100%',
    position: 'relative',
    height: 613, // EstimateCard의 높이(613px)만큼 공간 확보
    marginBottom: 200, // footer와의 간격을 위해 추가
  },
});
