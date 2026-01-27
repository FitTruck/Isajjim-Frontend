import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Image } from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { UploadedImage } from '../../utils/Server';

interface UploadBoxProps {
  onFilesSelected: (newImages: UploadedImage[]) => void;
}

const UploadContent = ({ isDragging }: { isDragging: boolean }) => {
  let textContent;
  if (isDragging) {
    textContent = (
      <>
        
      </>
    );
  } else {
    textContent = (
      <>
        <Text style={styles.uploadTitle}>클릭 또는 드롭하여 이미지 업로드</Text>
        <Text style={styles.uploadSubTitle}>JPG, PNG, HEIC 형식 지원</Text>
      </>
    );
  }

  let icon;
  if (isDragging) {
    icon = <Image source={require('../../../assets/drop.png')} style={styles.dropIcon} />;
  } else {
    icon = <Icon name="upload" size={48} color="#F0893B" />;
  }
  return (
    <>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      {textContent}
    </>
  );
};

export default function UploadBox({ onFilesSelected }: UploadBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const uploadBoxRef = useRef<any>(null);

  // 이미지가 추가될 때마다 실행되니까 추가될 때마다 이미지 정보 main에 있는 imageList로 보냄
  const handleWebUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({
        localUri: asset.uri,
        width: asset.width,
        height: asset.height,
      } as UploadedImage));

      onFilesSelected(newImages);
    }
  };

  // --- Drag & Drop Effect (Web) ---
  useEffect(() => {
    if (Platform.OS === 'web' && uploadBoxRef.current) {
      const element = uploadBoxRef.current as unknown as HTMLElement;

      const handleDragEnter = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setIsDragging(true);
        }
      };

      const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
          setIsDragging(false);
        }
      };

      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Necessary to allow dropping
      };

      const handleDrop = async (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const files = Array.from(e.dataTransfer.files);
          const imageFiles = files.filter(file => file.type.startsWith('image/'));

          if (imageFiles.length === 0) return;

          try {
            const newImages = await Promise.all(
              imageFiles.map(async (file) => {
                return new Promise<UploadedImage>((resolve) => {
                  const img = new window.Image();
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
              })
            );
            
            onFilesSelected(newImages);
          } catch (error) {
            console.error("Error processing dropped images:", error);
          }
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

  // Web인 경우 View 사용 (이벤트 핸들링 호환성 위함)
  return (
    <View
      ref={uploadBoxRef}
      style={[
        styles.uploadContainer,
        isHovered && styles.uploadContainerHover,
        isDragging && styles.uploadContainerDragging
      ]}
      // @ts-ignore - React Native Web supports these
      onClick={handleWebUpload}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <UploadContent isDragging={isDragging}/>
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
        transition: 'all 0.17s', 
      },
    }) as any,
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
  iconContainer: {
    width: 100,
    height: 100,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3D3D3A',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});