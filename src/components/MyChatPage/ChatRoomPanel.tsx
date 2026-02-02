import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { ChatItemData } from "../../Pages/MyChat";

interface ChatRoomPanelProps {
  data: ChatItemData | null;
}

export default function ChatRoomPanel({ data }: ChatRoomPanelProps) {
  if (!data) {
    return (
      <View style={[styles.rightPanel, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#999' }}>채팅방을 선택해주세요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.rightPanel}>
      {/* 헤더 */}
      <View style={styles.chatHeader}>
        <View>
           <Text style={styles.headerCompanyName}>{data.companyName}</Text>
           <Text style={styles.headerCompanyDesc}>보통 15분 내 응답, 응답률 100%</Text>
        </View>
        <View style={styles.headerRightGroup}>
           <View style={styles.headerPriceBlock}>
              <Text style={styles.headerPriceLabel}>제안 가격:</Text>
              <Text style={styles.headerPriceValue}>{data.price}</Text>
           </View>
           <View style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>확정하기</Text>
           </View>
        </View>
      </View>

      {/* 콘텐츠 */}
      <View style={styles.chatContent}>
        
      </View>

      {/* 푸터 입력창 */}
      <View style={styles.chatFooter}>
        <Image source={require('../../../assets/file.png')} style={styles.clipIcon} />
        <Image source={require('../../../assets/plane.png')} style={styles.sendIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rightPanel: {
    flex: 1,
    backgroundColor: '#FFF6EF',
    position: 'relative',
    zIndex: 99,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  chatHeader: {
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF' 
  },
  headerCompanyName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  headerCompanyDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7E7E7E',
    marginTop: 2,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerPriceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerPriceLabel: {
    fontSize: 15,
    color: '#727272',
    fontWeight: '500',
  },
  headerPriceValue: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333333',
  },
  confirmButton: {
    backgroundColor: '#EA6500',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FF8A32',
    paddingHorizontal: 17,
    paddingVertical: 5,
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatFooter: {
    height: 115,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'flex-end', 
  },
  clipIcon: {
    width: 20,
    height: 20,
    tintColor: '#4e4e4e', 
  },
  sendIcon: {
    width: 22,
    height: 22,
    tintColor: '#4e4e4e', 
  },
});
