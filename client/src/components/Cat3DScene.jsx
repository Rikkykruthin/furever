"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import AnimatedCat3D from "./AnimatedCat3D";

export default function Cat3DScene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 45 }}
        shadows={false}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        dpr={[1, 2]}
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={2} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={2.5}
          color="#ffffff"
        />
        <directionalLight
          position={[-5, 5, -5]}
          intensity={1.5}
          color="#ffffff"
        />
        <pointLight position={[0, 5, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-5, 3, -5]} intensity={1} color="#ffffff" />
        <pointLight position={[5, 2, 5]} intensity={1} color="#ffffff" />
        
        {/* 3D Cat */}
        <Suspense fallback={null}>
          <AnimatedCat3D />
        </Suspense>
        
        {/* Controls - Auto-rotate for dynamic feel */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}


