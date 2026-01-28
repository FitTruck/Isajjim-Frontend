import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Image, useWindowDimensions } from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { UploadedImage } from '../../utils/Server';

interface UploadBoxProps {
  onFilesSelected: (newImages: UploadedImage[]) => void;
}

const UploadContent = ({ isDragging, isMobile }: { isDragging: boolean, isMobile: boolean }) => {
  return (
    <View style={styles.contentWrapper}>
      {/* 드래그 아닐 때 */}
      <View style={[styles.contentLayer, { opacity: isDragging ? 0 : 1 }]}>
        <View style={[styles.iconContainer, isMobile && styles.mobileIconContainer]}>
          <Icon name="upload" size={isMobile ? 32 : 48} color="#F0893B" />
        </View>
        <Text style={[styles.uploadTitle, isMobile && styles.mobileUploadTitle]}>클릭 또는 드롭하여 이미지 업로드</Text>
        <Text style={[styles.uploadSubTitle, isMobile && styles.mobileUploadSubTitle]}>JPG, PNG, HEIC 형식 지원</Text>
      </View>

      {/* 드래그 했을 때 */}
      <View style={[styles.contentLayer, { opacity: isDragging ? 1 : 0 }]}>
        <View style={[styles.iconContainer, isMobile && styles.mobileIconContainer]}>
          <Image source={require('../../../assets/drop.png')} style={isMobile ? styles.mobileDropIcon : styles.dropIcon} />
        </View>
      </View>
    </View>
  );
};

export default function UploadBox({ onFilesSelected }: UploadBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0); // useState와 다르게 값이 바뀌어도 컴포넌트를 다시 그리지 않음.
  const uploadBoxRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // 클릭시 : 이미지가 추가될 때마다 실행되니까 추가될 때마다 이미지 정보 main에 있는 imageList로 보냄
  const handleWebUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      // 비동기 작업이 없으므로 Promise.all이 없어도 됨.
      const newImages = result.assets.map(asset => ({
        localUri: asset.uri,
        width: asset.width,
        height: asset.height,
      } as UploadedImage));

      onFilesSelected(newImages);
    }
  };

  // 드래그 앤 드롭(웹 브라우저의 고유 기능. 앱으로는 불가능. -> 웹 고유 기능을 가져와야 함)
  useEffect(() => {
    // uploadBoxRef에는 current가 있는데, 거기에 tagName, style, innerText같은 것들이 있음.
    if (Platform.OS === 'web' && uploadBoxRef.current) {
      const element = uploadBoxRef.current as unknown as HTMLElement; //element를 HTMLElement로 쓰겠다는 말 > div가 된댄다

      const handleDragEnter = (e: DragEvent) => {
        e.preventDefault(); // 기본 동작 막음
        e.stopPropagation(); // 이벤트 버블링 막음
        dragCounter.current += 1;
        if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setIsDragging(true);
        }
      };

      const handleDragLeave = (e: DragEvent) => {
        e.preventDefault(); // 기본 동작 막음
        e.stopPropagation(); // 이벤트 버블링 막음
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
          setIsDragging(false);
        }
      };

      const handleDragOver = (e: DragEvent) => {
        e.preventDefault(); // 원래는 브라우저 기본값으로 드롭할 수 없지만, 브라우저 기본 동작 막기로 드롭 가능해진다.  
        e.stopPropagation(); // 이벤트 버블링 막기
      };

      // 드롭했을 때
      const handleDrop = async (e: DragEvent) => {
        e.preventDefault(); // 기본 동작 막음
        e.stopPropagation(); // 이벤트 버블링 막음

        // 드래그 상태 해제(드롭 했으니까)
        setIsDragging(false);
        dragCounter.current = 0;

        // e.dataTransfer.files가 드래그 받은 이미지 파일 목록이래
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          const files = Array.from(e.dataTransfer.files); // 파일 목록을 배열로 변환

          const imageFiles = files.filter(file => file.type.startsWith('image/')); // 이미지 파일만 필터링(텍스트 파일 등 제외)
          // 드롭 한 것들 중에 이미지가 없으면 아무 것도 없이 리턴
          if (imageFiles.length === 0) return;
          // > imageFiles에는 이미지 파일에 대한 배열인거임.

          // window.Image()는 비동기 작업이므로 promise.all로 병렬처리
          const newImages = await Promise.all(imageFiles.map(async (file) => {
            return new Promise<UploadedImage>((resolve) => { // resolve: 작업이 끝나면 resolve를 통해 알려줌
              const img = new window.Image(); // 가상의 이미지 태그
              const objectUrl = URL.createObjectURL(file);
              
              img.onload = () => {
                resolve({
                  localUri: objectUrl,
                  width: img.width,
                  height: img.height,
                });
              };
              img.src = objectUrl;
            });
          }));

          // > 이 과정을 통해 newImages는 localUri, width, height가 담긴 배열이 됨.

          // 이 함수를 통해 main으로 이미지 배열 쏴줌
          onFilesSelected(newImages);
        }
      };

      element.addEventListener('dragenter', handleDragEnter);
      element.addEventListener('dragleave', handleDragLeave);
      element.addEventListener('dragover', handleDragOver);
      element.addEventListener('drop', handleDrop);

      return () => {
        element.removeEventListener('dragenter', handleDragEnter);
        element.removeEventListener('dragleave', handleDragLeave);
        element.removeEventListener('dragover', handleDragOver);
        element.removeEventListener('drop', handleDrop);
      };
    }
  }, [onFilesSelected]);

  // 웹인 경우 View를 사용하여 드래그 앤 드롭 기능을 구현
  return (
    <View
      ref={uploadBoxRef}
      style={[
        styles.uploadContainer,
        isMobile && styles.mobileUploadContainer,
        isHovered && styles.uploadContainerHover,
        isDragging && styles.uploadContainerDragging
      ]}
      // @ts-ignore - React Native Web supports these
      onClick={handleWebUpload}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <UploadContent isDragging={isDragging} isMobile={isMobile}/>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadContainer: {
    width: '100%',
    height: 280,
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 2,
    borderStyle: 'dashed', // 점선 스타일
    borderColor: '#EAE7E4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.17s ease-in-out', 
      },
    }) as any,
  },
  mobileUploadContainer: {
    height: 180,
    borderRadius: 16,
    padding: 16,
  },
  uploadContainerHover: {
    borderColor: '#F0893B',
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 7px rgba(0, 0, 0, 0.17)',
      },
    }) as any,
  },
  uploadContainerDragging: {
    borderColor: '#F0893B',
    backgroundColor: 'rgb(250, 249, 245)',
    borderStyle: 'solid',
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 7px rgba(0, 0, 0, 0.17)',
      },
    }) as any,
  },
  dropIcon :{
    width: 100,
    height: 100,
  },
  mobileDropIcon: {
    width: 60,
    height: 60,
  },
  iconContainer: {
    width: 100,
    height: 100,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileIconContainer: {
    width: 60,
    height: 60,
    padding: 10,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3D3D3A',
    marginBottom: 8,
    textAlign: 'center',
  },
  mobileUploadTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  uploadSubTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  mobileUploadSubTitle: {
    fontSize: 12,
  },
  contentWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  contentLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});