import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Pressable } from "react-native";
import { ChatItemData } from "../../Pages/MyChat";
import ConfirmButton from "./ConfirmButton";
import RequestDetailModal from "../common/RequestDetailModal";
import { FileText, MessageSquareMore, ChevronRight, ChevronLeft, Paperclip, Send } from 'lucide-react-native';
import { useEstimate, RequestData } from "../../context/EstimateContext";

interface ChatRoomPanelProps {
  data: ChatItemData | null;
  isMobile?: boolean; // Mobile check
  onBack?: () => void; // Mobile back navigation
}

interface Message {
  id: string;
  type: 'text' | 'quote' | 'intro';
  text?: string;
  isMe: boolean;
  time: string;
  price: string;
}

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

export default function ChatRoomPanel({ data, isMobile = false, onBack }: ChatRoomPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isFileHovered, setIsFileHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [replyStep, setReplyStep] = useState(0); // 응답 순서 관리
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { requestData, updateAiSummary, setEstimateStatus, setConfirmedCompany, chatStartTime } = useEstimate();

  // Context 데이터가 있으면 사용, 없으면 빈 값으로 초기화 (Error Case 대비)
  const displayData: RequestData = requestData ? {
    ...requestData
  } : {
    // 데이터 없음 >>>> 없는 대로 두기
    estimateId: 0,
    movingDate: null,
    startLocation: {
      address: null, detailAddress: null, floor: null, elevator: null,
      buildingType: null, roomSize: null, ladderTruck: null, roomType: null,
      duplex: null, groundStair: null, parking: null
    },
    endLocation: {
      address: null, detailAddress: null, floor: null, elevator: null,
      buildingType: null, roomSize: null, ladderTruck: null, roomType: null,
      duplex: null, groundStair: null, parking: null
    },
    items: [],
    truckInfo: null,
    aiSummary: undefined
  };

  const handleConfirmSuccess = (summary: string) => {
    // context에 aiSummary 업데이트
    updateAiSummary(summary);
    // 상태를 이사 진행 중으로 변경
    setEstimateStatus('moving');
    // 확정된 업체 정보 저장
    if (data) {
      setConfirmedCompany({
        name: data.companyName,
        logo: data.logoUri,
        price: data.price,
        rating: data.rating
      });
    }

    // MyEstimate 페이지로 이동
    navigation.navigate('MyEstimate');
  };

  // 채팅방 변경 시 메시지 초기화 (mock 데이터)
  useEffect(() => {
    if (data) {
      const initialTime = chatStartTime || '방금';
      setMessages([
        { 
          id: '1', 
          type: 'quote',
          isMe: false, 
          time: initialTime,
          price: data.price
        },
        { 
          id: '2', 
          type: 'intro',
          isMe: false, 
          time: initialTime,
          price: data.price,
          text: `안녕하세요.\n포장이사 전문 "${data.companyName}" 입니다.\n\n회원님들께 최고의 서비스를 드리겠습니다.\n\n 혹시 짐 중에서 분해가 필요한 가구(붙박이장 등)나 특수 가전(벽걸이 TV) 등이 있을까요?`
        },
      ]);
    }
  }, [data, chatStartTime]);

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

    // 자동 응답 로직
    setTimeout(() => {
      let replyText = "";
      
      if (replyStep === 0) {
        replyText = "확인 감사합니다.";
      } else if (replyStep === 1) {
        replyText = "알겠습니다 그럼 당일날 뵙겠습니다.";
      }

      if (replyText) {
        const replyMessage: Message = {
          id: Date.now().toString() + '_reply',
          type: 'text',
          text: replyText,
          isMe: false,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          price: data.price
        };

        setMessages(prev => [...prev, replyMessage]);
        setReplyStep(prev => prev + 1);

        // 응답 후 스크롤
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, 1500); // 1.5초 뒤 응답
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
        // 첫 번째 메시지 : 견적서
        <View style={[styles.messageRow, styles.theirMessageRow]}>
          <View style={[styles.profileCircle, isMobile && styles.mobileProfileCircle]}>
            {data.logoUri ? (
              <Image source={data.logoUri} style={styles.profileImage} />
            ) : (
              <Text style={[styles.profileText, isMobile && styles.mobileProfileText]}>{data.companyName[0]}</Text>
            )}
          </View>
          <View style={[styles.quoteBubble, isMobile && styles.mobileQuoteBubble]}>
            <View style={styles.quoteHeader}>
              <View style={[styles.quoteIconCircle, isMobile && styles.mobileQuoteIconCircle]}>
                <FileText size={isMobile ? 14 : 16} color="white" />              </View>
              <Text style={[styles.quoteTitle, isMobile && styles.mobileQuoteTitle]}>견적서</Text>
            </View>

            <Text style={[styles.quoteGreeting, isMobile && styles.mobileQuoteGreeting]}>
              고객님 안녕하세요. 요청서에 따른 예상 금액입니다.
            </Text>

            <View style={styles.quoteDivider} />

            <View style={styles.quoteInfoRow}>
              <Text style={[styles.quoteLabel, isMobile && styles.mobileQuoteLabel]}>예상금액</Text>
              <Text style={[styles.quotePriceValue, isMobile && styles.mobileQuotePriceValue]}>총 {item.price} 부터~</Text>
            </View>

            <View style={styles.quoteDivider} />

            <View style={styles.quoteHelpRow}>
              <MessageSquareMore size={isMobile ? 12 : 14} color="#A0A0A0" style={{marginTop: 2}} />              <Text style={[styles.quoteHelpText, isMobile && styles.mobileQuoteHelpText]}>나의 상황에 대해 상의해 보세요. 확정 시, AI가 요약하여 요청사항에 반영합니다.</Text>
            </View>

            <TouchableOpacity style={[styles.quoteButton, isMobile && styles.mobileQuoteButton]}>
              <Text style={[styles.quoteButtonText, isMobile && styles.mobileQuoteButtonText]}>업체 프로필 보기</Text>
              <ChevronRight size={isMobile ? 14 : 16} color="white" />            </TouchableOpacity>
          </View>
          <Text style={[styles.messageTime, isMobile && styles.mobileMessageTime]}>{item.time}</Text>
        </View>
      );
    }

    if (item.type === 'intro' && item.text) {
      return (
        // 두 번째 메시지 : 소개
        <View style={[styles.messageRow, styles.theirMessageRow]}>
          <View style={[styles.profileCircle, isMobile && styles.mobileProfileCircle, { opacity: 0 }]} />
          <View style={[
            styles.messageBubble, 
            styles.theirMessageBubble,
            isMobile && styles.mobileMessageBubble,
            isMobile && { maxWidth: '70%' }
          ]}>
            <Text style={[styles.messageText, styles.theirMessageText, isMobile && styles.mobileMessageText]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.messageTime, isMobile && styles.mobileMessageTime]}>{item.time}</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageRow, 
        item.isMe ? styles.myMessageRow : styles.theirMessageRow
      ]}>
        {!item.isMe && (
          <View style={[styles.profileCircle, isMobile && styles.mobileProfileCircle]}>
            {data.logoUri ? (
              <Image source={data.logoUri} style={styles.profileImage} />
            ) : (
              <Text style={[styles.profileText, isMobile && styles.mobileProfileText]}>{data.companyName[0]}</Text>
            )}
          </View>
        )}
        {item.isMe && <Text style={[styles.messageTime, isMobile && styles.mobileMessageTime]}>{item.time}</Text>}
        <View style={[
          styles.messageBubble, 
          item.isMe ? styles.myMessageBubble : styles.theirMessageBubble,
          isMobile && styles.mobileMessageBubble,
          isMobile && { maxWidth: '70%' }
        ]}>
          <Text style={[
            styles.messageText, 
            item.isMe ? styles.myMessageText : styles.theirMessageText,
            isMobile && styles.mobileMessageText
          ]}>{item.text}</Text>
        </View>
        {!item.isMe && <Text style={[styles.messageTime, isMobile && styles.mobileMessageTime]}>{item.time}</Text>}
      </View>
    );
  };

  return (
    <View style={[styles.rightPanel, isMobile && styles.mobileRightPanel]}>
      {/* 헤더 */}
      <View style={[styles.chatHeader, isMobile && styles.mobileChatHeader]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 5 : 10, flex: 1, overflow: 'hidden' }}>
          {isMobile && onBack && (
            <TouchableOpacity onPress={onBack} style={{ padding: 5, marginLeft: -5, marginRight: 0 }}>
              <ChevronLeft size={24} color="#333" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerCompanyName} numberOfLines={1} ellipsizeMode="tail">{data.companyName}</Text>
            <Text style={styles.headerCompanyDesc} numberOfLines={1} ellipsizeMode="tail">보통 15분 내 응답, 응답률 100%</Text>
          </View>
        </View>

        <View style={[styles.headerRightGroup, isMobile && { gap: 6 }]}>
          {!isMobile && (
            <View style={styles.headerPriceBlock}>
              <Text style={styles.headerPriceLabel}>제안 가격:</Text>
              <Text style={styles.headerPriceValue}>{data.price}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.headerRequestButton, isMobile && { paddingHorizontal: 8 }]}
            onPress={() => setIsRequestModalVisible(true)}
          >
            <FileText color="#555" size={14} style={[isMobile && { marginRight: 0 }, !isMobile && { marginRight: 6 }]} />
            {!isMobile && <Text style={styles.headerRequestText}>내 요청사항</Text>}
          </TouchableOpacity>

          {/* 확정하기 버튼 */}
          <ConfirmButton messages={messages} onConfirm={handleConfirmSuccess} />
        </View>
      </View>

      <RequestDetailModal 
        visible={isRequestModalVisible}
        onClose={() => setIsRequestModalVisible(false)}
        data={displayData}
      />

      {/* 콘텐츠 */}
      <View style={styles.chatContent}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.messageList, isMobile && styles.mobileMessageList]}
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
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !(e.nativeEvent as any).shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <View style={styles.footerToolbar}>
            <Pressable 
              onHoverIn={() => setIsFileHovered(true)}
              onHoverOut={() => setIsFileHovered(false)}
              style={[
                styles.iconButton,
                isFileHovered && styles.iconButtonHovered
              ]}
            >
              <Paperclip color="#999" size={20} />
            </Pressable>

            <Pressable 
              onPress={handleSend}
              onHoverIn={() => setIsSendHovered(true)}
              onHoverOut={() => setIsSendHovered(false)}
              style={[
                styles.iconButton,
                isSendHovered && styles.iconButtonHoveredOrange
              ]}
            >
              <Send color="#F0893B" size={24} />
            </Pressable>
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
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
  },
  mobileRightPanel: {
    marginLeft: 0,
    borderWidth: 0,
    borderRadius: 0,
    flex: 1,
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
  mobileChatHeader: {
    paddingHorizontal: 10,
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
  mobileMessageList: {
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  messageRow: {
    marginBottom: 20,
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
  },
  mobileProfileCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  profileText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  mobileProfileText: {
    fontSize: 12,
  },
  messageBubble: {
    maxWidth: '39%', // 웹 기본값
    padding: 15,
    borderRadius: 12,
  },
  mobileMessageBubble: {
    padding: 12,
    borderRadius: 10,
  },
  myMessageBubble: {
    backgroundColor: '#F0893B', // 내 메시지는 주황색
    borderTopRightRadius: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  theirMessageBubble: {
    backgroundColor: '#FFFFFF', // 상대방 메시지는 흰색
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  mobileMessageText: {
    fontSize: 12,
    lineHeight: 17,
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
  mobileMessageTime: {
    fontSize: 9,
    marginLeft: 4,
    marginRight: 4,
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
    tintColor: '#F0893B', 
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
  mobileQuoteBubble: {
    borderRadius: 12,
    padding: 12,
    maxWidth: '70%',
    marginTop: 3,
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
  mobileQuoteIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  quoteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  mobileQuoteTitle: {
    fontSize: 12,
  },
  quoteGreeting: {
    marginVertical: 4,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  mobileQuoteGreeting: {
    fontSize: 11,
    lineHeight: 16,
    marginVertical: 3,
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
  mobileQuoteLabel: {
    fontSize: 10,
  },
  quotePriceValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  mobileQuotePriceValue: {
    fontSize: 13,
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
  mobileQuoteHelpText: {
    fontSize: 9,
    lineHeight: 14,
  },
  quoteButton: {
    backgroundColor: '#F0893B',
    borderRadius: 8,
    height: 38,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  mobileQuoteButton: {
    height: 34,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  quoteButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500'
  },
  mobileQuoteButtonText: {
    fontSize: 11,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  iconButtonHovered: {
    backgroundColor: '#F5F5F5',
  },
  iconButtonHoveredOrange: {
    backgroundColor: '#FFF3E0', // 연한 주황색 (Light Orange)
  },

});
