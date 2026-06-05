import { useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, useWindowDimensions, Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Maximize, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useEstimate } from '../context/EstimateContext';
import { translateLabel } from '../utils/Translator';
import Space3D, { Space3DHandle } from '../components/Space/Space3D';
import { SimulationFurniture } from '../types/simulation';
import { useIsFocused } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'FinalEstimate'>;

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dow = DAY_KO[d.getDay()];
  return `${y}.${m}.${day} (${dow})`;
}

function buildTags(loc: {
  parking?: boolean | null;
  elevator?: boolean | null;
  ladderTruck?: string | null;
  duplex?: boolean | null;
} | null | undefined): string {
  if (!loc) return '';
  const tags: string[] = [];
  if (loc.parking != null) tags.push(`#주차 공간 ${loc.parking ? 'O' : 'X'}`);
  if (loc.elevator != null) tags.push(`#엘베 ${loc.elevator ? 'O' : 'X'}`);
  if (loc.ladderTruck != null && loc.ladderTruck !== 'NONE') tags.push('#사다리차 필요');
  if (loc.duplex != null) tags.push(`#복층 ${loc.duplex ? 'O' : 'X'}`);
  return tags.join('  ');
}

const TRUCK_LABELS: Record<string, string> = {
  '1ton': '1톤 트럭', '2.5ton': '2.5톤 트럭', '5ton': '5톤 트럭',
};

