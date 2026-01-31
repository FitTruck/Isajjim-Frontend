import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsStd } from 'three-stdlib';
import * as THREE from 'three';
import PorterTruck from './PorterTruck';

// 1. OrbitControls를 R3F에서 사용할 수 있도록 확장 등록
extend({ OrbitControlsStd });

// TypeScript에서 커스텀 JSX 요소(orbitControlsStd)를 인식하도록 선언
declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControlsStd: any;
  }
}

/**
 * Controls: 카메라 조작을 위한 컴포넌트
 * drei 라이브러리 대신 three-stdlib를 직접 사용하여 이벤트 충돌 방지 및 Native 호환성 확보
 */
const Controls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsStd>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
  }, []);

  // 매 프레임 업데이트 호출 (Damping 및 AutoRotate 적용 필수)
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
    // React Native의 View는 웹에서 div로 렌더링됩니다.
    // width: 100%, height: 100%를 사용하여 부모 컨테이너를 가득 채웁니다.
    <View style={{ width: '100%', height: '100%', backgroundColor: '#020617' }}> 
      <Canvas 
        shadows 
        camera={{ position: [20, 20, 18], fov: 85 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 배경색 (안개 제거, 배경만 유지) */}
        <color attach="background" args={['#020617']} />

        {/* 기본 조명 */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[20, 40, 20]} 
          intensity={2} 
        />
        <pointLight position={[-20, 20, -20]} intensity={0.5} color="#6ad2ff" />

        {/* --- 배경 요소 --- */}
        
        {/* 1. 기본 격자 (Simple Grid Helper) */}
        <group position={[0, -2.01, 0]}>
          <gridHelper args={[1000, 50, "#081027", "#050c1f"]} />
        </group>

        {/* 2. 바닥 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <shadowMaterial opacity={0.3}/>
        </mesh>

        {/* 3. XYZ 축 */}
        <axesHelper args={[20]} position={[0, 0, 0]} />

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