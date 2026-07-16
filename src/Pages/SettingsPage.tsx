import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Platform, BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, User } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import BottomTabBar, { TabKey } from '../components/common/BottomTabBar';
import api from '../api/axiosInstance';
import { unregisterFCMToken } from '../utils/fcm';
import { getMyRole } from '../api/userApi';

const TERMS_URL = 'https://isajjim.kro.kr/terms';
const PRIVACY_URL = 'https://isajjim.kro.kr/privacy-policy';

export default function SettingsPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showWithdrawDone, setShowWithdrawDone] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [partnerMenuLabel, setPartnerMenuLabel] = useState('파트너 신청');
  const [isPartner, setIsPartner] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      getMyRole()
        .then((role) => {
          if (!isActive) return;
          setPartnerMenuLabel(role === 'PARTNER' ? '파트너 관리' : '파트너 신청');
          setIsPartner(role === 'PARTNER');
        })
        .catch(() => {});
      return () => { isActive = false; };
    }, []),
  );

  const openUrl = (url: string) => {
    if (Platform.OS === 'web') window.open(url, '_blank');
    else WebBrowser.openBrowserAsync(url);
  };

  const handleWithdraw = async () => {
    if (isWithdrawing) return;
    setIsWithdrawing(true);
    try {
      await api.delete('/api/v1/users/withdrawal');
      setShowWithdrawConfirm(false);
      setShowWithdrawDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleWithdrawDone = () => {
    logout();
    setShowWithdrawDone(false);
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleExitApp = () => {
    if (Platform.OS === 'android') BackHandler.exitApp();
    else handleWithdrawDone();
  };

  const handleTabPress = (tab: TabKey) => {
    if (tab === 'home') navigation.navigate('Main');
    else if (tab === 'partner') navigation.navigate('PartnerSearch');
    else if (tab === 'estimate') navigation.navigate('MyEstimate');
    else if (tab === 'chat') navigation.navigate('MyChat');
  };

  const handleLogout = async () => {
    await unregisterFCMToken();
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const ITEMS = [
    { label: '개인정보 수정', onPress: () => navigation.navigate('PersonalInfo') },
    { label: '알림 설정', onPress: () => navigation.navigate('NotificationSettings') },
    { label: partnerMenuLabel, onPress: () => navigation.navigate('PartnerApplication') },
    ...(isPartner ? [{ label: '크레딧 관리', onPress: () => navigation.navigate('PartnerCredits') }] : []),
    { label: '이용약관', onPress: () => openUrl(TERMS_URL) },
    { label: '개인정보 처리방침', onPress: () => openUrl(PRIVACY_URL) },
    { label: '로그아웃', onPress: handleLogout },
    { label: '회원탈퇴', onPress: () => setShowWithdrawConfirm(true) },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} />

      {/* 네비게이션 바 */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 프로필 */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <View style={styles.avatarHead} />
            <View style={styles.avatarBody} />
          </View>
        </View>

        {/* 설정 목록 */}
        <View style={styles.settingsList}>
          {ITEMS.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.listItem} onPress={item.onPress} activeOpacity={0.7}>
                <Text style={[styles.listLabel, item.label === '로그아웃' && styles.logoutLabel, item.label === '회원탈퇴' && styles.withdrawLabel]}>
                  {item.label}
                </Text>
                <ChevronRight size={12} color="#949494" />
              </TouchableOpacity>
              {index < ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="settings" onTabPress={handleTabPress} />

      {/* 회원탈퇴 확인 모달 */}
      <Modal visible={showWithdrawConfirm} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogContent}>
              <Text style={styles.dialogTitle}>회원탈퇴 확인</Text>
              <Text style={styles.dialogDesc}>
                {'회원탈퇴 시 모든 정보가 삭제됩니다.\n탈퇴하시겠습니까?'}
              </Text>
            </View>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnOutline]}
                onPress={() => setShowWithdrawConfirm(false)}
              >
                <Text style={styles.dialogBtnOutlineText}>아니오</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnFill]}
                onPress={handleWithdraw}
                disabled={isWithdrawing}
              >
                <Text style={styles.dialogBtnFillText}>{isWithdrawing ? '처리 중...' : '예'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 회원탈퇴 완료 모달 */}
      <Modal visible={showWithdrawDone} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogContent}>
              <Text style={styles.dialogTitle}>회원탈퇴 완료</Text>
              <Text style={styles.dialogDesc}>이용해주셔서 감사합니다.</Text>
            </View>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnOutline]}
                onPress={handleExitApp}
              >
                <Text style={styles.dialogBtnOutlineText}>앱 종료</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnFill]}
                onPress={handleWithdrawDone}
              >
                <Text style={styles.dialogBtnFillText}>홈으로</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  navTitle: { fontSize: 14, fontWeight: '700', color: '#423E3E' },
  scrollContent: { paddingBottom: 24 },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFDEBB',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarHead: {
    position: 'absolute',
    top: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F36845',
    opacity: 0.7,
  },
  avatarBody: {
    width: 56,
    height: 40,
    borderRadius: 28,
    backgroundColor: '#F36845',
    opacity: 0.7,
    marginBottom: -10,
  },
  settingsList: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FAF5F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  listLabel: { fontSize: 14, fontWeight: '500', color: '#423E3E' },
  logoutLabel: { color: '#949494' },
  withdrawLabel: { color: '#FF4444' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(31,32,36,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 20,
    alignItems: 'center',
  },
  dialogContent: { padding: 8, gap: 8, alignSelf: 'stretch', alignItems: 'center' },
  dialogTitle: {
    fontSize: 16, fontWeight: '800', color: '#423E3E',
    textAlign: 'center', letterSpacing: 0.1, alignSelf: 'stretch',
  },
  dialogDesc: {
    fontSize: 12, fontWeight: '500', color: '#949494',
    textAlign: 'center', lineHeight: 16, letterSpacing: 0.1, alignSelf: 'stretch',
  },
  dialogActions: { flexDirection: 'row', gap: 8, alignSelf: 'stretch' },
  dialogBtn: {
    flex: 1, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  dialogBtnOutline: { borderWidth: 2, borderColor: '#F36845' },
  dialogBtnOutlineText: { fontSize: 12, fontWeight: '600', color: '#F36845' },
  dialogBtnFill: { backgroundColor: '#F36845' },
  dialogBtnFillText: { fontSize: 12, fontWeight: '600', color: '#fff' },
});
