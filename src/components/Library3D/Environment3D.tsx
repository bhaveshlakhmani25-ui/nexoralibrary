import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export const DustParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 300;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = Math.random() * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#ffdf85" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
};

export const Environment3D = () => {
  const wallMat = new THREE.MeshStandardMaterial({ color: '#f5eee6', roughness: 0.9 });
  const wainscotingMat = new THREE.MeshStandardMaterial({ color: '#3d2314', roughness: 0.8 });
  const beamMat = new THREE.MeshStandardMaterial({ color: '#2a1708', roughness: 0.9 });
  
  return (
    <group>
      <ambientLight intensity={0.6} color="#ffe5b4" />
      {/* Sunlight through windows */}
      <directionalLight 
        position={[30, 20, 10]} 
        intensity={1.8} 
        castShadow 
        color="#fff1e0"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-20, 15, -20]} intensity={0.4} color="#a1c4fd" />

      {/* Floor */}
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#5c3a21" roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Central Aisle Patterned Rug */}
      <mesh receiveShadow position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 60]} />
        <meshStandardMaterial color="#2d4c36" roughness={0.9} />
      </mesh>
      {/* Rug border */}
      <mesh receiveShadow position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.4, 60.4]} />
        <meshStandardMaterial color="#d4af37" roughness={0.9} />
      </mesh>

      {/* Architectural Walls & Boundaries */}
      <RigidBody type="fixed">
        {/* Left Wall */}
        <mesh position={[-25, 10, 0]} receiveShadow material={wallMat}><boxGeometry args={[1, 20, 70]} /></mesh>
        <mesh position={[-24.4, 1.5, 0]} receiveShadow material={wainscotingMat}><boxGeometry args={[0.2, 3, 70]} /></mesh>
        
        {/* Right Wall with Windows */}
        <mesh position={[25, 10, 0]} receiveShadow material={wallMat}><boxGeometry args={[1, 20, 70]} /></mesh>
        <mesh position={[24.4, 1.5, 0]} receiveShadow material={wainscotingMat}><boxGeometry args={[0.2, 3, 70]} /></mesh>
        
        {/* Tall glowing windows on the right wall */}
        {[-20, -10, 0, 10, 20].map((z, i) => (
          <mesh key={`win-${i}`} position={[24.4, 10, z]} material={new THREE.MeshBasicMaterial({ color: '#fff1e0' })}>
            <boxGeometry args={[0.3, 10, 4]} />
          </mesh>
        ))}

        {/* Back Wall */}
        <mesh position={[0, 10, -35]} receiveShadow material={wallMat}><boxGeometry args={[50, 20, 1]} /></mesh>
        <mesh position={[0, 1.5, -34.4]} receiveShadow material={wainscotingMat}><boxGeometry args={[50, 3, 0.2]} /></mesh>
        
        {/* Front Wall */}
        <mesh position={[0, 10, 35]} receiveShadow material={wallMat}><boxGeometry args={[50, 20, 1]} /></mesh>
        <mesh position={[0, 1.5, 34.4]} receiveShadow material={wainscotingMat}><boxGeometry args={[50, 3, 0.2]} /></mesh>
      </RigidBody>

      {/* Ceiling Beams */}
      {[-20, -10, 0, 10, 20].map((z, i) => (
        <mesh key={`beam-${i}`} position={[0, 19, z]} castShadow receiveShadow material={beamMat}>
          <boxGeometry args={[50, 1, 1]} />
        </mesh>
      ))}

      {/* Hanging Pendant Lamps */}
      {[-15, 0, 15].map((z, i) => (
        <group key={`lamp-${i}`} position={[0, 15, z]}>
          <mesh material={beamMat}><cylinderGeometry args={[0.05, 0.05, 8]} /></mesh>
          <mesh position={[0, -4, 0]} material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[1.5, 2, 1]} /></mesh>
          <mesh position={[0, -4.2, 0]} material={new THREE.MeshBasicMaterial({ color: '#ffdf85' })}><sphereGeometry args={[0.8]} /></mesh>
          <pointLight position={[0, -5, 0]} intensity={1.5} distance={20} color="#ffdf85" castShadow />
        </group>
      ))}

      <DustParticles />
    </group>
  );
};
