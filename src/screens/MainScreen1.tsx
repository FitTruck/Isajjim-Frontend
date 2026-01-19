import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { commonStyles } from '../styles/commonStyles';

// --- Firebase 설정 ---
const firebaseConfig = {
  storageBucket: 'knu-team-05.firebasestorage.app', // 사용자의 버킷 경로
  // apiKey, authDomain 등 나머지 설정값들을 여기에 추가하세요.
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 업로드된 파일 정보를 관리할 인터페이스
interface ImageData {
  id: string;
  uri: string;
  width: number;
  height: number;
  downloadUrl: string;
}

export default function Main() {
  const [imageList, setImageList] = useState<ImageData[]>([]);
  const [statusMessage, setStatusMessage] = useState('');

  const handleWebUpload = async () => {
    // 웹에서는 권한 요청(requestMediaLibraryPermissionsAsync) 단계가 필요 없습니다.
    // 브라우저의 파일 탐색기를 직접 호출합니다.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // 다중 선택 활성화
      quality: 1,
    });

    if (!result.canceled) {
      setStatusMessage('업로드 중...');
      const uploadedResults: ImageData[] = [];

      try {
        for (const asset of result.assets) {
          const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
          
          // 웹 브라우저에서 파일을 Firebase로 보내기 위한 Blob 변환
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          // Firebase Storage 저장 및 URL 추출
          const storageRef = ref(storage, `web_uploads/${uniqueId}`);
          await uploadBytes(storageRef, blob);
          const downloadUrl = await getDownloadURL(storageRef);

          uploadedResults.push({
            id: uniqueId,
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            downloadUrl: downloadUrl,
          });
        }

        // 기존 리스트에 새 데이터 추가 (프론트엔드에서 즉시 사용 가능)
        setImageList((prev) => [...prev, ...uploadedResults]);
        setStatusMessage(`${uploadedResults.length}개의 파일 업로드 완료`);
      } catch (error) {
        console.error("Upload Error:", error);
        setStatusMessage('업로드 실패');
      }
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <View style={commonStyles.mainWrapper}>
          
          <View style={commonStyles.mainSection}>
            <View style={commonStyles.mainContent}>
              <Text style={commonStyles.mainTitle}>이삿짐 사진 업로드 (Web)</Text>
              
              <TouchableOpacity 
                style={styles.webUploadButton} 
                onPress={handleWebUpload}
              >
                <Text style={styles.buttonText}>파일 선택하기</Text>
              </TouchableOpacity>
              
              <Text style={styles.statusText}>{statusMessage}</Text>

              {/* 업로드된 이미지와 메타데이터 재사용 구역 */}
              <View style={styles.imageGrid}>
                {imageList.map((item) => (
                  <View key={item.id} style={styles.imageCard}>
                    <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                    <View style={styles.metaInfo}>
                      <Text style={styles.metaText}>크기: {item.width} x {item.height}</Text>
                      <Text style={styles.metaText}>비율: {(item.width / item.height).toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
              </View>

            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  webUploadButton: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  imageGrid: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  imageCard: {
    width: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  thumbnail: {
    width: '100%',
    height: 100,
  },
  metaInfo: {
    padding: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#444',
  }
});