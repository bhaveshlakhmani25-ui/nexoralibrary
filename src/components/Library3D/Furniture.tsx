import { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store';
import * as THREE from 'three';

const darkWood = new THREE.MeshStandardMaterial({ color: '#2e180d', roughness: 0.9, metalness: 0.1 });
const lightWood = new THREE.MeshStandardMaterial({ color: '#6b4226', roughness: 0.8, metalness: 0.05 });
const fabricGreen = new THREE.MeshStandardMaterial({ color: '#2d4c36', roughness: 0.95 });
const fabricCaramel = new THREE.MeshStandardMaterial({ color: '#c17a3f', roughness: 0.95 });
const fabricNavy = new THREE.MeshStandardMaterial({ color: '#1a365d', roughness: 0.95 });
const lampGold = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.8, roughness: 0.3 });
// Lamp shades glow instead of each carrying a real light; dozens of point
// lights make every material shader slower and can exceed GPU limits.
const lampGlow = new THREE.MeshStandardMaterial({ color: '#ffdf85', emissive: '#ffcf6b', emissiveIntensity: 1.2 });
const paperMat = new THREE.MeshStandardMaterial({ color: '#fdf6e3', roughness: 1 });
const leafMat = new THREE.MeshStandardMaterial({ color: '#3a5f45', roughness: 0.9 });
const potMat = new THREE.MeshStandardMaterial({ color: '#a04825', roughness: 0.95 });
const frameMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.8 });
const canvasMat = new THREE.MeshStandardMaterial({ color: '#ecf0f1', roughness: 1 });

// Height of the seated player's body origin: puts the avatar's hips on a
// 0.55-high chair seat (the avatar is lowered by 0.5 while seated).
const SEAT_HEIGHT = 0.95;

const bookColors = ['#8a3a3a', '#314859', '#486049', '#614266', '#a87232', '#3d5e56', '#444444', '#8c4e2a', '#6b6863'];

const randomBookColor = () => new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)], roughness: 0.6 });

