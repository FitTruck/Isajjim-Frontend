import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabKey = 'home' | 'partner' | 'estimate' | 'chat' | 'settings';

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home',     label: '홈',        icon: 'home-outline',            iconActive: 'home' },
  { key: 'partner',  label: '파트너 찾기', icon: 'search-outline',          iconActive: 'search' },
  { key: 'estimate', label: '견적 이력',  icon: 'document-text-outline',   iconActive: 'document-text' },
  { key: 'chat',     label: '채팅',       icon: 'chatbubble-outline',      iconActive: 'chatbubble' },
  { key: 'settings', label: '설정',       icon: 'settings-outline',        iconActive: 'settings' },
];

interface Props {
  activeTab?: TabKey;
  onTabPress?: (tab: TabKey) => void;
}

export default function BottomTabBar({ activeTab = 'home', onTabPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {TABS.map(({ key, label, icon, iconActive }) => {
        const isActive = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            style={styles.tab}
            onPress={() => onTabPress?.(key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? iconActive : icon}
              size={22}
              color={isActive ? '#F36845' : '#E8E8E8'}
            />
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  label: {
    textAlign: 'center',
  },
  labelActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#423E3E',
  },
  labelInactive: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.12,
    color: '#949494',
  },
});
