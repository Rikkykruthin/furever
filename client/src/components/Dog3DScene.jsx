"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import AnimatedDog3D from "./AnimatedDog3D";

export default function Dog3DScene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        shadows={false}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        dpr={[1, 2]}
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={2} />
        <directionalLight
          position={[0, 5, 5]}
          intensity={2.5}
          color="#ffffff"
        />
        <directionalLight
          position={[-3, 3, 5]}
          intensity={1.5}
          color="#ffffff"
        />
        <directionalLight
          position={[3, 3, 5]}
          intensity={1.5}
          color="#ffffff"
        />
        <pointLight position={[0, 2, 5]} intensity={1.5} color="#ffffff" />
        
        {/* 3D Dog */}
        <Suspense fallback={null}>
          <AnimatedDog3D />
        </Suspense>
        
        {/* Controls - Fixed front view, no rotation */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

