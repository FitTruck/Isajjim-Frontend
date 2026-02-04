import { useState, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { BACKEND_DOMAIN } from '../utils/Server';
import LeftCard from '../components/ResultPage/LeftCard';
import NextBtn3 from '../components/ResultPage/NextBtn3';
import Header from '../components/common/Header';
import Space3D from '../components/Space/Space3D';
import { Ionicons } from '@expo/vector-icons';
import { SimulationFurniture, SimulationTruckResult } from '../types/simulation';
import MyTouch from "../components/common/MyTouch";
import { useEstimate } from '../context/EstimateContext';

// app.tsx로부터 전달받을 함수의 자료형 정의
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function Result({ navigation }: Props) {
  const { requestData } = useEstimate();

  // Context에서 데이터 추출
  const data = requestData?.images || [];
  const estimateId = requestData?.estimateId;
  const analysisResult = requestData?.analysisResult;
  const truckInfo = requestData?.truckInfo;

  const onNavigateNext = () => {
    navigation.navigate('MyEstimate');
  };
  // results: ResultCard컴포넌트의 속성으로 전달할 값임
  const [results, setResults] = useState<any[]>([]);

  const [updateStatus, setUpdateStatus] = useState<'prev' | 'updating' | 'done'>('prev');
  const [isSpaceModalVisible, setIsSpaceModalVisible] = useState(false);
  const [isSimulationPlaying, setIsSimulationPlaying] = useState(false);
  // 시뮬레이션에서 계산된 트럭 정보
  const [simulationTrucks, setSimulationTrucks] = useState<SimulationTruckResult[]>([]);

  // 첫 실행 시에 자동 실행됨.
  useEffect(() => {
    if (!requestData) {
      console.log('저장소에 데이터가 없음');
      return;
    }

    if (analysisResult && analysisResult.data.images) {
      // mappedResultCard : ResultCard에 필요한 이미지와 content객체
      const mappedResultCard = analysisResult.data.images.map((imgResult: any, i: number) => ({
        // main에서 전달받은 이미지 url과 width, height 정보
        // data[i]가 존재하는지 확인
        image: data[i] ? {
          localUri: data[i].uri || data[i].localUri,
          width: data[i].width,
          height: data[i].height,
        } : null,
        // furnitureList : userselect에서 전달받은 가구 정보
        // V2.5: 확장된 가구 데이터 (ply_url, width, depth, height, volume)
        contents: imgResult.furnitureList ? imgResult.furnitureList.map((f: any) => ({
          furnitureId: f.furnitureId,
          label: f.label,
          type: f.type,
          quantity: f.quantity,
          // V2.5 추가 필드
          width: f.width || 0,      // mm
          depth: f.depth || 0,      // mm
          height: f.height || 0,    // mm
          volume: f.volume || 0,    // m³
          ply_url: f.plyUrl || null,  // GCS PLY URL (백엔드: plyUrl)
        })) : []
      }));
      setResults(mappedResultCard);
      // 트럭 정보는 시뮬레이션(Space3D)에서 계산되어 onTrucksChange 콜백으로 전달됨

    } else {
      Alert.alert("오류", "분석결과를 불러올 수 없습니다.");
    }
  }, [requestData]); //이 값이 바뀔 때마다 useEffect 실행되는 거임.

  // 시뮬레이션용 가구 목록 (모든 이미지의 가구 합침)
  const simulationFurniture = useMemo((): SimulationFurniture[] => {
    if (!results || results.length === 0) {
      console.log('[시뮬레이션] results가 비어있음');
      return [];
    }

    console.log('[시뮬레이션] results:', results);
    console.log('[시뮬레이션] 전체 가구 목록:', results.flatMap(r => r.contents));

    const furniture = results.flatMap((result) =>
      result.contents
        .filter((c: any) => c.ply_url && c.quantity > 0)  // PLY가 있고 quantity > 0인 것만
        .map((c: any): SimulationFurniture => ({
          furnitureId: c.furnitureId,
          label: c.label,
          type: c.type,
          quantity: c.quantity,
          width: c.width,
          depth: c.depth,
          height: c.height,
          volume: c.volume,
          ply_url: c.ply_url,
        }))
    );

    console.log('[시뮬레이션] PLY가 있는 가구:', furniture);
    return furniture;
  }, [results]);

  const handleUpdateQuantity = async (furnitureId: number, newQuantity: number) => {
    if (!estimateId) return;
    setResults(prev => prev.map(result => ({
      ...result,
      contents: result.contents.map((item: any) =>
        item.furnitureId === furnitureId ? { ...item, quantity: newQuantity } : item
      )
    })));

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
        // 트럭 정보는 시뮬레이션(Space3D)에서 자동 재계산됨
        // 업데이트 상태를 done으로 변경
        setUpdateStatus('done');

      } else {
        // 실패 시 처리 : "견적서"글자 옆에 "견적서 업데이트 실패" 띄우도록 만드는 것도 고려해야함.
        Alert.alert("업데이트 실패", resultOfUpdate.message || "알 수 없는 오류");
        setUpdateStatus('prev'); // 실패 시 상태 초기화
      }
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "서버 통신 중 오류가 발생했습니다.");
      setUpdateStatus('prev'); // 에러 시 상태 초기화
    }
  };

  const handleNextStep = () => {
    onNavigateNext();
  }

  const handleSimulationComplete = () => {
    setIsSimulationPlaying(false);
  };

  // 슬라이더 로직
  const scrollRef = useRef<ScrollView>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  const handleScroll = (direction: 'next' | 'prev') => {
    if (!scrollRef.current) return;

    const PAGE_WIDTH = 970;
    let newIndex = scrollIndex;

    if (direction === 'next') {
      if (scrollIndex < results.length - 1) {
        newIndex = scrollIndex + 1;
      }
    } else {
      if (scrollIndex > 0) {
        newIndex = scrollIndex - 1;
      }
    }

    if (newIndex !== scrollIndex) {
      scrollRef.current.scrollTo({ x: newIndex * PAGE_WIDTH, animated: true });
      setScrollIndex(newIndex);
    }
  };

  // 시뮬레이션 트럭 결과 콜백
  const handleTrucksChange = (trucks: SimulationTruckResult[]) => {
    setSimulationTrucks(trucks);
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={commonStyles.scrollContent}
        stickyHeaderIndices={[0]}
      >
        {/* Header */}
        <Header />

        {/* Main Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* 왼쪽 및 오른쪽 컨테이너 */}
          <View style={styles.leftrightContainer}>

            {/* 왼쪽 컨테이너 */}
            <View style={styles.leftContainer}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
              >
                {/* 분석 카드 */}
                {/* results -> 모든 항목 변경 : results로 바꿔야함, 바꿀 때 results 변수 자체명도 바뀌니까 주석처리 같이 해야함. */}
                {results.map((result, index) => (
                  <View key={index} style={{ width: 970, alignItems: 'center' }}>
                    <LeftCard
                      image={result.image}
                      items={result.contents}
                      onQuantityChange={handleUpdateQuantity}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* 네비게이션 버튼 */}
              {scrollIndex > 0 && (
                <MyTouch
                  style={styles.arrowButtonLeft}
                  onPress={() => handleScroll('prev')}
                >
                  <Ionicons name="chevron-back" size={40} color="#333" />
                </MyTouch>
              )}
              {scrollIndex < results.length - 1 && (
                <MyTouch
                  style={styles.arrowButtonRight}
                  onPress={() => handleScroll('next')}
                >
                  <Ionicons name="chevron-forward" size={40} color="#333" />
                </MyTouch>
              )}


              {/* 페이지 인디케이터 (Dots) */}
              <View style={styles.paginationContainer}>
                {results.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      scrollIndex === index && styles.activeDot
                    ]}
                  />
                ))}
              </View>

            </View>

            {/* 오른쪽 컨테이너 */}
            <View style={[
              styles.rightContainer,
              isSpaceModalVisible && { position: 'relative', zIndex: 10000 }
            ]}>
              {/* 3D 시뮬레이션 - 전체화면 스타일 분리 적용 */}
              <View style={isSpaceModalVisible ? styles.expandedContainer : styles.space3DContainer}>
                <Space3D
                  furniture={simulationFurniture}
                  autoPlay={isSimulationPlaying}
                  onAnimationComplete={handleSimulationComplete}
                  onTrucksChange={handleTrucksChange}
                />
                <MyTouch
                  style={isSpaceModalVisible ? styles.closeButtonFixed : styles.expandButton}
                  onPress={() => setIsSpaceModalVisible(!isSpaceModalVisible)}
                >
                  <Ionicons name={isSpaceModalVisible ? "close" : "expand"} size={isSpaceModalVisible ? 30 : 20} color={isSpaceModalVisible ? "#333333" : "#555"} />
                </MyTouch>
              </View>

              {/* 다음 단계 버튼 */}
              <NextBtn3
                data={simulationTrucks.length > 0
                  ? simulationTrucks
                  : (truckInfo ? [truckInfo] : [{ type: '', quantity: 0 }])}
                status={updateStatus}
                onNavigateNext={handleNextStep}
              />

            </View>

          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  leftrightContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 150,
    gap: 100,
    marginLeft: 100,
    height: 600
  },

  leftContainer: {
    width: 970,
    paddingBottom: 100,
    paddingHorizontal: 0,
    position: 'relative', // For arrow positioning

    // 내부 요소
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 0,
  },
  rightContainer: {
    width: 305,
    zIndex: 10,
  },
  space3DContainer: {
    width: '100%',
    height: 307,
    marginBottom: 5,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D8D8D8',
    position: 'relative', // 버튼 배치 때문에 넣음
  },
  expandedContainer: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw' as any,
    height: '100vh' as any,
    zIndex: 9999,
    margin: 0,
    borderRadius: 0,
    backgroundColor: '#020617',
  },
  expandButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 4,
    zIndex: 10,
  },
  closeButtonFixed: {
    position: 'absolute',
    top: 80,
    right: 40,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // 왼쪽 슬라이더 버튼 스타일
  arrowButtonLeft: {
    position: 'absolute',
    left: -70,
    top: '45%', // 카드 높이의 중간
    width: 50,
    height: 50,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  // 오른쪽 슬라이더 버튼 스타일
  arrowButtonRight: {
    position: 'absolute',
    right: -70,
    top: '45%',
    width: 50,
    height: 50,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F5F5',

    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // 슬라이드 도트
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    backgroundColor: '#F0893B', // 브랜드 컬러
    width: 24, // 활성화된 닷은 길게
  },
});
