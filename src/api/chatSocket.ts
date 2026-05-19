import 'text-encoding';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { getAccessToken, getRefreshToken, setTokens } from '../auth/tokenStorage';
import { BACKEND_DOMAIN } from '../utils/Server';
import axios from 'axios';

const WS_URL = BACKEND_DOMAIN.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/ws/chat';

type Handler = (body: any) => void;

class ChatSocketManager {
  private client: Client | null = null;
  // subId → { destination, stompSub, handler }
  private subs = new Map<string, { destination: string; handler: Handler; stompSub?: StompSubscription }>();
  private sendQueue: { roomId: number; content: string; type: 'TEXT' | 'IMAGE' }[] = [];
  private counter = 0;

  private buildClient(): Client {
    const token = getAccessToken();
    return new Client({
      webSocketFactory: () => {
        const WS = WebSocket as any;
        return new WS(WS_URL, [], { headers: { 'User-Agent': 'IsajjimApp/1.0' } });
      },
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 0,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        console.log('[WS] CONNECTED ✓');
        // 대기 중인 모든 구독 전송
        this.subs.forEach((sub, id) => {
          if (!sub.stompSub) this.doSubscribe(id, sub.destination, sub.handler);
        });
        this.flushQueue();
      },
      onStompError: async (frame) => {
        console.error('[WS] STOMP ERROR:', frame.headers['message']);
        if ((frame.headers['message'] ?? '').includes('401')) {
          await this.refreshAndReconnect();
        }
      },
      onWebSocketError: (evt) => console.error('[WS] WebSocket ERROR:', evt),
      onDisconnect: () => console.warn('[WS] DISCONNECTED'),
      onWebSocketClose: (evt) =>
        console.warn('[WS] CLOSE | code:', (evt as CloseEvent).code),
    });
  }

  private ensureConnected(): void {
    if (this.client) return;
    this.client = this.buildClient();
    this.client.activate();
    console.log('[WS] activate()');
  }

  private doSubscribe(id: string, destination: string, handler: Handler): void {
    if (!this.client?.connected) return;
    console.log('[WS] SUBSCRIBE →', destination);
    const stompSub = this.client.subscribe(destination, (frame: IMessage) => {
      try { handler(JSON.parse(frame.body)); }
      catch (e) { console.error('[WS] 파싱 오류:', e); }
    });
    const existing = this.subs.get(id);
    if (existing) this.subs.set(id, { ...existing, stompSub });
  }

  // destination: '/sub/chat/rooms/{roomId}' 또는 '/sub/user/{userId}'
  subscribe(destination: string, handler: Handler): () => void {
    const id = `sub-${this.counter++}`;
    this.subs.set(id, { destination, handler });

    if (this.client?.connected) {
      this.doSubscribe(id, destination, handler);
    } else {
      this.ensureConnected();
    }

    return () => {
      const sub = this.subs.get(id);
      sub?.stompSub?.unsubscribe();
      this.subs.delete(id);
      if (this.subs.size === 0) this.disconnect();
    };
  }

  private flushQueue(): void {
    if (!this.sendQueue.length) return;
    this.sendQueue.forEach(({ roomId, content, type }) => this.doPublish(roomId, content, type));
    this.sendQueue = [];
  }

  private doPublish(roomId: number, content: string, type: 'TEXT' | 'IMAGE'): void {
    const dest = `/pub/chat/rooms/${roomId}/messages`;
    console.log('[WS] SEND →', dest);
    this.client!.publish({ destination: dest, body: JSON.stringify({ content, type }) });
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
    this.subs.forEach(sub => sub.stompSub?.unsubscribe());
    this.subs.clear();
    this.client?.deactivate();
    this.client = null;
    this.sendQueue = [];
  }

  private async refreshAndReconnect(): Promise<void> {
    try {
      const res = await axios.post(`${BACKEND_DOMAIN}/api/v1/users/reissue`, { refreshToken: getRefreshToken() });
      const { accessToken, refreshToken: newRT } = res.data.data;
      setTokens(accessToken, newRT);
      this.client?.deactivate();
      this.client = null;
      this.ensureConnected();
    } catch (e) {
      console.error('[WS] 토큰 재발급 실패:', e);
    }
  }
}

export const chatSocket = new ChatSocketManager();
