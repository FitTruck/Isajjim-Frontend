import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useState } from "react";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/common/Header";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import ChatListPanel from "../components/MyChatPage/ChatListPanel";
import ChatRoomPanel from "../components/MyChatPage/ChatRoomPanel";

type Props = NativeStackScreenProps<RootStackParamList, 'MyChat'>;

export interface ChatItemData {
  id: string;
  companyName: string;
  price: string;
  time: string;
  isActive: boolean;
  isUnread: boolean;
  logoUri?: any;
}
// mock데이터
const dummyChatList: ChatItemData[] = [
  {
    id: '2',
    companyName: '작은 짐 이사',
    price: '820,000원',
    time: '방금',
    isActive: true,
    isUnread: false,
    logoUri: require('../../assets/smallisa.png'),
  },
  {
    id: '1',
    companyName: '백마익스프레스',
    price: '860,000원',
    time: '1월 9일',
    isActive: false,
    isUnread: true,
    logoUri: require('../../assets/back.png'),
  },
  {
    id: '3',
    companyName: '2424닷컴',
    price: '900,000원',
    time: '1월 8일',
    isActive: false,
    isUnread: true,
    logoUri: require('../../assets/2424.png'),
  },
];

export default function MyChat({ navigation }: Props) {
  // 선택된 채팅 ID 상태 관리 (초기값 : 첫 번째 채팅방)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(dummyChatList[0].id);

  // 선택된 ID에 해당하는 채팅 데이터 찾기
  const selectedChatData = dummyChatList.find(item => item.id === selectedChatId) || null;

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        contentContainerStyle={commonStyles.scrollContent}
        stickyHeaderIndices={[0]} // 자식 컴포넌트들 중 첫 번째 컴포넌트를 고정시키겠다.
      >
        <Header />

        <View style={styles.mainWrapper}>
          
          {/* Page Content: 기준점 */}
          <View style={styles.pageContent}>

            {/* 중앙정렬 컨테이너 */}
            <View style={styles.centerContainer}>
              <Text style={styles.pageTitle}>채팅</Text>
            </View>

            {/* 채팅 UI 섹션 */}
            <View style={styles.chatSection}>
              {/* 왼쪽 패널 */}
              <ChatListPanel 
                chatList={dummyChatList} 
                selectedChatId={selectedChatId}
                onSelectChat={setSelectedChatId}
              />

              {/* 오른쪽 패널 */}
              <ChatRoomPanel data={selectedChatData} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    marginTop: 50,
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
  },
  pageContent: {
    width: '90%', 
    maxWidth: 1600, 
    paddingTop: 80,
    position: 'relative', 
    alignItems: 'center',
    marginHorizontal: 'auto',
  },
  
  // 중앙 컨텐츠 컨테이너 
  centerContainer: {
    width: 1050, 
    alignSelf: 'center',
    marginHorizontal: 'auto',
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },

  pageTitle: {
    fontSize: 30, 
    fontWeight: '700',
    color: '#323232',
    lineHeight: 34,
    marginBottom: 5,
  },

  // 채팅 레이아웃 스타일
  chatSection: {
    flexDirection: 'row',
    width: 1050,
    height: 700,
    backgroundColor: 'transparent',
    overflow: 'visible',
    alignSelf: 'center',
    marginHorizontal: 'auto',
    position: 'relative',
  },
});