export default function FinalEstimatePage({ navigation, route }: Props) {
  const { simulationTrucks } = route.params;
  const { requestData, setChatStartTime } = useEstimate();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [imageIndex, setImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const space3DRef = useRef<Space3DHandle>(null);
  const fullscreenRef = useRef<Space3DHandle>(null);

  const images = requestData?.images ?? [];
  const startLoc = requestData?.startLocation;
  const endLoc = requestData?.endLocation;
  const movingDate = requestData?.movingDate;
  const analysisResult = requestData?.analysisResult;

  const groupedItems = useMemo(() => {
    if (!analysisResult?.data?.images) return [];
    const map = new Map<string, number>();
    analysisResult.data.images.forEach((imgResult: any) => {
      (imgResult.furnitureList ?? []).forEach((f: any) => {
        if (f.quantity > 0) {
          const label = translateLabel(f.label);
          map.set(label, (map.get(label) ?? 0) + f.quantity);
        }
      });
    });
    return Array.from(map.entries()).map(([label, quantity]) => ({ label, quantity }));
  }, [analysisResult]);

  const simulationFurniture = useMemo((): SimulationFurniture[] => {
    if (!analysisResult?.data?.images) return [];
    return analysisResult.data.images.flatMap((imgResult: any) =>
      (imgResult.furnitureList ?? [])
        .filter((f: any) => f.quantity > 0)
        .map((f: any): SimulationFurniture => ({
          furnitureId: f.furnitureId,
          label: f.label,
          type: f.type,
          quantity: f.quantity,
          width: f.width ?? 0,
          depth: f.depth ?? 0,
          height: f.height ?? 0,
        }))
    );
  }, [analysisResult]);

  const validTrucks = simulationTrucks.filter(t => t.type && t.quantity > 0);

  const handleConfirm = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    setChatStartTime(timeString);
    navigation.navigate('EstimateOffers');
  };

  const startAddress = [startLoc?.address, startLoc?.detailAddress].filter(Boolean).join(' ');
  const endAddress = [endLoc?.address, endLoc?.detailAddress].filter(Boolean).join(' ');
  const startTags = buildTags(startLoc);
  const endTags = buildTags(endLoc);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>견적서</Text>
        <Text style={styles.headerSubtitle}>최종 견적서를 확인해주세요.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* 출발지 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>출발지 주소</Text>
          <Text style={styles.addressText}>{startAddress || '-'}</Text>
          {startTags ? <Text style={styles.tagText}>{startTags}</Text> : null}
        </View>

        <View style={styles.divider} />

        {/* 도착지 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>도착지 주소</Text>
          <Text style={styles.addressText}>{endAddress || '-'}</Text>
          {endTags ? <Text style={styles.tagText}>{endTags}</Text> : null}
        </View>

        <View style={styles.divider} />

        {/* 희망 날짜 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>희망 날짜</Text>
          <Text style={styles.valueText}>{formatDate(movingDate)}</Text>
        </View>

        <View style={styles.divider} />

        {/* 필요 차량 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>필요 차량</Text>
          {validTrucks.length > 0 ? (
            validTrucks.map((t, i) => (
              <View key={i} style={styles.rowItem}>
                <Text style={styles.rowItemLabel}>{TRUCK_LABELS[t.type] || t.type}</Text>
                <View style={styles.quantityBox}>
                  <Text style={styles.quantityText}>{t.quantity}대</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.valueText}>-</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* 가구 사진 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>가구 사진</Text>
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.carousel}
                onScroll={e => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 48)))}
                scrollEventThrottle={16}
              >
                {images.map((img: any, i: number) => (
                  <Image
                    key={i}
                    source={typeof (img.uri || img.localUri) === 'string'
                      ? { uri: img.uri || img.localUri }
                      : img.uri || img.localUri}
                    style={[styles.carouselImage, { width: width - 48 }]}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.dotsRow}>
                  {images.map((_: any, i: number) => (
                    <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>사진 없음</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* 가구 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>가구 목록</Text>
          {groupedItems.map((item, i) => (
            <View key={i} style={styles.rowItem}>
              <Text style={styles.rowItemLabel}>{item.label}</Text>
              <View style={styles.quantityBox}>
                <Text style={styles.quantityText}>{item.quantity}개</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* 적재 시뮬레이션 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>적재 시뮬레이션</Text>
          {isFocused && simulationFurniture.length > 0 ? (
            <View style={styles.simulationWrap}>
              <Space3D
                ref={space3DRef}
                furniture={simulationFurniture}
                instantResult={true}
              />
              <TouchableOpacity style={styles.fullscreenBtn} onPress={() => setIsFullscreen(true)}>
                <Maximize size={16} color="#555" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.simulationPlaceholder}>
              <Text style={styles.placeholderText}>시뮬레이션 정보 없음</Text>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>확인</Text>
        </TouchableOpacity>
      </View>

      {/* 전체화면 시뮬레이션 */}
      <Modal visible={isFullscreen} animationType="fade" statusBarTranslucent onRequestClose={() => setIsFullscreen(false)}>
        <View style={styles.fullscreenContainer}>
          <View style={{ flex: 1 }}>
            <Space3D
              ref={fullscreenRef}
              furniture={simulationFurniture}
              instantResult={true}
            />
          </View>
          <TouchableOpacity style={styles.fullscreenClose} onPress={() => setIsFullscreen(false)}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#423E3E', letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 12, fontWeight: '500', color: '#949494', lineHeight: 16, letterSpacing: 0.1 },
  scrollContent: { paddingHorizontal: 24 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  section: { paddingVertical: 20, gap: 10 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#423E3E' },
  addressText: { fontSize: 13, fontWeight: '400', color: '#423E3E', lineHeight: 20 },
  tagText: { fontSize: 12, fontWeight: '600', color: '#F36845' },
  valueText: { fontSize: 13, color: '#423E3E' },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowItemLabel: { fontSize: 13, fontWeight: '500', color: '#423E3E' },
  quantityBox: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quantityText: { fontSize: 13, fontWeight: '500', color: '#423E3E' },
  carousel: { borderRadius: 12, overflow: 'hidden' },
  carouselImage: { height: 200, borderRadius: 12 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E5EA' },
  dotActive: { backgroundColor: '#F36845' },
  imagePlaceholder: {
    height: 160, borderRadius: 12, backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },
  simulationWrap: {
    height: 220, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#F5F5F5', position: 'relative',
  },
  simulationPlaceholder: {
    height: 160, borderRadius: 12, backgroundColor: '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },
  placeholderText: { fontSize: 13, color: '#949494' },
  fullscreenBtn: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(255,255,255,0.85)', padding: 7, borderRadius: 8, zIndex: 10,
  },
  fullscreenContainer: { flex: 1, backgroundColor: '#111' },
  fullscreenClose: {
    position: 'absolute', top: 52, right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8, zIndex: 20,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: '#F36845',
    justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
