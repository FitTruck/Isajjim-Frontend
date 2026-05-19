import 'text-encoding'; // React Native TextEncoder/TextDecoder 폴리필
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { getAccessToken, getRefreshToken, setTokens } from '../auth/tokenStorage';
import { BACKEND_DOMAIN } from '../utils/Server';
import { ChatMessage } from '../types/chat';
import axios from 'axios';

const WS_URL = BACKEND_DOMAIN.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/ws/chat';

type MessageHandler = (msg: ChatMessage) => void;

class ChatSocketManager {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private sendQueue: { roomId: number; content: string; type: 'TEXT' | 'IMAGE' }[] = [];

  connect(roomId: number, handler: MessageHandler): void {
    if (this.client?.connected) {
      console.log('[WS] 기존 연결 재사용 → subscribe roomId:', roomId);
      this.doSubscribe(roomId, handler);
      return;
    }

    this.client?.deactivate();
    this.client = null;

    const token = getAccessToken();
    console.log('[WS] connect | URL:', WS_URL, '| roomId:', roomId, '| token:', !!token);

    this.client = new Client({
      // React Native: webSocketFactory + User-Agent 명시 (Nginx 403 방지)
      webSocketFactory: () => {
        const WS = WebSocket as any;
        return new WS(WS_URL, [], { headers: { 'User-Agent': 'IsajjimApp/1.0' } });
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 0,
      // React Native: binary frame으로 전송해야 null byte(\x00) 보존됨
      // 문자열 전송 시 RN bridge가 JSON 직렬화하면서 \x00 제거됨
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        console.log('[WS] CONNECTED ✓');
        this.doSubscribe(roomId, handler);
        this.flushQueue();
      },
      onStompError: async (frame) => {
        console.error('[WS] STOMP ERROR:', frame.headers['message'], frame.body);
        if ((frame.headers['message'] ?? '').includes('401')) {
          await this.refreshAndReconnect(roomId, handler);
        }
      },
      onWebSocketError: (evt) => console.error('[WS] WebSocket ERROR:', evt),
      onDisconnect: () => console.warn('[WS] DISCONNECTED'),
      onWebSocketClose: (evt) =>
        console.warn('[WS] CLOSE | code:', (evt as CloseEvent).code, 'reason:', (evt as CloseEvent).reason),
    });

    this.client.activate();
  }

  private doSubscribe(roomId: number, handler: MessageHandler): void {
    this.subscription?.unsubscribe();
    const dest = `/sub/chat/rooms/${roomId}`;
    console.log('[WS] SUBSCRIBE →', dest);
    this.subscription = this.client!.subscribe(dest, (frame: IMessage) => {
      console.log('[WS] MESSAGE 수신:', frame.body);
      try { handler(JSON.parse(frame.body) as ChatMessage); }
      catch (e) { console.error('[WS] 파싱 오류:', e); }
    });
  }

  private flushQueue(): void {
    if (!this.sendQueue.length) return;
    console.log('[WS] flush 대기 메시지:', this.sendQueue.length);
    this.sendQueue.forEach(({ roomId, content, type }) => this.doPublish(roomId, content, type));
    this.sendQueue = [];
  }

  private doPublish(roomId: number, content: string, type: 'TEXT' | 'IMAGE'): void {
    const dest = `/pub/chat/rooms/${roomId}/messages`;
    const body = JSON.stringify({ content, type });
    console.log('[WS] SEND →', dest, body);
    this.client!.publish({ destination: dest, body });
  }

  send(roomId: number, content: string, type: 'TEXT' | 'IMAGE' = 'TEXT'): void {
    if (!this.client?.connected) {
      console.warn('[WS] 미연결 → 큐 추가');
      this.sendQueue.push({ roomId, content, type });
      return;
    }
    this.doPublish(roomId, content, type);
  }

  disconnect(): void {
    console.log('[WS] disconnect');
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.client?.deactivate();
    this.client = null;
    this.sendQueue = [];
  }

  private async refreshAndReconnect(roomId: number, handler: MessageHandler): Promise<void> {
    try {
      const res = await axios.post(`${BACKEND_DOMAIN}/api/v1/users/reissue`, { refreshToken: getRefreshToken() });
      const { accessToken, refreshToken: newRT } = res.data.data;
      setTokens(accessToken, newRT);
      this.connect(roomId, handler);
    } catch (e) {
      console.error('[WS] 토큰 재발급 실패:', e);
    }
  }
}

export const chatSocket = new ChatSocketManager();
