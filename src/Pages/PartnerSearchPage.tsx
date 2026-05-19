import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, MapPin, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import BottomTabBar, { TabKey } from '../components/common/BottomTabBar';

interface Partner {
  id: number;
  targetId: number;
  name: string;
  rating: number;
  reviewCount: number;
  region: string;
  specialty: string[];
  priceRange: string;
  description: string;
  experience: number;
}

const MOCK_PARTNERS: Partner[] = [
  { id: 1, targetId: 2,  name: '빠른이사 전문팀',  rating: 4.9, reviewCount: 312, region: '서울 전지역',     specialty: ['가정이사', '원룸이사'],   priceRange: '30만원~', description: '10년 경력 전문 이사팀. 신속하고 꼼꼼한 포장으로 안전한 이사를 보장합니다.', experience: 10 },
  { id: 2, targetId: 3,  name: '믿음이사',          rating: 4.8, reviewCount: 241, region: '서울·경기',       specialty: ['가정이사', '사무실이사'], priceRange: '40만원~', description: '대형 이사부터 소형 이사까지. 분리수거 서비스 포함.',                         experience: 8  },
  { id: 3, targetId: 4,  name: '편한이사 서비스',   rating: 4.7, reviewCount: 188, region: '경기 전지역',     specialty: ['원룸이사', '포장이사'],   priceRange: '25만원~', description: '합리적인 가격에 프리미엄 서비스. 포장재 무상 제공.',                        experience: 6  },
  { id: 4, targetId: 5,  name: '안심이사',           rating: 4.7, reviewCount: 156, region: '서울 강남·송파', specialty: ['가정이사', '피아노이사'], priceRange: '50만원~', description: '피아노, 금고 등 특수물품 이사 전문. 파손 시 100% 보상.',                   experience: 12 },
  { id: 5, targetId: 6,  name: '스마트무빙',         rating: 4.6, reviewCount: 134, region: '인천·부천',       specialty: ['원룸이사', '가정이사'],   priceRange: '20만원~', description: '1인 가구 전문 이사 서비스. 당일 이사 가능.',                               experience: 4  },
  { id: 6, targetId: 7,  name: '하나이사센터',       rating: 4.6, reviewCount: 98,  region: '서울 마포·은평', specialty: ['사무실이사', '가정이사'], priceRange: '45만원~', description: '사무실 이사 전문. 야간·주말 이사 가능.',                                   experience: 9  },
  { id: 7, targetId: 8,  name: '나라이사',           rating: 4.5, reviewCount: 87,  region: '수원·용인',       specialty: ['가정이사', '장거리이사'], priceRange: '35만원~', description: '수도권 전 지역 장거리 이사 전문.',                                          experience: 7  },
  { id: 8, targetId: 9,  name: '친절이사 24',        rating: 4.5, reviewCount: 73,  region: '서울 노원·도봉', specialty: ['원룸이사', '포장이사'],   priceRange: '22만원~', description: '24시간 상담 가능. 이사 당일까지 친절 안내.',                               experience: 5  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.starRow}>
    <Star size={12} color="#FFC107" fill="#FFC107" />
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
  </View>
);

const PartnerCard = ({ partner, onChat }: { partner: Partner; onChat: () => void }) => (
  <View style={styles.card}>
    <View style={styles.cardBody}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{partner.name}</Text>
        <Text style={styles.priceRange}>{partner.priceRange}</Text>
      </View>
      <View style={styles.cardMeta}>
        <StarRating rating={partner.rating} />
        <Text style={styles.reviewCount}>리뷰 {partner.reviewCount}개</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.experience}>경력 {partner.experience}년</Text>
      </View>
      <View style={styles.regionRow}>
        <MapPin size={11} color="#8F9098" />
        <Text style={styles.regionText}>{partner.region}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{partner.description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.tagRow}>
          {partner.specialty.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.chatBtn} onPress={onChat} activeOpacity={0.8}>
          <MessageCircle size={14} color="#fff" />
          <Text style={styles.chatBtnText}>채팅하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function PartnerSearchPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleTabPress = (tab: TabKey) => {
    if (tab === 'home') navigation.navigate('Main');
    else if (tab === 'estimate') navigation.navigate('MyEstimate');
    else if (tab === 'chat') navigation.navigate('MyChat');
    else if (tab === 'settings') navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} />

      {/* 헤더 */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>파트너 찾기</Text>
      </View>

      {/* 목록 */}
      <FlatList
        data={MOCK_PARTNERS}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <PartnerCard
            partner={item}
            onChat={() => navigation.navigate('ChatRoom', {
              targetId: item.targetId,
              targetName: item.name,
            })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
          </View>
        }
      />

      <BottomTabBar activeTab="partner" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  navBar: {
    height: 56, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5E5',
  },
  navTitle: { fontSize: 14, fontWeight: '700', color: '#1F2024' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, flexDirection: 'row', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardBody: { flex: 1, gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1F2024' },
  priceRange: { fontSize: 13, fontWeight: '600', color: '#006FFD' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#1F2024' },
  reviewCount: { fontSize: 11, color: '#8F9098' },
  dot: { fontSize: 11, color: '#C5C6CC' },
  experience: { fontSize: 11, color: '#8F9098' },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  regionText: { fontSize: 11, color: '#8F9098' },
  description: { fontSize: 12, color: '#71727A', lineHeight: 17, marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#006FFD', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  chatBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  tag: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: '#EAF2FF', borderRadius: 6,
  },
  tagText: { fontSize: 11, fontWeight: '500', color: '#006FFD' },
  empty: { paddingTop: 80, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#8F9098' },
});
