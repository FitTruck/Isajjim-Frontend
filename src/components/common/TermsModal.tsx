import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const TERMS_URL = 'https://www.notion.so/35842810fb17802896e5cb20c8596218';
const PRIVACY_URL = 'https://www.notion.so/35842810fb1780239b8cf7769880d809';

const ITEMS = [
  { key: 'age',     label: '만 14세 이상 가입 동의', required: true,  url: null },
  { key: 'terms',   label: '이용약관',               required: true,  url: TERMS_URL },
  { key: 'privacy', label: '개인정보 처리방침',       required: true,  url: PRIVACY_URL },
] as const;

type ItemKey = typeof ITEMS[number]['key'];

interface Props {
  visible: boolean;
  onConfirm: () => Promise<void>;
}

export default function TermsModal({ visible, onConfirm }: Props) {
  const [checked, setChecked] = useState<Record<ItemKey, boolean>>({
    age: false,
    terms: false,
    privacy: false,
  });
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const allChecked = ITEMS.every(({ key }) => checked[key]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    }
  }, [visible]);

  const toggleAll = () => {
    const next = !allChecked;
    setChecked({ age: next, terms: next, privacy: next });
  };

  const toggle = (key: ItemKey) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openUrl = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      WebBrowser.openBrowserAsync(url);
    }
  };

  const handleConfirm = async () => {
    if (!allChecked || loading) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />

          <Text style={styles.title}>서비스 이용약관</Text>

          {/* 전체 동의 */}
          <TouchableOpacity style={styles.allRow} onPress={toggleAll} activeOpacity={0.7}>
            <Checkbox checked={allChecked} />
            <Text style={styles.allLabel}>전체 동의</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 개별 항목 */}
          {ITEMS.map(({ key, label, required, url }) => (
            <View key={key} style={styles.itemRow}>
              <TouchableOpacity
                style={styles.itemLeft}
                onPress={() => toggle(key)}
                activeOpacity={0.7}
              >
                <Checkbox checked={checked[key]} />
                <Text style={styles.itemLabel}>
                  {label}{' '}
                  <Text style={styles.required}>(필수)</Text>
                </Text>
              </TouchableOpacity>
              {url && (
                <TouchableOpacity onPress={() => openUrl(url)} activeOpacity={0.6}>
                  <Text style={styles.viewLink}>보기</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.confirmBtn, !allChecked && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!allChecked || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmText}>{loading ? '처리 중...' : '확인'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkMark}>✓</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E8E8',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#423E3E',
    marginBottom: 20,
  },
  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  allLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#423E3E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    color: '#423E3E',
    fontWeight: '500',
    flex: 1,
  },
  required: {
    color: '#F36845',
  },
  viewLink: {
    fontSize: 13,
    color: '#949494',
    textDecorationLine: 'underline',
    marginLeft: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#F36845',
    borderColor: '#F36845',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  confirmBtn: {
    marginTop: 8,
    backgroundColor: '#F36845',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#E8E8E8',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
