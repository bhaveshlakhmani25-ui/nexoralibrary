import { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store';
import * as THREE from 'three';

const darkWood = new THREE.MeshStandardMaterial({ color: '#3d2314', roughness: 0.8 });
const lightWood = new THREE.MeshStandardMaterial({ color: '#8b5a2b', roughness: 0.7 });
const fabricGreen = new THREE.MeshStandardMaterial({ color: '#2d4c36', roughness: 0.9 });
const fabricCaramel = new THREE.MeshStandardMaterial({ color: '#c17a3f', roughness: 0.9 });
const fabricNavy = new THREE.MeshStandardMaterial({ color: '#1a365d', roughness: 0.9 });
const lampGold = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.6, roughness: 0.2 });
const paperMat = new THREE.MeshStandardMaterial({ color: '#fdf6e3' });
const leafMat = new THREE.MeshStandardMaterial({ color: '#4a7c59', roughness: 0.8 });

const bookColors = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#f39c12', '#16a085', '#2c3e50', '#d35400'];

const randomBookColor = () => new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] });

const generateBooks = (count: number, shelfWidth: number, yPos: number, zPos: number) => {
  const books = [];
  let currentX = -shelfWidth / 2 + 0.2;
  for (let i = 0; i < count; i++) {
    const width = 0.1 + Math.random() * 0.1;
    const height = 0.5 + Math.random() * 0.3;
    const depth = 0.5 + Math.random() * 0.2;
    if (currentX + width > shelfWidth / 2 - 0.2) break;
    books.push(
      <mesh key={`book-${i}`} position={[currentX + width/2, yPos + height/2, zPos]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={randomBookColor()} attach="material" />
      </mesh>
    );
    currentX += width + 0.02;
  }
  return books;
};

export const Bookshelf = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <group>
        <mesh position={[0, 2.5, -0.4]} castShadow receiveShadow material={darkWood}><boxGeometry args={[4, 5, 0.1]} /></mesh>
        <mesh position={[-2, 2.5, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[0.2, 5, 0.9]} /></mesh>
        <mesh position={[2, 2.5, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[0.2, 5, 0.9]} /></mesh>
        <mesh position={[0, 5, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[4.2, 0.2, 1]} /></mesh>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[4.2, 0.2, 1]} /></mesh>
        {[1, 2, 3, 4].map((y, i) => (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[3.8, 0.1, 0.8]} /></mesh>
            {generateBooks(15, 3.8, y + 0.05, 0)}
          </group>
        ))}
        <mesh position={[-1.5, 5.3, 0]} castShadow material={leafMat}><cylinderGeometry args={[0.3, 0.2, 0.4]} /></mesh>
      </group>
    </RigidBody>
  );
};

export const DeskChair = ({ position, rotation = [0,0,0], color = 'navy' }: any) => {
  const mat = color === 'green' ? fabricGreen : color === 'caramel' ? fabricCaramel : fabricNavy;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={mat}><boxGeometry args={[0.6, 0.1, 0.6]} /></mesh>
      <mesh position={[0, 1, 0.25]} castShadow receiveShadow material={mat}><boxGeometry args={[0.6, 0.6, 0.1]} /></mesh>
      <mesh position={[-0.25, 0.25, -0.25]} castShadow material={darkWood}><cylinderGeometry args={[0.03, 0.03, 0.5]} /></mesh>
      <mesh position={[0.25, 0.25, -0.25]} castShadow material={darkWood}><cylinderGeometry args={[0.03, 0.03, 0.5]} /></mesh>
      <mesh position={[-0.25, 0.25, 0.25]} castShadow material={darkWood}><cylinderGeometry args={[0.03, 0.03, 0.5]} /></mesh>
      <mesh position={[0.25, 0.25, 0.25]} castShadow material={darkWood}><cylinderGeometry args={[0.03, 0.03, 0.5]} /></mesh>
    </group>
  );
};

