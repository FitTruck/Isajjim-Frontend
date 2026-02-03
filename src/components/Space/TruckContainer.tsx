/**
 * TruckContainer 컴포넌트
 *
 * 트럭 프리셋 기반 적재함 렌더링
 * - 바닥면 (반투명)
 * - 벽면 (반투명)
 * - 와이어프레임 가이드라인
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TruckType, TRUCK_DIMENSIONS } from '../../types/simulation';

interface TruckContainerProps {
  truckType: TruckType;
  color?: string;
  opacity?: number;
}

const TruckContainer: React.FC<TruckContainerProps> = ({
  truckType,
  color = '#00ff88',
  opacity = 0.15,
}) => {
  const dimensions = TRUCK_DIMENSIONS[truckType];
  const { width, depth, height } = dimensions;

  // 와이어프레임 지오메트리
  const edgesGeometry = useMemo(() => {
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    return new THREE.EdgesGeometry(boxGeometry);
  }, [width, height, depth]);

  // 벽면 재질
  const wallMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
    });
  }, [color, opacity]);

  // 바닥 재질 (약간 더 불투명)
  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: opacity * 1.5,
      side: THREE.DoubleSide,
    });
  }, [color, opacity]);

  return (
    <group>
      {/* 와이어프레임 (박스 윤곽선) */}
      <lineSegments
        geometry={edgesGeometry}
        position={[0, height / 2, 0]}
      >
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>

      {/* 바닥면 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        material={floorMaterial}
      >
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* 뒤쪽 벽 (-Z) */}
      <mesh
        position={[0, height / 2, -depth / 2]}
        material={wallMaterial}
      >
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* 왼쪽 벽 (-X) */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-width / 2, height / 2, 0]}
        material={wallMaterial}
      >
        <planeGeometry args={[depth, height]} />
      </mesh>

      {/* 오른쪽 벽 (+X) */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[width / 2, height / 2, 0]}
        material={wallMaterial}
      >
        <planeGeometry args={[depth, height]} />
      </mesh>
    </group>
  );
};

export default TruckContainer;
