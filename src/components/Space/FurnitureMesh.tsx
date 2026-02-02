/**
 * FurnitureMesh 컴포넌트
 *
 * PLY URL에서 PointCloud 로드하고 배치 위치에 렌더링
 * - PLY 파일 로딩
 * - 배치 위치 (PlacedBox) 적용
 * - orientation에 따른 회전
 * - 적재 애니메이션 (위에서 아래로 떨어지는 효과)
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadPLY, getExactScale } from './utils/plyLoader';
import { PlacedBox, Orientation } from '../../binPacking/types';

interface FurnitureMeshProps {
  plyUrl: string;
  placement: PlacedBox;
  visible: boolean;
  animate?: boolean;
  animationDuration?: number; // ms
  onAnimationComplete?: () => void;
}

const FurnitureMesh: React.FC<FurnitureMeshProps> = ({
  plyUrl,
  placement,
  visible,
  animate = true,
  animationDuration = 500,
  onAnimationComplete,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [material, setMaterial] = useState<THREE.PointsMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 애니메이션 상태
  const animationRef = useRef({
    isAnimating: false,
    startTime: 0,
    startY: 0,
    targetY: 0,
  });

  // placement 단위: cm → m 변환
  // binPacking은 cm 단위를 사용함
  const targetWidth = placement.width / 100;  // cm → m
  const targetDepth = placement.depth / 100;
  const targetHeight = placement.height / 100;

  // 배치 위치 (cm → m)
  const targetX = placement.x / 100;
  const targetY = placement.y / 100 + targetHeight / 2;  // y는 바닥 기준이므로 높이의 절반 더함
  const targetZ = placement.z / 100;

  // 디버그 로그
  console.log(`[FurnitureMesh] ${placement.itemId}:`, {
    placement_cm: { x: placement.x, y: placement.y, z: placement.z, w: placement.width, d: placement.depth, h: placement.height },
    target_m: { x: targetX, y: targetY, z: targetZ, w: targetWidth, d: targetDepth, h: targetHeight },
    orientation: placement.orientation,
  });

  // PLY 로딩
  useEffect(() => {
    if (!plyUrl) return;

    setIsLoading(true);
    setError(null);

    loadPLY(plyUrl, 0.008)
      .then(({ geometry: loadedGeometry, material: loadedMaterial }) => {
        // 지오메트리 중심 정렬
        loadedGeometry.center();

        // 비균일 스케일 계산 (목표 박스에 정확히 맞추기)
        const { scaleX, scaleY, scaleZ } = getExactScale(
          loadedGeometry,
          targetWidth,
          targetDepth,
          targetHeight
        );

        // 지오메트리 비균일 스케일링 적용
        loadedGeometry.scale(scaleX, scaleY, scaleZ);

        console.log(`[FurnitureMesh] PLY 스케일:`, { scaleX, scaleY, scaleZ });

        setGeometry(loadedGeometry);
        setMaterial(loadedMaterial);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('PLY 로딩 실패:', err);
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      geometry?.dispose();
      material?.dispose();
    };
  }, [plyUrl, targetWidth, targetDepth, targetHeight]);

  // visible 상태 변경 시 애니메이션 시작
  useEffect(() => {
    if (visible && geometry && animate && groupRef.current) {
      // 애니메이션 시작 위치 (위에서 시작)
      const startY = targetY + 1.5; // 1.5m 위에서 시작
      groupRef.current.position.y = startY;

      animationRef.current = {
        isAnimating: true,
        startTime: performance.now(),
        startY,
        targetY,
      };
    }
  }, [visible, geometry, animate, targetY]);

  // 애니메이션 프레임
  useFrame(() => {
    if (!animationRef.current.isAnimating || !groupRef.current) return;

    const elapsed = performance.now() - animationRef.current.startTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    // easeOutBounce 이징
    const eased = easeOutBack(progress);

    const currentY =
      animationRef.current.startY +
      (animationRef.current.targetY - animationRef.current.startY) * eased;

    groupRef.current.position.y = currentY;

    if (progress >= 1) {
      animationRef.current.isAnimating = false;
      groupRef.current.position.y = animationRef.current.targetY;
      onAnimationComplete?.();
    }
  });

  // 회전 계산 (orientation에 따라)
  const rotation = useMemo(() => {
    if (placement.orientation === Orientation.WLH) {
      return [0, Math.PI / 2, 0] as [number, number, number];
    }
    return [0, 0, 0] as [number, number, number];
  }, [placement.orientation]);

  if (!visible || isLoading || error || !geometry || !material) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={[targetX, animate ? animationRef.current.startY || targetY : targetY, targetZ]}
      rotation={rotation}
    >
      <points geometry={geometry} material={material} />
    </group>
  );
};

// easeOutBack 이징 함수
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export default FurnitureMesh;
