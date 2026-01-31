import React from 'react';

/**
 * PorterTruck: 현대 포터 II 디자인을 구현한 컴포넌트입니다.
 * 1톤 트럭 규격(8x8x14)을 기준으로 설계되었습니다.
 */
const PorterTruck = () => {
  const truckColor = "#114ebf";
  const truckDim = { width: 8, height: 8, depth: 15 };

  return (
    <group position={[0, 0, 0]}>
      {/* 1. 하부 프레임 및 섀시 */}
      <mesh position={[0, 0.5, 2]} receiveShadow castShadow>
        <boxGeometry args={[truckDim.width - 1, 0.8, truckDim.depth + 4]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 2. 적재함 영역 */}
      <group position={[0, 2, 0]}>
        {/* 바닥판 */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[truckDim.width + 0.4, 0.4, truckDim.depth + 0.4]} />
          <meshStandardMaterial color={truckColor} metalness={0.5} roughness={0.4}/>
        </mesh>
        
        {/* 적재 가이드라인 */}
        <mesh position={[0, truckDim.height / 2 + 0.2, 0]}>
          <boxGeometry args={[truckDim.width, truckDim.height, truckDim.depth]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.15} />
        </mesh>
      </group>

      {/* 3. 트럭 캡 (운전석 영역) */}
      <group position={[0, 2, (truckDim.depth / 2) + 2.2]}>
        
        <mesh position={[0, 2.8, 0]} castShadow>
          <boxGeometry args={[truckDim.width + 0.2, 6.0, 4.4]} />
          <meshStandardMaterial color={truckColor} />
        </mesh>

        {/* 범퍼 */}
        <mesh position={[0, 4.2, 2.22]} castShadow>
          <boxGeometry args={[truckDim.width - 0.2, 3.0, 0.1]} />
          <meshStandardMaterial color="#000000"/>
        </mesh>

        {/* 헤드램프 */}
        <mesh position={[-2.8, 1.4, 2.21]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.5, 0.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[2.8, 1.4, 2.21]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.5, 0.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>

        {/* 하단 범퍼 */}
        <mesh position={[0, 0.2, 2.3]} castShadow>
          <boxGeometry args={[truckDim.width + 0.6, 1, 0.5]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* 4. 바퀴 구성 */}
      {[
        [3.8, 0.8, -2], [-3.8, 0.8, -2], 
        [3.8, 0.8, 8], [-3.8, 0.8, 8]
      ].map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.2, 1.2, 1.0, 32]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 1.1, 32]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default PorterTruck;
