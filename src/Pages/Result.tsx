import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { BACKEND_DOMAIN } from '../utils/Server';
import { translateLabel } from '../utils/Translator';
import LeftCard from '../components/ResultPage/LeftCard';
import NextBtn3 from '../components/ResultPage/NextBtn3';
import Header from '../components/common/Header';
import Space3D from '../components/Space/Space3D';
import { ChevronLeft, ChevronRight, X, Maximize } from 'lucide-react-native';
import { SimulationFurniture, SimulationTruckResult } from '../types/simulation';
import MyTouch from "../components/common/MyTouch";
import { useEstimate } from '../context/EstimateContext';

// app.tsx로부터 전달받을 함수의 자료형 정의
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function Result({ navigation }: Props) {
  const { requestData, setRequestData, setChatStartTime } = useEstimate();

  // Context에서 데이터 추출
  const data = requestData?.images || [];
  const estimateId = requestData?.estimateId;
  const analysisResult = requestData?.analysisResult;
  const truckInfo = requestData?.truckInfo;

  const onNavigateNext = () => {
    // 채팅 시작 시간 설정 (현재 시간)
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    setChatStartTime(timeString);
    
    navigation.navigate('MyEstimate');
  };
  // results: ResultCard컴포넌트의 속성으로 전달할 값임
  const [results, setResults] = useState<any[]>([]);

  const [updateStatus, setUpdateStatus] = useState<'prev' | 'updating' | 'done'>('prev');
  const [isSpaceModalVisible, setIsSpaceModalVisible] = useState(false);
  const [isSimulationPlaying, setIsSimulationPlaying] = useState(false);
  // 시뮬레이션에서 계산된 트럭 정보
  const [simulationTrucks, setSimulationTrucks] = useState<SimulationTruckResult[]>([]);
  // 박스 수량 상태 (가구 목록과 분리)
  // 초기값은 Context에 저장된 '박스' 수량에서 가져옴
  const [boxQuantity, setBoxQuantity] = useState(() => {
    if (requestData?.boxQuantity !== undefined) return requestData.boxQuantity;
    const boxItem = requestData?.items?.find(i => i.name === '박스');
    return boxItem ? boxItem.quantity : 0;
  });

  const updateBoxContext = (qty: number) => {
    setRequestData(prev => {
      if (!prev) return prev;
      let newItems = prev.items ? [...prev.items] : [];
      const boxIndex = newItems.findIndex(i => i.name === '박스');
      
      if (boxIndex >= 0) {
          if (qty > 0) {
            newItems[boxIndex] = { ...newItems[boxIndex], quantity: qty };
          } else {
            newItems.splice(boxIndex, 1);
          }
      } else if (qty > 0) {
          newItems.push({ name: '박스', quantity: qty, category: '기타', itemType: 'BOX' });
      }
      return { ...prev, items: newItems, boxQuantity: qty };
    });
  };

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
          // 객체 중심 좌표 (이미지 위 마커 표시용)
          centerX: f.centerX,
          centerY: f.centerY,
        })) : []
      }));
      setResults(mappedResultCard);
      // 트럭 정보는 시뮬레이션(Space3D)에서 계산되어 onTrucksChange 콜백으로 전달됨

    } else {
      Alert.alert("오류", "분석결과를 불러올 수 없습니다.");
    }
  }, [analysisResult, data, estimateId]); // 값이 바뀔 때마다 useEffect 실행 (requestData 전체 의존성 제거)

  // 시뮬레이션용 가구 목록 (모든 이미지의 가구 합침)
  const simulationFurniture = useMemo((): SimulationFurniture[] => {
    if (!results || results.length === 0) {
      console.log('[시뮬레이션] results가 비어있음');
      return [];
    }

    console.log('[시뮬레이션] results:', results);

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

    // 박스 추가 - 단일 객체로 표현하고 quantity로 수량 관리
    if (boxQuantity > 0) {
      return [...furniture, {
        furnitureId: 'box',  // 고정된 ID 사용
        label: '박스',
        type: 'box',
        quantity: boxQuantity,  // 수량으로 관리
        width: 500,  // mm
        depth: 300,  // mm
        height: 350, // mm
        volume: 0.0525,
        ply_url: 'BOX_PLACEHOLDER',
      }];
    }

    return furniture;
  }, [results, boxQuantity]);

  const handleUpdateQuantity = async (furnitureId: number, newQuantity: number) => {
    if (!estimateId) return;
    setResults(prev => prev.map(result => ({
      ...result,
      contents: result.contents.map((item: any) =>
        item.furnitureId === furnitureId ? { ...item, quantity: newQuantity } : item
      )
    })));

    setUpdateStatus('updating');
    
    // results에서 해당 furnitureId를 가진 아이템 찾기
    const targetItem = results
      .flatMap(r => r.contents)
      .find((item: any) => item.furnitureId === furnitureId);
    
    if (targetItem) {
      // 한글 이름 변환
      const convertedName = translateLabel(targetItem.label); 

      // Context 업데이트
      setRequestData(prev => {
        if (!prev || !prev.items) return prev;
        
        const newItems = prev.items.map(item => {
          if (item.name === convertedName) {
            return { ...item, quantity: newQuantity }; // 수량 업데이트
          }
          return item;
        });
        
        return {
          ...prev,
          items: newItems
        };
      });
    }

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

  const handleAddBox = () => {
    const newQty = boxQuantity + 1;
    setBoxQuantity(newQty);
    updateBoxContext(newQty);
  };

  const handleRemoveBox = () => {
    if (boxQuantity > 0) {
      const newQty = boxQuantity - 1;
      setBoxQuantity(newQty);
      updateBoxContext(newQty);
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
  const handleTrucksChange = useCallback((trucks: SimulationTruckResult[]) => {
    setSimulationTrucks(trucks);

    // Context 업데이트 (RequestDetailModal 등에 반영하기 위함)
    const typeMap: {[key: string]: string} = {
      '1ton': '1톤 트럭',
      '2.5ton': '2.5톤 트럭',
      '5ton': '5톤 트럭'
    };
    
    // 트럭 종류 문자열 생성 (예: "1톤 트럭 + 5톤 트럭")
    const flatTypes: string[] = [];
    trucks.forEach(t => {
      const label = typeMap[t.type] || t.type;
      flatTypes.push(label);
    });

    // 톤수 오름차순 정렬 (1톤 -> 2.5톤 -> 5톤)
    const getTonnage = (str: string) => {
      if (str.includes('1톤')) return 1;
      if (str.includes('2.5톤')) return 2.5;
      if (str.includes('5톤')) return 5;
      return 999;
    };
    flatTypes.sort((a, b) => getTonnage(a) - getTonnage(b));

    const newTruckTypeStr = flatTypes.join(' + ');
    const newTotalQuantity = trucks.reduce((sum, t) => sum + t.quantity, 0);

    // Context 업데이트 (값이 실제로 변했을 때만 수행)
    setRequestData(prev => {
      if (!prev) return null; // 실행될 일이 거의 없겠지만 방어 코드
      
      const currentType = prev.truckInfo?.type;
      const currentQuantity = prev.truckInfo?.quantity;

      if (currentType === newTruckTypeStr && currentQuantity === newTotalQuantity) {
        return prev;
      }

      return {
        ...prev,
        truckInfo: {
          type: newTruckTypeStr,
          quantity: newTotalQuantity
        }
      };
    });
  }, [setRequestData]);

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
                  <ChevronLeft size={40} color="#F0893B" />
                </MyTouch>
              )}
              {scrollIndex < results.length - 1 && (
                <MyTouch
                  style={styles.arrowButtonRight}
                  onPress={() => handleScroll('next')}
                >
                  <ChevronRight size={40} color="#F0893B" />
                </MyTouch>
              )}


              {/* 페이지 인디케이터 (Dots) - 2개 이상일 때만 표시 */}
              {results.length > 1 && (
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
              )}

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
                  autoPlay={true}
                  onAnimationComplete={handleSimulationComplete}
                  onTrucksChange={handleTrucksChange}
                />
                <MyTouch
                  style={isSpaceModalVisible ? styles.closeButtonFixed : styles.expandButton}
                  onPress={() => setIsSpaceModalVisible(!isSpaceModalVisible)}
                >
                  {isSpaceModalVisible ? (
                      <X size={30} color="#333333" />
                  ) : (
                      <Maximize size={20} color="#555" />
                  )}
                </MyTouch>
              </View>

              {/* 다음 단계 버튼 */}
              <NextBtn3
                data={simulationTrucks.length > 0
                  ? simulationTrucks
                  : (truckInfo ? [truckInfo] : [{ type: '', quantity: 0 }])}
                status={updateStatus}
                onNavigateNext={handleNextStep}
                onAddBox={handleAddBox}
                boxQuantity={boxQuantity}
                onRemoveBox={handleRemoveBox}
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
    borderColor: '#E0E0E0',
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
