import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Player } from '../components/Library3D/Player';
import { Environment3D } from '../components/Library3D/Environment3D';
import { Bookshelf, StudyTable } from '../components/Library3D/Furniture';
import { UIOverlay } from '../components/Library3D/UIOverlay';

const Library: React.FC = () => {
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
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <Physics>
              <Environment3D />
              
              {/* Arrange some bookshelves and tables */}
              <Bookshelf position={[-8, 0, -10]} rotation={[0, Math.PI / 2, 0]} />
              <Bookshelf position={[-8, 0, -5]} rotation={[0, Math.PI / 2, 0]} />
              <Bookshelf position={[-8, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
              
              <Bookshelf position={[8, 0, -10]} rotation={[0, -Math.PI / 2, 0]} />
              <Bookshelf position={[8, 0, -5]} rotation={[0, -Math.PI / 2, 0]} />
              <Bookshelf position={[8, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />

              <StudyTable id={1} position={[-3, 0, -8]} />
              <StudyTable id={2} position={[3, 0, -8]} />
              <StudyTable id={3} position={[-3, 0, -2]} />
              <StudyTable id={4} position={[3, 0, -2]} />
              <StudyTable id={5} position={[0, 0, 5]} />

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
