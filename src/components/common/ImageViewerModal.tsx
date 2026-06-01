import React, { useCallback, useRef, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList,
  useWindowDimensions, StyleSheet,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';

interface ZoomablePageProps {
  width: number;
  height: number;
  children: React.ReactNode;
  onSwipeDown: () => void;
  onZoomChange: (zoomed: boolean) => void;
}

function ZoomablePage({ width, height, children, onSwipeDown, onZoomChange }: ZoomablePageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    'worklet';
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        resetZoom();
        runOnJS(onZoomChange)(false);
      } else {
        savedScale.value = scale.value;
        runOnJS(onZoomChange)(true);
      }
    });

  const pan = Gesture.Pan()
    .onUpdate(e => {
      if (scale.value <= 1) {
        if (e.translationY > 0) translateY.value = e.translationY;
      } else {
        const maxX = (width * (scale.value - 1)) / 2;
        const maxY = (height * (scale.value - 1)) / 2;
        translateX.value = Math.max(-maxX, Math.min(savedTranslateX.value + e.translationX, maxX));
        translateY.value = Math.max(-maxY, Math.min(savedTranslateY.value + e.translationY, maxY));
      }
    })
    .onEnd(e => {
      if (scale.value <= 1) {
        if (e.translationY > 120) {
          runOnJS(onSwipeDown)();
        } else {
          translateY.value = withSpring(0);
        }
      } else {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      resetZoom();
      runOnJS(onZoomChange)(false);
    });

  const composed = Gesture.Simultaneous(pinch, Gesture.Race(doubleTap, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[{ width, height, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

export interface ImageViewerModalProps {
  visible: boolean;
  onClose: () => void;
  count: number;
  initialIndex?: number;
  renderImage: (index: number, width: number, height: number) => React.ReactNode;
  bottomActions?: React.ReactNode;
}

export default function ImageViewerModal({
  visible, onClose, count, initialIndex = 0, renderImage, bottomActions,
}: ImageViewerModalProps) {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const listRef = useRef<FlatList>(null);

  const handleZoomChange = useCallback((zoomed: boolean) => {
    setScrollEnabled(!zoomed);
  }, []);

  const data = Array.from({ length: count }, (_, i) => i);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <X size={24} color="#fff" />
        </TouchableOpacity>

        {count > 1 && (
          <Text style={styles.counter}>{currentIndex + 1} / {count}</Text>
        )}

        <FlatList
          ref={listRef}
          data={data}
          horizontal
          pagingEnabled
          scrollEnabled={scrollEnabled}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={e => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          keyExtractor={i => String(i)}
          renderItem={({ item: i }) => (
            <ZoomablePage
              width={width}
              height={height}
              onSwipeDown={onClose}
              onZoomChange={handleZoomChange}
            >
              {renderImage(i, width, height)}
            </ZoomablePage>
          )}
        />

        {bottomActions && (
          <View style={styles.bottomActions}>
            {bottomActions}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    position: 'absolute',
    top: 56,
    zIndex: 10,
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 48,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
});
