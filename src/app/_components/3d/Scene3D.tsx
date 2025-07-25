"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { GarmentModel } from "./GarmentModel";
import { Suspense } from "react";
import { useMobile } from "~/context/mobile-provider";

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
  disableInteraction?: boolean;
}

export function Scene3D({
  garmentType,
  disableInteraction = false,
}: Scene3DProps) {
  const { isMobile } = useMobile();

  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera makeDefault position={[1, 1, 2]} fov={30} />

      {/* Lighting setup - simplified for mobile */}
      {isMobile ? (
        // Simplified lighting for mobile performance
        <>
          <directionalLight position={[5, 5, 5]} intensity={1.0} />
          <ambientLight intensity={0.4} />
        </>
      ) : (
        // Full three-point lighting for desktop
        <>
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
        </>
      )}

      {/* 3D Model */}
      <Suspense fallback={<LoadingFallback />}>
        <GarmentModel garmentType={garmentType} />
      </Suspense>

      {/* Controls - adaptive for mobile */}
      <OrbitControls
        enablePan={false}
        enableZoom={!disableInteraction}
        enableRotate={!disableInteraction}
        autoRotate={!disableInteraction}
        autoRotateSpeed={isMobile ? 1 : 2} // Slower rotation on mobile
        minDistance={isMobile ? 1.5 : 2}
        maxDistance={isMobile ? 8 : 50}
        zoom0={100}
        target={[0, 0, 0]}
        // Mobile-specific touch settings
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={isMobile ? 0.5 : 1}
        zoomSpeed={isMobile ? 0.5 : 1}
      />
    </>
  );
}
