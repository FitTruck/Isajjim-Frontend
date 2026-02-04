import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput, FlatList, Platform, Pressable } from "react-native";
import { Search } from 'lucide-react-native';
import { ChatItemData } from "../../Pages/MyChat";
import MyTouch from "../common/MyTouch";

interface ChatListPanelProps {
  chatList: ChatItemData[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
}

export default function ChatListPanel({ chatList, selectedChatId, onSelectChat }: ChatListPanelProps) {
  // 검색바에 검색한 값
  const [searchText, setSearchText] = useState("");
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  
  // 검색바에 검색한 값에 따라 필터링된 리스트
  const filteredList = chatList.filter(item =>
    // 업체 이름 목록들 중에서 searchText가 포함된 것만 필터링
    item.companyName.includes(searchText)
  );

  // 채팅방 리스트 렌더링 함수
  const renderItem = ({ item }: { item: ChatItemData }) => {
    const isSelected = item.id === selectedChatId;
    
    return (
      <MyTouch 
        style={[styles.chatItem, isSelected && styles.chatItemActive]}
        onPress={() => onSelectChat(item.id)}
      >
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
              <View style={isSelected ? styles.statusDot : styles.statusDotGray} />
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
      </MyTouch>
    );
  };

  return (
    <View style={styles.leftPanel}>
      {/* 검색 바 */}
      <Pressable 
        style={[styles.searchBar, isSearchHovered && styles.searchBarHovered]}
        onHoverIn={() => setIsSearchHovered(true)}
        onHoverOut={() => setIsSearchHovered(false)}
      >
        <TextInput 
          style={styles.input}
          placeholder="업체 이름을 검색해 주세요"
          placeholderTextColor="#929AA9"
          // onChangeText 속성 : value가 자동으로 함수에 파라미터로 전달된다.
          value={searchText}
          onChangeText={setSearchText}
        />
        <Search size={20} color="#999" />
      </Pressable>

      {/* 필터 바 */}
      <View style={styles.filterBar}>
        <Text style={styles.filterTotal}>전체</Text>
        <Text style={styles.filterUnread}>안 읽음 {filteredList.filter(i => i.isUnread).length}</Text>
      </View>
      <View style={styles.divider} />

      {/* 채팅 리스트 */}
      <FlatList
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 60 }}
      />

      {/* 휴지통 아이콘 */}
      <Image source={require('../../../assets/trash.png')} style={styles.trashIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  leftPanel: {
    width: 279,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 4,
    backgroundColor: 'white',
    position: 'relative',
    height: '100%',
  },
  searchBar: {
    width: 260,
    height: 44,
    backgroundColor: '#eef0f3',
    borderRadius: 8,
    margin: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
  },
  searchBarHovered: {
    backgroundColor: '#ebebebff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 7,
    color: '#333',
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }) as any,
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
    backgroundColor: '#eef0f3',
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
    tintColor: '#4e4e4e', 
  },
});
