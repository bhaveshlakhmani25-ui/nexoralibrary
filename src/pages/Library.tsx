import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Player } from '../components/Library3D/Player';
import { Environment3D } from '../components/Library3D/Environment3D';
import { Bookshelf, IndividualDesk, GroupTable, ReadingNook, ReceptionDesk } from '../components/Library3D/Furniture';
import { UIOverlay } from '../components/Library3D/UIOverlay';

const Library = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
          { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
          { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
          { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        ]}
      >
        <Canvas shadows camera={{ position: [0, 5, 30], fov: 60 }}>
          <color attach="background" args={['#1a100b']} />
          <Suspense fallback={null}>
            <Physics>
              <Environment3D />
              
              {/* Entrance Zone */}
              <ReceptionDesk position={[8, 0, 20]} rotation={[0, -Math.PI / 4, 0]} />

              {/* Left Side: Bookshelves & Silent Focus Zone */}
              {/* Bookshelves */}
              <Bookshelf position={[-12, 0, 10]} rotation={[0, Math.PI / 2, 0]} />
              <Bookshelf position={[-12, 0, 2]} rotation={[0, Math.PI / 2, 0]} />
              <Bookshelf position={[-12, 0, -6]} rotation={[0, Math.PI / 2, 0]} />
              <Bookshelf position={[-12, 0, -14]} rotation={[0, Math.PI / 2, 0]} />
              
              {/* Individual Desks between/near shelves */}
              <IndividualDesk id={1} position={[-7, 0, 10]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={2} position={[-7, 0, 2]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={3} position={[-7, 0, -6]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={4} position={[-7, 0, -14]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={5} position={[-17, 0, 10]} rotation={[0, -Math.PI / 2, 0]} />
              <IndividualDesk id={6} position={[-17, 0, 2]} rotation={[0, -Math.PI / 2, 0]} />

              {/* Right Side: Bookshelves & Group Study Zone */}
              <Bookshelf position={[12, 0, 5]} rotation={[0, -Math.PI / 2, 0]} />
              <Bookshelf position={[12, 0, -5]} rotation={[0, -Math.PI / 2, 0]} />
              
              <GroupTable id={7} position={[17, 0, 5]} />
              <GroupTable id={8} position={[17, 0, -5]} />
              <GroupTable id={9} position={[12, 0, -15]} />

              {/* Far Back: Reading Nook near the back windows */}
              <ReadingNook id={10} position={[-10, 0, -25]} />
              <ReadingNook id={11} position={[0, 0, -25]} />
              <ReadingNook id={12} position={[10, 0, -25]} />

              <Player />
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <UIOverlay />
    </div>
  );
};

export default Library;
