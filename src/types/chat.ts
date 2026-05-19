export interface ChatRoomTarget {
  name: string;
  profileImageUrl?: string;
}

export interface ChatRoom {
  roomId: number;
  creatorId: number;
  targetId: number;
  target: ChatRoomTarget;
  lastMessageContent?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatMessage {
  messageId: number;
  roomId: number;
  senderId: number;
  content: string;
  type: 'TEXT' | 'IMAGE';
  createdAt: string;
}

export interface ChatMessagePageResponse {
  messages: ChatMessage[];
  hasNext: boolean;
  page: number;
  size: number;
}

export interface PresignedUrlItem {
  presignedUrl: string;
  fileUrl: string;
  key: string;
}
