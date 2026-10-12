import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { HALL, BOOKCASE_ZS, ALCOVE_ZS, LONG_ROOM_STAIRS, REAL_BOOK_SHELF_YS } from './longRoomLayout';

// A game-scale recreation of the Long Room at Trinity College Dublin: a long
// oak hall with a barrel-vaulted ceiling, two storeys of bookcase alcoves on
// both sides, an upper gallery with a wooden balustrade, and marble busts at
// the aisle end of every ground-floor bookcase.

type Vec3 = [number, number, number];
type Box = { p: Vec3, s: Vec3, c?: string };
type Collider = { p: Vec3, half: Vec3 };

// Deterministic RNG so the shelves look the same on every visit.
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Old leather and vellum bindings, with the odd red or green spine.
const BOOK_COLORS = ['#5c3a21', '#6e4526', '#7a5230', '#4a2c18', '#8b5e34', '#3f2716', '#9a6b3f', '#2e1d12', '#a07a4c', '#6b2a20', '#2f3d2a'];

const fillShelf = (out: Box[], rand: () => number, x0: number, x1: number, y: number, z: number, maxHeight: number) => {
  let x = x0;
  while (x < x1) {
    if (rand() < 0.03) { x += 0.15 + rand() * 0.2; continue; } // a gap where a book is out
    const w = 0.05 + rand() * 0.06;
    if (x + w > x1) break;
    const h = maxHeight * (0.7 + rand() * 0.28);
    out.push({ p: [x + w / 2, y + h / 2, z], s: [w, h, 0.22], c: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)] });
    x += w + 0.005;
  }
};

