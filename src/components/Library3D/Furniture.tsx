
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
        {/* Back Panel */}
        <mesh position={[0, 2.5, -0.4]} castShadow receiveShadow material={darkWood}>
          <boxGeometry args={[4, 5, 0.1]} />
        </mesh>
        {/* Side Panels */}
        <mesh position={[-2, 2.5, 0]} castShadow receiveShadow material={darkWood}>
          <boxGeometry args={[0.2, 5, 0.9]} />
        </mesh>
        <mesh position={[2, 2.5, 0]} castShadow receiveShadow material={darkWood}>
          <boxGeometry args={[0.2, 5, 0.9]} />
        </mesh>
        {/* Top & Bottom */}
        <mesh position={[0, 5, 0]} castShadow receiveShadow material={darkWood}>
          <boxGeometry args={[4.2, 0.2, 1]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow material={darkWood}>
          <boxGeometry args={[4.2, 0.2, 1]} />
        </mesh>
        {/* Shelves */}
        {[1, 2, 3, 4].map((y, i) => (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow receiveShadow material={darkWood}>
              <boxGeometry args={[3.8, 0.1, 0.8]} />
            </mesh>
            {/* Populate with books */}
            {generateBooks(15, 3.8, y + 0.05, 0)}
          </group>
        ))}
        {/* Top decorations (plants/boxes) */}
        <mesh position={[-1.5, 5.3, 0]} castShadow material={leafMat}>
          <cylinderGeometry args={[0.3, 0.2, 0.4]} />
        </mesh>
      </group>
    </RigidBody>
  );
};

export const DeskChair = ({ position, rotation = [0,0,0], color = 'navy' }: any) => {
  const mat = color === 'green' ? fabricGreen : color === 'caramel' ? fabricCaramel : fabricNavy;
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={mat}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 1, 0.25]} castShadow receiveShadow material={mat}>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
      </mesh>
      {/* Legs (Wood) */}
      <mesh position={[-0.25, 0.25, -0.25]} castShadow material={darkWood}><cylinderGeometry args={[0.03, 0.03, 0.5]} /></mesh>
      <mesh position={[0.25, 0.25, -0.25]} castShadow material={darkWood}><cylinderGeometry args={[0.03, 0.03, 0.5]} /></mesh>
      <mesh position={[-0.25, 0.25, 0.25]} castShadow material={darkWood}><cylinderGeometry args={[0.03, 0.03, 0.5]} /></mesh>
      <mesh position={[0.25, 0.25, 0.25]} castShadow material={darkWood}><cylinderGeometry args={[0.03, 0.03, 0.5]} /></mesh>
    </group>
  );
};

export const IndividualDesk = ({ id, position, rotation = [0,0,0] }: any) => {
  const { setNearTable } = useGameStore();
  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed">
        {/* Desk Top */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow material={lightWood}>
          <boxGeometry args={[1.5, 0.05, 1]} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.7, 0.4, -0.45]} castShadow material={darkWood}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
        <mesh position={[0.7, 0.4, -0.45]} castShadow material={darkWood}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
        <mesh position={[-0.7, 0.4, 0.45]} castShadow material={darkWood}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
        <mesh position={[0.7, 0.4, 0.45]} castShadow material={darkWood}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
        
        {/* Privacy Divider */}
        <mesh position={[0, 1.1, -0.45]} castShadow receiveShadow material={fabricGreen}>
          <boxGeometry args={[1.4, 0.6, 0.05]} />
        </mesh>

        {/* Desk Lamp */}
        <mesh position={[0.5, 0.85, -0.3]} castShadow material={lampGold}><cylinderGeometry args={[0.1, 0.1, 0.05]} /></mesh>
        <mesh position={[0.5, 1.0, -0.3]} castShadow material={lampGold}><cylinderGeometry args={[0.02, 0.02, 0.3]} /></mesh>
        <mesh position={[0.4, 1.15, -0.3]} rotation={[0, 0, 0.5]} castShadow material={lampGold}><coneGeometry args={[0.15, 0.2]} /></mesh>
        <pointLight position={[0.4, 1.1, -0.3]} intensity={0.5} distance={3} color="#ffdf85" />

        {/* Open Book */}
        <mesh position={[0, 0.83, 0]} rotation={[0, 0.2, 0]} castShadow material={paperMat}>
          <boxGeometry args={[0.5, 0.02, 0.3]} />
        </mesh>

        <DeskChair position={[0, 0, 0.6]} color="navy" />
      </RigidBody>

      <RigidBody type="fixed" colliders={false} sensor>
        <CuboidCollider args={[1, 1, 1]} position={[0, 1, 0]} 
          onIntersectionEnter={() => setNearTable(id)} 
          onIntersectionExit={() => setNearTable(null)} 
        />
      </RigidBody>
    </group>
  );
};

