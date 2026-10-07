import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Environment, SoftShadows } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Player } from '../components/Library3D/Player';
import { Environment3D } from '../components/Library3D/Environment3D';
import { Bookshelf, IndividualDesk, GroupTable, ReadingNook, ReceptionDesk, GrandStaircase, LargePlant, WallArt } from '../components/Library3D/Furniture';
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
          <color attach="background" args={['#f0e6d2']} />
          <SoftShadows size={15} samples={10} focus={0.5} />
          <Environment preset="sunset" />
          <Suspense fallback={null}>
            <Physics>
              <Environment3D />
              
              {/* === GROUND FLOOR === */}
              {/* Entrance Zone */}
              <ReceptionDesk position={[10, 0, 20]} rotation={[0, -Math.PI / 6, 0]} />
              <LargePlant position={[-10, 0, 22]} />
              <WallArt position={[-24.4, 4, 15]} rotation={[0, Math.PI / 2, 0]} />

              {/* Grand Staircase to Mezzanine (Left Side) */}
              <GrandStaircase position={[-13, 0, 5]} />

              {/* Left Side Ground (Under Mezzanine) */}
              <Bookshelf position={[-24, 0, 5]} rotation={[0, Math.PI / 2, 0]} label="Fiction" />
              <Bookshelf position={[-24, 0, -5]} rotation={[0, Math.PI / 2, 0]} label="Fantasy" />
              <Bookshelf position={[-24, 0, -15]} rotation={[0, Math.PI / 2, 0]} label="Sci-Fi" />
              
              <IndividualDesk id={1} position={[-18, 0, 5]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={2} position={[-18, 0, -5]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={3} position={[-18, 0, -15]} rotation={[0, Math.PI / 2, 0]} />

              {/* Right Side Ground (Under Mezzanine) */}
              <Bookshelf position={[24, 0, 15]} rotation={[0, -Math.PI / 2, 0]} label="Biography" />
              <Bookshelf position={[24, 0, 5]} rotation={[0, -Math.PI / 2, 0]} label="History" />
              <Bookshelf position={[24, 0, -5]} rotation={[0, -Math.PI / 2, 0]} label="Science" />
              <Bookshelf position={[24, 0, -15]} rotation={[0, -Math.PI / 2, 0]} label="Art" />

              <GroupTable id={4} position={[18, 0, 10]} />
              <GroupTable id={5} position={[18, 0, -10]} />

              {/* Back Ground (Under Mezzanine) */}
              <Bookshelf position={[-10, 0, -34]} rotation={[0, 0, 0]} label="Philosophy" />
              <Bookshelf position={[10, 0, -34]} rotation={[0, 0, 0]} label="Psychology" />
              <ReadingNook id={6} position={[0, 0, -30]} />
              <LargePlant position={[-14, 0, -32]} />
              <LargePlant position={[14, 0, -32]} />

              {/* === MEZZANINE UPPER GALLERY (Y = 10) === */}
              {/* Left Gallery */}
              <Bookshelf position={[-24, 10, 15]} rotation={[0, Math.PI / 2, 0]} label="Classics" />
              <Bookshelf position={[-24, 10, 5]} rotation={[0, Math.PI / 2, 0]} label="Poetry" />
              <Bookshelf position={[-24, 10, -5]} rotation={[0, Math.PI / 2, 0]} label="Drama" />
              <Bookshelf position={[-24, 10, -15]} rotation={[0, Math.PI / 2, 0]} label="Mythology" />
              
              <IndividualDesk id={7} position={[-15, 10, 15]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={8} position={[-15, 10, 5]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={9} position={[-15, 10, -5]} rotation={[0, Math.PI / 2, 0]} />
              <IndividualDesk id={10} position={[-15, 10, -15]} rotation={[0, Math.PI / 2, 0]} />
              <WallArt position={[-24.4, 14, 10]} rotation={[0, Math.PI / 2, 0]} />
              <WallArt position={[-24.4, 14, -10]} rotation={[0, Math.PI / 2, 0]} />
              <LargePlant position={[-22, 10, 0]} />

              {/* Right Gallery */}
              <Bookshelf position={[24, 10, 15]} rotation={[0, -Math.PI / 2, 0]} label="Law" />
              <Bookshelf position={[24, 10, 5]} rotation={[0, -Math.PI / 2, 0]} label="Business" />
              <Bookshelf position={[24, 10, -5]} rotation={[0, -Math.PI / 2, 0]} label="Medicine" />
              <Bookshelf position={[24, 10, -15]} rotation={[0, -Math.PI / 2, 0]} label="Engineering" />
              
              <IndividualDesk id={11} position={[15, 10, 15]} rotation={[0, -Math.PI / 2, 0]} />
              <IndividualDesk id={12} position={[15, 10, 5]} rotation={[0, -Math.PI / 2, 0]} />
              <IndividualDesk id={13} position={[15, 10, -5]} rotation={[0, -Math.PI / 2, 0]} />
              <IndividualDesk id={14} position={[15, 10, -15]} rotation={[0, -Math.PI / 2, 0]} />
              <WallArt position={[24.4, 14, 0]} rotation={[0, -Math.PI / 2, 0]} />
              <LargePlant position={[22, 10, 10]} />

              {/* Back Gallery */}
              <Bookshelf position={[-8, 10, -34]} rotation={[0, 0, 0]} label="Rare Books" />
              <Bookshelf position={[8, 10, -34]} rotation={[0, 0, 0]} label="Archives" />
              <ReadingNook id={15} position={[-18.5, 10, -30]} rotation={[0, Math.PI/2, 0]} />
              <ReadingNook id={16} position={[18.5, 10, -30]} rotation={[0, -Math.PI/2, 0]} />
              <GroupTable id={17} position={[0, 10, -28]} />

              {/* Front Gallery (Over Entrance) */}
              <Bookshelf position={[-8, 10, 34]} rotation={[0, Math.PI, 0]} label="New Arrivals" />
              <Bookshelf position={[8, 10, 34]} rotation={[0, Math.PI, 0]} label="Periodicals" />
              <ReadingNook id={18} position={[-18.5, 10, 28]} rotation={[0, Math.PI/2, 0]} />
              <ReadingNook id={19} position={[18.5, 10, 28]} rotation={[0, -Math.PI/2, 0]} />
              <IndividualDesk id={20} position={[-5, 10, 23]} rotation={[0, Math.PI, 0]} />
              <IndividualDesk id={21} position={[5, 10, 23]} rotation={[0, Math.PI, 0]} />

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
