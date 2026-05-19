import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ChatMessage } from '../types/chat';
import { createOrGetRoom, getMessages, markRead, getChatPresignedUrls } from '../api/chatApi';
import { chatSocket } from '../api/chatSocket';
import { getMyUserId } from '../auth/tokenStorage';
import { ChevronLeft, Plus, Send, X, Download } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

export default function ChatRoom({ route, navigation }: Props) {
  const { roomId: initRoomId, targetId, targetName: initTargetName } = route.params;
  const insets = useSafeAreaInsets();
  const myUserId = getMyUserId();

  const [roomId, setRoomId] = useState<number | null>(initRoomId ?? null);
  const [targetName, setTargetName] = useState(initTargetName);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const appendMessages = useCallback((incoming: ChatMessage) => {
    setMessages(prev => [...prev, incoming]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  useEffect(() => {
    initRoom();
    return () => { chatSocket.disconnect(); };
  }, []);

  const initRoom = async () => {
    try {
      let id = initRoomId;
      let name = initTargetName;

      if (!id && targetId) {
        const room = await createOrGetRoom(targetId);
        id = room.roomId;
        name = room.target.name;
        setTargetName(name);
      }

      if (!id) return;
      setRoomId(id);

      const pageData = await getMessages(id, 0);
      // REST 응답은 최신순(내림차순) → 화면 표시용 오름차순으로 역순
      setMessages([...pageData.messages].reverse());
      setHasNext(pageData.hasNext);
      setPage(0);

      await markRead(id);

      chatSocket.connect(id, (msg) => {
        appendMessages(msg);
        markRead(id!);
      });
    } catch (err) {
      Alert.alert('오류', '채팅방을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  };

  const loadMore = async () => {
    if (!roomId || isLoadingMore || !hasNext) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const pageData = await getMessages(roomId, nextPage);
      // 이전 메시지는 목록 앞에 붙임 (역순 후 prepend)
      setMessages(prev => [...[...pageData.messages].reverse(), ...prev]);
      setHasNext(pageData.hasNext);
      setPage(nextPage);
    } catch {}
    setIsLoadingMore(false);
  };

  const sendText = () => {
    if (!roomId || !inputText.trim() || isSending) return;
    chatSocket.send(roomId, inputText.trim(), 'TEXT');
    setInputText('');
  };

  const sendImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `chat_${Date.now()}.jpg`;

    try {
      setIsSending(true);
      const urls = await getChatPresignedUrls([fileName]);
      if (!urls[0]) return;

      const { presignedUrl, fileUrl } = urls[0];
      const blob = await fetch(asset.uri).then(r => r.blob());
      await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': asset.mimeType ?? 'image/jpeg' },
      });

      if (roomId) chatSocket.send(roomId, fileUrl, 'IMAGE');
    } catch {
      Alert.alert('오류', '이미지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const saveImage = async (uri: string) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 저장 권한이 필요합니다.');
      return;
    }
    try {
      const filename = uri.split('/').pop()?.split('?')[0] ?? `image_${Date.now()}.jpg`;
      const localUri = (FileSystem.cacheDirectory ?? '') + filename;
      await FileSystem.downloadAsync(uri, localUri);
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('저장 완료', '사진이 갤러리에 저장됐습니다.');
    } catch {
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const toMinute = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMine = myUserId !== null && item.senderId === myUserId;
    const isImage = item.type === 'IMAGE';
    const time = toMinute(item.createdAt);

    // 다음 메시지가 같은 발신자 + 같은 분이면 시간 숨김 (그룹의 마지막만 표시)
    const next = messages[index + 1];
    const showTime = !next || next.senderId !== item.senderId || toMinute(next.createdAt) !== time;

    return (
      <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowOther]}>
        {isMine && showTime && <Text style={styles.timeText}>{time}</Text>}
        {isMine && !showTime && <View style={styles.timePlaceholder} />}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
          {isImage ? (
            <TouchableOpacity onPress={() => setPreviewUri(item.content)} activeOpacity={0.9}>
              <Image source={{ uri: item.content }} style={styles.imageMessage} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
              {item.content}
            </Text>
          )}
        </View>
        {!isMine && showTime && <Text style={styles.timeText}>{time}</Text>}
        {!isMine && !showTime && <View style={styles.timePlaceholder} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 SafeArea */}
      <SafeAreaView edges={['top']} style={styles.safeTop} />

      {/* 네비 바 */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1F2024" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{targetName}</Text>
        <View style={styles.navAvatar}>
          <View style={styles.avatarPlaceholder} />
        </View>
      </View>

      {/* 메시지 영역 */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <ActivityIndicator style={styles.flex} color="#006FFD" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => String(item.messageId)}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onStartReachedThreshold={0.1}
            onStartReached={loadMore}
            ListHeaderComponent={isLoadingMore ? <ActivityIndicator color="#006FFD" style={{ marginVertical: 8 }} /> : null}
          />
        )}

        {/* 입력 바 */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TouchableOpacity style={styles.addBtn} onPress={sendImage} disabled={isSending}>
            {isSending ? (
              <ActivityIndicator size="small" color="#006FFD" />
            ) : (
              <Plus size={20} color="#71727A" />
            )}
          </TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="메시지를 입력하세요"
              placeholderTextColor="#8F9098"
              multiline
              maxLength={2000}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={sendText}
              disabled={!inputText.trim()}
            >
              <Send size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 이미지 전체화면 모달 */}
      <Modal visible={!!previewUri} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setPreviewUri(null)}>
        <View style={styles.previewOverlay}>
          <Image
            source={{ uri: previewUri ?? '' }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          {/* 닫기 */}
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewUri(null)}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
          {/* 저장 */}
          <TouchableOpacity style={styles.previewSave} onPress={() => previewUri && saveImage(previewUri)}>
            <Download size={20} color="#fff" />
            <Text style={styles.previewSaveText}>저장</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },
  safeTop: { backgroundColor: '#fff' },
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  backBtn: { padding: 4, marginRight: 4 },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2024',
  },
  navAvatar: { width: 40, alignItems: 'flex-end' },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 4,
  },
  messageRowMine: { justifyContent: 'flex-end' },
  messageRowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleOther: {
    backgroundColor: '#F8F9FE',
    borderTopLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: '#006FFD',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1F2024',
  },
  messageTextMine: { color: '#fff' },
  imageMessage: {
    width: 200,
    height: 150,
  },
  timeText: {
    fontSize: 10,
    color: '#8F9098',
    marginBottom: 2,
  },
  timePlaceholder: {
    width: 30,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  previewClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
  },
  previewSave: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  previewSaveText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  addBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
    gap: 8,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2024',
    maxHeight: 120,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#006FFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#C5C6CC' },
});
