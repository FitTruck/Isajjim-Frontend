import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { commonStyles } from "../styles/commonStyles";
import Header from "../components/Header";

// app.tsx로부터 전달받을 함수의 자료형 정의
interface CompareProps {
  onGoHome: () => void;
}

export default function Compare({ onGoHome }: CompareProps) {
  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <Header onGoHome={onGoHome} />

      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* 메인 Wrapper */}
        <View style={commonStyles.mainWrapper}>

          {/* 메인섹션 */}
          <View style={commonStyles.mainSection}>
            <Text style={commonStyles.mainTitle}>업체별 견적 비교</Text>
            <Text style={commonStyles.mainSubtitle}>업체와 연결하기</Text>
          </View>

          {/* 견적 비교 섹션 */}
          <View style={styles.compareSection}>
            {/* 검색 필터 섹션 */}
            <View style={styles.searchFilterSection}>
              <Text style={styles.searchFilterTitle}>검색 필터</Text>
              <Text style={styles.searchFilterSubtitle}>업체와 연결하기</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({

});