export const IndividualDesk = ({ id, position, rotation = [0,0,0] }: { id: number, position: [number, number, number], rotation?: [number, number, number] }) => {
  const { setNearTable } = useGameStore();

  const seatWorldInfo = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...position);
    obj.rotation.set(...rotation);
    obj.updateMatrixWorld();

    const localSeatPos = new THREE.Vector3(0, 0.2, 0.6); // where the player butt should be
    localSeatPos.applyMatrix4(obj.matrixWorld);

    // Player should face -z relative to the desk (since chair is at +z facing -z)
    const yRot = (rotation[1] || 0);

    return {
      pos: [localSeatPos.x, localSeatPos.y, localSeatPos.z] as [number, number, number],
      rot: [0, yRot, 0] as [number, number, number]
    };
  }, [position, rotation]);

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed">
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow material={lightWood}><boxGeometry args={[1.5, 0.05, 1]} /></mesh>
        <mesh position={[-0.7, 0.4, -0.45]} castShadow material={darkWood}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
        <mesh position={[0.7, 0.4, -0.45]} castShadow material={darkWood}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
        <mesh position={[-0.7, 0.4, 0.45]} castShadow material={darkWood}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
        <mesh position={[0.7, 0.4, 0.45]} castShadow material={darkWood}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
        
        <mesh position={[0, 1.1, -0.45]} castShadow receiveShadow material={fabricGreen}><boxGeometry args={[1.4, 0.6, 0.05]} /></mesh>

        {/* Lamp */}
        <mesh position={[0.5, 0.85, -0.3]} castShadow material={lampGold}><cylinderGeometry args={[0.1, 0.1, 0.05]} /></mesh>
        <mesh position={[0.5, 1.0, -0.3]} castShadow material={lampGold}><cylinderGeometry args={[0.02, 0.02, 0.3]} /></mesh>
        <mesh position={[0.4, 1.15, -0.3]} rotation={[0, 0, 0.5]} castShadow material={lampGold}><coneGeometry args={[0.15, 0.2]} /></mesh>
        <pointLight position={[0.4, 1.1, -0.3]} intensity={0.5} distance={3} color="#ffdf85" />

        {/* Open Notebook */}
        <mesh position={[0, 0.83, 0]} rotation={[0, 0.1, 0]} castShadow material={paperMat}><boxGeometry args={[0.4, 0.02, 0.3]} /></mesh>
        {/* Pen */}
        <mesh position={[0.25, 0.83, 0.1]} rotation={[0, -0.5, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[0.01, 0.01, 0.15]} /></mesh>
        {/* Timer Clock */}
        <mesh position={[-0.4, 0.85, -0.2]} rotation={[0, 0.3, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#e74c3c' })}><boxGeometry args={[0.1, 0.1, 0.05]} /></mesh>
        <mesh position={[-0.4, 0.85, -0.17]} rotation={[0, 0.3, 0]} material={new THREE.MeshStandardMaterial({ color: '#ecf0f1' })}><boxGeometry args={[0.08, 0.08, 0.01]} /></mesh>

        <DeskChair position={[0, 0, 0.6]} color="navy" />
      </RigidBody>

      <RigidBody type="fixed" colliders={false} sensor>
        <CuboidCollider args={[1, 1, 1]} position={[0, 1, 0]} 
          onIntersectionEnter={() => setNearTable({ id, transform: seatWorldInfo })} 
          onIntersectionExit={() => setNearTable(null)} 
        />
      </RigidBody>
    </group>
  );
};

export const GroupTable = ({ id, position, rotation = [0,0,0] }: { id: number, position: [number, number, number], rotation?: [number, number, number] }) => {
  const { setNearTable } = useGameStore();

  const seatWorldInfo = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...position);
    obj.rotation.set(...rotation);
    obj.updateMatrixWorld();

    // Use the first chair (at +z)
    const localSeatPos = new THREE.Vector3(0, 0.2, 1.8);
    localSeatPos.applyMatrix4(obj.matrixWorld);
    
    // For the chair at +z, it faces -z. But it has rotation Math.PI in the mesh, 
    // Wait, the chair is at [0,0,1.8], facing the center. So it faces -z. 
    // Thus the player's rotation should be `rotation[1]`.
    const yRot = (rotation[1] || 0);

    return {
      pos: [localSeatPos.x, localSeatPos.y, localSeatPos.z] as [number, number, number],
      rot: [0, yRot, 0] as [number, number, number]
    };
  }, [position, rotation]);

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed">
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow material={lightWood}><cylinderGeometry args={[1.5, 1.5, 0.1, 32]} /></mesh>
        <mesh position={[0, 0.4, 0]} castShadow material={darkWood}><cylinderGeometry args={[0.2, 0.4, 0.8, 16]} /></mesh>
        <mesh position={[0, 0.9, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#ecf0f1' })}><cylinderGeometry args={[0.2, 0.15, 0.2]} /></mesh>
        <mesh position={[0, 1.1, 0]} castShadow material={leafMat}><sphereGeometry args={[0.3]} /></mesh>

        <DeskChair position={[0, 0, 1.8]} rotation={[0, 0, 0]} color="caramel" />
        <DeskChair position={[0, 0, -1.8]} rotation={[0, Math.PI, 0]} color="caramel" />
        <DeskChair position={[1.8, 0, 0]} rotation={[0, -Math.PI/2, 0]} color="caramel" />
        <DeskChair position={[-1.8, 0, 0]} rotation={[0, Math.PI/2, 0]} color="caramel" />
      </RigidBody>

      <RigidBody type="fixed" colliders={false} sensor>
        <CuboidCollider args={[2.5, 1, 2.5]} position={[0, 1, 0]} 
          onIntersectionEnter={() => setNearTable({ id, transform: seatWorldInfo })} 
          onIntersectionExit={() => setNearTable(null)} 
        />
      </RigidBody>
    </group>
  );
};