const generateBooks = (count: number, shelfWidth: number, yPos: number, zPos: number) => {
  const elements = [];
  let currentX = -shelfWidth / 2 + 0.2;
  
  for (let i = 0; i < count; i++) {
    const isStack = Math.random() > 0.85;
    const isPlant = Math.random() > 0.95;

    if (isPlant) {
      const width = 0.4;
      if (currentX + width > shelfWidth / 2 - 0.2) break;
      elements.push(
        <group key={`deco-${i}`} position={[currentX + width/2, yPos + 0.1, zPos]}>
          <mesh castShadow material={potMat}><cylinderGeometry args={[0.1, 0.08, 0.2]} /></mesh>
          <mesh position={[0, 0.2, 0]} castShadow material={leafMat}><sphereGeometry args={[0.15]} /></mesh>
        </group>
      );
      currentX += width + 0.05;
      continue;
    }

    if (isStack) {
      const width = 0.4 + Math.random() * 0.2;
      const numStacked = Math.floor(2 + Math.random() * 3);
      if (currentX + width > shelfWidth / 2 - 0.2) break;
      for (let s = 0; s < numStacked; s++) {
        elements.push(
          <mesh key={`stack-${i}-${s}`} position={[currentX + width/2, yPos + s * 0.06 + 0.03, zPos]} castShadow>
            <boxGeometry args={[width * 0.9, 0.05, 0.5]} />
            <primitive object={randomBookColor()} attach="material" />
          </mesh>
        );
      }
      currentX += width + 0.05;
      continue;
    }

    const width = 0.05 + Math.random() * 0.08;
    const height = 0.4 + Math.random() * 0.3;
    const depth = 0.4 + Math.random() * 0.2;
    if (currentX + width > shelfWidth / 2 - 0.2) break;
    elements.push(
      <mesh key={`book-${i}`} position={[currentX + width/2, yPos + height/2, zPos]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={randomBookColor()} attach="material" />
      </mesh>
    );
    currentX += width + 0.02;
  }
  return elements;
};

export const Bookshelf = ({ position, rotation = [0, 0, 0], label = "" }: { position: [number, number, number], rotation?: [number, number, number], label?: string }) => {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <group>
        <mesh position={[0, 3.5, -0.4]} castShadow receiveShadow material={darkWood}><boxGeometry args={[4, 7, 0.1]} /></mesh>
        <mesh position={[-2, 3.5, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[0.2, 7, 0.9]} /></mesh>
        <mesh position={[2, 3.5, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[0.2, 7, 0.9]} /></mesh>
        <mesh position={[0, 7, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[4.2, 0.2, 1]} /></mesh>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[4.2, 0.2, 1]} /></mesh>
        
        {/* 6 Shelves */}
        {[1, 2, 3, 4, 5, 6].map((y, i) => (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[3.8, 0.1, 0.8]} /></mesh>
            {generateBooks(20, 3.8, y + 0.05, 0)}
          </group>
        ))}

        {/* Top decorations */}
        <mesh position={[-1.5, 7.3, 0]} castShadow material={leafMat}><cylinderGeometry args={[0.3, 0.2, 0.4]} /></mesh>
        <mesh position={[1.2, 7.2, 0]} castShadow material={potMat}><boxGeometry args={[0.4, 0.3, 0.4]} /></mesh>

        {/* Category Label */}
        {label && (
          <group position={[0, 7.1, 0.51]}>
            <mesh material={lampGold}><boxGeometry args={[1, 0.3, 0.02]} /></mesh>
            {/* simple text representation using a dark box since no text geometry */}
            <mesh position={[0, 0, 0.02]} material={new THREE.MeshBasicMaterial({ color: '#000' })}><boxGeometry args={[0.8, 0.1, 0.01]} /></mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
};

type SeatTransform = { pos: [number, number, number], rot: [number, number, number] };

// Trigger volume around a seat. Selectors keep each seat from re-rendering
// on unrelated store updates such as timer ticks.
const SeatSensor = ({ id, seat, size }: { id: number, seat: SeatTransform, size: [number, number, number] }) => {
  const setNearTable = useGameStore((s) => s.setNearTable);
  const clearNearTable = useGameStore((s) => s.clearNearTable);

  return (
    <RigidBody type="fixed" colliders={false} sensor>
      <CuboidCollider args={size} position={[0, 1, 0]}
        onIntersectionEnter={() => setNearTable({ id, transform: seat })}
        onIntersectionExit={() => clearNearTable(id)}
      />
    </RigidBody>
  );
};

// A single floating "[E] Sit" prompt, in the style of a Roblox
// ProximityPrompt, that moves to whichever seat the player is near. It stays
// mounted and is only hidden: mounting and unmounting drei <Html> while
// React is rendering throws under React 19.
export const SeatPrompt = () => {
  const nearTable = useGameStore((s) => s.nearTable);
  const isSeated = useGameStore((s) => s.isSeated);
  const setSeated = useGameStore((s) => s.setSeated);
  const visible = nearTable !== null && !isSeated;
  const [x, y, z] = nearTable?.transform.pos ?? [0, -50, 0];

  return (
    <Html position={[x, y + 1.4, z]} center zIndexRange={[6, 0]} style={{ display: visible ? 'block' : 'none' }}>
      <button className="proximity-prompt" onClick={() => nearTable && setSeated(true, nearTable.transform)}>
        <span className="proximity-key">E</span>
        <span>Sit</span>
      </button>
    </Html>
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
  const seatWorldInfo = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...position);
    obj.rotation.set(...rotation);
    obj.updateMatrixWorld();
    const localSeatPos = new THREE.Vector3(0, SEAT_HEIGHT, 0.6);
    localSeatPos.applyMatrix4(obj.matrixWorld);
    const yRot = (rotation[1] || 0);
    return { pos: [localSeatPos.x, localSeatPos.y, localSeatPos.z] as [number, number, number], rot: [0, yRot, 0] as [number, number, number] };
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

        <mesh position={[0.5, 0.85, -0.3]} castShadow material={lampGold}><cylinderGeometry args={[0.1, 0.1, 0.05]} /></mesh>
        <mesh position={[0.5, 1.0, -0.3]} castShadow material={lampGold}><cylinderGeometry args={[0.02, 0.02, 0.3]} /></mesh>
        <mesh position={[0.4, 1.15, -0.3]} rotation={[0, 0, 0.5]} castShadow material={lampGlow}><coneGeometry args={[0.15, 0.2]} /></mesh>

        <mesh position={[0, 0.83, 0]} rotation={[0, 0.1, 0]} castShadow material={paperMat}><boxGeometry args={[0.4, 0.02, 0.3]} /></mesh>
        <mesh position={[0.25, 0.83, 0.1]} rotation={[0, -0.5, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><cylinderGeometry args={[0.01, 0.01, 0.15]} /></mesh>
        <mesh position={[-0.4, 0.85, -0.2]} rotation={[0, 0.3, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#e74c3c' })}><boxGeometry args={[0.1, 0.1, 0.05]} /></mesh>
        <mesh position={[-0.4, 0.85, -0.17]} rotation={[0, 0.3, 0]} material={new THREE.MeshStandardMaterial({ color: '#ecf0f1' })}><boxGeometry args={[0.08, 0.08, 0.01]} /></mesh>

        <DeskChair position={[0, 0, 0.6]} color="navy" />
      </RigidBody>

      <SeatSensor id={id} seat={seatWorldInfo} size={[1, 1, 1.6]} />
    </group>
  );
};

export const GroupTable = ({ id, position, rotation = [0,0,0] }: { id: number, position: [number, number, number], rotation?: [number, number, number] }) => {
  const seatWorldInfo = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...position);
    obj.rotation.set(...rotation);
    obj.updateMatrixWorld();
    const localSeatPos = new THREE.Vector3(0, SEAT_HEIGHT, 1.8);
    localSeatPos.applyMatrix4(obj.matrixWorld);
    const yRot = (rotation[1] || 0);
    return { pos: [localSeatPos.x, localSeatPos.y, localSeatPos.z] as [number, number, number], rot: [0, yRot, 0] as [number, number, number] };
  }, [position, rotation]);

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed">
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow material={lightWood}><cylinderGeometry args={[1.5, 1.5, 0.1, 32]} /></mesh>
        <mesh position={[0, 0.4, 0]} castShadow material={darkWood}><cylinderGeometry args={[0.2, 0.4, 0.8, 16]} /></mesh>
        <mesh position={[0, 0.9, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#ecf0f1' })}><cylinderGeometry args={[0.2, 0.15, 0.2]} /></mesh>
        <mesh position={[0, 1.1, 0]} castShadow material={leafMat}><sphereGeometry args={[0.3]} /></mesh>
        
        {/* Books/Notebooks on table */}
        <mesh position={[0.5, 0.88, 0.5]} rotation={[0, 0.4, 0]} castShadow material={paperMat}><boxGeometry args={[0.4, 0.05, 0.3]} /></mesh>
        <mesh position={[-0.5, 0.88, -0.5]} rotation={[0, -0.2, 0]} castShadow material={randomBookColor()}><boxGeometry args={[0.3, 0.08, 0.4]} /></mesh>

        <DeskChair position={[0, 0, 1.8]} rotation={[0, 0, 0]} color="caramel" />
        <DeskChair position={[0, 0, -1.8]} rotation={[0, Math.PI, 0]} color="caramel" />
        <DeskChair position={[1.8, 0, 0]} rotation={[0, -Math.PI/2, 0]} color="caramel" />
        <DeskChair position={[-1.8, 0, 0]} rotation={[0, Math.PI/2, 0]} color="caramel" />
      </RigidBody>

      <SeatSensor id={id} seat={seatWorldInfo} size={[2.5, 1, 2.5]} />
    </group>
  );
};

export const ReadingNook = ({ id, position, rotation = [0,0,0] }: { id: number, position: [number, number, number], rotation?: [number, number, number] }) => {
  const seatWorldInfo = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(...position);
    obj.rotation.set(...rotation);
    obj.updateMatrixWorld();
    const localSeatPos = new THREE.Vector3(-0.5, SEAT_HEIGHT, 0); 
    localSeatPos.applyMatrix4(obj.matrixWorld);
    const yRot = (rotation[1] || 0) + Math.PI/4;
    return { pos: [localSeatPos.x, localSeatPos.y, localSeatPos.z] as [number, number, number], rot: [0, yRot, 0] as [number, number, number] };
  }, [position, rotation]);

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed">
        <mesh position={[0, 0.02, 0]} receiveShadow material={new THREE.MeshStandardMaterial({ color: '#2d4c36' })}><cylinderGeometry args={[2.5, 2.5, 0.01, 32]} /></mesh>
        
        <group position={[-0.5, 0, 0]} rotation={[0, Math.PI/4, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={fabricNavy}><boxGeometry args={[1, 0.4, 0.8]} /></mesh>
          <mesh position={[0, 1, -0.3]} castShadow receiveShadow material={fabricNavy}><boxGeometry args={[1, 0.8, 0.2]} /></mesh>
          <mesh position={[-0.4, 0.7, 0]} castShadow receiveShadow material={fabricNavy}><boxGeometry args={[0.2, 0.4, 0.8]} /></mesh>
          <mesh position={[0.4, 0.7, 0]} castShadow receiveShadow material={fabricNavy}><boxGeometry args={[0.2, 0.4, 0.8]} /></mesh>
        </group>

        <mesh position={[1, 0.4, -0.5]} castShadow material={darkWood}><cylinderGeometry args={[0.4, 0.4, 0.05]} /></mesh>
        <mesh position={[1, 0.2, -0.5]} castShadow material={darkWood}><cylinderGeometry args={[0.05, 0.2, 0.4]} /></mesh>
        <mesh position={[1, 0.45, -0.5]} castShadow material={paperMat}><boxGeometry args={[0.3, 0.05, 0.2]} /></mesh>

        <mesh position={[-1.2, 1, -1]} castShadow material={lampGold}><cylinderGeometry args={[0.05, 0.05, 2]} /></mesh>
        <mesh position={[-1.2, 2, -1]} castShadow material={lampGlow}><cylinderGeometry args={[0.4, 0.4, 0.4]} /></mesh>
      </RigidBody>

      <SeatSensor id={id} seat={seatWorldInfo} size={[2.5, 1, 2.5]} />
    </group>
  );
};

export const ReceptionDesk = ({ position, rotation = [0,0,0] }: any) => {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <group>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow material={darkWood}><boxGeometry args={[5, 1.2, 1.5]} /></mesh>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow material={lightWood}><boxGeometry args={[5.2, 0.1, 1.7]} /></mesh>
        <mesh position={[0, 1.5, -0.3]} rotation={[0.2, 0, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}><boxGeometry args={[0.8, 0.5, 0.05]} /></mesh>
        <mesh position={[0, 0.8, 0.77]} castShadow material={lampGold}><boxGeometry args={[2, 0.5, 0.05]} /></mesh>
        <mesh position={[2, 1.3, 0]} castShadow material={leafMat}><sphereGeometry args={[0.3]} /></mesh>
        <mesh position={[-2, 1.3, 0]} castShadow material={leafMat}><sphereGeometry args={[0.3]} /></mesh>
      </group>
    </RigidBody>
  );
};

export const LargePlant = ({ position }: { position: [number, number, number] }) => (
  <RigidBody type="fixed" position={position}>
    <mesh position={[0, 0.5, 0]} castShadow material={potMat}><cylinderGeometry args={[0.4, 0.3, 1]} /></mesh>
    <mesh position={[0, 1.5, 0]} castShadow material={leafMat}><sphereGeometry args={[0.8]} /></mesh>
    <mesh position={[0.4, 1.2, 0.2]} castShadow material={leafMat}><sphereGeometry args={[0.5]} /></mesh>
    <mesh position={[-0.3, 1.8, -0.3]} castShadow material={leafMat}><sphereGeometry args={[0.6]} /></mesh>
  </RigidBody>
);

export const WallArt = ({ position, rotation = [0,0,0] }: { position: [number, number, number], rotation?: [number, number, number] }) => (
  <RigidBody type="fixed" position={position} rotation={rotation}>
    <mesh castShadow material={frameMat}><boxGeometry args={[3, 2, 0.1]} /></mesh>
    <mesh position={[0, 0, 0.06]} material={canvasMat}><boxGeometry args={[2.7, 1.7, 0.01]} /></mesh>
    {/* Abstract art shapes */}
    <mesh position={[-0.5, 0.2, 0.07]} material={new THREE.MeshBasicMaterial({ color: '#3498db' })}><planeGeometry args={[1, 1]} /></mesh>
    <mesh position={[0.5, -0.2, 0.07]} material={new THREE.MeshBasicMaterial({ color: '#e74c3c' })}><planeGeometry args={[1, 1]} /></mesh>
    <mesh position={[0, 0, 0.08]} material={new THREE.MeshBasicMaterial({ color: '#f1c40f' })}><circleGeometry args={[0.4, 32]} /></mesh>
  </RigidBody>
);

// A slightly deeper tread keeps the hidden walk surface below a 35° slope,
// which lets the dynamic player body climb it smoothly.
export const GrandStaircase = ({ position, rotation = [0,0,0], steps = 20, stepHeight = 0.5, stepDepth = 0.75, width = 4 }: {
  position: [number, number, number], rotation?: [number, number, number], steps?: number, stepHeight?: number, stepDepth?: number, width?: number,
}) => {
  const totalHeight = steps * stepHeight;
  const totalDepth = steps * stepDepth;
  const rampAngle = Math.atan2(totalHeight, totalDepth);
  const rampLength = Math.hypot(totalDepth, totalHeight);
  
  return (
    <group position={position} rotation={rotation}>
      {/* Invisible walls to keep player perfectly centred on stairs */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-width / 2, totalHeight / 2, -totalDepth / 2]} rotation={[rampAngle, 0, 0]} visible={false}>
          <boxGeometry args={[0.2, 5, rampLength]} />
        </mesh>
        <mesh position={[width / 2, totalHeight / 2, -totalDepth / 2]} rotation={[rampAngle, 0, 0]} visible={false}>
          <boxGeometry args={[0.2, 5, rampLength]} />
        </mesh>
      </RigidBody>

      {/* Visual steps */}
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} position={[0, i * stepHeight + stepHeight/2, -i * stepDepth - stepDepth/2]} castShadow receiveShadow material={lightWood}>
          <boxGeometry args={[width, stepHeight, stepDepth]} />
        </mesh>
      ))}

      {/* Handrails */}
      <mesh position={[-width/2 + 0.1, totalHeight / 2 + 1, -totalDepth / 2]} rotation={[rampAngle, 0, 0]} castShadow material={darkWood}>
        <cylinderGeometry args={[0.05, 0.05, rampLength]} />
      </mesh>
      <mesh position={[width/2 - 0.1, totalHeight / 2 + 1, -totalDepth / 2]} rotation={[rampAngle, 0, 0]} castShadow material={darkWood}>
        <cylinderGeometry args={[0.05, 0.05, rampLength]} />
      </mesh>
      
      {/* Railing posts */}
      {Array.from({ length: steps }).map((_, i) => {
        if (i % 2 !== 0) return null;
        return (
          <group key={`post-${i}`}>
            <mesh position={[-width/2 + 0.1, i * stepHeight + 1, -i * stepDepth - stepDepth/2]} castShadow material={darkWood}><cylinderGeometry args={[0.02, 0.02, 1]} /></mesh>
            <mesh position={[width/2 - 0.1, i * stepHeight + 1, -i * stepDepth - stepDepth/2]} castShadow material={darkWood}><cylinderGeometry args={[0.02, 0.02, 1]} /></mesh>
          </group>
        );
      })}
    </group>
  );
};
