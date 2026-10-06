import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export const DustParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = Math.random() * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
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
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#ffdf85" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
};

export const Environment3D = () => {
  const wallMat = new THREE.MeshStandardMaterial({ color: '#f5eee6', roughness: 0.9 });
  const wainscotingMat = new THREE.MeshStandardMaterial({ color: '#3d2314', roughness: 0.8 });
  const beamMat = new THREE.MeshStandardMaterial({ color: '#2a1708', roughness: 0.9 });
  const floorMat = new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 0.7 });
  const railingMat = new THREE.MeshStandardMaterial({ color: '#3d2314', roughness: 0.7 });
  
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
        shadow-camera-left={-40} shadow-camera-right={40}
        shadow-camera-top={40} shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-20, 15, -20]} intensity={0.4} color="#a1c4fd" />

      {/* Ground Floor */}
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 80]} />
          <primitive object={floorMat} attach="material" />
        </mesh>
      </RigidBody>

      {/* Central Aisle Patterned Rug */}
      <mesh receiveShadow position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 60]} />
        <meshStandardMaterial color="#2d4c36" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10.4, 60.4]} />
        <meshStandardMaterial color="#d4af37" roughness={0.9} />
      </mesh>

      {/* Mezzanine Floors (Height = 10) */}
      <RigidBody type="fixed">
        {/* Left Mezzanine */}
        <mesh position={[-20, 9.75, 0]} receiveShadow castShadow>
          <boxGeometry args={[10, 0.5, 70]} />
          <primitive object={floorMat} attach="material" />
        </mesh>
        {/* Right Mezzanine */}
        <mesh position={[20, 9.75, 0]} receiveShadow castShadow>
          <boxGeometry args={[10, 0.5, 70]} />
          <primitive object={floorMat} attach="material" />
        </mesh>
        {/* Back Mezzanine joining left and right */}
        <mesh position={[0, 9.75, -30]} receiveShadow castShadow>
          <boxGeometry args={[30, 0.5, 10]} />
          <primitive object={floorMat} attach="material" />
        </mesh>
      </RigidBody>

      {/* Mezzanine Railings */}
      <RigidBody type="fixed">
        {/* Left inner edge railing */}
        <mesh position={[-15, 10.5, 0]} castShadow><boxGeometry args={[0.2, 1, 70]} /><primitive object={railingMat} attach="material" /></mesh>
        {/* Right inner edge railing */}
        <mesh position={[15, 10.5, 0]} castShadow><boxGeometry args={[0.2, 1, 70]} /><primitive object={railingMat} attach="material" /></mesh>
        {/* Back inner edge railing */}
        <mesh position={[0, 10.5, -25]} castShadow><boxGeometry args={[30, 1, 0.2]} /><primitive object={railingMat} attach="material" /></mesh>
      </RigidBody>

      {/* Architectural Walls */}
      <RigidBody type="fixed">
        {/* Left Wall */}
        <mesh position={[-25, 15, 0]} receiveShadow material={wallMat}><boxGeometry args={[1, 30, 70]} /></mesh>
        <mesh position={[-24.4, 1.5, 0]} receiveShadow material={wainscotingMat}><boxGeometry args={[0.2, 3, 70]} /></mesh>
        <mesh position={[-24.4, 11.5, 0]} receiveShadow material={wainscotingMat}><boxGeometry args={[0.2, 3, 70]} /></mesh>
        
        {/* Right Wall with Windows */}
        <mesh position={[25, 15, 0]} receiveShadow material={wallMat}><boxGeometry args={[1, 30, 70]} /></mesh>
        <mesh position={[24.4, 1.5, 0]} receiveShadow material={wainscotingMat}><boxGeometry args={[0.2, 3, 70]} /></mesh>
        <mesh position={[24.4, 11.5, 0]} receiveShadow material={wainscotingMat}><boxGeometry args={[0.2, 3, 70]} /></mesh>
        
        {/* Tall glowing windows on the right wall (Ground Floor) */}
        {[-20, -10, 0, 10, 20].map((z, i) => (
          <mesh key={`win-g-${i}`} position={[24.4, 6, z]} material={new THREE.MeshBasicMaterial({ color: '#fff1e0' })}>
            <boxGeometry args={[0.3, 8, 4]} />
          </mesh>
        ))}
        {/* Tall glowing windows on the right wall (Upper Floor) */}
        {[-20, -10, 0, 10, 20].map((z, i) => (
          <mesh key={`win-u-${i}`} position={[24.4, 18, z]} material={new THREE.MeshBasicMaterial({ color: '#fff1e0' })}>
            <boxGeometry args={[0.3, 8, 4]} />
          </mesh>
        ))}

        {/* Back Wall */}
        <mesh position={[0, 15, -35]} receiveShadow material={wallMat}><boxGeometry args={[50, 30, 1]} /></mesh>
        <mesh position={[0, 1.5, -34.4]} receiveShadow material={wainscotingMat}><boxGeometry args={[50, 3, 0.2]} /></mesh>
        <mesh position={[0, 11.5, -34.4]} receiveShadow material={wainscotingMat}><boxGeometry args={[50, 3, 0.2]} /></mesh>
        
        {/* Front Wall */}
        <mesh position={[0, 15, 35]} receiveShadow material={wallMat}><boxGeometry args={[50, 30, 1]} /></mesh>
        <mesh position={[0, 1.5, 34.4]} receiveShadow material={wainscotingMat}><boxGeometry args={[50, 3, 0.2]} /></mesh>
      </RigidBody>

      {/* Roof / Ceiling */}
      <RigidBody type="fixed">
        <mesh position={[0, 30, 0]} receiveShadow material={wallMat}><boxGeometry args={[50, 1, 70]} /></mesh>
      </RigidBody>

      {/* Ceiling Beams */}
      {[-30, -20, -10, 0, 10, 20, 30].map((z, i) => (
        <mesh key={`beam-${i}`} position={[0, 29.5, z]} castShadow receiveShadow material={beamMat}>
          <boxGeometry args={[50, 1, 1]} />
        </mesh>
      ))}

      {/* Hanging Pendant Lamps for Central Hall */}
      {[-15, 0, 15].map((z, i) => (
        <group key={`lamp-${i}`} position={[0, 29, z]}>
          <mesh material={beamMat}><cylinderGeometry args={[0.05, 0.05, 12]} /></mesh>
          <mesh position={[0, -6, 0]} material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[2, 2.5, 1]} /></mesh>
          <mesh position={[0, -6.2, 0]} material={new THREE.MeshBasicMaterial({ color: '#ffdf85' })}><sphereGeometry args={[1]} /></mesh>
          <pointLight position={[0, -7, 0]} intensity={2.0} distance={40} color="#ffdf85" castShadow />
        </group>
      ))}

      {/* Smaller Hanging Lamps for Mezzanine */}
      {[-20, 0, 20].map((z, i) => (
        <group key={`mlamp-l-${i}`} position={[-20, 29, z]}>
          <mesh material={beamMat}><cylinderGeometry args={[0.02, 0.02, 8]} /></mesh>
          <mesh position={[0, -4, 0]} material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[0.8, 1, 0.5]} /></mesh>
          <mesh position={[0, -4.1, 0]} material={new THREE.MeshBasicMaterial({ color: '#ffdf85' })}><sphereGeometry args={[0.4]} /></mesh>
          <pointLight position={[0, -4.5, 0]} intensity={1} distance={20} color="#ffdf85" castShadow />
        </group>
      ))}
      {[-20, 0, 20].map((z, i) => (
        <group key={`mlamp-r-${i}`} position={[20, 29, z]}>
          <mesh material={beamMat}><cylinderGeometry args={[0.02, 0.02, 8]} /></mesh>
          <mesh position={[0, -4, 0]} material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[0.8, 1, 0.5]} /></mesh>
          <mesh position={[0, -4.1, 0]} material={new THREE.MeshBasicMaterial({ color: '#ffdf85' })}><sphereGeometry args={[0.4]} /></mesh>
          <pointLight position={[0, -4.5, 0]} intensity={1} distance={20} color="#ffdf85" castShadow />
        </group>
      ))}

      <DustParticles />
    </group>
  );
};
