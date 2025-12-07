"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function CatBody({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.06;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[0.9, 0.6, 0.5]} />
      <meshStandardMaterial 
        color="#ffffff" 
        metalness={0.2} 
        roughness={0.8}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function CatHead({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.06;
      // Subtle head movement
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.5]} />
      <meshStandardMaterial 
        color="#ffffff" 
        metalness={0.2} 
        roughness={0.8}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function CatEar({ position, rotation }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Cat ears twitch occasionally
      meshRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.06;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
      {/* Triangular ear shape */}
      <coneGeometry args={[0.12, 0.35, 3]} />
      <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.8} emissive="#ffffff" emissiveIntensity={0.15} />
    </mesh>
  );
}

function CatLeg({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // More subtle leg movement for cat
      const bounce = Math.sin(state.clock.elapsedTime * 2.5 + position[0] * 2) * 0.03;
      meshRef.current.position.y = position[1] + bounce;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.15, 0.4, 0.15]} />
      <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.8} emissive="#ffffff" emissiveIntensity={0.15} />
    </mesh>
  );
}

function CatTail({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Cat tail swishes more elegantly
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.06;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {/* Longer, thinner tail for cat */}
      <boxGeometry args={[0.12, 1.0, 0.12]} />
      <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.8} emissive="#ffffff" emissiveIntensity={0.2} />
    </mesh>
  );
}

function CatEye({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Cat eyes blink occasionally
      const blink = Math.sin(state.clock.elapsedTime * 0.5);
      if (blink > 0.95) {
        meshRef.current.scale.y = 0.1;
      } else {
        meshRef.current.scale.y = 1;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color="#000000" emissive="#444444" emissiveIntensity={0.4} />
    </mesh>
  );
}

function CatNose({ position }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.3} emissive="#111111" emissiveIntensity={0.2} />
    </mesh>
  );
}

export default function AnimatedCat3D() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation - more subtle for cat
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.1;
      // Gentle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
      {/* Body - smaller and more compact than dog */}
      <CatBody position={[0, 0, 0]} />
      
      {/* Head - rounder than dog */}
      <CatHead position={[0, 0.4, 0.35]} />
      
      {/* Ears - pointed triangular ears */}
      <CatEar position={[-0.2, 0.65, 0.25]} rotation={[0, 0, -0.2]} />
      <CatEar position={[0.2, 0.65, 0.25]} rotation={[0, 0, 0.2]} />
      
      {/* Eyes - positioned more forward */}
      <CatEye position={[-0.15, 0.5, 0.55]} />
      <CatEye position={[0.15, 0.5, 0.55]} />
      
      {/* Nose */}
      <CatNose position={[0, 0.4, 0.6]} />
      
      {/* Legs - more compact */}
      <CatLeg position={[-0.35, -0.5, 0.15]} />
      <CatLeg position={[0.35, -0.5, 0.15]} />
      <CatLeg position={[-0.35, -0.5, -0.15]} />
      <CatLeg position={[0.35, -0.5, -0.15]} />
      
      {/* Tail - longer and more elegant */}
      <CatTail position={[0, 0.05, -0.4]} />
    </group>
  );
}

