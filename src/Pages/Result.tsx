import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert, useWindowDimensions, Image, TouchableOpacity, FlatList, Text, Modal, LayoutChangeEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api/axiosInstance';
import { translateLabel } from '../utils/Translator';
import Space3D, { Space3DHandle } from '../components/Space/Space3D';
import { X, Maximize, Minus, Plus, Hand } from 'lucide-react-native';
import { SimulationFurniture, SimulationTruckResult } from '../types/simulation';
import { useEstimate } from '../context/EstimateContext';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useIsFocused } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const CAROUSEL_HEIGHT = 240;

const COLOR_PALETTE = [
  '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#A855F7',
  '#14B8A6', '#EC4899', '#06B6D4', '#EAB308', '#84CC16',
  '#6366F1', '#F43F5E',
];

interface FurnitureMarker {
  furnitureId: string | number;
  centerX: number;
  centerY: number;
  label: string;
  quantity: number;
}

function AnnotatedCarouselImage({
  image,
  contents,
  displayWidth,
  colorMap,
  selectedId,
}: {
  image: { localUri: string; width: number; height: number };
  contents: FurnitureMarker[];
  displayWidth: number;
  colorMap: Map<string, string>;
  selectedId: string | null;
}) {
  const [containerHeight, setContainerHeight] = useState(CAROUSEL_HEIGHT);

  const markers = useMemo(() => {
    if (!containerHeight || !image.width || !image.height) return [];
    const scale = Math.min(displayWidth / image.width, containerHeight / image.height);
    const offsetX = (displayWidth - image.width * scale) / 2;
    const offsetY = (containerHeight - image.height * scale) / 2;
    return contents
      .filter(c => c.quantity > 0 && c.centerX != null && c.centerY != null)
      .map(c => ({
        x: c.centerX * scale + offsetX,
        y: c.centerY * scale + offsetY,
        id: String(c.furnitureId),
        color: colorMap.get(String(c.furnitureId)) ?? '#F36845',
      }))
      .filter(m => m.x >= 8 && m.x <= displayWidth - 8 && m.y >= 8 && m.y <= containerHeight - 8);
  }, [containerHeight, displayWidth, image, contents, colorMap]);

  return (
    <View
      style={{ width: displayWidth, height: CAROUSEL_HEIGHT, backgroundColor: '#F5F6FA' }}
      onLayout={(e: LayoutChangeEvent) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      <Image
        source={typeof image.localUri === 'string' ? { uri: image.localUri } : image.localUri}
        style={{ width: displayWidth, height: CAROUSEL_HEIGHT }}
        resizeMode="contain"
      />
      {markers.map((m, i) => {
        const isSelected = selectedId === m.id;
        const dimmed = selectedId !== null && !isSelected;
        const size = isSelected ? 16 : 10;
        return (
          <View
            key={i}
            style={[
              annotStyles.markerWrap,
              { left: m.x - size / 2, top: m.y - size / 2, opacity: dimmed ? 0.25 : 1 },
            ]}
          >
            <View style={[
              annotStyles.dot,
              {
                width: size, height: size, borderRadius: size / 2,
                backgroundColor: m.color,
                borderWidth: isSelected ? 2 : 1.5,
              },
            ]} />
          </View>
        );
      })}
    </View>
  );
}

const annotStyles = StyleSheet.create({
  markerWrap: { position: 'absolute' },
  dot: {
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
});

export default function Result({ navigation }: Props) {
  const { requestData, setRequestData } = useEstimate();
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [mobileMode, setMobileMode] = useState<'review' | 'edit'>('review');
  const [editImageIndex, setEditImageIndex] = useState(0);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [reviewSelectedLabel, setReviewSelectedLabel] = useState<string | null>(null);

  const data = requestData?.images || [];
  const estimateId = requestData?.estimateId;
  const analysisResult = requestData?.analysisResult;
  const truckInfo = requestData?.truckInfo;

  const onNavigateNext = () => {
    navigation.navigate('FinalEstimate', { simulationTrucks });
  };

  const [results, setResults] = useState<any[]>([]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    let idx = 0;
    results.forEach(result => {
      result.contents.forEach((c: any) => {
        const key = String(c.furnitureId);
        if (!map.has(key)) {
          map.set(key, COLOR_PALETTE[idx % COLOR_PALETTE.length]);
          idx++;
        }
      });
    });
    return map;
  }, [results]);

  // review 모드: 선택된 라벨에 해당하는 furnitureId Set
  const reviewHighlightedIds = useMemo((): Set<string> | null => {
    if (!reviewSelectedLabel) return null;
    const ids = new Set<string>();
    results.forEach(r => {
      r.contents.forEach((c: any) => {
        if (translateLabel(c.label) === reviewSelectedLabel) ids.add(String(c.furnitureId));
      });
    });
    return ids.size > 0 ? ids : null;
  }, [reviewSelectedLabel, results]);

  // edit 모드: 단일 선택 ID를 Set으로 변환
  const editHighlightedIds = useMemo((): Set<string> | null => {
    if (!selectedFurnitureId) return null;
    return new Set([selectedFurnitureId]);
  }, [selectedFurnitureId]);

  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const mobileSpace3DRef = useRef<Space3DHandle>(null);
  const fullscreenSpace3DRef = useRef<Space3DHandle>(null);
  const [simulationTrucks, setSimulationTrucks] = useState<SimulationTruckResult[]>([]);
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
        if (qty > 0) newItems[boxIndex] = { ...newItems[boxIndex], quantity: qty };
        else newItems.splice(boxIndex, 1);
      } else if (qty > 0) {
        newItems.push({ name: '박스', quantity: qty, category: '기타', itemType: 'BOX' });
      }
      return { ...prev, items: newItems, boxQuantity: qty };
    });
  };

  useEffect(() => {
    if (!requestData) return;
    if (analysisResult && analysisResult.data.images) {
      const mappedResultCard = analysisResult.data.images.map((imgResult: any, i: number) => ({
        image: data[i] ? {
          localUri: data[i].uri || data[i].localUri,
          width: data[i].width,
          height: data[i].height,
        } : null,
        contents: imgResult.furnitureList ? imgResult.furnitureList.map((f: any) => ({
          furnitureId: f.furnitureId,
          label: f.label,
          type: f.type,
          quantity: f.quantity,
          width: f.width || 0,
          depth: f.depth || 0,
          height: f.height || 0,
          centerX: f.centerX,
          centerY: f.centerY,
        })) : [],
      }));
      setResults(mappedResultCard);
    } else {
      Alert.alert('오류', '분석결과를 불러올 수 없습니다.');
    }
  }, [analysisResult, data, estimateId]);

  const prevSimFurnitureRef = useRef<string>('');

  const simulationFurniture = useMemo((): SimulationFurniture[] => {
    if (!results || results.length === 0) return [];

    const furniture = results.flatMap(result =>
      result.contents
        .filter((c: any) => c.quantity > 0)
        .map((c: any): SimulationFurniture => ({
          furnitureId: c.furnitureId,
          label: c.label,
          type: c.type,
          quantity: c.quantity,
          width: c.width,
          depth: c.depth,
          height: c.height,
        }))
    );

    if (boxQuantity > 0) {
      return [...furniture, {
        furnitureId: 'box',
        label: '박스',
        type: 'box',
        quantity: boxQuantity,
        width: 500,
        depth: 300,
        height: 350,
      }];
    }

    const key = JSON.stringify(furniture.map(f => ({ id: f.furnitureId, qty: f.quantity })));
    if (key !== prevSimFurnitureRef.current) {
      prevSimFurnitureRef.current = key;
    }
    return furniture;
  }, [results, boxQuantity]);

  const TRUCK_LABELS: Record<string, string> = {
    '1ton': '1톤 트럭', '2.5ton': '2.5톤 트럭', '5ton': '5톤 트럭',
  };

  const allItems = useMemo(() =>
    results.flatMap(r => r.contents.map((item: any) => ({
      ...item,
      label: translateLabel(item.label),
    }))),
  [results]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, number>();
    allItems.forEach(item => {
      if (item.quantity > 0) map.set(item.label, (map.get(item.label) ?? 0) + item.quantity);
    });
    return Array.from(map.entries()).map(([label, quantity]) => ({ label, quantity }));
  }, [allItems]);

  const handleUpdateQuantity = async (furnitureId: number, newQuantity: number) => {
    if (!estimateId) return;
    setResults(prev => prev.map(result => ({
      ...result,
      contents: result.contents.map((item: any) =>
        item.furnitureId === furnitureId ? { ...item, quantity: newQuantity } : item
      ),
    })));

    const targetItem = results.flatMap(r => r.contents).find((item: any) => item.furnitureId === furnitureId);
    if (targetItem) {
      const convertedName = translateLabel(targetItem.label);
      setRequestData(prev => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.map(item =>
            item.name === convertedName ? { ...item, quantity: newQuantity } : item
          ),
        };
      });
    }

    try {
      const { data: resultOfUpdate } = await api.patch(`/api/v1/estimates/${estimateId}/furniture`, {
        furnitureId,
        quantity: newQuantity,
      });
      if (resultOfUpdate.code !== 'OK') {
        Alert.alert('업데이트 실패', resultOfUpdate.message || '알 수 없는 오류');
      }
    } catch (e) {
      Alert.alert('오류', '서버 통신 중 오류가 발생했습니다.');
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


  const handleTrucksChange = useCallback((trucks: SimulationTruckResult[]) => {
    setSimulationTrucks(trucks);

    const typeMap: { [key: string]: string } = {
      '1ton': '1톤 트럭', '2.5ton': '2.5톤 트럭', '5ton': '5톤 트럭',
    };
    const flatTypes = trucks.map(t => typeMap[t.type] || t.type);
    const getTonnage = (str: string) => str.includes('1톤') ? 1 : str.includes('2.5톤') ? 2.5 : str.includes('5톤') ? 5 : 999;
    flatTypes.sort((a, b) => getTonnage(a) - getTonnage(b));

    const newTruckTypeStr = flatTypes.join(' + ');
    const newTotalQuantity = trucks.reduce((sum, t) => sum + t.quantity, 0);

    setRequestData(prev => {
      if (!prev) return null;
      if (prev.truckInfo?.type === newTruckTypeStr && prev.truckInfo?.quantity === newTotalQuantity) return prev;
      return { ...prev, truckInfo: { type: newTruckTypeStr, quantity: newTotalQuantity } };
    });
  }, [setRequestData]);

  // ── review 모드 ───────────────────────────────────────────
  if (mobileMode === 'review') {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} />

        <View style={styles.titleSection}>
          <Text style={styles.title}>분석 결과</Text>
          <Text style={styles.subtitle}>인식된 가구 목록을 확인해주세요.</Text>
        </View>

        {isFocused && (
          <View style={{ position: 'relative' }}>
            <View style={styles.simulation}>
              <Space3D
                ref={mobileSpace3DRef}
                furniture={simulationFurniture}
                autoPlay={true}
                highlightedFurnitureIds={reviewHighlightedIds}
                onTrucksChange={handleTrucksChange}
              />
            </View>
            <TouchableOpacity style={styles.fullscreenBtn} onPress={() => setIsMobileFullscreen(true)}>
              <Maximize size={16} color="#555" />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>예상 필요 차량</Text>
            <View style={styles.dashedBox}>
              {simulationTrucks.filter(t => t.type && t.quantity > 0).length > 0 ? (
                simulationTrucks.filter(t => t.type && t.quantity > 0).map((t, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.rowLabel}>{TRUCK_LABELS[t.type] || t.type}</Text>
                    <Text style={styles.rowValue}>{t.quantity}대</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>시뮬레이션 계산 중...</Text>
              )}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>가구 목록</Text>
            <View style={[styles.hintRow, { paddingHorizontal: 0 }]}>
              <Hand size={12} color="#B0B0B0" />
              <Text style={styles.hintText}>항목을 탭하면 3D에서 강조돼요</Text>
            </View>
            <View style={styles.dashedBox}>
              {groupedItems.map((item, i) => {
                const isSelected = reviewSelectedLabel === item.label;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.row, isSelected && styles.reviewRowSelected]}
                    onPress={() => setReviewSelectedLabel(prev => prev === item.label ? null : item.label)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.rowLabel, isSelected && styles.reviewRowLabelSelected]}>{item.label}</Text>
                    <Text style={[styles.rowValue, isSelected && styles.reviewRowLabelSelected]}>{item.quantity}개</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => setMobileMode('edit')} activeOpacity={0.8}>
            <Text style={styles.outlineBtnText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fillBtn} onPress={onNavigateNext} activeOpacity={0.85}>
            <Text style={styles.fillBtnText}>확인</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={isMobileFullscreen} animationType="fade" statusBarTranslucent onRequestClose={() => setIsMobileFullscreen(false)}>
          <View style={styles.fullscreenContainer}>
            <View style={{ flex: 1 }}>
              <Space3D
                ref={fullscreenSpace3DRef}
                furniture={simulationFurniture}
                autoPlay={true}
                cameraDistanceMultiplier={1.8}
                highlightedFurnitureIds={reviewHighlightedIds}
                onTrucksChange={handleTrucksChange}
              />
            </View>
            <TouchableOpacity style={styles.fullscreenClose} onPress={() => setIsMobileFullscreen(false)}>
              <X size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  }

  // ── edit 모드 ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} />
      <View style={styles.titleSection}>
        <Text style={styles.title}>견적 수정</Text>
        <Text style={styles.subtitle}>가구 수를 조정해주세요.</Text>
      </View>

      {results.length > 0 && (
        <View>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={e => setEditImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {results.map((r, i) => r.image && (
              <AnnotatedCarouselImage
                key={i}
                image={r.image}
                contents={r.contents}
                displayWidth={width}
                colorMap={colorMap}
                selectedId={selectedFurnitureId}
              />
            ))}
          </ScrollView>
          {results.length > 1 && (
            <View style={styles.dotsRow}>
              {results.map((_, i) => (
                <View key={i} style={[styles.dot, i === editImageIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.hintRow}>
        <Hand size={12} color="#B0B0B0" />
        <Text style={styles.hintText}>항목을 탭하면 이미지에서 위치를 확인할 수 있어요</Text>
      </View>

      <FlatList
        data={(results[editImageIndex]?.contents ?? []).map((item: any) => ({
          ...item,
          label: translateLabel(item.label),
        }))}
        keyExtractor={(item, i) => String(item.furnitureId ?? i)}
        style={styles.editList}
        contentContainerStyle={[styles.editListContent, { marginBottom: Math.max(insets.bottom, 16) + 24 }]}
        ListEmptyComponent={
          <View style={styles.editEmptyContainer}>
            <Text style={styles.emptyText}>인식된 가구가 없습니다.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const fid = String(item.furnitureId);
          const color = colorMap.get(fid) ?? '#F36845';
          const isSelected = selectedFurnitureId === fid;
          return (
            <TouchableOpacity
              style={[styles.editRow, isSelected && styles.editRowSelected]}
              onPress={() => setSelectedFurnitureId(prev => prev === fid ? null : fid)}
              activeOpacity={0.7}
            >
              <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              <Text style={[styles.editLabel, isSelected && styles.editLabelSelected]}>
                {item.label}
              </Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => item.quantity > 0 && handleUpdateQuantity(item.furnitureId, item.quantity - 1)}
                >
                  <Minus size={10} color="#423E3E" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, styles.qtyBtnPlus]}
                  onPress={() => handleUpdateQuantity(item.furnitureId, item.quantity + 1)}
                >
                  <Plus size={10} color="#423E3E" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.fillBtn} onPress={() => setMobileMode('review')} activeOpacity={0.85}>
          <Text style={styles.fillBtnText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 24 },
  titleSection: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#423E3E', letterSpacing: 0.2 },
  subtitle: { fontSize: 12, fontWeight: '500', color: '#949494', lineHeight: 16, letterSpacing: 0.1 },
  simulation: { width: '100%', height: 221, backgroundColor: '#F5F5F5' },
  fullscreenBtn: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(255,255,255,0.85)', padding: 7, borderRadius: 8, zIndex: 10,
  },
  fullscreenContainer: { flex: 1, backgroundColor: '#111', position: 'relative' },
  fullscreenClose: {
    position: 'absolute', top: 52, right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8, zIndex: 20,
  },
  section: { paddingHorizontal: 24, paddingTop: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#000', marginBottom: 8 },
  dashedBox: {
    borderWidth: 1, borderColor: '#E8E8E8', borderStyle: 'dashed',
    borderRadius: 16, padding: 24, gap: 5,
  },
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', paddingVertical: 2, paddingHorizontal: 5, marginHorizontal: -5, borderRadius: 6 },
  reviewRowSelected: { backgroundColor: '#FFF5F0' },
  reviewRowLabelSelected: { color: '#F36845' },
  rowLabel: { flex: 1, fontSize: 12, fontWeight: '700', color: '#423E3E' },
  rowValue: { fontSize: 14, color: '#423E3E' },
  emptyText: { fontSize: 12, color: '#949494' },
  editEmptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  bottomBar: {
    flexDirection: 'row', gap: 24, paddingHorizontal: 24, paddingTop: 24, backgroundColor: '#fff',
  },
  outlineBtn: {
    flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFDEBB',
  },
  outlineBtnText: { fontSize: 14, fontWeight: '600', color: '#F36845' },
  fillBtn: {
    flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F36845',
  },
  fillBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  carouselImage: { height: 240, backgroundColor: '#F5F6FA' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA' },
  dotActive: { backgroundColor: '#F36845' },
  hintRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 24, paddingTop: 10, paddingBottom: 2,
  },
  hintText: { fontSize: 11, color: '#B0B0B0', flex: 1 },
  editList: { flex: 1 },
  editListContent: {
    marginHorizontal: 24, marginTop: 16,
    borderWidth: 1, borderColor: '#E8E8E8', borderStyle: 'dashed',
    borderRadius: 16, padding: 24, gap: 5,
    flexGrow: 1,
  },
  editRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 8, paddingVertical: 2, paddingHorizontal: 5, marginHorizontal: -5, borderRadius: 8 },
  editRowSelected: { backgroundColor: '#FFF5F0' },
  colorSwatch: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  editLabel: { flex: 1, fontSize: 12, fontWeight: '700', color: '#423E3E' },
  editLabelSelected: { color: '#F36845' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnPlus: {},
  qtyText: { width: 24, textAlign: 'center', fontSize: 14, color: '#423E3E', lineHeight: 18 },
});
