import { Component, Suspense, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Environment, SoftShadows } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Player } from '../components/Library3D/Player';
import { LongRoom } from '../components/Library3D/LongRoom';
import { SectionShelves } from '../components/Library3D/SectionShelves';
import { ALCOVE_ZS, LONG_ROOM_STAIRS } from '../components/Library3D/longRoomLayout';
import { IndividualDesk, GroupTable, ReceptionDesk, GrandStaircase, SeatPrompt } from '../components/Library3D/Furniture';
import { UIOverlay } from '../components/Library3D/UIOverlay';

const DESK_ALCOVES = ALCOVE_ZS.filter((_, i) => i % 2 === 0);

// Without this, any WebGL or shader failure inside the Canvas leaves a silent
// black screen.
class SceneErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#f0e6d2', padding: '1rem', textAlign: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif' }}>The library couldn't load</h2>
            <p style={{ opacity: 0.8 }}>{this.state.error.message}</p>
            <button className="btn-3d" onClick={() => window.location.reload()}>Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Library = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
          { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
          { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
          { name: 'right', keys: ['ArrowRight', 'KeyD'] },
          { name: 'jump', keys: ['Space'] },
          { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
        ]}
      >
        <SceneErrorBoundary>
        <Canvas shadows camera={{ position: [1.5, 5, 32], fov: 60 }}>
          <color attach="background" args={['#f0e6d2']} />
          <SoftShadows size={15} samples={10} focus={0.5} />
          {/* The HDR is fetched from a CDN; its own Suspense keeps the room
              visible while it loads (or if it never does). */}
          <Suspense fallback={null}>
            <Environment preset="sunset" />
          </Suspense>
          <Suspense fallback={null}>
            <Physics>
              <LongRoom />
              <SectionShelves />
              <SeatPrompt />

              {/* Entrance: the librarian's desk under the end gallery */}
              <ReceptionDesk position={[5.8, 0, 30]} rotation={[0, -Math.PI / 2, 0]} />
              <GrandStaircase
                position={[LONG_ROOM_STAIRS.centerX, 0, LONG_ROOM_STAIRS.startZ]}
                rotation={[0, Math.PI, 0]}
                steps={12} stepHeight={0.5} stepDepth={1} width={LONG_ROOM_STAIRS.width}
              />

              {/* Quiet study desks facing the windows in every other alcove */}
              {DESK_ALCOVES.map((z, i) => (
                <IndividualDesk key={`l-${z}`} id={i * 2 + 1} position={[-7.6, 0, z]} rotation={[0, Math.PI / 2, 0]} />
              ))}
              {DESK_ALCOVES.map((z, i) => (
                <IndividualDesk key={`r-${z}`} id={i * 2 + 2} position={[7.6, 0, z]} rotation={[0, -Math.PI / 2, 0]} />
              ))}

              {/* Group study tables at the far end of the hall */}
              <GroupTable id={101} position={[0, 0, -27]} />
              <GroupTable id={102} position={[0, 0, -19]} />

              <Player />
            </Physics>
          </Suspense>
        </Canvas>
        </SceneErrorBoundary>
      </KeyboardControls>

      <UIOverlay />
    </div>
  );
};

export default Library;
