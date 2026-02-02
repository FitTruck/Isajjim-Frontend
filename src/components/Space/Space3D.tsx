import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsStd } from 'three-stdlib';
import PorterTruck from './PorterTruck';

extend({ OrbitControlsStd });

declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControlsStd: any;
  }
}

const Controls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsStd>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
  }, []);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return (
    <orbitControlsStd
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping={true}
      dampingFactor={0.05}
      autoRotateSpeed={2.0}
      minDistance={5}
      maxDistance={100}
      maxPolarAngle={Math.PI / 2.1} 
    />
  );
};

const Space3D = () => {
  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#020617' }}> 
      <Canvas 
        shadows 
        camera={{ position: [20, 20, 18], fov: 85 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 배경색 */}
        <color attach="background" args={['#020617']} />

        {/* 기본 조명 */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[20, 40, 20]} 
          intensity={2} 
        />
        <pointLight position={[-20, 20, -20]} intensity={0.5} color="#6ad2ff" />

        {/* --- 배경 요소 --- */}
        
        {/* 1. 기본 격자 */}
        <group position={[0, -2.01, 0]}>
          <gridHelper args={[1000, 50, "#081027", "#050c1f"]} />
        </group>

        {/* 2. 바닥 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <shadowMaterial opacity={0.3}/>
        </mesh>

        {/* --- 메인 콘텐츠 --- */}
        {/* Native 환경에 맞춰 바닥면으로 위치 조정 */}
        <group position={[0, -2, 0]}>
          <PorterTruck />
        </group>
        
        {/* --- 컨트롤 --- */}
        <Controls />
      </Canvas>
    </View>
  );
}

export default Space3D;