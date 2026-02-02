import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface ChatItemData {
  id: string;
  companyName: string;
  price: string;
  time: string;
  isActive: boolean;
  isUnread: boolean;
  logoUri?: any;
}

// mock데이터. 나중에 백엔드에서 받는 값이어야 함.
const dummyChatList: ChatItemData[] = [
  {
    id: '1',
    companyName: '백마익스프레스',
    price: '860,000원',
    time: '방금',
    isActive: true,
    isUnread: false,
    logoUri: require('../../../assets/back.png'),
  },
  {
    id: '2',
    companyName: '작은 짐 이사',
    price: '820,000원',
    time: '1월 9일',
    isActive: false,
    isUnread: true,
    logoUri: require('../../../assets/smallisa.png'),
  },
  {
    id: '3',
    companyName: '2424닷컴',
    price: '900,000원',
    time: '1월 8일',
    isActive: false,
    isUnread: true,
    logoUri: require('../../../assets/2424.png'),
  },
];

export default function ChatListPanel() {
  // 검색바에 검색한 값
  const [searchText, setSearchText] = useState("");
  
  // 검색바에 검색한 값에 따라 필터링된 리스트
  const filteredList = dummyChatList.filter(item =>
    // 업체 이름 목록들 중에서 searchText가 포함된 것만 필터링
    item.companyName.includes(searchText)
  );

  // 채팅방 리스트 렌더링 함수
  const renderItem = ({ item }: { item: ChatItemData }) => (
    <View style={[styles.chatItem, item.isActive && styles.chatItemActive]}>
      {item.logoUri ? (
        <Image source={item.logoUri} style={styles.avatar} />
      ) : ( // logoUri가 없을 경우
        <View style={styles.avatarPlaceholder}>
          <Text style={{fontSize: 10}}>Logo</Text> 
        </View>
      )}
      
      <View style={styles.chatItemContent}>
        <View style={styles.chatItemHeader}>
          <Text style={styles.chatItemName}>{item.companyName}</Text>
          <View style={styles.chatItemMeta}>
            <View style={item.isActive ? styles.statusDot : styles.statusDotGray} />
            <Text style={styles.chatTime}>{item.time}</Text>
          </View>
        </View>
        <View style={styles.chatItemPriceRow}>
          <Text style={styles.chatPriceLabel}>제안 가격:</Text>
          <Text style={styles.chatPriceValue}>{item.price}</Text>
        </View>
      </View>
      {/* 안 읽었을 때 뜨는 점 */}
      {item.isUnread && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <View style={styles.leftPanel}>
      {/* 검색 바 */}
      <View style={styles.searchBar}>
        <TextInput 
          style={styles.input}
          placeholder="업체 이름을 검색해 주세요"
          placeholderTextColor="#929AA9"
          // onChangeText 속성 : value가 자동으로 함수에 파라미터로 전달된다.
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={20} color="#999" />
      </View>

      {/* 필터 바 */}
      <View style={styles.filterBar}>
        <Text style={styles.filterTotal}>전체</Text>
        <Text style={styles.filterUnread}>안 읽음 {filteredList.filter(i => i.isUnread).length}</Text>
      </View>
      <View style={styles.divider} />

      {/* 채팅 리스트 - FlatList 사용 */}
      <FlatList
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 60 }} // 휴지통 아이콘 공간 확보
      />

      {/* 휴지통 아이콘 */}
      <Image source={{uri: 'https://placehold.co/18x18'}} style={styles.trashIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  leftPanel: {
    width: 279,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'white',
    position: 'relative',
    height: '100%', // Ensure full height for scrolling
  },
  searchBar: {
    width: 260,
    height: 44,
    backgroundColor: '#F4F4F4',
    margin: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  searchTextPlaceholder: {
    color: '#929AA9',
    fontSize: 20, 
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 17,
    marginTop: 10,
    marginBottom: 10,
  },
  filterTotal: {
    fontSize: 18,
    color: '#333333',
  },
  filterUnread: {
    fontSize: 15,
    color: '#616161',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E6E6',
  },
  chatItem: {
    width: '100%',
    height: 77,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  chatItemActive: {
    backgroundColor: '#FFF6EF',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 14,
  },
  avatarPlaceholder: {
    width: 42, 
    height: 16, 
    marginRight: 27, 
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chatItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatItemName: {
    fontSize: 16, 
    fontWeight: '500',
    color: '#333333',
  },
  chatItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D9D9D9',
  },
  statusDotGray: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D9D9D9',
  },
  chatTime: {
    fontSize: 12,
    color: '#AFAFAF',
  },
  chatItemPriceRow: {
    flexDirection: 'row',
    gap: 4,
  },
  chatPriceLabel: {
    fontSize: 15,
    color: '#333333',
  },
  chatPriceValue: {
    fontSize: 15,
    color: '#333333',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF8383',
    position: 'absolute',
    right: 17,
    bottom: 20,
  },
  trashIcon: {
    width: 18,
    height: 18,
    position: 'absolute',
    bottom: 15,
    left: 17,
  },
});