export const GroupTable = ({ id, position, rotation = [0,0,0] }: any) => {
  const { setNearTable } = useGameStore();
  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed">
        {/* Large Round Table */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow material={lightWood}>
          <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
        </mesh>
        {/* Pedestal Base */}
        <mesh position={[0, 0.4, 0]} castShadow material={darkWood}>
          <cylinderGeometry args={[0.2, 0.4, 0.8, 16]} />
        </mesh>
        
        {/* Centerpiece Plant */}
        <mesh position={[0, 0.9, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#ecf0f1' })}>
          <cylinderGeometry args={[0.2, 0.15, 0.2]} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow material={leafMat}>
          <sphereGeometry args={[0.3]} />
        </mesh>

        {/* 4 Chairs */}
        <DeskChair position={[0, 0, 1.8]} rotation={[0, Math.PI, 0]} color="caramel" />
        <DeskChair position={[0, 0, -1.8]} rotation={[0, 0, 0]} color="caramel" />
        <DeskChair position={[1.8, 0, 0]} rotation={[0, -Math.PI/2, 0]} color="caramel" />
        <DeskChair position={[-1.8, 0, 0]} rotation={[0, Math.PI/2, 0]} color="caramel" />
      </RigidBody>

      <RigidBody type="fixed" colliders={false} sensor>
        <CuboidCollider args={[2.5, 1, 2.5]} position={[0, 1, 0]} 
          onIntersectionEnter={() => setNearTable(id)} 
          onIntersectionExit={() => setNearTable(null)} 
        />
      </RigidBody>
    </group>
  );
};

export const ReadingNook = ({ id, position, rotation = [0,0,0] }: any) => {
  const { setNearTable } = useGameStore();
  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed">
        {/* Rug */}
        <mesh position={[0, 0.02, 0]} receiveShadow material={new THREE.MeshStandardMaterial({ color: '#8e44ad' })}>
          <cylinderGeometry args={[2, 2, 0.01, 32]} />
        </mesh>
        
        {/* Soft Armchair */}
        <group position={[-0.5, 0, 0]} rotation={[0, Math.PI/4, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={fabricNavy}>
            <boxGeometry args={[1, 0.4, 0.8]} />
          </mesh>
          <mesh position={[0, 1, -0.3]} castShadow receiveShadow material={fabricNavy}>
            <boxGeometry args={[1, 0.8, 0.2]} />
          </mesh>
          <mesh position={[-0.4, 0.7, 0]} castShadow receiveShadow material={fabricNavy}>
            <boxGeometry args={[0.2, 0.4, 0.8]} />
          </mesh>
          <mesh position={[0.4, 0.7, 0]} castShadow receiveShadow material={fabricNavy}>
            <boxGeometry args={[0.2, 0.4, 0.8]} />
          </mesh>
        </group>

        {/* Small Side Table */}
        <mesh position={[1, 0.4, -0.5]} castShadow material={darkWood}>
          <cylinderGeometry args={[0.4, 0.4, 0.05]} />
        </mesh>
        <mesh position={[1, 0.2, -0.5]} castShadow material={darkWood}>
          <cylinderGeometry args={[0.05, 0.2, 0.4]} />
        </mesh>

        {/* Floor Lamp */}
        <mesh position={[-1.2, 1, -1]} castShadow material={lampGold}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
        </mesh>
        <mesh position={[-1.2, 2, -1]} castShadow material={new THREE.MeshStandardMaterial({ color: '#fdf6e3', transparent: true, opacity: 0.8 })}>
          <cylinderGeometry args={[0.3, 0.4, 0.4]} />
        </mesh>
        <pointLight position={[-1.2, 2, -1]} intensity={0.8} distance={6} color="#ffdf85" />
      </RigidBody>

      <RigidBody type="fixed" colliders={false} sensor>
        <CuboidCollider args={[2, 1, 2]} position={[0, 1, 0]} 
          onIntersectionEnter={() => setNearTable(id)} 
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
        {/* Main Desk */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow material={darkWood}>
          <boxGeometry args={[4, 1.2, 1]} />
        </mesh>
        {/* Desk Top */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow material={lightWood}>
          <boxGeometry args={[4.2, 0.1, 1.2]} />
        </mesh>
        {/* Computer Screen */}
        <mesh position={[0, 1.5, -0.2]} rotation={[0.2, 0, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: '#2c3e50' })}>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
        </mesh>
        {/* Sign */}
        <mesh position={[0, 0.8, 0.55]} castShadow material={lampGold}>
          <boxGeometry args={[1.5, 0.4, 0.05]} />
        </mesh>
        {/* Small plants on desk */}
        <mesh position={[1.5, 1.3, 0]} castShadow material={leafMat}><sphereGeometry args={[0.2]} /></mesh>
        <mesh position={[-1.5, 1.3, 0]} castShadow material={leafMat}><sphereGeometry args={[0.2]} /></mesh>
      </group>
    </RigidBody>
  );
};
