import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Image, useWindowDimensions, TouchableOpacity, Alert } from 'react-native';
import { Upload, ImageIcon, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { UploadedImage } from '../../types/common';

interface UploadBoxProps {
  onFilesSelected: (newImages: UploadedImage[]) => void;
  selectedImages?: UploadedImage[];
}

const UploadContent = ({ isDragging, isMobile, hasImages }: { isDragging: boolean, isMobile: boolean, hasImages: boolean }) => {
  return (
    <View style={styles.contentWrapper}>
      {/* 드래그 아닐 때 */}
      <View style={[styles.contentLayer, { opacity: isDragging ? 0 : 1 }]}>
        <View style={[styles.iconContainer, isMobile && styles.mobileIconContainer]}>
          <Upload size={isMobile ? 32 : 48} color="#F0893B" />
        </View>
        <Text style={[styles.uploadTitle, isMobile && styles.mobileUploadTitle]}>
          {hasImages ? "이미지 추가 업로드" : Platform.OS !== 'web' ? "이미지 촬영 또는 업로드" : "클릭 또는 드롭하여 이미지 업로드"}
        </Text>
        <Text style={[styles.uploadSubTitle, isMobile && styles.mobileUploadSubTitle]}>JPG, PNG, HEIC 형식 지원</Text>
      </View>

      {/* 드래그 했을 때 */}
      <View style={[styles.contentLayer, { opacity: isDragging ? 1 : 0 }]}>
        <View style={[styles.iconContainer, isMobile && styles.mobileIconContainer]}>
          
        </View>
      </View>
    </View>
  );
};

export default function UploadBox({ onFilesSelected, selectedImages = [] }: UploadBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const uploadBoxRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const hasImages = selectedImages.length > 0;

  const handleWebUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        localUri: asset.uri,
        width: asset.width,
        height: asset.height,
      } as UploadedImage));

      onFilesSelected(newImages);
    }
  };

  const handleNativeUpload = () => {
    Alert.alert('이미지 선택', '', [
      {
        text: '카메라로 촬영',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('카메라 권한이 필요합니다.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            quality: 1,
          });
          if (!result.canceled) {
            onFilesSelected(result.assets.map(asset => ({
              fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
              mimeType: asset.mimeType ?? 'image/jpeg',
              localUri: asset.uri,
              width: asset.width,
              height: asset.height,
            } as UploadedImage)));
          }
        },
      },
      {
        text: '앨범에서 선택',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true,
            quality: 1,
          });
          if (!result.canceled) {
            onFilesSelected(result.assets.map(asset => ({
              fileName: asset.fileName,
              mimeType: asset.mimeType,
              localUri: asset.uri,
              width: asset.width,
              height: asset.height,
            } as UploadedImage)));
          }
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  // 드래그 앤 드롭(웹 브라우저의 고유 기능. 앱으로는 불가능. -> 웹 고유 기능을 가져와야 함)
  useEffect(() => {
    // uploadBoxRef에는 current가 있는데, 거기에 tagName, style, innerText같은 것들이 있음.
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
      };

      // 드롭했을 때
      const handleDrop = async (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 드래그 상태 해제(드롭 했으니까)
        setIsDragging(false);
        dragCounter.current = 0;

        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          const files = Array.from(e.dataTransfer.files);
          const imageFiles = files.filter(file => file.type.startsWith('image/'));
          if (imageFiles.length === 0) return;

          const newImages = await Promise.all(imageFiles.map(async (file) => {
            return new Promise<UploadedImage>((resolve) => {
              const img = new window.Image();
              const objectUrl = URL.createObjectURL(file);
              
              img.onload = () => {
                resolve({
                  fileName: file.name,
                  mimeType: file.type,
                  localUri: objectUrl,
                  width: img.width,
                  height: img.height,
                });
              };
              img.src = objectUrl;
            });
          }));

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

  if (Platform.OS !== 'web') {
    return (
      <TouchableOpacity
        style={styles.mobileBox}
        onPress={handleNativeUpload}
        activeOpacity={0.85}
      >
        {hasImages ? (
          <View style={styles.uploadedImagesWrapper}>
            <View style={[styles.imageGrid, styles.mobileImageGrid]}>
              {selectedImages.map((img, idx) => (
                <Image key={idx} source={{ uri: img.localUri }} style={styles.mobileUploadedImage} />
              ))}
              <View style={styles.addMoreBox}>
                <Plus size={20} color="#006FFD" />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mobileEmptyContent}>
            <View style={styles.mobileIconBox}>
              <ImageIcon size={32} color="#006FFD" />
            </View>
            <TouchableOpacity style={styles.mobileAddButton} onPress={handleNativeUpload} activeOpacity={0.7}>
              <Plus size={12} color="#006FFD" />
              <Text style={styles.mobileAddButtonText}>사진 추가하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View
      ref={uploadBoxRef}
      style={[
        styles.uploadContainer,
        isMobile && styles.mobileUploadContainer,
        isHovered && styles.uploadContainerHover,
        isDragging && styles.uploadContainerDragging
      ]}
      // @ts-ignore
      onClick={handleWebUpload}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasImages ? (
        <View style={styles.uploadedImagesWrapper}>
          <View style={[styles.imageGrid, isMobile && styles.mobileImageGrid]}>
            {selectedImages.map((img, idx) => (
              <Image key={idx} source={{ uri: img.localUri }} style={[styles.uploadedImage, isMobile && styles.mobileUploadedImage]} />
            ))}
          </View>
        </View>
      ) : (
        <UploadContent isDragging={isDragging} isMobile={isMobile} hasImages={false} />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  uploadContainer: {
    width: 794,
    alignSelf: 'center',
    minHeight: 273,
    backgroundColor: 'white',
    borderRadius: 20,
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
    width: '100%',
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
    color: '#333333',
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
    minHeight: 200,
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
  uploadedImagesWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  imageGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 30,
    justifyContent: 'flex-start',
  },
  mobileImageGrid: {
    gap: 10,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  mobileUploadedImage: {
    width: 70,
    height: 70,
  },
  addMoreBox: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#006FFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Native mobile (Figma design) ─────────────────────
  mobileBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4D6DD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 24,
  },
  mobileEmptyContent: {
    alignItems: 'center',
    gap: 24,
  },
  mobileIconBox: {
    width: 80,
    height: 69,
    backgroundColor: '#EAF2FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  mobileAddButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#006FFD',
  },
});