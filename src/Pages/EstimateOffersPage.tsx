import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Star } from 'lucide-react-native';
import BottomTabBar from '../components/common/BottomTabBar';

type Props = NativeStackScreenProps<RootStackParamList, 'EstimateOffers'>;

interface Company {
  name: string;
  price: string;
  rating: string;
  tags: string[];
  previewMessage: string;
  logoUri: any;
  targetId: number;
}

const MOCK_COMPANIES: Company[] = [
  {
    name: '작은 짐 이사',
    price: '820,000원',
    rating: '4.9',
    tags: ['#친절', '#소형이사 전문', '#당일 가능'],
    previewMessage: '안녕하세요! 이삿짐 견적 확인했습니다. 820,000원에 도와드릴게요. 궁금한 점 있으시면 편하게 문의주세요!',
    logoUri: require('../../assets/smallisa.png'),
    targetId: 3,
  },
  {
    name: '백마익스프레스',
    price: '860,000원',
    rating: '4.8',
    tags: ['#경력 10년', '#보험 완비', '#정시 보장'],
    previewMessage: '견적 검토했습니다. 저희 860,000원으로 빠르고 안전하게 이사 도와드리겠습니다. 날짜 조율 가능하세요?',
    logoUri: require('../../assets/back.png'),
    targetId: 3,
  },
];

function CompanyCard({ company, onPress }: { company: Company; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View style={styles.logoWrap}>
          <Image source={company.logoUri} style={styles.logo} contentFit="cover" />
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{company.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={12} color="#F36845" fill="#F36845" />
            <Text style={styles.ratingText}>{company.rating}</Text>
          </View>
        </View>
        <View style={styles.priceWrap}>
          <Text style={styles.price}>{company.price}</Text>
          <Text style={styles.priceLabel}>예상 견적</Text>
        </View>
      </View>

      <View style={styles.tagsRow}>
        {company.tags.map((tag, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.previewBubble}>
        <Text style={styles.previewText} numberOfLines={2}>{company.previewMessage}</Text>
      </View>

      <View style={styles.chatBtn}>
        <Text style={styles.chatBtnText}>채팅 시작하기</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function EstimateOffersPage({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const goToRoom = (company: Company) => {
    navigation.navigate('ChatRoom', {
      targetId: company.targetId,
      targetName: company.name,
      mockInitialMessage: company.previewMessage,
    });
  };

  const goTab = (tab: string) => {
    const map: Record<string, keyof RootStackParamList> = {
      home: 'Main',
      partner: 'PartnerSearch',
      chat: 'MyChat',
      estimate: 'MyEstimate',
      settings: 'Settings',
    };
    if (map[tab]) navigation.navigate(map[tab] as any);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>견적 받는 중</Text>
        <Text style={styles.headerSubtitle}>{MOCK_COMPANIES.length}개 업체에서 견적이 도착했어요.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 80 + Math.max(insets.bottom, 16) }]}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_COMPANIES.map((company, i) => (
          <CompanyCard key={i} company={company} onPress={() => goToRoom(company)} />
        ))}
      </ScrollView>

      <BottomTabBar activeTab="chat" onTabPress={goTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 6,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#423E3E', letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 12, fontWeight: '500', color: '#949494', lineHeight: 16 },
  scroll: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FAF5F0',
  },
  logo: { width: 48, height: 48 },
  companyInfo: { flex: 1, gap: 4 },
  companyName: { fontSize: 16, fontWeight: '700', color: '#423E3E' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#F36845' },
  priceWrap: { alignItems: 'flex-end', gap: 2 },
  price: { fontSize: 17, fontWeight: '800', color: '#423E3E' },
  priceLabel: { fontSize: 10, color: '#949494', fontWeight: '500' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#F5F6FA',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: '#949494' },

  previewBubble: {
    backgroundColor: '#FAF5F0',
    borderRadius: 12,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  previewText: { fontSize: 13, color: '#423E3E', lineHeight: 19 },

  chatBtn: {
    backgroundColor: '#F36845',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
