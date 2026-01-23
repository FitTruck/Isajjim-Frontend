import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { UploadedImage, BACKEND_DOMAIN } from '../utils/Server';
import ResultCard from '../components/ResultCard';
import EstimatedCard from '../components/EstimatedCard';
import Header from '../components/Header';

// app.tsx로부터 전달받을 함수의 자료형 정의
interface ResultProps {
  data: UploadedImage[];
  estimateId: number | null;
  ResultOfUserSelect: any;
  onGoHome: () => void;
}
// data : main에서 전달받은 이미지 url과 width, height 정보
// estimateId : main에서 백엔드에게 받은 견적서id
// ResultOfUserSelect : userselect에서 받은 resultCard에 들어갈 값과 estimateCard에 들어갈 값  
export default function Result({ data, estimateId, ResultOfUserSelect, onGoHome }: ResultProps) {
  // results: ResultCard컴포넌트의 속성으로 전달할 값임
  const [results, setResults] = useState<any[]>([]); 
  
  // 견적서 컴포넌트에 전달할 값임
  const [estimateData, setEstimateData] = useState<any>({}); // 딕셔너리값임
  const [updateStatus, setUpdateStatus] = useState<'prev' | 'updating' | 'done'>('idle');

  // 첫 실행 시에 자동 실행됨.
  useEffect(() => {
    if (ResultOfUserSelect.data.images) {
      // mappedResultCard : ResultCard에 필요한 이미지와 content객체
      const mappedResultCard = ResultOfUserSelect.data.images.map((imgResult: any, i: number) => ({
        // main에서 전달받은 이미지 url과 width, height 정보
        image: { 
          uri: data[i].uri,
          width: data[i].width,
          height: data[i].height,
        },
        // furnitureList : userselect에서 전달받은 가구 정보
        contents: imgResult.furnitureList ? imgResult.furnitureList.map((f: any) => ({
          furnitureId: f.furnitureId,
          label: f.label, 
          type: f.type, 
          quantity: f.quantity,
        })) : []
      }));
      setResults(mappedResultCard);
      
      if (ResultOfUserSelect.data.items) {
        setEstimateData({
          truckType: ResultOfUserSelect.data.items.itemType,
          truckQuantity: ResultOfUserSelect.data.items.quantity,
        });
      }

    } else {
      Alert.alert("오류", "분석결과를 불러올 수 없습니다.");
    }
  }, [ResultOfUserSelect]); //이 값이 바뀔 때마다 useEffect 실행되는 거임.

  // ResultCard컴포넌트를 보면 onQuantityChange라는 것이 실행되면 handleUpdataQuantity 함수가 실행됨.
  // ResultCard.tsx에서 furnitureId와 newQuantity값을 받아온 것임.
  const handleUpdateQuantity = async (furnitureId: number, newQuantity: number) => {
    if (!estimateId) return; // 견적서id가 없으면 리턴(안전장치)
    
    // 프론트에서 즉각 변경하는 부분 : results의 값을 변경하는 로직임. results는 useState로 만든 값이므로 results의 값이 바뀌면, 자동으로 results를 쓰는 모든 컴포넌트를 다시 그림. >> ResultCard 컴포넌트의 속성이 즉각적으로 변경됨.
    setResults(prev => prev.map(result => ({ // 기존의 results를 써서 results를 수정하겠다는 뜻임. result는 results중에서 하나씩 가져온 객체. 즉, 카드 하나에 대한 정보임.
      ...result, // "...result, contents:" 다른 것들은 그대로 놔두고 contents만 바꾼다. 
      contents: result.contents.map((item: any) => // 카드 이미지에 인식된 하나의 가구를 item이라 하자. 카드 하나 중에서도 아이템 하나
        item.furnitureId === furnitureId ? { ...item, quantity: newQuantity } : item 
        // item의 id가 furnitureId와 같다면 수량을 newQuantity로 바꾼다.
        // item.furnitureId 순회하면서 볼 가구들의 id
        // furnitureId : 변경할 가구의 id
        // 그것이 동일하다면 그것의 quantity를 바꿔야함. 그래서 바꿀 값으로 newQuantity를 넣음.
        // "...item, quantity: newQuantity" : item의 다른 값들은 놔두고 quantity만 newQuantity로 바꾼다.
      )
    })));

    // 프론트의 값이 변경되면, 견적서 또한 업데이트 되어야 한다. 그 동안의 status를 나타내는 변수(updateStatus)를 "updating"으로 설정!
    setUpdateStatus('updating');

    // 백엔드로 바뀐 정보를 보내는 부분
    try {
      const response = await fetch(`${BACKEND_DOMAIN}/api/v1/estimates/${estimateId}/furniture`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          furnitureId: furnitureId,
          quantity: newQuantity
        }),
      });

      // resultOfUpdate에는 트럭 타입과 수량에 대한 정보가 담겨있음.
      const resultOfUpdate = await response.json();

      if (response.ok && resultOfUpdate.code === 'OK') {
        
        setEstimateData({ // 여기서 받은 값을 견적서 컴포넌트에 전달해서 견적서 업데이트 할거임.
          truckType: resultOfUpdate.data.items.itemType,
          truckQuantity: resultOfUpdate.data.items.quantity,
        });

        // 업데이트 상태를 done으로 변경
        setUpdateStatus('done');

      } else {
        // 실패 시 처리 : "견적서"글자 옆에 "견적서 업데이트 실패" 띄우도록 만드는 것도 고려해야함.
        Alert.alert("업데이트 실패", resultOfUpdate.message || "알 수 없는 오류");
        setUpdateStatus('idle'); // 실패 시 상태 초기화
      }
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "서버 통신 중 오류가 발생했습니다.");
      setUpdateStatus('idle'); // 에러 시 상태 초기화
    }
  };


  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <Header onGoHome={onGoHome} />

      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* Main Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* 메인 섹션 */}
          <View style={commonStyles.mainSection}>
            <View style={commonStyles.mainContent}>
              <Text style={commonStyles.mainTitle}>AI 결과 확인하기</Text>
              <Text style={commonStyles.mainSubtitle}>이미지 분석 결과</Text>
            </View>
          </View>

          {/* 구분선 */}
          <View style={styles.divider}/>

          <View style={styles.resultEstimateCardContainer}>
            {/* 결과 섹션 컨테이너 */}
            <View style={styles.resultSectionContainer}>
              
              {results.map((result, index) => (
                <ResultCard
                  key={index}
                  image={result.image}
                  items={result.contents}
                  onQuantityChange={handleUpdateQuantity}
                />
              ))}

            </View>

            {/* 견적표 카드 추가 */}
            <View style={styles.estimateCardContainer}>
              <EstimatedCard 
                data={estimateData} 
                status={updateStatus} 
              />
            </View>
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
  resultEstimateCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultSectionContainer: {
    marginTop: 150,
    width: '75%',
    maxWidth: 1740,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingBottom: 100,
    paddingHorizontal: 0, // 화면이 아주 작을 때를 위한 최소한의 여백만 남김
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 70,
    columnGap: 70,
  },

  estimateCardContainer: {
    marginTop: 150, // resultSectionContainer margin과 맞춤
    width: '25%',
    position: 'relative',
    height: 'auto',
    marginBottom: 200, 
    alignItems: 'center',
  },
});
