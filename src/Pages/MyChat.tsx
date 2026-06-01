import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ChatRoom } from '../types/chat';
import { getRooms } from '../api/chatApi';
import { chatSocket } from '../api/chatSocket';
import { getMyUserId } from '../auth/tokenStorage';
import { Search } from 'lucide-react-native';
import BottomTabBar from '../components/common/BottomTabBar';
import { useIsFocused } from '@react-navigation/native';
import { ChatItemData } from '../context/EstimateContext';

// 하위 호환성: 기존 컴포넌트들이 import해서 사용하는 타입과 더미 데이터
export type { ChatItemData };
export const dummyChatList: ChatItemData[] = [
  {
    id: '2',
    companyName: '작은 짐 이사',
    price: '820,000원',
    time: '방금',
    isActive: true,
    isUnread: false,
    logoUri: require('../../assets/smallisa.png'),
    rating: '4.9',
  },
  {
    id: '1',
    companyName: '백마익스프레스',
    price: '860,000원',
    time: '방금',
    isActive: false,
    isUnread: false,
    logoUri: require('../../assets/back.png'),
    rating: '4.8',
  },
  {
    id: '3',
    companyName: '2424닷컴',
    price: '900,000원',
    time: '방금',
    isActive: false,
    isUnread: false,
    logoUri: require('../../assets/2424.png'),
    rating: '4.7',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'MyChat'>;

function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}시간 전`;
  return `${Math.floor(diffMin / 1440)}일 전`;
}

function previewContent(content?: string): string {
  if (!content) return '';
  if (content.startsWith('http') && !content.includes(' ')) return '사진';
  return content;
}

export default function MyChat({ navigation }: Props) {
  const isFocused = useIsFocused();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [filtered, setFiltered] = useState<ChatRoom[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getRooms();
      setRooms(data);
      setFiltered(data);
    } catch {
      // API 실패 시 빈 목록 유지
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isFocused) {
      unsubRef.current?.();
      unsubRef.current = null;
      return;
    }
    load();

    const myUserId = getMyUserId();
    if (!myUserId) return;

    // 유저 채널 구독 → 새 메시지 수신 시 해당 채팅방 정보 업데이트
    unsubRef.current = chatSocket.subscribe(`/sub/user/${myUserId}`, (update) => {
      const { roomId, lastMessageContent, lastMessageAt, unreadCount } = update;
      setRooms(prev => {
        const updated = prev.map(r =>
          r.roomId === roomId
            ? { ...r, lastMessageContent, lastMessageAt, unreadCount }
            : r
        );
        // 최신 메시지 순 정렬
        return updated.sort((a, b) =>
          new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
        );
      });
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [isFocused, load]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(q ? rooms.filter(r => r.target.name.toLowerCase().includes(q)) : [...rooms]);
  }, [search, rooms]);

  const goToRoom = (room: ChatRoom) => {
    navigation.navigate('ChatRoom', {
      roomId: room.roomId,
      targetName: room.target.name,
    });
  };

  const goTab = (tab: string) => {
    const map: Record<string, keyof RootStackParamList> = {
      home: 'Main',
      partner: 'PartnerSearch',
      estimate: 'MyEstimate',
      settings: 'Settings',
    };
    if (map[tab]) navigation.navigate(map[tab] as any);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} />

      {/* 네비 바 */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>채팅</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>편집</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchBar}>
        <Search size={16} color="#949494" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="검색"
          placeholderTextColor="#949494"
        />
      </View>

      {/* 채팅 목록 */}
      {isLoading ? (
        <ActivityIndicator style={styles.flex} color="#F36845" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.roomId)}
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => goToRoom(item)} activeOpacity={0.7}>
              {/* 아바타 */}
              <View style={styles.avatar}>
                {item.target.profileImageUrl ? (
                  <Image source={{ uri: item.target.profileImageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
                ) : (
                  <View style={styles.avatarDefault} />
                )}
              </View>

              {/* 텍스트 */}
              <View style={styles.listContent2}>
                <Text style={styles.roomName} numberOfLines={1}>{item.target.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {previewContent(item.lastMessageContent)}
                </Text>
              </View>

              {/* 우측: 시간 + 뱃지 */}
              <View style={styles.rightCol}>
                <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
                {item.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.unreadCount > 99 ? '99+' : String(item.unreadCount)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {search ? '검색 결과가 없습니다.' : '채팅방이 없습니다.'}
            </Text>
          }
        />
      )}

      {/* 하단 탭 바 */}
      <BottomTabBar activeTab="chat" onTabPress={goTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },

  navBar: {
    height: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#423E3E',
  },
  editBtn: {
    position: 'absolute',
    right: 24,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F36845',
  },

  searchBar: {
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF5F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#423E3E',
  },

  listContent: { paddingHorizontal: 8, paddingVertical: 8 },
  listContent2: { flex: 1, gap: 4 },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#FFDEBB',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDefault: {
    width: '60%',
    height: '100%',
    backgroundColor: '#FFDEBB',
    borderRadius: 8,
  },
  roomName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#423E3E',
  },
  lastMessage: {
    fontSize: 12,
    fontWeight: '500',
    color: '#949494',
    lineHeight: 16,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 40,
  },
  timeText: {
    fontSize: 10,
    color: '#949494',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F36845',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 14,
    color: '#949494',
  },
});
