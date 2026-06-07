import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Modal,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  useWindowDimensions, Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Package, Truck, RefreshCw, ClipboardList, X, ChevronRight, Calendar, MapPin } from 'lucide-react-native';

import { Image, ImageLoadEventData } from 'expo-image';
import { RootStackParamList } from '../types/navigation';
import BottomTabBar from '../components/common/BottomTabBar';
import ImageViewerModal from '../components/common/ImageViewerModal';
import {
  getEstimates, mapAiStatus, formatTruckType,
  EstimateData, EstimateImage,
} from '../api/estimateApi';
import { furnitureTranslations } from '../utils/Translator';

type Props = NativeStackScreenProps<RootStackParamList, 'MyEstimate'>;

// ── 상태 설정 ─────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ReturnType<typeof mapAiStatus>,
  { label: string; color: string; bg: string }
> = {
  pending:   { label: 'AI 분석 중',   color: '#F0893B', bg: '#FFF6EF' },
  active:    { label: '견적 받는 중', color: '#F36845', bg: '#FFDEBB' },
  moving:    { label: '이사 진행 중', color: '#009443', bg: '#F0FFF7' },
  completed: { label: '완료',         color: '#888',    bg: '#F5F5F5' },
  cancelled: { label: '취소됨',       color: '#ADADAD', bg: '#F5F5F5' },
};

// ── 날짜 포맷 ─────────────────────────────────────────────
function formatDate(iso?: string): string {
  if (!iso) return '날짜 없음';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '날짜 없음';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ── 가구 총 개수 ──────────────────────────────────────────
function totalFurnitureCount(estimate: EstimateData): number {
  return estimate.images.reduce(
    (sum, img) => sum + img.furnitureList.reduce((s, f) => s + f.quantity, 0),
    0,
  );
}

// ── 가구 목록 평탄화 (중복 합산) ──────────────────────────
function mergeFurniture(estimate: EstimateData): Array<{ name: string; type: string; quantity: number }> {
  const map = new Map<string, { name: string; type: string; quantity: number }>();
  for (const img of estimate.images) {
    for (const f of img.furnitureList) {
      const key = `${f.label}::${f.type}`;
      const name = furnitureTranslations[f.label] ?? f.label;
      if (map.has(key)) {
        map.get(key)!.quantity += f.quantity;
      } else {
        map.set(key, { name, type: f.type, quantity: f.quantity });
      }
    }
  }
  return Array.from(map.values());
}

// ── 가구 위치 마커 오버레이 이미지 ────────────────────────
const COLOR_PALETTE = [
  '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#A855F7',
  '#14B8A6', '#EC4899', '#06B6D4', '#EAB308', '#84CC16',
  '#6366F1', '#F43F5E',
];

function AnnotatedImage({
  img, style, resizeMode = 'cover',
}: {
  img: EstimateImage;
  style: any;
  resizeMode?: 'cover' | 'contain';
}) {
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [displaySize, setDisplaySize] = useState<{ w: number; h: number } | null>(null);

  const colorMap = useMemo(() => {
    const map = new Map<number, string>();
    img.furnitureList.forEach((f, i) => {
      map.set(f.furnitureId, COLOR_PALETTE[i % COLOR_PALETTE.length]);
    });
    return map;
  }, [img.furnitureList]);

  const markers = useMemo(() => {
    if (!naturalSize || !displaySize) return [];
    const { w: natW, h: natH } = naturalSize;
    const { w: dispW, h: dispH } = displaySize;
    const scale = resizeMode === 'cover'
      ? Math.max(dispW / natW, dispH / natH)
      : Math.min(dispW / natW, dispH / natH);
    const offsetX = (dispW - natW * scale) / 2;
    const offsetY = (dispH - natH * scale) / 2;
    return img.furnitureList
      .filter(f => f.centerX != null && f.centerY != null)
      .map(f => ({
        x: f.centerX * scale + offsetX,
        y: f.centerY * scale + offsetY,
        color: colorMap.get(f.furnitureId) ?? '#F36845',
      }))
      .filter(m => m.x >= 5 && m.x <= dispW - 5 && m.y >= 5 && m.y <= dispH - 5);
  }, [naturalSize, displaySize, img.furnitureList, resizeMode, colorMap]);

  return (
    <View
      style={[style, { overflow: 'hidden' }]}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        setDisplaySize({ w: width, h: height });
      }}
    >
      <Image
        source={{ uri: img.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit={resizeMode}
        cachePolicy="memory-disk"
        onLoad={(e: ImageLoadEventData) => setNaturalSize({ w: e.source.width, h: e.source.height })}
      />
      {markers.map((m, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: m.x - 5,
            top: m.y - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: m.color,
            borderWidth: 1.5,
            borderColor: '#fff',
          }}
        />
      ))}
    </View>
  );
}


