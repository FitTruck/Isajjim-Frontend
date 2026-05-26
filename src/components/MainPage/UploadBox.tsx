import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { ImageIcon, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { UploadedImage } from '../../types/common';

interface UploadBoxProps {
  onFilesSelected: (newImages: UploadedImage[]) => void;
  selectedImages?: UploadedImage[];
}

export default function UploadBox({ onFilesSelected, selectedImages = [] }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const boxRef = useRef<any>(null);
  const hasImages = selectedImages.length > 0;

  const handleWebUpload = async () => {
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
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 1 });
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

  // 웹 드래그앤드롭
  useEffect(() => {
    if (Platform.OS !== 'web' || !boxRef.current) return;
    const el = boxRef.current as unknown as HTMLElement;

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items?.length) setIsDragging(true);
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) setIsDragging(false);
    };
    const onDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
      if (!files.length) return;

      const newImages = await Promise.all(files.map(file =>
        new Promise<UploadedImage>(resolve => {
          const img = new window.Image();
          const url = URL.createObjectURL(file);
          img.onload = () => resolve({ fileName: file.name, mimeType: file.type, localUri: url, width: img.width, height: img.height });
          img.src = url;
        })
      ));
      onFilesSelected(newImages);
    };

    el.addEventListener('dragenter', onDragEnter);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);
    return () => {
      el.removeEventListener('dragenter', onDragEnter);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('drop', onDrop);
    };
  }, [onFilesSelected]);

  const handlePress = () => {
    if (Platform.OS === 'web') handleWebUpload();
    else handleNativeUpload();
  };

  return (
    <TouchableOpacity
      ref={boxRef}
      style={[styles.box, isDragging && styles.boxDragging]}
      onPress={handlePress}
      activeOpacity={0.85}
      // @ts-ignore
      onMouseEnter={Platform.OS === 'web' ? (e: any) => e.currentTarget.style.borderColor = '#F36845' : undefined}
      onMouseLeave={Platform.OS === 'web' ? (e: any) => e.currentTarget.style.borderColor = isDragging ? '#F36845' : '#E8E8E8' : undefined}
    >
      {hasImages ? (
        <View style={styles.imageGrid}>
          {selectedImages.map((img, idx) => (
            <Image key={idx} source={{ uri: img.localUri }} style={styles.thumb} />
          ))}
          <View style={styles.addMoreBox}>
            <Plus size={20} color="#F36845" />
          </View>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <View style={styles.iconBox}>
            <ImageIcon size={32} color="#F36845" />
          </View>
          <View style={styles.addButton}>
            <Plus size={12} color="#F36845" />
            <Text style={styles.addButtonText}>사진 추가하기</Text>
          </View>
          {Platform.OS === 'web' && (
            <Text style={styles.dragHint}>또는 파일을 여기에 드래그하세요</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 16,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  boxDragging: {
    borderColor: '#F36845',
    backgroundColor: '#FFDEBB',
  },
  emptyContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 80,
    height: 69,
    backgroundColor: '#FFDEBB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F36845',
  },
  dragHint: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  imageGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  addMoreBox: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F36845',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
