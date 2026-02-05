import React, { useState } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType, Text, Platform, ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  useAnimatedReaction
} from 'react-native-reanimated';
import { ArrowLeftRight } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';

interface ImageComparisonSliderProps {
  beforeImage: ImageSourcePropType;
  afterImage?: ImageSourcePropType; // Made optional if video is used
  afterVideo?: any; // Asset for video
  initialSlide?: number; // 0 to 1
  height?: number | string;
  width?: number | string;
}

export default function ImageComparisonSlider({
  beforeImage,
  afterImage,
  afterVideo,
  initialSlide = 0.5,
  height,
  width = '100%',
}: ImageComparisonSliderProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState(1784 / 1282);
  const x = useSharedValue(0);
  const startX = useSharedValue(0);

  const onLayout = (event: any) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0 && containerWidth !== w) {
      setContainerWidth(w);
      x.value = w * initialSlide;
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = x.value;
    })
    .onUpdate((event) => {
      let newX = startX.value + event.translationX;
      if (newX < 0) newX = 0;
      if (newX > containerWidth) newX = containerWidth;
      x.value = newX;
    });

  const hoverGesture = Gesture.Hover()
    .onUpdate((event) => {
      if (event.x >= 0 && event.x <= containerWidth) {
        x.value = withSpring(event.x, { mass: 0.5, stiffness: 200, damping: 20 });
      }
    });

  const composedGesture = Gesture.Simultaneous(panGesture, hoverGesture);

  const videoRef = React.useRef<Video>(null);

  const triggerPlay = () => {
    videoRef.current?.playFromPositionAsync(0);
  };

  useAnimatedReaction(
    () => x.value,
    (currentX, previousX) => {
      if (containerWidth === 0) return;
      // Play if Video (>40% visible) -> x < 60% of width
      // Trigger when crossing threshold from Right (>=) to Left (<)
      const threshold = containerWidth * 0.6;
      if (previousX !== null && previousX >= threshold && currentX < threshold) {
        runOnJS(triggerPlay)();
      }
    },
    [containerWidth]
  );

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: x.value,
    };
  });

  const handleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }],
    };
  });

  const beforeLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(x.value, [0, 50], [0, 1], Extrapolate.CLAMP),
    };
  });

  const afterLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(x.value, [containerWidth - 50, containerWidth], [1, 0], Extrapolate.CLAMP),
    };
  });

  const containerStyle: ViewStyle = {
     width: typeof width === 'number' ? width : '100%', 
     height: (height ? height : undefined) as any,
     aspectRatio: height ? undefined : videoAspectRatio,
  };
  
  const innerContainerStyle: any = [
    styles.container, 
    { 
      height: (height ? height : '100%') as any,
      aspectRatio: height ? undefined : videoAspectRatio 
    }
  ];

  return (
    <GestureHandlerRootView style={containerStyle}>
      <View style={innerContainerStyle} onLayout={onLayout}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={styles.imageWrapper}> 
             {/* Wrap everything in GestureDetector to catch hover everywhere */}
             
            {/* Background Image (After) */}
            <View style={styles.imageWrapper}>
              {afterVideo ? (
                <Video
                  source={afterVideo}
                  ref={videoRef}
                  style={[styles.image, { position: 'absolute', left: 0, top: -1, bottom: 0, right: 0 }]}
                  resizeMode={ResizeMode.COVER}
                  isLooping={false}
                  isMuted
                  onLoad={(status: any) => {
                    if (status?.naturalSize) {
                      setVideoAspectRatio(status.naturalSize.width / status.naturalSize.height);
                    }
                  }}
                />
              ) : (
                afterImage && <Image source={afterImage} style={styles.image} resizeMode="cover" />
              )}
              
              <View style={styles.afterLabelContainer}>
                 <Animated.View style={afterLabelStyle}>
                   <View style={styles.labelBadge}>
                     <Text style={styles.labelText}>After</Text>
                   </View>
                 </Animated.View>
              </View>
            </View>

            {/* Foreground Image (Before) - Masked by width */}
            <Animated.View style={[styles.frontImageWrapper, frontAnimatedStyle]}>
              <View style={{ width: containerWidth, height: '100%' }}> 
                <Image source={beforeImage} style={styles.image} resizeMode="cover" />
                 <View style={styles.beforeLabelContainer}>
                   <Animated.View style={beforeLabelStyle}>
                     <View style={styles.labelBadge}>
                       <Text style={styles.labelText}>Before</Text>
                     </View>
                   </Animated.View>
                </View>
              </View>
            </Animated.View>

            {/* 핸들 */}
            <Animated.View style={[styles.handleContainer, handleAnimatedStyle]}>
              <View style={styles.line} />
              <View style={styles.handleCircle}>
                <ArrowLeftRight size={20} color="#F0893B" />
              </View>
              <View style={styles.line} />
            </Animated.View>

          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: '#ffffffff',
  },
  imageWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  frontImageWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: 'white', // fallback
    borderRightWidth: 1, // Optional visual border
    borderRightColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  handleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -20, // Center the 40px wide handle on the line
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  handleCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Labels
  beforeLabelContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  afterLabelContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 5, 
  },
  labelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
     // @ts-ignore
     backdropFilter: 'blur(4px)',
  },
  labelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
