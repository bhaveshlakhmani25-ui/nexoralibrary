
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store';

export const Bookshelf = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <group>
        {/* Main Frame */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 4, 1]} />
          <meshStandardMaterial color="var(--wood-dark)" />
        </mesh>
        {/* Shelves */}
        {[0.5, 1.5, 2.5, 3.5].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.8, 0.1, 0.9]} />
            <meshStandardMaterial color="var(--wood-base)" />
          </mesh>
        ))}
        {/* Fake Books (just some colored boxes) */}
        <mesh position={[-1, 0.8, 0]} castShadow>
          <boxGeometry args={[0.3, 0.5, 0.6]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
        <mesh position={[-0.5, 0.8, 0]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.6]} />
          <meshStandardMaterial color="#2980b9" />
        </mesh>
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[0.8, 0.6, 0.6]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
        <mesh position={[1, 2.8, 0]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.6]} />
          <meshStandardMaterial color="#8e44ad" />
        </mesh>
      </group>
    </RigidBody>
  );
};

export const StudyTable = ({ id, position }: { id: number, position: [number, number, number] }) => {
  const { setNearTable } = useGameStore();

  return (
    <group position={position}>
      <RigidBody type="fixed">
        {/* Table Top */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.1, 1.5]} />
          <meshStandardMaterial color="var(--wood-light)" />
        </mesh>
        {/* Legs */}
        <mesh position={[-1.1, 0.5, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="var(--wood-dark)" />
        </mesh>
        <mesh position={[1.1, 0.5, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="var(--wood-dark)" />
        </mesh>
        <mesh position={[-1.1, 0.5, 0.6]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="var(--wood-dark)" />
        </mesh>
        <mesh position={[1.1, 0.5, 0.6]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="var(--wood-dark)" />
        </mesh>

        {/* Chair */}
        <mesh position={[0, 0.5, 1]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="var(--wood-base)" />
        </mesh>
        <mesh position={[0, 1, 1.25]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.8, 0.1]} />
          <meshStandardMaterial color="var(--wood-base)" />
        </mesh>
        <mesh position={[0, 0.25, 1]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color="var(--wood-dark)" />
        </mesh>
      </RigidBody>

      {/* Interaction Sensor (slightly larger than table) */}
      <RigidBody type="fixed" colliders={false} sensor>
        <CuboidCollider 
          args={[2, 1, 2]} 
          position={[0, 1, 0]} 
          onIntersectionEnter={() => setNearTable(id)}
          onIntersectionExit={() => setNearTable(null)}
        />
      </RigidBody>
    </group>
  );
};
