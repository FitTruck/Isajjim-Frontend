import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import api from '../api/axiosInstance';
import { navigateTo } from '../auth/navigationRef';

// 알림 수신 시 배너 표시 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let _token: string | null = null;

export async function registerFCMToken(): Promise<void> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[FCM] 알림 권한 거부됨');
      return;
    }

    const { data: token } = await Notifications.getDevicePushTokenAsync();
    _token = token;
    console.log('[FCM] 토큰:', token);

    await api.post('/api/v1/users/device-token', {
      token,
      deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    });
    console.log('[FCM] 토큰 등록 완료');
  } catch (e) {
    console.error('[FCM] 토큰 등록 실패:', e);
  }
}

export async function unregisterFCMToken(): Promise<void> {
  if (!_token) return;
  try {
    await api.delete('/api/v1/users/device-token', {
      data: {
        token: _token,
        deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      },
    });
    console.log('[FCM] 토큰 해제 완료');
    _token = null;
  } catch (e) {
    console.error('[FCM] 토큰 해제 실패:', e);
  }
}

// 알림 탭 시 ChatRoom으로 딥링크
export function setupNotificationTapHandler(): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const roomId = response.notification.request.content.data?.roomId;
    const title = response.notification.request.content.title ?? '채팅';
    if (roomId) {
      navigateTo('ChatRoom', {
        roomId: Number(roomId),
        targetName: title,
      });
    }
  });
  return () => sub.remove();
}
