"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

function DogBody({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Body slightly rotates to follow the ball
      meshRef.current.rotation.y = Math.sin(time * 2) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      {/* More rounded, realistic body shape - using rounded box appearance */}
      <boxGeometry args={[1.3, 0.85, 0.65]} />
      <meshStandardMaterial 
        color="#8B4513" 
        metalness={0.05} 
        roughness={0.95}
        emissive="#654321"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function DogHead({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Head stays fixed - no rotation to keep eyes stable
      meshRef.current.rotation.y = 0;
      meshRef.current.rotation.x = 0;
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {/* More rounded head shape */}
      <boxGeometry args={[0.75, 0.75, 0.6]} />
      <meshStandardMaterial 
        color="#8B4513" 
        metalness={0.05} 
        roughness={0.95}
        emissive="#654321"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function DogSnout({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {/* Snout/muzzle - rounded shape */}
      <boxGeometry args={[0.28, 0.22, 0.38]} />
      <meshStandardMaterial 
        color="#8B4513" 
        metalness={0.05} 
        roughness={0.95}
        emissive="#654321"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function DogChest({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {/* Chest detail for more realism */}
      <boxGeometry args={[0.4, 0.3, 0.25]} />
      <meshStandardMaterial 
        color="#8B4513" 
        metalness={0.05} 
        roughness={0.95}
        emissive="#654321"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function DogEar({ position, rotation }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
      {/* More realistic floppy ear shape */}
      <boxGeometry args={[0.18, 0.45, 0.12]} />
      <meshStandardMaterial 
        color="#8B4513" 
        metalness={0.05} 
        roughness={0.95} 
        emissive="#654321" 
        emissiveIntensity={0.08} 
      />
    </mesh>
  );
}

function DogLeg({ position, isFrontPaw = false }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      if (isFrontPaw && position[0] < 0) {
        // Left front paw - pawing at ball animation
        const pawTime = state.clock.elapsedTime * 2;
        const pawCycle = Math.sin(pawTime);
        meshRef.current.rotation.x = pawCycle > 0 ? pawCycle * 0.3 : 0;
        meshRef.current.rotation.z = pawCycle > 0 ? pawCycle * 0.2 : 0;
        meshRef.current.position.y = position[1] + (pawCycle > 0 ? pawCycle * 0.1 : 0);
        meshRef.current.position.z = position[2] + (pawCycle > 0 ? pawCycle * 0.15 : 0);
      } else {
        const bounce = Math.sin(state.clock.elapsedTime * 3 + position[0] * 2) * 0.05;
        meshRef.current.position.y = position[1] + bounce;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {/* More realistic leg proportions */}
      <boxGeometry args={[0.22, 0.55, 0.22]} />
      <meshStandardMaterial 
        color="#8B4513" 
        metalness={0.05} 
        roughness={0.95} 
        emissive="#654321" 
        emissiveIntensity={0.08} 
      />
    </mesh>
  );
}

function DogPaw({ position }) {
  return (
    <mesh position={position} castShadow>
      {/* Paw pad detail */}
      <boxGeometry args={[0.18, 0.08, 0.25]} />
      <meshStandardMaterial 
        color="#654321" 
        metalness={0.05} 
        roughness={0.95} 
        emissive="#4a2c1a" 
        emissiveIntensity={0.05} 
      />
    </mesh>
  );
}

function TennisBall({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Bouncing animation
      const bounce = Math.abs(Math.sin(time * 3)) * 0.15;
      meshRef.current.position.y = position[1] + bounce;
      
      // Rolling animation
      meshRef.current.rotation.x += 0.05;
      meshRef.current.rotation.z += 0.03;
      
      // Slight horizontal movement (being pawed)
      meshRef.current.position.x = position[0] + Math.sin(time * 2) * 0.1;
      meshRef.current.position.z = position[2] + Math.cos(time * 1.5) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshStandardMaterial 
        color="#FFD700" 
        metalness={0.2} 
        roughness={0.8}
        emissive="#FFD700"
        emissiveIntensity={0.4}
      />
      {/* Tennis ball lines */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.008, 8, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.15, 0.008, 8, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </mesh>
  );
}

function DogTail({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Excited wagging when playing with ball
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.z = Math.sin(time * 3) * 0.5; // Faster wagging
      meshRef.current.rotation.y = Math.sin(time * 3) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {/* More realistic tail - slightly curved */}
      <boxGeometry args={[0.18, 0.9, 0.18]} />
      <meshStandardMaterial 
        color="#8B4513" 
        metalness={0.05} 
        roughness={0.95} 
        emissive="#654321" 
        emissiveIntensity={0.08} 
      />
    </mesh>
  );
}

function DogEye({ position }) {
  return (
    <mesh position={position}>
      {/* Small fixed black dots - no animation, no effects */}
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial 
        color="#000000" 
        emissive="#000000" 
        emissiveIntensity={0}
        metalness={0}
        roughness={1}
      />
    </mesh>
  );
}

function DogNose({ position }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.3} emissive="#111111" emissiveIntensity={0.2} />
    </mesh>
  );
}

export default function AnimatedDog3D() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      // Playful floating animation only - no rotation
      groupRef.current.position.y = Math.sin(time * 0.7) * 0.12;
      // Keep facing forward towards camera - rotate 180 degrees to show face
      groupRef.current.rotation.y = 0;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[1.6, 1.6, 1.6]} rotation={[0, Math.PI, 0]}>
      {/* Body - main torso */}
      <DogBody position={[0, 0, 0]} />
      
      {/* Chest detail */}
      <DogChest position={[0, 0.15, 0.25]} />
      
      {/* Head - attached to body */}
      <DogHead position={[0, 0.5, 0.4]} />
      
      {/* Snout/Muzzle - extending from head */}
      <DogSnout position={[0, 0.4, 0.65]} />
      
      {/* Ears - perky and alert */}
      <DogEar position={[-0.28, 0.8, 0.3]} rotation={[0, 0, -0.3]} />
      <DogEar position={[0.28, 0.8, 0.3]} rotation={[0, 0, 0.3]} />
      
      {/* Eyes - bright and focused on ball */}
      <DogEye position={[-0.22, 0.62, 0.65]} />
      <DogEye position={[0.22, 0.62, 0.65]} />
      
      {/* Nose - cute black nose */}
      <DogNose position={[0, 0.35, 0.85]} />
      
      {/* Legs - left front paw actively playing */}
      <DogLeg position={[-0.45, -0.7, 0.22]} isFrontPaw={true} />
      <DogLeg position={[0.45, -0.7, 0.22]} />
      <DogLeg position={[-0.45, -0.7, -0.22]} />
      <DogLeg position={[0.45, -0.7, -0.22]} />
      
      {/* Paw pads for front paws */}
      <DogPaw position={[-0.45, -0.95, 0.22]} />
      <DogPaw position={[0.45, -0.95, 0.22]} />
      
      {/* Tail - excited wagging */}
      <DogTail position={[0, 0.12, -0.52]} />
      
      {/* Tennis Ball - the focus of play */}
      <TennisBall position={[-0.35, -0.35, 0.55]} />
    </group>
  );
}

