"use client";

import {
  GLTFGarment,
  hasGarmentModel,
  useGarmentMaterial,
} from "./GLTFGarment";

interface GarmentModelProps {
  garmentType: string;
  colorHex?: string | null;
  fabric?: string | null;
}

// Shown for garments without a dedicated 3D model (e.g. legacy commission
// types that are no longer offered). Tinted by
// the chosen color so the design selection still reads in the viewer.
function PlaceholderModel({
  colorHex,
  fabric,
}: {
  colorHex?: string | null;
  fabric?: string | null;
}) {
  const material = useGarmentMaterial(colorHex, fabric, { wireframe: true });

  return (
    <group>
      <mesh position={[0, 0, 0]} material={material}>
        <boxGeometry args={[0.5, 1, 0.3]} />
      </mesh>
      <mesh position={[0, 0.7, 0]} material={material}>
        <sphereGeometry args={[0.15]} />
      </mesh>
    </group>
  );
}

export function GarmentModel({
  garmentType,
  colorHex,
  fabric,
}: GarmentModelProps) {
  if (hasGarmentModel(garmentType)) {
    return (
      <GLTFGarment
        garmentType={garmentType}
        colorHex={colorHex}
        fabric={fabric}
      />
    );
  }
  return <PlaceholderModel colorHex={colorHex} fabric={fabric} />;
}
