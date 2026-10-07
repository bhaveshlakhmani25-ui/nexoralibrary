import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBodyType } from '@dimforge/rapier3d-compat';
import { useGameStore } from '../../store';
import * as THREE from 'three';

const WALK_SPEED = 5;
const MAIN_STAIRCASE = {
  centerX: -13,
  startZ: 5,
  width: 4,
  run: 15,
  rise: 10,
};

export const Player = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const avatarRef = useRef<THREE.Group>(null);
  const stairAssistActive = useRef(false);
  const stairGroundOffset = useRef(0);
  const [, getKeys] = useKeyboardControls();
  const { joystickVector, isSeated, seatTransform, resetTrigger } = useGameStore();
  const { camera, gl } = useThree();

  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);

  // Click-and-drag / trackpad free-look works both while walking and seated.
  // Walking keeps its third-person camera; seated mode uses a closer eye-level view.
  useEffect(() => {
    let isDragging = false;
    let previousTouch: { x: number, y: number } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      gl.domElement.setPointerCapture?.(e.pointerId);
    };
    const onPointerUp = () => { isDragging = false; previousTouch = null; };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      setYaw((y) => y - e.movementX * 0.005);
      const pitchLimit = isSeated ? Math.PI / 2 : 0.8;
      setPitch((p) => Math.max(-pitchLimit, Math.min(pitchLimit, p - e.movementY * 0.005)));
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!previousTouch) {
        previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return;
      }
      const dx = e.touches[0].clientX - previousTouch.x;
      const dy = e.touches[0].clientY - previousTouch.y;
      setYaw((y) => y - dx * 0.005);
      const pitchLimit = isSeated ? Math.PI / 2 : 0.8;
      setPitch((p) => Math.max(-pitchLimit, Math.min(pitchLimit, p - dy * 0.005)));
      previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    gl.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    gl.domElement.addEventListener('touchmove', onTouchMove);

    return () => {
      gl.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      gl.domElement.removeEventListener('touchmove', onTouchMove);
    };
  }, [isSeated, gl.domElement]);

  useEffect(() => {
    if (resetTrigger > 0 && bodyRef.current) {
      bodyRef.current.setTranslation({ x: 0, y: 2, z: 25 }, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      setYaw(0);
      setPitch(0);
    }
  }, [resetTrigger]);

  // A seated player is kinematic so the chair/table colliders cannot push the
  // avatar away (the source of the jumpy, stuck-on-chair behaviour).
  useEffect(() => {
    if (isSeated && seatTransform && bodyRef.current) {
      bodyRef.current.setBodyType(RigidBodyType.KinematicPositionBased, true);
      bodyRef.current.setTranslation(new THREE.Vector3(...seatTransform.pos), true);
      const euler = new THREE.Euler(...seatTransform.rot);
      const quat = new THREE.Quaternion().setFromEuler(euler);
      bodyRef.current.setRotation(quat, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      
      setYaw(seatTransform.rot[1]);
      setPitch(0);
    } else if (!isSeated && seatTransform && bodyRef.current) {
      // Place the player just behind the chair, relative to the chair's own
      // direction, then restore normal physics and walking controls.
      const standOffset = new THREE.Vector3(0, 1, 1.25)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), seatTransform.rot[1]);
      const standPos = new THREE.Vector3(...seatTransform.pos).add(standOffset);
      bodyRef.current.setBodyType(RigidBodyType.Dynamic, true);
      bodyRef.current.setTranslation(standPos, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      bodyRef.current.wakeUp();
    }
  }, [isSeated, seatTransform]);

  useFrame((state) => {
    if (!bodyRef.current || !avatarRef.current) return;

    if (isSeated) {
      // Sit down slightly lower
      avatarRef.current.position.y = -0.5; 
      
      // Camera is first-person (at head level)
      const headPos = new THREE.Vector3(0, 1.2, 0.2); 
      const playerWorldPos = bodyRef.current.translation();
      
      const camPos = new THREE.Vector3(playerWorldPos.x, playerWorldPos.y + headPos.y, playerWorldPos.z + headPos.z);
      camera.position.lerp(camPos, 0.1);

      // Apply pitch and yaw
      const targetRotation = new THREE.Euler(pitch, yaw, 0, 'YXZ');
      const targetQuat = new THREE.Quaternion().setFromEuler(targetRotation);
      camera.quaternion.slerp(targetQuat, 0.2);
      return;
    }

    // --- NORMAL WALKING LOGIC ---
    avatarRef.current.position.y = 0; 

    const { forward, backward, left, right } = getKeys();
    const velocity = bodyRef.current.linvel();
    
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

    const direction = new THREE.Vector3(moveX, 0, moveZ).normalize().multiplyScalar(WALK_SPEED);

    // The avatar uses a dynamic physics body, which cannot reliably step up a
    // tall decorative staircase. Within the stair lane, smoothly lift/lower it
    // along the stair path so walking onto it feels automatic, like Roblox.
    const playerPos = bodyRef.current.translation();
    const stairProgress = (MAIN_STAIRCASE.startZ - playerPos.z) / MAIN_STAIRCASE.run;
    const isOnMainStaircase =
      Math.abs(playerPos.x - MAIN_STAIRCASE.centerX) < MAIN_STAIRCASE.width / 2 + 0.2 &&
      stairProgress >= -0.1 &&
      stairProgress <= 1.1;

    if (isOnMainStaircase) {
      const clampedProgress = THREE.MathUtils.clamp(stairProgress, 0, 1);
      if (!stairAssistActive.current) {
        stairGroundOffset.current = playerPos.y - clampedProgress * MAIN_STAIRCASE.rise;
        stairAssistActive.current = true;
      }

      const expectedY = stairGroundOffset.current + clampedProgress * MAIN_STAIRCASE.rise;
      
      let clampedX = playerPos.x;
      const xMargin = MAIN_STAIRCASE.width / 2 - 0.3;
      if (clampedX < MAIN_STAIRCASE.centerX - xMargin) clampedX = MAIN_STAIRCASE.centerX - xMargin;
      if (clampedX > MAIN_STAIRCASE.centerX + xMargin) clampedX = MAIN_STAIRCASE.centerX + xMargin;

      bodyRef.current.setGravityScale(0, true);
      bodyRef.current.setTranslation(
        { x: clampedX, y: THREE.MathUtils.lerp(playerPos.y, expectedY, 0.4), z: playerPos.z },
        true
      );
      bodyRef.current.setLinvel({ x: direction.x, y: 0, z: direction.z }, true);
    } else {
      if (stairAssistActive.current) {
        bodyRef.current.setGravityScale(1, true);
        stairAssistActive.current = false;
      }
      bodyRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);
    }

    if (direction.lengthSq() > 0.1) {
      const angle = Math.atan2(direction.x, direction.z);
      avatarRef.current.rotation.y = THREE.MathUtils.lerp(avatarRef.current.rotation.y, angle, 0.1);
      avatarRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1;
    }

    const cameraDistance = 8;
    const cameraOffset = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch) * cameraDistance,
      3.6 + Math.sin(pitch) * cameraDistance,
      Math.cos(yaw) * Math.cos(pitch) * cameraDistance
    );
    const targetCameraPos = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z).add(cameraOffset);
    if (targetCameraPos.y < playerPos.y + 1.5) {
      targetCameraPos.y = playerPos.y + 1.5;
    }
    camera.position.lerp(targetCameraPos, 0.1);
    camera.lookAt(playerPos.x, playerPos.y + 1.1, playerPos.z);
  });

  return (
    <RigidBody ref={bodyRef} position={[0, 2, 25]} colliders="cuboid" lockRotations mass={1}>
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
        
        {/* Left Arm */}
        <mesh position={[-0.45, 0.6, isSeated ? 0.3 : 0]} rotation={[isSeated ? -Math.PI / 3 : 0, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#f1c27d" />
        </mesh>
        
        {/* Right Arm */}
        <mesh position={[0.45, 0.6, isSeated ? 0.3 : 0]} rotation={[isSeated ? -Math.PI / 3 : 0, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#f1c27d" />
        </mesh>

        {/* Left Leg */}
        <mesh position={[-0.2, isSeated ? 0.2 : -0.2, isSeated ? 0.3 : 0]} rotation={[isSeated ? -Math.PI / 2 : 0, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.6, 0.25]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Right Leg */}
        <mesh position={[0.2, isSeated ? 0.2 : -0.2, isSeated ? 0.3 : 0]} rotation={[isSeated ? -Math.PI / 2 : 0, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.6, 0.25]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
    </RigidBody>
  );
};
