import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { ChatItemData } from "../../Pages/MyChat";
import MyTouch from "../common/MyTouch";
import { Ionicons } from '@expo/vector-icons';

interface ChatRoomPanelProps {
  data: ChatItemData | null;
}

interface Message {
  id: string;
  type: 'text' | 'quote' | 'intro';
  text?: string;
  isMe: boolean;
  time: string;
  price: string;
}

export default function ChatRoomPanel({ data }: ChatRoomPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // 채팅방 변경 시 메시지 초기화 (mock 데이터)
  useEffect(() => {
    if (data) {
      setMessages([
        { 
          id: '1', 
          type: 'quote',
          isMe: false, 
          time: '오후 12:50',
          price: data.price
        },
        { 
          id: '2', 
          type: 'intro',
          isMe: false, 
          time: '오후 12:51',
          price: data.price,
          text: `안녕하세요.\n포장이사 전문 "${data.companyName}" 입니다.\n\n숨고 회원님들께 최고의 서비스를 드리겠습니다..\n\n◆ 2.5톤 이사 금액은\n\n* 포장 이사: 1,950,000원 (작업인원 2명 기준)\n\n거리 및 작업 조건에 따라 가격 상이\n\n◆ 사다리 추가 별도\n\n* 5층(2.5톤) 기준: 150,000원\n(층 수와 짐 양에 따라...`
        },
      ]);
    }
  }, [data]);

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    if (!data) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      text: inputText,
      isMe: true,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      price: data.price
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    
    // 스크롤 아래로
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!data) {
    return (
      <View style={[styles.rightPanel, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#999' }}>채팅방을 선택해주세요.</Text>
      </View>
    );
  }

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === 'quote' && item.price) {
      return (
        <View style={[styles.messageRow, styles.theirMessageRow]}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>{data.companyName[0]}</Text>
          </View>
          <View style={styles.quoteBubble}>
            <View style={styles.quoteHeader}>
              <View style={styles.quoteIconCircle}>
                 <Ionicons name="document-text-outline" size={16} color="white" />
              </View>
              <Text style={styles.quoteTitle}>견적서</Text>
            </View>

            <Text style={styles.quoteGreeting}>
              고객님 안녕하세요. 요청서에 따른 예상 금액입니다.
            </Text>

            <View style={styles.quoteDivider} />

            <View style={styles.quoteInfoRow}>
              <Text style={styles.quoteLabel}>예상금액</Text>
              <Text style={styles.quotePriceValue}>총 {item.price} 부터~</Text>
            </View>

            <View style={styles.quoteDivider} />

            <View style={styles.quoteHelpRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#A0A0A0" style={{marginTop: 2}} />
              <Text style={styles.quoteHelpText}>나의 상황에 대해 상의해 보세요. 확정 시, AI가 요약하여 요청사항에 반영합니다.</Text>
            </View>

            <TouchableOpacity style={styles.quoteButton}>
              <Text style={styles.quoteButtonText}>업체 프로필 보기</Text>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      );
    }

    if (item.type === 'intro' && item.text) {
      return (
        <View style={[styles.messageRow, styles.theirMessageRow]}>
          <View style={[styles.profileCircle, { opacity: 0 }]} />
          <View style={[styles.messageBubble, styles.theirMessageBubble, { width: 280, maxWidth: 280 }]}>
            <Text style={styles.quoteGreeting}>
              {item.text}
            </Text>
             
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageRow, 
        item.isMe ? styles.myMessageRow : styles.theirMessageRow
      ]}>
        {!item.isMe && (
          <View style={styles.profileCircle}>
            {/* 상대방 프로필 자리 (로고 등) */}
            <Text style={styles.profileText}>{data.companyName[0]}</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble, 
          item.isMe ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          <Text style={[
            styles.messageText, 
            item.isMe ? styles.myMessageText : styles.theirMessageText
          ]}>{item.text}</Text>
        </View>
        <Text style={styles.messageTime}>{item.time}</Text>
      </View>
    );
  };

  return (
    <View style={styles.rightPanel}>
      {/* 헤더 */}
      <View style={styles.chatHeader}>
        <View>
          <Text style={styles.headerCompanyName}>{data.companyName}</Text>
          <Text style={styles.headerCompanyDesc}>보통 15분 내 응답, 응답률 100%</Text>
        </View>
        <View style={styles.headerRightGroup}>
          <View style={styles.headerPriceBlock}>
            <Text style={styles.headerPriceLabel}>제안 가격:</Text>
            <Text style={styles.headerPriceValue}>{data.price}</Text>
          </View>

          <TouchableOpacity style={styles.headerRequestButton}>
            <Image source={require('../../../assets/docs.png')} style={styles.headerRequestIcon} resizeMode="contain" />
            <Text style={styles.headerRequestText}>내 요청사항</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>확정하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 콘텐츠 */}
      <View style={styles.chatContent}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* 푸터 입력창 */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.chatFooter}>
          <TextInput 
            style={[styles.input, Platform.select({ web: { outlineStyle: 'none' } }) as any]}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
          />

          <View style={styles.footerToolbar}>
            <MyTouch>
              <Image source={require('../../../assets/file.png')} style={styles.clipIcon} />
            </MyTouch>

            <MyTouch onPress={handleSend}>
              <Image source={require('../../../assets/plane.png')} style={styles.sendIcon} />
            </MyTouch>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  rightPanel: {
    flex: 1,
    position: 'relative',
    zIndex: 99,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF' 
  },
  headerCompanyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
    fontWeight: '700',
    color: '#333333',
    bottom: 2
  },
  confirmButton: {
    backgroundColor: '#EA6500',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FF8A32',
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '400',
  },
  headerRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerRequestIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  headerRequestText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  
  // 채팅 영역 스타일
  chatContent: {
    flex: 1,
    backgroundColor: '#eef0f3',
  },
  messageList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 40,
  },
  messageRow: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    top: 10,
  },
  profileText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
  },
  myMessageBubble: {
    backgroundColor: '#EA6500', // 내 메시지는 주황색
    borderTopRightRadius: 2,
  },
  theirMessageBubble: {
    backgroundColor: '#FFFFFF', // 상대방 메시지는 흰색
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#FFF',
  },
  theirMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: '#AAA',
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 2,
  },

  // 푸터 스타일
  chatFooter: {
    minHeight: 125, // 높이 증가
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    flexDirection: 'column', // 세로 배치
    padding: 10,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top', // 상단 정렬
  },
  footerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  clipIcon: {
    width: 20,
    height: 20,
    tintColor: '#999', 
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: '#EA6500', 
  },
  quoteBubble: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    maxWidth: 280,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quoteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  quoteGreeting: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 12,
  },
  quoteDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  quoteInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  quoteLabel: {
    fontSize: 12,
    color: '#888',
  },
  quotePriceValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  quoteHelpRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 12,
    gap: 8,
  },
  quoteHelpText: {
    fontSize: 11,
    color: '#888',
    flex: 1,
    lineHeight: 16,
  },
  quoteButton: {
    backgroundColor: '#EA6500',
    borderRadius: 8,
    height: 38,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  quoteButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  viewAllButtonText: {
    fontSize: 13,
    color: '#555',
  },
});
