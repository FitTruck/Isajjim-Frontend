import api from './axiosInstance';
import { ChatRoom, ChatMessage, ChatMessagePageResponse, PresignedUrlItem } from '../types/chat';

export const createOrGetRoom = async (targetId: number): Promise<ChatRoom> => {
  const res = await api.post('/api/v1/chat/rooms', { targetId });
  return res.data.data;
};

export const getRooms = async (): Promise<ChatRoom[]> => {
  const res = await api.get('/api/v1/chat/rooms');
  return res.data.data;
};

export const getMessages = async (
  roomId: number,
  page = 0,
  size = 30,
): Promise<ChatMessagePageResponse> => {
  const res = await api.get(`/api/v1/chat/rooms/${roomId}/messages`, {
    params: { page, size },
  });
  return res.data.data;
};

export const markRead = async (roomId: number): Promise<void> => {
  await api.put(`/api/v1/chat/rooms/${roomId}/read`);
};

export const getChatPresignedUrls = async (
  fileNames: string[],
): Promise<PresignedUrlItem[]> => {
  const res = await api.post('/api/v1/presigned-url', {
    folder: 'CHAT',
    fileNames,
  });
  return res.data.data.urls;
};