const buildLayout = () => {
  const rand = mulberry32(1592); // Trinity College's founding year
  const oak: Box[] = [];
  const books: Box[] = [];
  const marble: Box[] = [];
  const bustHeads: Box[] = [];
  const windows: Box[] = [];
  const colliders: Collider[] = [];
  const { halfWidth: W, aisleHalf: A, galleryY: G } = HALL;

  for (const side of [-1, 1]) {
    // Mirror helper: every x below is written for the left (negative x) side.
    const X = (x: number) => x * -side;

    BOOKCASE_ZS.forEach((z, caseIndex) => {
      // --- Ground-floor double-sided bookcase (wall to x = -5.3) ---
      oak.push({ p: [X(7.25), 2.75, z], s: [3.5, 5.5, 0.08] }); // spine
      oak.push({ p: [X(5.4), 2.75, z], s: [0.2, 5.5, 0.62] }); // aisle-end panel
      oak.push({ p: [X(7.2), 5.45, z], s: [3.6, 0.1, 0.66] }); // cornice
      for (let k = 0; k < 6; k++) {
        const y = 0.1 + k * 0.9;
        oak.push({ p: [X(7.25), y, z], s: [3.5, 0.06, 0.6] });
        for (const face of [-1, 1]) {
          // Eye-level rows facing into an alcove hold real, titled books
          // instead (see SectionShelves); leave them empty here.
          const facesAlcove = face === 1 ? caseIndex < BOOKCASE_ZS.length - 1 : caseIndex > 0;
          if (facesAlcove && REAL_BOOK_SHELF_YS.some((shelfY) => Math.abs(shelfY - y) < 0.01)) continue;
          const shelfBooks: Box[] = [];
          fillShelf(shelfBooks, rand, 5.55, 8.95, y + 0.03, z + face * 0.17, 0.8);
          for (const b of shelfBooks) books.push({ ...b, p: [X(b.p[0]), b.p[1], b.p[2]] });
        }
      }
      colliders.push({ p: [X(7.15), 2.75, z], half: [1.85, 2.75, 0.32] });

      // --- Marble bust on a pedestal at the aisle end ---
      marble.push({ p: [X(4.95), 0.6, z], s: [0.5, 1.2, 0.5] }); // pedestal
      marble.push({ p: [X(4.95), 1.36, z], s: [0.32, 0.32, 0.46] }); // shoulders
      marble.push({ p: [X(4.95), 1.58, z], s: [0.1, 0.14, 0.1] }); // neck
      bustHeads.push({ p: [X(4.95), 1.76, z], s: [0.34, 0.4, 0.32] });
      colliders.push({ p: [X(4.95), 0.9, z], half: [0.27, 0.9, 0.27] });

      // --- Upper-gallery bookcase (wall to x = -7.0, leaves a 2-unit walkway) ---
      oak.push({ p: [X(8.1), G + 2.5, z], s: [1.8, 5, 0.08] });
      oak.push({ p: [X(7.1), G + 2.5, z], s: [0.2, 5, 0.62] });
      oak.push({ p: [X(8.05), G + 4.95, z], s: [1.9, 0.1, 0.66] });
      for (let k = 0; k < 6; k++) {
        const y = G + 0.1 + k * 0.8;
        oak.push({ p: [X(8.1), y, z], s: [1.8, 0.06, 0.6] });
        for (const face of [-1, 1]) {
          const shelfBooks: Box[] = [];
          fillShelf(shelfBooks, rand, 7.25, 8.95, y + 0.03, z + face * 0.17, 0.7);
          for (const b of shelfBooks) books.push({ ...b, p: [X(b.p[0]), b.p[1], b.p[2]] });
        }
      }
      colliders.push({ p: [X(8), G + 2.5, z], half: [1, 2.5, 0.32] });
    });

    // Tall windows at the back of every alcove, on both storeys.
    for (const z of ALCOVE_ZS) {
      windows.push({ p: [X(W - 0.03), 2.9, z], s: [0.04, 3.4, 2.2] });
      windows.push({ p: [X(W - 0.03), G + 2.6, z], s: [0.04, 3, 2] });
    }

    // Gallery balustrade along the aisle edge (z from the far wall to the end gallery).
    const railStart = HALL.zMin;
    const railEnd = 26;
    const railLen = railEnd - railStart;
    const railMid = (railStart + railEnd) / 2;
    oak.push({ p: [X(A + 0.05), G + 1.0, railMid], s: [0.14, 0.1, railLen] });
    oak.push({ p: [X(A + 0.05), G + 0.08, railMid], s: [0.14, 0.1, railLen] });
    for (let z = railStart + 0.2; z < railEnd; z += 0.4) {
      oak.push({ p: [X(A + 0.05), G + 0.54, z], s: [0.06, 0.84, 0.06] });
    }
    colliders.push({ p: [X(A + 0.05), G + 0.7, railMid], half: [0.08, 0.7, railLen / 2] });
  }

  // End-gallery balustrade facing the hall, with an opening at the stair head.
  const stairX0 = LONG_ROOM_STAIRS.centerX - LONG_ROOM_STAIRS.width / 2;
  const stairX1 = LONG_ROOM_STAIRS.centerX + LONG_ROOM_STAIRS.width / 2;
  for (const [x0, x1] of [[-HALL.aisleHalf, stairX0], [stairX1, HALL.aisleHalf]]) {
    const len = x1 - x0;
    const mid = (x0 + x1) / 2;
    oak.push({ p: [mid, G + 1.0, 26], s: [len, 0.1, 0.14] });
    oak.push({ p: [mid, G + 0.08, 26], s: [len, 0.1, 0.14] });
    for (let x = x0 + 0.2; x < x1; x += 0.4) oak.push({ p: [x, G + 0.54, 26], s: [0.06, 0.84, 0.06] });
    colliders.push({ p: [mid, G + 0.7, 26], half: [len / 2, 0.7, 0.08] });
  }

  return { oak, books, marble, bustHeads, windows, colliders };
};

const LAYOUT = buildLayout();

