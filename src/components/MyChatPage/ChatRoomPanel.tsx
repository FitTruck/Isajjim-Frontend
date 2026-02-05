import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Pressable } from "react-native";
import { ChatItemData } from "../../Pages/MyChat";
import ConfirmButton from "./ConfirmButton";
import RequestDetailModal from "../common/RequestDetailModal";
import { FileText, MessageSquareMore, ChevronRight } from 'lucide-react-native';
import { useEstimate, RequestData } from "../../context/EstimateContext";

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
  const [isFileHovered, setIsFileHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [replyStep, setReplyStep] = useState(0); // 응답 순서 관리
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { requestData, updateAiSummary, setEstimateStatus } = useEstimate();

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
  };

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
          text: `안녕하세요.\n포장이사 전문 "${data.companyName}" 입니다.\n\n회원님들께 최고의 서비스를 드리겠습니다.\n\n 혹시 짐 중에서 분해가 필요한 가구(붙박이장 등)나 특수 가전(벽걸이 TV) 등이 있을까요?`
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
          <View style={styles.profileCircle}>
            {data.logoUri ? (
              <Image source={data.logoUri} style={styles.profileImage} />
            ) : (
              <Text style={styles.profileText}>{data.companyName[0]}</Text>
            )}
          </View>
          <View style={styles.quoteBubble}>
            <View style={styles.quoteHeader}>
              <View style={styles.quoteIconCircle}>
                <FileText size={16} color="white" />              </View>
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
              <MessageSquareMore size={14} color="#A0A0A0" style={{marginTop: 2}} />              <Text style={styles.quoteHelpText}>나의 상황에 대해 상의해 보세요. 확정 시, AI가 요약하여 요청사항에 반영합니다.</Text>
            </View>

            <TouchableOpacity style={styles.quoteButton}>
              <Text style={styles.quoteButtonText}>업체 프로필 보기</Text>
              <ChevronRight size={16} color="white" />            </TouchableOpacity>
          </View>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      );
    }

    if (item.type === 'intro' && item.text) {
      return (
        // 두 번째 메시지 : 소개
        <View style={[styles.messageRow, styles.theirMessageRow]}>
          <View style={[styles.profileCircle, { opacity: 0 }]} />
          <View style={[styles.messageBubble, styles.theirMessageBubble]}>
            <Text style={[styles.messageText, styles.theirMessageText]}>
              {item.text}
            </Text>
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
            {data.logoUri ? (
              <Image source={data.logoUri} style={styles.profileImage} />
            ) : (
              <Text style={styles.profileText}>{data.companyName[0]}</Text>
            )}
          </View>
        )}
        {item.isMe && <Text style={styles.messageTime}>{item.time}</Text>}
        <View style={[
          styles.messageBubble, 
          item.isMe ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          <Text style={[
            styles.messageText, 
            item.isMe ? styles.myMessageText : styles.theirMessageText
          ]}>{item.text}</Text>
        </View>
        {!item.isMe && <Text style={styles.messageTime}>{item.time}</Text>}
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


          <TouchableOpacity 
            style={styles.headerRequestButton}
            onPress={() => setIsRequestModalVisible(true)}
          >
            <Image source={require('../../../assets/docs.png')} style={styles.headerRequestIcon} resizeMode="contain" />
            <Text style={styles.headerRequestText}>내 요청사항</Text>
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
              <Image source={require('../../../assets/file.png')} style={styles.clipIcon} />
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
              <Image source={require('../../../assets/plane.png')} style={styles.sendIcon} />
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
  messageBubble: {
    maxWidth: '39%',
    padding: 15,
    borderRadius: 12,
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
    marginVertical: 4,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
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
    backgroundColor: '#F0893B',
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
    fontWeight: '500'
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
