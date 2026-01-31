import { View, Text, ScrollView, StyleSheet } from "react-native";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/common/Header";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MyChat'>;

export default function MyChat({ navigation }: Props) {
  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <Header />

      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* 메인 Wrapper */}
        <View style={styles.mainWrapper}>
          
          {/* Page Content: 기준점 */}
          <View style={styles.pageContent}>

            {/* 중앙정렬 컨테이너*/}
            <View style={styles.centerContainer}>

              {/* 타이틀 섹션 */}
              <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>내 견적</Text>
                <View style={styles.subtitleRow}>
                  <View style={styles.subtitleBar} />
                  <Text style={styles.pageSubtitle}>업체에게 받은 견적서를 확인하세요</Text>
                </View>
              </View>


            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
    borderWidth: 1,
  },
  pageContent: {
    width: '90%', // 반응형을 위해 퍼센트 사용하되
    maxWidth: 1600, // 사이드패널 공간 확보를 위해 넓게 잡음
    paddingTop: 80,
    position: 'relative', // 사이드패널 배치를 위한 기준
    borderWidth: 1,
  },
  
  // 중앙 컨텐츠 컨테이너
  centerContainer: {
    width: 900, // 리스트 너비에 맞춤
    alignSelf: 'center', // 화면 중앙 정렬
    borderWidth: 1,
  },

  titleSection: {
    marginBottom: 60,
    width: '100%', 
    // left : 300 // Remove manual offset
  },
  pageTitle: {
    fontSize: 60,
    fontWeight: '700',
    color: '#3D3D3A',
    marginBottom: 20,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 22, 
  },
  subtitleBar: {
    width: 7,
    height: 27,
    backgroundColor: '#FADDC3',
    marginRight: 15,
    position: 'absolute',
    left: -22,
  },
  pageSubtitle: {
    fontSize: 20,
    color: '#62625D',
    fontWeight: '400',
  },
});