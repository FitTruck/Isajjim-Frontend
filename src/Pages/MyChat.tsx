import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
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
  rating: string;
}
// mock데이터
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
    isUnread: true,
    logoUri: require('../../assets/back.png'),
    rating: '4.8',
  },
  {
    id: '3',
    companyName: '2424닷컴',
    price: '900,000원',
    time: '방금',
    isActive: false,
    isUnread: true,
    logoUri: require('../../assets/2424.png'),
    rating: '4.7',
  },
];

export default function MyChat({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // 선택된 채팅 ID 상태 관리 (초기값 : 첫 번째 채팅방)
  // 모바일에서는 초기 진입 시 리스트를 보여주어야 하므로, 모바일인 경우 선택된 채팅방이 있어도 리스트 뷰로 시작하는 로직이 필요함.
  // 다만 '내부 로직 건들지 말라'는 요청이 있으므로 selectedChatId는 그대로 두고, 보이는 뷰만 제어함.
  const [selectedChatId, setSelectedChatId] = useState<string | null>(dummyChatList[0].id);
  const [mobileView, setMobileView] = useState<'list' | 'room'>('list');

  // 선택된 ID에 해당하는 채팅 데이터 찾기
  const selectedChatData = dummyChatList.find(item => item.id === selectedChatId) || null;

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    if (isMobile) {
      setMobileView('room');
    }
  };

  const handleMobileBack = () => {
    setMobileView('list');
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        contentContainerStyle={[commonStyles.scrollContent, isMobile && { flex: 1, paddingBottom: 0 }]}
        stickyHeaderIndices={[0]} 
        scrollEnabled={!isMobile} // 모바일에서는 내부 스크롤 사용
      >
        <Header />

        <View style={[styles.mainWrapper, isMobile && styles.mobileMainWrapper]}>
          
          {/* Page Content: 기준점 */}
          <View style={[styles.pageContent, isMobile && styles.mobilePageContent]}>

            {/* 중앙정렬 컨테이너 - 모바일에서는 숨김 or 스타일 변경 */}
            <View style={[styles.centerContainer, isMobile && styles.mobileCenterContainer]}>
              <Text style={styles.pageTitle}>채팅</Text>
            </View>

            {/* 채팅 UI 섹션 */}
            <View style={[styles.chatSection, isMobile && styles.mobileChatSection]}>
              {isMobile ? (
                // 모바일 뷰
                mobileView === 'list' ? (
                  <ChatListPanel 
                    chatList={dummyChatList} 
                    selectedChatId={selectedChatId}
                    onSelectChat={handleSelectChat}
                    isMobile={isMobile}
                  />
                ) : (
                  <ChatRoomPanel 
                    data={selectedChatData} 
                    isMobile={isMobile}
                    onBack={handleMobileBack}
                  />
                )
              ) : (
                // 데스크탑 뷰
                <>
                  <ChatListPanel 
                    chatList={dummyChatList} 
                    selectedChatId={selectedChatId}
                    onSelectChat={handleSelectChat}
                  />
                  <ChatRoomPanel data={selectedChatData} />
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    marginTop: 80,
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
  },
  mobileMainWrapper: {
    marginTop: 0,
    marginBottom: 0,
    flex: 1,
  },
  pageContent: {
    width: '90%', 
    maxWidth: 1600, 
    position: 'relative', 
    alignItems: 'center',
    marginHorizontal: 'auto',
  },
  mobilePageContent: {
    width: '100%',
    maxWidth: '100%',
    flex: 1,
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
  mobileCenterContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
    display: 'none', // Hide title on mobile to save space
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
  mobileChatSection: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },
});
