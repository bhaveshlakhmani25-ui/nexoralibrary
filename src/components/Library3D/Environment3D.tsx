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

export const GlassRailing = ({ position, rotation = [0, 0, 0], length }: { position: [number, number, number], rotation?: [number, number, number], length: number }) => {
  const postSpacing = 2;
  const numPosts = Math.ceil(length / postSpacing) + 1;
  const postMat = new THREE.MeshStandardMaterial({ color: '#3d2314', roughness: 0.7 });
  const handrailMat = new THREE.MeshStandardMaterial({ color: '#3d2314', roughness: 0.6 });
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: '#ffffff', transparent: true, opacity: 0.2, roughness: 0.1, metalness: 0.1, transmission: 0.9, ior: 1.5 
  });

  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <group>
        {/* Glass Panel */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[length, 0.9, 0.05]} />
          <primitive object={glassMat} attach="material" />
        </mesh>
        {/* Top Handrail */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[length, 0.1, 0.15]} />
          <primitive object={handrailMat} attach="material" />
        </mesh>
        {/* Bottom Rail */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[length, 0.1, 0.1]} />
          <primitive object={postMat} attach="material" />
        </mesh>
        {/* Posts */}
        {Array.from({ length: numPosts }).map((_, i) => {
          const xPos = -length / 2 + (i * length) / (numPosts - 1);
          return (
            <mesh key={`post-${i}`} position={[xPos, 0.5, 0]} castShadow>
              <boxGeometry args={[0.1, 1, 0.1]} />
              <primitive object={postMat} attach="material" />
            </mesh>
          );
        })}
      </group>
    </RigidBody>
  );
};

export const Environment3D = () => {
  const wallMat = new THREE.MeshStandardMaterial({ color: '#f5eee6', roughness: 0.9 });
  const wainscotingMat = new THREE.MeshStandardMaterial({ color: '#3d2314', roughness: 0.8 });
  const beamMat = new THREE.MeshStandardMaterial({ color: '#2a1708', roughness: 0.9 });
  const floorMat = new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 0.7 });
  
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

      {/* Upper Floor (70% coverage) */}
      <RigidBody type="fixed">
        {/* Left Upper Floor */}
        <mesh position={[-18.5, 9.75, 0]} receiveShadow castShadow>
          <boxGeometry args={[13, 0.5, 70]} />
          <primitive object={floorMat} attach="material" />
        </mesh>
        {/* Right Upper Floor */}
        <mesh position={[18.5, 9.75, 0]} receiveShadow castShadow>
          <boxGeometry args={[13, 0.5, 70]} />
          <primitive object={floorMat} attach="material" />
        </mesh>
        {/* Front Upper Floor (Over Entrance) */}
        <mesh position={[0, 9.75, 27.5]} receiveShadow castShadow>
          <boxGeometry args={[24, 0.5, 15]} />
          <primitive object={floorMat} attach="material" />
        </mesh>
        {/* Back Upper Floor */}
        <mesh position={[0, 9.75, -27.5]} receiveShadow castShadow>
          <boxGeometry args={[24, 0.5, 15]} />
          <primitive object={floorMat} attach="material" />
        </mesh>
      </RigidBody>

      {/* Upper Floor Green Rugs */}
      <mesh receiveShadow position={[-18.5, 10.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 60]} />
        <meshStandardMaterial color="#2d4c36" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[18.5, 10.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 60]} />
        <meshStandardMaterial color="#2d4c36" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 10.01, -27.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#2d4c36" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 10.01, 27.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#2d4c36" roughness={0.9} />
      </mesh>

      {/* Atrium Glass Balcony Railings */}
      {/* Left Railing */}
      <GlassRailing position={[-12, 10, 0]} rotation={[0, Math.PI / 2, 0]} length={40} />
      {/* Right Railing */}
      <GlassRailing position={[12, 10, 0]} rotation={[0, -Math.PI / 2, 0]} length={40} />
      {/* Front Railing */}
      <GlassRailing position={[0, 10, 20]} rotation={[0, Math.PI, 0]} length={24} />
      {/* Back Railing */}
      <GlassRailing position={[0, 10, -20]} rotation={[0, 0, 0]} length={24} />

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
        <mesh position={[0, 11.5, 34.4]} receiveShadow material={wainscotingMat}><boxGeometry args={[50, 3, 0.2]} /></mesh>
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

      {/* Hanging Pendant Lamps for Central Atrium */}
      {[-15, 0, 15].map((z, i) => (
        <group key={`lamp-${i}`} position={[0, 29, z]}>
          <mesh material={beamMat}><cylinderGeometry args={[0.05, 0.05, 12]} /></mesh>
          <mesh position={[0, -6, 0]} material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[2, 2.5, 1]} /></mesh>
          <mesh position={[0, -6.2, 0]} material={new THREE.MeshBasicMaterial({ color: '#ffdf85' })}><sphereGeometry args={[1]} /></mesh>
          <pointLight position={[0, -7, 0]} intensity={2.0} distance={40} color="#ffdf85" castShadow />
        </group>
      ))}

      {/* Smaller Hanging Lamps for Mezzanine Gallery */}
      {[-25, -10, 5, 20].map((z, i) => (
        <group key={`mlamp-l-${i}`} position={[-18.5, 29, z]}>
          <mesh material={beamMat}><cylinderGeometry args={[0.02, 0.02, 8]} /></mesh>
          <mesh position={[0, -4, 0]} material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[0.8, 1, 0.5]} /></mesh>
          <mesh position={[0, -4.1, 0]} material={new THREE.MeshBasicMaterial({ color: '#ffdf85' })}><sphereGeometry args={[0.4]} /></mesh>
          <pointLight position={[0, -4.5, 0]} intensity={1} distance={20} color="#ffdf85" castShadow />
        </group>
      ))}
      {[-25, -10, 5, 20].map((z, i) => (
        <group key={`mlamp-r-${i}`} position={[18.5, 29, z]}>
          <mesh material={beamMat}><cylinderGeometry args={[0.02, 0.02, 8]} /></mesh>
          <mesh position={[0, -4, 0]} material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[0.8, 1, 0.5]} /></mesh>
          <mesh position={[0, -4.1, 0]} material={new THREE.MeshBasicMaterial({ color: '#ffdf85' })}><sphereGeometry args={[0.4]} /></mesh>
          <pointLight position={[0, -4.5, 0]} intensity={1} distance={20} color="#ffdf85" castShadow />
        </group>
      ))}
      {[-10, 10].map((x, i) => (
        <group key={`mlamp-b-${i}`} position={[x, 29, -27.5]}>
          <mesh material={beamMat}><cylinderGeometry args={[0.02, 0.02, 8]} /></mesh>
          <mesh position={[0, -4, 0]} material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[0.8, 1, 0.5]} /></mesh>
          <mesh position={[0, -4.1, 0]} material={new THREE.MeshBasicMaterial({ color: '#ffdf85' })}><sphereGeometry args={[0.4]} /></mesh>
          <pointLight position={[0, -4.5, 0]} intensity={1} distance={20} color="#ffdf85" castShadow />
        </group>
      ))}
      {[-10, 10].map((x, i) => (
        <group key={`mlamp-f-${i}`} position={[x, 29, 27.5]}>
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