// ── 상세 모달 ─────────────────────────────────────────────
function DetailModal({ estimate, displayIndex, onClose }: { estimate: EstimateData; displayIndex: number; onClose: () => void }) {
  const status = mapAiStatus(estimate.aiStatus);
  const cfg = STATUS_CONFIG[status];
  const furniture = mergeFurniture(estimate);
  const trucks = estimate.items.filter(i => i.category === 'TRUCK');
  const allImages = estimate.images.filter(i => i.imageUrl);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <Pressable style={modal.backdrop} onPress={onClose} />

        <View style={[modal.sheet, { height: screenHeight * 0.85, paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* 핸들 */}
          <View style={modal.handle} />

          {/* 헤더 */}
          <View style={modal.header}>
            <View>
              {status !== 'completed' && (
                <View style={[modal.badge, { backgroundColor: cfg.bg }]}>
                  <View style={[modal.dot, { backgroundColor: cfg.color }]} />
                  <Text style={[modal.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              )}
              <Text style={modal.idText}>견적 #{displayIndex}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modal.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color="#949494" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modal.scroll} showsVerticalScrollIndicator={false}>
            {/* 생성일 · 이사 정보 */}
            <View style={modal.section}>
              <View style={modal.infoRow}>
                <View style={modal.infoLabelWrap}>
                  <Calendar size={13} color="#949494" />
                  <Text style={modal.infoLabel}>생성일</Text>
                </View>
                <Text style={modal.infoValue}>{formatDate(estimate.createdDate)}</Text>
              </View>
              {estimate.preferredMovingDate && (
                <View style={modal.infoRow}>
                  <View style={modal.infoLabelWrap}>
                    <Calendar size={13} color="#949494" />
                    <Text style={modal.infoLabel}>희망 날짜</Text>
                  </View>
                  <Text style={modal.infoValue}>{formatDate(estimate.preferredMovingDate)}</Text>
                </View>
              )}
              {estimate.startLocation?.address && (
                <View style={modal.infoRow}>
                  <View style={modal.infoLabelWrap}>
                    <MapPin size={13} color="#949494" />
                    <Text style={modal.infoLabel}>출발지</Text>
                  </View>
                  <Text style={modal.infoValue} numberOfLines={2}>
                    {estimate.startLocation.address}
                    {estimate.startLocation.detailAddress ? `\n${estimate.startLocation.detailAddress}` : ''}
                  </Text>
                </View>
              )}
              {estimate.endLocation?.address && (
                <View style={modal.infoRow}>
                  <View style={modal.infoLabelWrap}>
                    <MapPin size={13} color="#F36845" />
                    <Text style={modal.infoLabel}>도착지</Text>
                  </View>
                  <Text style={modal.infoValue} numberOfLines={2}>
                    {estimate.endLocation.address}
                    {estimate.endLocation.detailAddress ? `\n${estimate.endLocation.detailAddress}` : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* 이미지 */}
            {allImages.length > 0 && (
              <View style={modal.section}>
                <Text style={modal.sectionTitle}>업로드 사진</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modal.imageScroll}>
                  {allImages.map((img, idx) => (
                    <TouchableOpacity key={img.imageId} onPress={() => setViewerIndex(idx)} activeOpacity={0.85}>
                      <AnnotatedImage img={img} style={modal.image} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 가구 목록 */}
            <View style={modal.section}>
              <Text style={modal.sectionTitle}>감지된 가구 ({totalFurnitureCount(estimate)}개)</Text>
              {furniture.length === 0 ? (
                <Text style={modal.emptyText}>가구 정보 없음</Text>
              ) : (
                furniture.map((f, idx) => (
                  <View key={idx} style={modal.listRow}>
                    <Text style={modal.listName}>{f.name}</Text>
                    <Text style={modal.listQty}>{f.quantity}개</Text>
                  </View>
                ))
              )}
            </View>

            {/* 트럭 */}
            <View style={[modal.section, { marginBottom: 32 }]}>
              <Text style={modal.sectionTitle}>배정 트럭</Text>
              {trucks.length === 0 ? (
                <Text style={modal.emptyText}>트럭 미정</Text>
              ) : (
                trucks.map((t, idx) => (
                  <View key={idx} style={modal.listRow}>
                    <Truck size={14} color="#949494" style={{ marginRight: 6 }} />
                    <Text style={modal.listName}>{formatTruckType(t.itemType)}</Text>
                    <Text style={modal.listQty}>{t.quantity}대</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {viewerIndex !== null && (
        <ImageViewerModal
          visible
          count={allImages.length}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          renderImage={(i, w, h) => (
            <AnnotatedImage img={allImages[i]} style={{ width: w, height: h * 0.8 }} resizeMode="contain" />
          )}
        />
      )}
    </Modal>
  );
}

// ── 견적 카드 ─────────────────────────────────────────────
function EstimateCard({ estimate, displayIndex, onPress }: { estimate: EstimateData; displayIndex: number; onPress: () => void }) {
  const status = mapAiStatus(estimate.aiStatus);
  const cfg = STATUS_CONFIG[status];
  const thumbnail = estimate.images[0]?.imageUrl;
  const count = totalFurnitureCount(estimate);

  return (
    <TouchableOpacity style={card.container} onPress={onPress} activeOpacity={0.75}>
      {/* 상단: 상태 배지 + 견적 번호 */}
      <View style={card.header}>
        {status !== 'completed' ? (
          <View style={[card.badge, { backgroundColor: cfg.bg }]}>
            <View style={[card.dot, { backgroundColor: cfg.color }]} />
            <Text style={[card.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        ) : (
          <View />
        )}
        <ChevronRight size={16} color="#E8E8E8" />
      </View>

      {/* 본문: 썸네일 + 정보 */}
      <View style={card.body}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={card.thumbnail} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <View style={card.thumbPlaceholder}>
            <ClipboardList size={22} color="#E8E8E8" />
          </View>
        )}

        <View style={card.info}>
          {/* 견적 번호 */}
          <Text style={card.estimateId}>견적 #{displayIndex}</Text>

          {/* 이사 희망일 */}
          {estimate.preferredMovingDate ? (
            <View style={card.row}>
              <Calendar size={13} color="#949494" />
              <Text style={card.metaText}>{formatDate(estimate.preferredMovingDate)} 이사 희망</Text>
            </View>
          ) : null}

          {/* 출발지 */}
          {estimate.startLocation?.address ? (
            <View style={card.row}>
              <MapPin size={13} color="#949494" />
              <Text style={card.metaText} numberOfLines={1}>{estimate.startLocation.address}</Text>
            </View>
          ) : null}

          {/* 도착지 */}
          {estimate.endLocation?.address ? (
            <View style={card.row}>
              <MapPin size={13} color="#F36845" />
              <Text style={card.metaText} numberOfLines={1}>{estimate.endLocation.address}</Text>
            </View>
          ) : null}

          {/* 가구 개수 */}
          <View style={card.row}>
            <Package size={13} color="#949494" />
            <Text style={card.metaText}>가구 {count}개</Text>
          </View>

          {/* 트럭 */}
          {estimate.items.filter(i => i.category === 'TRUCK').map((t, idx) => (
            <View key={idx} style={card.row}>
              <Truck size={13} color="#949494" />
              <Text style={card.metaText}>{formatTruckType(t.itemType)}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────
export default function MyEstimate({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [estimates, setEstimates] = useState<EstimateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selected, setSelected] = useState<{ estimate: EstimateData; displayIndex: number } | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setHasError(false);
    try {
      const data = await getEstimates();
      data.sort((a, b) => (b.createdDate ?? '').localeCompare(a.createdDate ?? ''));
      setEstimates(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const handleTabPress = (tab: string) => {
    const map: Record<string, keyof RootStackParamList> = {
      home: 'Main', partner: 'PartnerSearch', chat: 'MyChat', settings: 'Settings',
    };
    if (map[tab]) navigation.navigate(map[tab] as any);
  };

  const renderBody = () => {
    if (isLoading) return <ActivityIndicator color="#F36845" style={page.loader} />;

    if (hasError) return (
      <View style={page.center}>
        <Text style={page.emptyTitle}>불러오기 실패</Text>
        <Text style={page.emptyDesc}>네트워크 상태를 확인하고 다시 시도해주세요.</Text>
        <TouchableOpacity style={page.actionBtn} onPress={() => load()}>
          <RefreshCw size={14} color="#fff" />
          <Text style={page.actionBtnText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );

    if (estimates.length === 0) return (
      <View style={page.center}>
        <ClipboardList size={48} color="#E8E8E8" />
        <Text style={page.emptyTitle}>신청한 견적이 없어요</Text>
        <Text style={page.emptyDesc}>이사 사진을 업로드하면 AI가 견적을 분석해드려요.</Text>
        <TouchableOpacity style={page.actionBtn} onPress={() => navigation.navigate('Upload')}>
          <Text style={page.actionBtnText}>견적 신청하기</Text>
        </TouchableOpacity>
      </View>
    );

    return estimates.map((e, i) => {
      const displayIndex = estimates.length - i;
      return (
        <EstimateCard
          key={e.estimateId}
          estimate={e}
          displayIndex={displayIndex}
          onPress={() => setSelected({ estimate: e, displayIndex })}
        />
      );
    });
  };

  return (
    <View style={page.root}>
      <SafeAreaView edges={['top']} />

      <View style={page.header}>
        <Text style={page.headerTitle}>견적 이력</Text>
      </View>

      <ScrollView
        contentContainerStyle={[page.scroll, !isMobile && page.scrollWide, isMobile && { paddingBottom: 80 + Math.max(insets.bottom, 16) }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor="#F36845" />
        }
      >
        {renderBody()}
      </ScrollView>

      {isMobile && !selected && <BottomTabBar activeTab="estimate" onTabPress={handleTabPress} />}

      {selected && (
        <DetailModal estimate={selected.estimate} displayIndex={selected.displayIndex} onClose={() => setSelected(null)} />
      )}
    </View>
  );
}

// ── 카드 스타일 ───────────────────────────────────────────
const card = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  body: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: 10,
    flexShrink: 0,
  },
  thumbPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#FAF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, gap: 5 },
  estimateId: { fontSize: 14, fontWeight: '700', color: '#423E3E', marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: '#949494' },
});


// ── 모달 스타일 ───────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 1,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E8E8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  idText: { fontSize: 16, fontWeight: '700', color: '#423E3E' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#423E3E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    gap: 12,
  },
  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 72,
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: 13,
    color: '#949494',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#423E3E',
    fontWeight: '500',
    textAlign: 'right',
  },
  imageScroll: { marginTop: 4 },
  image: {
    width: 120,
    height: 90,
    borderRadius: 10,
    marginRight: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },
  listName: {
    flex: 1,
    fontSize: 14,
    color: '#423E3E',
  },
  listQty: {
    fontSize: 13,
    fontWeight: '600',
    color: '#423E3E',
  },
  emptyText: {
    fontSize: 13,
    color: '#B0B0B0',
    paddingVertical: 8,
  },
});

// ── 페이지 스타일 ─────────────────────────────────────────
const page = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF5F0' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#423E3E' },
  scroll: { padding: 16, gap: 12, flexGrow: 1 },
  scrollWide: { maxWidth: 640, alignSelf: 'center', width: '100%' },
  loader: { marginTop: 60 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#423E3E', marginTop: 8 },
  emptyDesc: {
    fontSize: 13,
    color: '#949494',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 32,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#F36845',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
