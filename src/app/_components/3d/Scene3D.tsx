'use client';

import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GarmentModel } from './GarmentModel';
import { Suspense } from 'react';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6b7280" wireframe />
    </mesh>
  );
}

interface Scene3DProps {
  garmentType: string;
}

export function Scene3D({ garmentType }: Scene3DProps) {



  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera makeDefault position={[1, 1, 2]} fov={30} />
      
      {/* Lighting setup - three-point lighting */}
      {/* Key light (main light) */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill light (softer, opposite side) */}
      <directionalLight
        position={[-3, 2, 3]}
        intensity={0.4}
        color="#f0f9ff"
      />
      
      {/* Rim light (back light for definition) */}
      <directionalLight
        position={[0, -2, -5]}
        intensity={0.3}
        color="#e0f2fe"
      />
      
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.2} />
      
      
      {/* 3D Model */}
      <Suspense fallback={<LoadingFallback />}>
        <GarmentModel garmentType={garmentType} />
      </Suspense>
      
      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={2}
        minDistance={2}
        maxDistance={50}
        zoom0={100}
        target={[0, 0, 0]}
      />
    </>
  );
}