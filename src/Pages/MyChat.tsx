import { View, Text, ScrollView, StyleSheet } from "react-native";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/common/Header";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import ChatListPanel from "../components/MyChatPage/ChatListPanel";
import ChatRoomPanel from "../components/MyChatPage/ChatRoomPanel";

type Props = NativeStackScreenProps<RootStackParamList, 'MyChat'>;

export default function MyChat({ navigation }: Props) {
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
              <View>
                <Text style={styles.pageTitle}>채팅</Text>
                <Text style={styles.pageSubtitle}>나의 상황에 대해 상의해 보세요 AI가 요약하여 견적서에 반영합니다.</Text>
              </View>
            </View>

              {/* 채팅 UI 섹션 */}
              <View style={styles.chatSection}>
                {/* 왼쪽 패널 */}
                <ChatListPanel />

                {/* 오른쪽 패널 */}
                <ChatRoomPanel />
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
    marginBottom: 50,
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
  pageSubtitle: {
    fontSize: 15,
    color: '#999999',
    fontWeight: '400',
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
