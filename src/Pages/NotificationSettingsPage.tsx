import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

const NOTIFICATIONS = [
  { key: 'estimate', label: '견적 발송 알림', defaultValue: false },
  { key: 'chat',     label: '채팅 알림',      defaultValue: true },
  { key: 'marketing', label: '이벤트/마케팅',  defaultValue: false },
] as const;

export default function NotificationSettingsPage() {
  const navigation = useNavigation();
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map(n => [n.key, n.defaultValue]))
  );

  const toggle = (key: string) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <ChevronLeft size={20} color="#423E3E" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>알림 설정</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>앱 푸시 알림</Text>
        {NOTIFICATIONS.map(({ key, label }) => (
          <View key={key} style={styles.listItem}>
            <Text style={styles.listLabel}>{label}</Text>
            <Switch
              value={toggles[key]}
              onValueChange={() => toggle(key)}
              trackColor={{ false: '#E8E8E8', true: '#F36845' }}
              thumbColor="#fff"
              ios_backgroundColor="#E8E8E8"
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  backBtn: { width: 32, justifyContent: 'center' },
  navTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 14, fontWeight: '700', color: '#423E3E',
    marginRight: 32,
  },
  content: { paddingHorizontal: 24, paddingTop: 32, gap: 10 },
  sectionTitle: {
    fontSize: 18, fontWeight: '800', color: '#423E3E', letterSpacing: 0.1,
  },
  listItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderRadius: 12,
  },
  listLabel: { fontSize: 14, fontWeight: '500', color: '#423E3E' },
});
