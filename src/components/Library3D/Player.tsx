import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody, useRapier } from '@react-three/rapier';
import { useKeyboardControls, Html } from '@react-three/drei';
import { RigidBodyType } from '@dimforge/rapier3d-compat';
import { useGameStore } from '../../store';
import { LONG_ROOM_STAIRS, SPAWN_POINT } from './longRoomLayout';
import * as THREE from 'three';

const WALK_SPEED = 5;
const SPRINT_MULTIPLIER = 1.6;
const JUMP_VELOCITY = 6.5;
const TURN_SPEED = 12;
const LOOK_SENSITIVITY = 0.005;
const MIN_ZOOM = 4;
const MAX_ZOOM = 16;
const DEFAULT_ZOOM = 8;
// Distance from the body origin to the bottom of the avatar collider.
const FOOT_OFFSET = 0.5;
// How far the camera stays in front of a wall it would otherwise clip into.
const CAMERA_WALL_MARGIN = 0.3;
const CAMERA_HIDE_AVATAR_DISTANCE = 1.6;
const SPAWN = SPAWN_POINT;
const STAIRS = LONG_ROOM_STAIRS;

const UP = new THREE.Vector3(0, 1, 0);

// Shortest signed difference between two angles, so turning never spins the
// long way round when the target crosses the -PI/PI boundary.
const angleDelta = (from: number, to: number) =>
  THREE.MathUtils.euclideanModulo(to - from + Math.PI, Math.PI * 2) - Math.PI;

