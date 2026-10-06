import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export const DustParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const count = 200;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 40;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffdf85" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

export const Environment3D = () => {
  return (
    <group>
      <ambientLight intensity={0.4} />
      {/* Sunlight through windows */}
      <directionalLight 
        position={[20, 20, 10]} 
        intensity={1.5} 
        castShadow 
        color="#fff1e0"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {/* Soft fill light */}
      <directionalLight position={[-10, 10, -10]} intensity={0.3} color="#a1c4fd" />

      {/* Floor */}
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#c18a54" />
        </mesh>
      </RigidBody>

      {/* Rug */}
      <mesh receiveShadow position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#4a7c59" />
      </mesh>

      {/* Walls (Invisible colliders just to keep player inside, plus some visible walls) */}
      <RigidBody type="fixed">
        <mesh position={[0, 10, -25]} receiveShadow>
          <boxGeometry args={[50, 20, 1]} />
          <meshStandardMaterial color="#f4ecd8" />
        </mesh>
        <mesh position={[0, 10, 25]} receiveShadow>
          <boxGeometry args={[50, 20, 1]} />
          <meshStandardMaterial color="#f4ecd8" />
        </mesh>
        <mesh position={[-25, 10, 0]} receiveShadow>
          <boxGeometry args={[1, 20, 50]} />
          <meshStandardMaterial color="#f4ecd8" />
        </mesh>
        <mesh position={[25, 10, 0]} receiveShadow>
          <boxGeometry args={[1, 20, 50]} />
          <meshStandardMaterial color="#f4ecd8" />
        </mesh>
      </RigidBody>

      <DustParticles />
    </group>
  );
};