const oakMat = new THREE.MeshStandardMaterial({ color: '#5a3720', roughness: 0.75 });
const darkOakMat = new THREE.MeshStandardMaterial({ color: '#3b2416', roughness: 0.8 });
const vaultMat = new THREE.MeshStandardMaterial({ color: '#7a5434', roughness: 0.85, side: THREE.DoubleSide });
const floorMat = new THREE.MeshStandardMaterial({ color: '#8a6a4a', roughness: 0.7 });
const runnerMat = new THREE.MeshStandardMaterial({ color: '#5a1f1f', roughness: 0.95 });
const wallMat = new THREE.MeshStandardMaterial({ color: '#4a2e1b', roughness: 0.9 });
const marbleMat = new THREE.MeshStandardMaterial({ color: '#ece8e0', roughness: 0.35 });
// Books share one white material; per-instance colours tint each spine.
const bookMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 });
const windowMat = new THREE.MeshBasicMaterial({ color: '#fff4dc' });
const glassMat = new THREE.MeshStandardMaterial({ color: '#dff3ff', transparent: true, opacity: 0.25, roughness: 0.05 });
const pageMat = new THREE.MeshStandardMaterial({ color: '#f3e6c4', roughness: 1 });

// Draws many boxes (or spheres) as one InstancedMesh: one draw call per
// material instead of one per book, which keeps thousands of books cheap.
const Instances = ({ items, material, children, castShadow = false, receiveShadow = false }: {
  items: Box[], material: THREE.Material, children: ReactNode, castShadow?: boolean, receiveShadow?: boolean,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const color = new THREE.Color();
    items.forEach((item, i) => {
      matrix.compose(position.set(...item.p), rotation, scale.set(...item.s));
      mesh.setMatrixAt(i, matrix);
      if (item.c) mesh.setColorAt(i, color.set(item.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} material={material} castShadow={castShadow} receiveShadow={receiveShadow}>
      {children}
    </instancedMesh>
  );
};

const DisplayCase = ({ position }: { position: Vec3 }) => (
  <RigidBody type="fixed" position={position} colliders={false}>
    <CuboidCollider args={[0.85, 0.7, 0.55]} position={[0, 0.7, 0]} />
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow material={darkOakMat}><boxGeometry args={[1.7, 0.9, 1.1]} /></mesh>
    <mesh position={[0, 1.12, 0]} material={glassMat}><boxGeometry args={[1.6, 0.44, 1]} /></mesh>
    {/* An open manuscript inside */}
    <mesh position={[-0.2, 0.93, 0]} rotation={[0, 0, 0.12]} material={pageMat}><boxGeometry args={[0.4, 0.02, 0.55]} /></mesh>
    <mesh position={[0.2, 0.93, 0]} rotation={[0, 0, -0.12]} material={pageMat}><boxGeometry args={[0.4, 0.02, 0.55]} /></mesh>
  </RigidBody>
);

export const LongRoom = () => {
  const { halfWidth: W, zMin, zMax, galleryY: G, wallTop } = HALL;
  const length = zMax - zMin;
  const ribZs = Array.from({ length: Math.floor(length / 4) + 1 }, (_, i) => zMin + i * 4);

  return (
    <group>
      {/* Lighting: daylight through the side windows plus warm aisle lamps.
          Only the sun casts shadows, to stay well inside GPU texture limits. */}
      <hemisphereLight args={['#fff4e0', '#5a3a22', 0.7]} />
      <directionalLight
        position={[30, 30, 8]}
        intensity={1.6}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40} shadow-camera-right={40}
        shadow-camera-top={40} shadow-camera-bottom={-40}
        shadow-bias={-0.0002}
      />
      {[-24, -8, 8, 24].map((z) => (
        <pointLight key={z} position={[0, 9, z]} intensity={40} distance={30} decay={1.6} color="#ffd9a0" />
      ))}

      {/* Floor with a long red runner down the central aisle */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[W + 1, 0.5, length / 2 + 1]} position={[0, -0.5, 0]} />
      </RigidBody>
      <mesh position={[0, -0.5, 0]} receiveShadow material={floorMat}><boxGeometry args={[W * 2 + 2, 1, length + 2]} /></mesh>
      <mesh position={[0, 0.01, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={runnerMat}><planeGeometry args={[3, 58]} /></mesh>

      {/* Walls (they receive light but do not cast shadows, so daylight reaches inside) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.5, wallTop / 2 + 5, length / 2]} position={[-W - 0.5, wallTop / 2, 0]} />
        <CuboidCollider args={[0.5, wallTop / 2 + 5, length / 2]} position={[W + 0.5, wallTop / 2, 0]} />
        <CuboidCollider args={[W + 1, 10, 0.5]} position={[0, 10, zMin - 0.5]} />
        <CuboidCollider args={[W + 1, 10, 0.5]} position={[0, 10, zMax + 0.5]} />
      </RigidBody>
      <mesh position={[-W - 0.5, wallTop / 2, 0]} receiveShadow material={wallMat}><boxGeometry args={[1, wallTop, length]} /></mesh>
      <mesh position={[W + 0.5, wallTop / 2, 0]} receiveShadow material={wallMat}><boxGeometry args={[1, wallTop, length]} /></mesh>
      <mesh position={[0, 10, zMin - 0.5]} receiveShadow material={wallMat}><boxGeometry args={[W * 2 + 2, 20, 1]} /></mesh>
      <mesh position={[0, 10, zMax + 0.5]} receiveShadow material={wallMat}><boxGeometry args={[W * 2 + 2, 20, 1]} /></mesh>

      {/* Great arched window at the far end */}
      <mesh position={[0, 7, zMin + 0.02]} material={windowMat}><planeGeometry args={[5, 8]} /></mesh>
      <mesh position={[0, 11, zMin + 0.02]} material={windowMat}><circleGeometry args={[2.5, 32, 0, Math.PI]} /></mesh>

      {/* Barrel-vaulted oak ceiling with ribs every bay */}
      <mesh position={[0, wallTop, 0]} rotation={[Math.PI / 2, 0, 0]} material={vaultMat}>
        <cylinderGeometry args={[W, W, length, 40, 1, true, Math.PI / 2, Math.PI]} />
      </mesh>
      {ribZs.map((z) => (
        <mesh key={z} position={[0, wallTop, z]} material={darkOakMat}>
          <torusGeometry args={[W - 0.15, 0.18, 6, 40, Math.PI]} />
        </mesh>
      ))}

      {/* Upper gallery floors: both sides plus the end gallery over the entrance */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2, 0.25, 30]} position={[-7, G - 0.25, -4]} />
        <CuboidCollider args={[2, 0.25, 30]} position={[7, G - 0.25, -4]} />
        <CuboidCollider args={[W, 0.25, 4]} position={[0, G - 0.25, 30]} />
      </RigidBody>
      <mesh position={[-7, G - 0.25, -4]} castShadow receiveShadow material={darkOakMat}><boxGeometry args={[4, 0.5, 60]} /></mesh>
      <mesh position={[7, G - 0.25, -4]} castShadow receiveShadow material={darkOakMat}><boxGeometry args={[4, 0.5, 60]} /></mesh>
      <mesh position={[0, G - 0.25, 30]} castShadow receiveShadow material={darkOakMat}><boxGeometry args={[W * 2, 0.5, 8]} /></mesh>

      {/* Bookcases, books, busts, balustrades and windows */}
      <Instances items={LAYOUT.oak} material={oakMat} castShadow receiveShadow><boxGeometry /></Instances>
      <Instances items={LAYOUT.books} material={bookMat}><boxGeometry /></Instances>
      <Instances items={LAYOUT.marble} material={marbleMat} castShadow><boxGeometry /></Instances>
      <Instances items={LAYOUT.bustHeads} material={marbleMat} castShadow><sphereGeometry args={[0.5, 12, 10]} /></Instances>
      <Instances items={LAYOUT.windows} material={windowMat}><boxGeometry /></Instances>

      <RigidBody type="fixed" colliders={false}>
        {LAYOUT.colliders.map((c, i) => <CuboidCollider key={i} position={c.p} args={c.half} />)}
      </RigidBody>

      {/* Manuscript display cases down the aisle, like the Long Room's exhibits */}
      <DisplayCase position={[0, 0, 6]} />
      <DisplayCase position={[0, 0, -6]} />
    </group>
  );
};