export const Player = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const avatarRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const stairAssistActive = useRef(false);
  const stairGroundOffset = useRef(0);
  const walkPhase = useRef(0);

  // Camera orbit lives in refs: updating React state on every mouse move would
  // re-render the player dozens of times per second.
  const yaw = useRef(0);
  const pitch = useRef(0);
  const zoom = useRef(DEFAULT_ZOOM);

  const [, getKeys] = useKeyboardControls();
  const { world, rapier } = useRapier();
  const isSeated = useGameStore((s) => s.isSeated);
  const seatTransform = useGameStore((s) => s.seatTransform);
  const resetTrigger = useGameStore((s) => s.resetTrigger);
  const { camera, gl } = useThree();

  const tmp = useRef({
    direction: new THREE.Vector3(),
    cameraOffset: new THREE.Vector3(),
    cameraTarget: new THREE.Vector3(),
    head: new THREE.Vector3(),
    toCamera: new THREE.Vector3(),
    euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    quat: new THREE.Quaternion(),
  }).current;

  // Roblox-style camera: drag with the right (or left, for trackpads) mouse
  // button to orbit, scroll to zoom. Seated mode uses an eye-level view.
  useEffect(() => {
    const el = gl.domElement;
    let isDragging = false;
    let previousTouch: { x: number, y: number } | null = null;

    const look = (dx: number, dy: number) => {
      yaw.current -= dx * LOOK_SENSITIVITY;
      const pitchLimit = useGameStore.getState().isSeated ? Math.PI / 2 : 0.8;
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * LOOK_SENSITIVITY, -pitchLimit, pitchLimit);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || (e.button !== 0 && e.button !== 2)) return;
      isDragging = true;
      el.setPointerCapture?.(e.pointerId);
    };
    const onPointerUp = () => { isDragging = false; };
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) look(e.movementX, e.movementY);
    };
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom.current = THREE.MathUtils.clamp(zoom.current + e.deltaY * 0.01, MIN_ZOOM, MAX_ZOOM);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (previousTouch) look(touch.clientX - previousTouch.x, touch.clientY - previousTouch.y);
      previousTouch = { x: touch.clientX, y: touch.clientY };
    };
    const onTouchEnd = () => { previousTouch = null; };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    el.addEventListener('contextmenu', onContextMenu);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('contextmenu', onContextMenu);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [gl.domElement]);

  useEffect(() => {
    if (resetTrigger > 0 && bodyRef.current) {
      bodyRef.current.setBodyType(RigidBodyType.Dynamic, true);
      bodyRef.current.setTranslation(SPAWN, true);
      bodyRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      yaw.current = 0;
      pitch.current = 0;
      zoom.current = DEFAULT_ZOOM;
    }
  }, [resetTrigger]);

  // A seated player is kinematic so the chair/table colliders cannot push the
  // avatar away (the source of the jumpy, stuck-on-chair behaviour).
  useEffect(() => {
    if (isSeated && seatTransform && bodyRef.current) {
      bodyRef.current.setBodyType(RigidBodyType.KinematicPositionBased, true);
      bodyRef.current.setTranslation(new THREE.Vector3(...seatTransform.pos), true);
      const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...seatTransform.rot));
      bodyRef.current.setRotation(quat, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

      yaw.current = seatTransform.rot[1];
      pitch.current = 0;
    } else if (!isSeated && seatTransform && bodyRef.current) {
      // Place the player just behind the chair, relative to the chair's own
      // direction, then restore normal physics and walking controls. The body
      // rotation is reset so the avatar's facing is world-relative again.
      const standOffset = new THREE.Vector3(0, 1, 1.25).applyAxisAngle(UP, seatTransform.rot[1]);
      const standPos = new THREE.Vector3(...seatTransform.pos).add(standOffset);
      bodyRef.current.setBodyType(RigidBodyType.Dynamic, true);
      bodyRef.current.setTranslation(standPos, true);
      bodyRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      bodyRef.current.wakeUp();
      if (avatarRef.current) avatarRef.current.rotation.y = seatTransform.rot[1] + Math.PI;
    }
  }, [isSeated, seatTransform]);

  const setLimbPose = (arm: number, leg: number, seated: boolean) => {
    if (!leftArmRef.current || !rightArmRef.current || !leftLegRef.current || !rightLegRef.current) return;
    if (seated) {
      leftArmRef.current.rotation.x = rightArmRef.current.rotation.x = -Math.PI / 3;
      leftLegRef.current.rotation.x = rightLegRef.current.rotation.x = -Math.PI / 2;
      return;
    }
    leftArmRef.current.rotation.x = arm;
    rightArmRef.current.rotation.x = -arm;
    leftLegRef.current.rotation.x = leg;
    rightLegRef.current.rotation.x = -leg;
  };

  useFrame((_state, delta) => {
    const body = bodyRef.current;
    const avatar = avatarRef.current;
    if (!body || !avatar) return;
    const dt = Math.min(delta, 0.05);

    if (isSeated) {
      avatar.position.y = -0.5;
      avatar.rotation.y = Math.PI; // face the desk
      avatar.visible = true;
      setLimbPose(0, 0, true);

      // First-person camera at head level
      const seatPos = body.translation();
      tmp.cameraTarget.set(seatPos.x, seatPos.y + 0.75, seatPos.z);
      camera.position.lerp(tmp.cameraTarget, 0.1);
      tmp.euler.set(pitch.current, yaw.current, 0, 'YXZ');
      tmp.quat.setFromEuler(tmp.euler);
      camera.quaternion.slerp(tmp.quat, 0.2);
      return;
    }

    // --- NORMAL WALKING LOGIC ---
    avatar.position.y = 0;

    const { forward, backward, left, right, jump, sprint } = getKeys();
    const { joystickVector } = useGameStore.getState();
    const velocity = body.linvel();
    const playerPos = body.translation();

    let moveX = 0;
    let moveZ = 0;
    if (forward) moveZ -= 1;
    if (backward) moveZ += 1;
    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (joystickVector.x !== 0 || joystickVector.y !== 0) {
      moveX = joystickVector.x;
      moveZ = -joystickVector.y;
    }

    // Movement is relative to the camera, so "forward" always walks away
    // from where you are looking, like Roblox.
    const speed = WALK_SPEED * (sprint ? SPRINT_MULTIPLIER : 1);
    const direction = tmp.direction.set(moveX, 0, moveZ);
    if (direction.lengthSq() > 0) direction.normalize().applyAxisAngle(UP, yaw.current).multiplyScalar(speed);

    // The avatar uses a dynamic physics body, which cannot reliably step up a
    // tall decorative staircase. Within the stair lane, smoothly lift/lower it
    // along the stair path so walking onto it feels automatic, like Roblox.
    const stairProgress = (playerPos.z - STAIRS.startZ) / (STAIRS.endZ - STAIRS.startZ);
    const isOnMainStaircase =
      Math.abs(playerPos.x - STAIRS.centerX) < STAIRS.width / 2 + 0.2 &&
      stairProgress >= -0.1 &&
      stairProgress <= 1.1;

    if (isOnMainStaircase) {
      const clampedProgress = THREE.MathUtils.clamp(stairProgress, 0, 1);
      if (!stairAssistActive.current) {
        stairGroundOffset.current = playerPos.y - clampedProgress * STAIRS.rise;
        stairAssistActive.current = true;
      }

      const expectedY = stairGroundOffset.current + clampedProgress * STAIRS.rise;
      const xMargin = STAIRS.width / 2 - 0.3;
      const clampedX = THREE.MathUtils.clamp(playerPos.x, STAIRS.centerX - xMargin, STAIRS.centerX + xMargin);

      body.setGravityScale(0, true);
      body.setTranslation(
        { x: clampedX, y: THREE.MathUtils.lerp(playerPos.y, expectedY, 0.4), z: playerPos.z },
        true
      );
      body.setLinvel({ x: direction.x, y: 0, z: direction.z }, true);
    } else {
      if (stairAssistActive.current) {
        body.setGravityScale(1, true);
        stairAssistActive.current = false;
      }

      let verticalVelocity = velocity.y;
      if (jump && verticalVelocity <= 0.1) {
        const ray = new rapier.Ray(playerPos, { x: 0, y: -1, z: 0 });
        const hit = world.castRay(
          ray, FOOT_OFFSET + 0.15, true,
          rapier.QueryFilterFlags.EXCLUDE_SENSORS, undefined, undefined, body
        );
        if (hit) verticalVelocity = JUMP_VELOCITY;
      }
      body.setLinvel({ x: direction.x, y: verticalVelocity, z: direction.z }, true);
    }

    // Turn toward the movement direction and swing arms/legs while walking.
    const isMoving = direction.lengthSq() > 0.1;
    if (isMoving) {
      const targetAngle = Math.atan2(direction.x, direction.z);
      avatar.rotation.y += angleDelta(avatar.rotation.y, targetAngle) * Math.min(1, TURN_SPEED * dt);
      walkPhase.current += dt * speed * 2.2;
    } else {
      walkPhase.current = 0;
    }
    const swing = isMoving ? Math.sin(walkPhase.current) * 0.7 : 0;
    const airborne = !isOnMainStaircase && Math.abs(velocity.y) > 1;
    setLimbPose(airborne ? -0.4 : swing, airborne ? 0.3 : swing, false);

    // Third-person orbit camera
    const distance = zoom.current;
    tmp.cameraOffset.set(
      Math.sin(yaw.current) * Math.cos(pitch.current) * distance,
      3.6 + Math.sin(pitch.current) * distance,
      Math.cos(yaw.current) * Math.cos(pitch.current) * distance
    );
    tmp.cameraTarget.set(playerPos.x, playerPos.y, playerPos.z).add(tmp.cameraOffset);
    tmp.cameraTarget.y = Math.max(tmp.cameraTarget.y, playerPos.y + 1.5);

    // Like Roblox, pull the camera in front of any wall or bookcase between
    // it and the avatar instead of letting it clip inside the geometry.
    tmp.head.set(playerPos.x, playerPos.y + 1.1, playerPos.z);
    tmp.toCamera.subVectors(tmp.cameraTarget, tmp.head);
    const cameraDistance = tmp.toCamera.length();
    tmp.toCamera.divideScalar(cameraDistance);
    const cameraRay = new rapier.Ray(tmp.head, tmp.toCamera);
    const blocker = world.castRay(
      cameraRay, cameraDistance, true,
      rapier.QueryFilterFlags.EXCLUDE_SENSORS, undefined, undefined, body
    );
    if (blocker) {
      camera.position.copy(tmp.head).addScaledVector(tmp.toCamera, Math.max(0.5, blocker.timeOfImpact - CAMERA_WALL_MARGIN));
    } else {
      camera.position.lerp(tmp.cameraTarget, 0.15);
    }
    camera.lookAt(tmp.head);
    // Like Roblox, hide your own avatar when the camera is pushed right up
    // against it (e.g. in a narrow alcove) so it does not block the view.
    avatar.visible = camera.position.distanceTo(tmp.head) > CAMERA_HIDE_AVATAR_DISTANCE;
  });

  return (
    <RigidBody ref={bodyRef} position={[SPAWN.x, SPAWN.y, SPAWN.z]} colliders={false} lockRotations mass={1}>
      <CuboidCollider args={[0.55, 1, 0.2]} position={[0, 0.5, 0]} />
      <group ref={avatarRef}>
        {/* Head */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#f1c27d" roughness={0.6} />
        </mesh>

        {/* Body */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.7, 0.8, 0.4]} />
          <meshStandardMaterial color="#e74c3c" roughness={0.8} />
        </mesh>

        {/* Arms pivot at the shoulder, legs at the hip, so they swing naturally */}
        <group ref={leftArmRef} position={[-0.45, 0.9, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#f1c27d" />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.45, 0.9, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#f1c27d" />
          </mesh>
        </group>
        <group ref={leftLegRef} position={[-0.2, 0.1, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.25, 0.6, 0.25]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.2, 0.1, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.25, 0.6, 0.25]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
        </group>
      </group>

      {/* Always mounted (hidden while seated): toggling drei <Html> mid-render throws under React 19 */}
      <Html position={[0, 2, 0]} center zIndexRange={[5, 0]} pointerEvents="none" style={{ display: isSeated ? 'none' : 'block' }}>
        <div className="name-tag">You</div>
      </Html>
    </RigidBody>
  );
};