export const ReadingNook = ({ id, position, rotation = [0,0,0] }: { id: number, position: [number, number, number], rotation?: [number, number, number] }) => {
  const { setNearTable } = useGameStore();

  const seatWorldInfo = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...position);
    obj.rotation.set(...rotation);
    obj.updateMatrixWorld();

    const localSeatPos = new THREE.Vector3(-0.5, 0.2, 0); 
    localSeatPos.applyMatrix4(obj.matrixWorld);

    // Armchair is rotated Math.PI/4. The player needs to match this rotation.
    const yRot = (rotation[1] || 0) + Math.PI/4;

    return {
      pos: [localSeatPos.x, localSeatPos.y, localSeatPos.z] as [number, number, number],
      rot: [0, yRot, 0] as [number, number, number]
    };
  }, [position, rotation]);

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed">
        <mesh position={[0, 0.02, 0]} receiveShadow material={new THREE.MeshStandardMaterial({ color: '#8e44ad' })}><cylinderGeometry args={[2, 2, 0.01, 32]} /></mesh>
        
        <group position={[-0.5, 0, 0]} rotation={[0, Math.PI/4, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={fabricNavy}><boxGeometry args={[1, 0.4, 0.8]} /></mesh>
          <mesh position={[0, 1, -0.3]} castShadow receiveShadow material={fabricNavy}><boxGeometry args={[1, 0.8, 0.2]} /></mesh>
          <mesh position={[-0.4, 0.7, 0]} castShadow receiveShadow material={fabricNavy}><boxGeometry args={[0.2, 0.4, 0.8]} /></mesh>
          <mesh position={[0.4, 0.7, 0]} castShadow receiveShadow material={fabricNavy}><boxGeometry args={[0.2, 0.4, 0.8]} /></mesh>
        </group>

        <mesh position={[1, 0.4, -0.5]} castShadow material={darkWood}><cylinderGeometry args={[0.4, 0.4, 0.05]} /></mesh>
        <mesh position={[1, 0.2, -0.5]} castShadow material={darkWood}><cylinderGeometry args={[0.05, 0.2, 0.4]} /></mesh>

        <mesh position={[-1.2, 1, -1]} castShadow material={lampGold}><cylinderGeometry args={[0.05, 0.05, 2]} /></mesh>
        <mesh position={[-1.2, 2, -1]} castShadow material={new THREE.MeshStandardMaterial({ color: '#fdf6e3', transparent: true, opacity: 0.8 })}><cylinderGeometry args={[0.3, 0.4, 0.4]} /></mesh>
        <pointLight position={[-1.2, 2, -1]} intensity={0.8} distance={6} color="#ffdf85" />
      </RigidBody>

      <RigidBody type="fixed" colliders={false} sensor>
        <CuboidCollider args={[2, 1, 2]} position={[0, 1, 0]} 
          onIntersectionEnter={() => setNearTable({ id, transform: seatWorldInfo })} 
          onIntersectionExit={() => setNearTable(null)} 
        />
      </RigidBody>
    </group>
  );
};

export const ReceptionDesk = ({ position, rotation = [0,0,0] }: any) => {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <group>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[4, 1.2, 1]} /></mesh>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow material={lightWood}><boxGeometry args={[4.2, 0.1, 1.2]} /></mesh>
        <mesh position={[0, 1.5, -0.2]} rotation={[0.2, 0, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><boxGeometry args={[0.8, 0.5, 0.05]} /></mesh>
        <mesh position={[0, 0.8, 0.55]} castShadow material={lampGold}><boxGeometry args={[1.5, 0.4, 0.05]} /></mesh>
        <mesh position={[1.5, 1.3, 0]} castShadow material={leafMat}><sphereGeometry args={[0.2]} /></mesh>
        <mesh position={[-1.5, 1.3, 0]} castShadow material={leafMat}><sphereGeometry args={[0.2]} /></mesh>
      </group>
    </RigidBody>
  );
};
