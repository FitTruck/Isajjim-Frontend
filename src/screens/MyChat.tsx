import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/common/Header";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MyChat'>;

export default function MyChat({ navigation }: Props) {
  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <Header />

      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* 메인 Wrapper */}
        <View style={styles.mainWrapper}>
          
          {/* Page Content: 기준점 */}
          <View style={styles.pageContent}>

            {/* 중앙정렬 컨테이너*/}
            <View style={styles.centerContainer}>

              {/* 타이틀 섹션 */}
              <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>내 견적</Text>
                <View style={styles.subtitleRow}>
                  <View style={styles.subtitleBar} />
                  <Text style={styles.pageSubtitle}>업체에게 받은 견적서를 확인하세요</Text>
                </View>
              </View>
            </View>

              {/* 채팅 UI 섹션 */}
              <View style={styles.chatSection}>
                {/* 왼쪽 패널 */}
                <View style={styles.leftPanel}>
                  {/* 검색 바 */}
                  <View style={styles.searchBar}>
                    <Text style={styles.searchTextPlaceholder}>대화방 검색</Text>
                    <Image source={{uri: 'https://placehold.co/31x31'}} style={{width: 31, height: 31}} />
                  </View>

                  {/* 필터 바 */}
                  <View style={styles.filterBar}>
                    <Text style={styles.filterTotal}>전체</Text>
                    <Text style={styles.filterUnread}>안 읽음 18</Text>
                  </View>
                  <View style={styles.divider} />

                  {/* 채팅 리스트 아이템 */}
                  {/* 아이템 1 (활성) */}
                  <View style={[styles.chatItem, styles.chatItemActive]}>
                    <Image source={{uri: 'https://placehold.co/55x55'}} style={styles.avatar} />
                    <View style={styles.chatItemContent}>
                      <View style={styles.chatItemHeader}>
                        <Text style={styles.chatItemName}>백마익스프레스</Text>
                        <View style={styles.chatItemMeta}>
                           <View style={styles.statusDot} />
                           <Text style={styles.chatTime}>방금</Text>
                        </View>
                      </View>
                      <View style={styles.chatItemPriceRow}>
                         <Text style={styles.chatPriceLabel}>제안 가격:</Text>
                         <Text style={styles.chatPriceValue}>860,000원</Text>
                      </View>
                    </View>
                  </View>

                  {/* 아이템 2 */}
                  <View style={styles.chatItem}>
                    <Image source={{uri: 'https://placehold.co/55x55'}} style={styles.avatar} />
                    <View style={styles.chatItemContent}>
                      <View style={styles.chatItemHeader}>
                        <Text style={styles.chatItemName}>백마익스프레스</Text>
                        <View style={styles.chatItemMeta}>
                           <View style={styles.statusDotGray} />
                           <Text style={styles.chatTime}>1월 9일</Text>
                        </View>
                      </View>
                      <View style={styles.chatItemPriceRow}>
                         <Text style={styles.chatPriceLabel}>제안 가격:</Text>
                         <Text style={styles.chatPriceValue}>820,000원</Text>
                      </View>
                    </View>
                    <View style={styles.unreadDot} />
                  </View>

                   {/* 아이템 3 */}
                   <View style={styles.chatItem}>
                    <View style={styles.avatarPlaceholder}>
                         <Text style={{fontSize: 10}}>Logo</Text> 
                    </View>
                    <View style={styles.chatItemContent}>
                      <View style={styles.chatItemHeader}>
                        <Text style={styles.chatItemName}>백마익스프레스</Text>
                        <View style={styles.chatItemMeta}>
                           <View style={styles.statusDotGray} />
                           <Text style={styles.chatTime}>1월 8일</Text>
                        </View>
                      </View>
                      <View style={styles.chatItemPriceRow}>
                         <Text style={styles.chatPriceLabel}>제안 가격:</Text>
                         <Text style={styles.chatPriceValue}>900,000원</Text>
                      </View>
                    </View>
                    <View style={styles.unreadDot} />
                  </View>

                  {/* 휴지통 아이콘 */}
                  <Image source={{uri: 'https://placehold.co/18x18'}} style={styles.trashIcon} />
                </View>

                {/* 오른쪽 패널 */}
                <View style={styles.rightPanel}>
                  {/* 헤더 */}
                  <View style={styles.chatHeader}>
                    <View>
                       <Text style={styles.headerCompanyName}>백마익스프레스</Text>
                       <Text style={styles.headerCompanyDesc}>보통 15분 내 응답, 응답률 100%</Text>
                    </View>
                    <View style={styles.headerRightGroup}>
                       <View style={styles.headerPriceBlock}>
                          <Text style={styles.headerPriceLabel}>제안 가격:</Text>
                          <Text style={styles.headerPriceValue}>860,000원</Text>
                       </View>
                       <View style={styles.confirmButton}>
                          <Text style={styles.confirmButtonText}>확정하기</Text>
                       </View>
                    </View>
                  </View>

                  {/* 콘텐츠 */}
                  <View style={styles.chatContent}>
                     <View style={styles.pinkLoader} />
                  </View>

                  {/* 푸터 입력창 */}
                  <View style={styles.chatFooter}>
                     <Image source={{uri: 'https://placehold.co/20x20'}} style={styles.clipIcon} />
                     <Image source={{uri: 'https://placehold.co/22x22'}} style={styles.sendIcon} />
                  </View>
                </View>
              </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
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
  },
  
  // 중앙 컨텐츠 컨테이너 
  centerContainer: {
    width: 900, 
    alignSelf: 'center',
  },

  titleSection: {
    marginBottom: 60,
    width: '100%', 
  },
  pageTitle: {
    fontSize: 60,
    fontWeight: '700',
    color: '#3D3D3A',
    marginBottom: 20,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 22, 
  },
  subtitleBar: {
    width: 7,
    height: 27,
    backgroundColor: '#FADDC3',
    marginRight: 15,
    position: 'absolute',
    left: -22,
  },
  pageSubtitle: {
    fontSize: 20,
    color: '#62625D',
    fontWeight: '400',
  },

  // 채팅 레이아웃 스타일
  chatSection: {
    flexDirection: 'row',
    width: 1050,
    height: 611,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'white',
    overflow: 'visible',
    // 필요시 컨테이너 오버플로우 허용 또는 자체 중앙 정렬
    alignSelf: 'center',
    position: 'relative',
  },
  leftPanel: {
    width: 279,
    borderRightWidth: 1,
    borderRightColor: '#E6E6E6',
    position: 'relative',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#FFF6EF',
    position: 'relative',
    zIndex: 99,
  },

  // 왼쪽 패널 요소
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
  searchTextPlaceholder: {
    color: '#929AA9',
    fontSize: 20,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    marginTop: 10,
    marginBottom: 10,
  },
  filterTotal: {
    fontSize: 18,
    color: '#3D3D3A',
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
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
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
    color: 'black',
  },
  chatPriceValue: {
    fontSize: 15,
    color: 'black',
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

  // 오른쪽 패널 요소
  chatHeader: {
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF' // 스니펫 오른쪽 패널 상단 헤더는 보통 흰색
  },
  headerCompanyName: {
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
  },
  headerCompanyDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7E7E7E',
    marginTop: 2,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerPriceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerPriceLabel: {
    fontSize: 15,
    color: '#727272',
    fontWeight: '500',
  },
  headerPriceValue: {
    fontSize: 22,
    fontWeight: '500',
    color: 'black',
  },
  confirmButton: {
    backgroundColor: '#F0893B',
    borderRadius: 8,
    paddingHorizontal: 17,
    paddingVertical: 5,
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  chatContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinkLoader: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF00CC', // 이미지 중앙에 보이는 핑크색 링 
  },

  chatFooter: {
    height: 115,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'flex-end', // 아이콘을 하단 정렬 또는 필요에 따라 조정 
  },
  clipIcon: {
    width: 20,
    height: 20,
  },
  sendIcon: {
    width: 22,
    height: 22,
  },
});