import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store';

export const Player = () => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const [, getKeys] = useKeyboardControls();
  const { joystickVector, activeTableId } = useGameStore();
  const { camera } = useThree();

  const speed = 5;
  const turnSpeed = 5;
  const playerPosition = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();

  useFrame((_state, delta) => {
    if (!bodyRef.current || activeTableId !== null) return; // don't move if using table

    const keys = getKeys();
    const linvel = bodyRef.current.linvel();
    const translation = bodyRef.current.translation();
    
    playerPosition.set(translation.x, translation.y, translation.z);

    // Calculate input direction
    let moveX = 0;
    let moveZ = 0;

    if (keys.forward) moveZ -= 1;
    if (keys.backward) moveZ += 1;
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;

    // Joystick override
    if (joystickVector.x !== 0 || joystickVector.y !== 0) {
      moveX = joystickVector.x;
      moveZ = -joystickVector.y; // Y up is forward (negative Z)
    }

    const direction = new THREE.Vector3(moveX, 0, moveZ).normalize();
    
    // Apply movement
    if (direction.length() > 0) {
      bodyRef.current.setLinvel({ x: direction.x * speed, y: linvel.y, z: direction.z * speed }, true);

      // Rotate character to face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      const targetRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      
      const currentRotation = bodyRef.current.rotation();
      const currentQuat = new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w);
      currentQuat.slerp(targetRotation, turnSpeed * delta);
      
      bodyRef.current.setRotation({ x: currentQuat.x, y: currentQuat.y, z: currentQuat.z, w: currentQuat.w }, true);
    } else {
      // Stop moving smoothly
      bodyRef.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
    }

    // Camera follow (Third Person)
    const idealCameraOffset = new THREE.Vector3(0, 4, 8); // slightly up and behind
    idealCameraOffset.applyQuaternion(new THREE.Quaternion(0, 0, 0, 1)); // We can make it rotate with player, but a static angled view is easier to navigate indoor.
    // Actually, fixed angle isometric/third-person is great.
    
    cameraTarget.copy(playerPosition);
    const cameraPosition = playerPosition.clone().add(new THREE.Vector3(0, 5, 8));
    
    camera.position.lerp(cameraPosition, 0.1);
    camera.lookAt(cameraTarget.add(new THREE.Vector3(0, 1, 0)));
  });

  return (
    <RigidBody ref={bodyRef} position={[0, 2, 0]} colliders="cuboid" lockRotations>
      {/* Cute blocky avatar */}
      <group>
        {/* Head */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#f0d4b5" />
        </mesh>
        {/* Body */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.7, 0.8, 0.4]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.6, 0.25]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.6, 0.25]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
    </RigidBody>
  );
};
