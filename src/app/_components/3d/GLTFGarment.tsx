"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  DEFAULT_GARMENT_COLOR,
  getFabricById,
} from "~/lib/commission-design";

// Per-garment GLTF path and transform. The GLTF node hierarchies differ per
// asset, so meshes are rendered flat inside a group carrying the transform.
const GARMENT_MODEL_CONFIG = {
  shirt: {
    path: "/3d-assets/shirt/scene.gltf",
    rotation: [(Math.PI / 180) * 270, 0, 0] as const,
    position: [0, -1.5, 0] as const,
    scale: 1.2,
  },
  jacket: {
    path: "/3d-assets/jacket/scene.gltf",
    rotation: [(Math.PI / 180) * 270, 0, 0] as const,
    position: [0, -0.4, 0] as const,
    scale: 0.07,
  },
  pants: {
    path: "/3d-assets/pants/scene.gltf",
    rotation: [(Math.PI / 180) * 270, 0, 0] as const,
    position: [0, 0, 0] as const,
    scale: 0.009,
  },
  dress: {
    path: "/3d-assets/dress/scene.gltf",
    rotation: [0, 0, 0] as const,
    position: [0, -0.7, 0] as const,
    scale: 0.007,
  },
} satisfies Record<
  string,
  {
    path: string;
    rotation: readonly [number, number, number];
    position: readonly [number, number, number];
    scale: number;
  }
>;

export type ModeledGarmentType = keyof typeof GARMENT_MODEL_CONFIG;

export function hasGarmentModel(
  garmentType: string,
): garmentType is ModeledGarmentType {
  return garmentType in GARMENT_MODEL_CONFIG;
}

// Fabric material defaults used when no fabric preset is selected.
const DEFAULT_FABRIC_PARAMS = { roughness: 0.85, sheen: 0.1, sheenRoughness: 0.9 };

// One material shared by every mesh of the garment. It is created once and
// mutated in place when the color or fabric changes — no per-render material
// churn and no per-frame work.
export function useGarmentMaterial(
  colorHex: string | null | undefined,
  fabricId: string | null | undefined,
  options?: { wireframe?: boolean },
): THREE.MeshPhysicalMaterial {
  const wireframe = options?.wireframe ?? false;
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: DEFAULT_GARMENT_COLOR,
        metalness: 0.05,
        wireframe,
        ...DEFAULT_FABRIC_PARAMS,
      }),
    [wireframe],
  );

  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.color.set(colorHex ?? DEFAULT_GARMENT_COLOR);
    const params = getFabricById(fabricId ?? null)?.material ?? DEFAULT_FABRIC_PARAMS;
    material.roughness = params.roughness;
    material.sheen = params.sheen;
    material.sheenRoughness = params.sheenRoughness;
    // Tinted sheen reads as fabric lustre rather than a white specular film.
    material.sheenColor.set(colorHex ?? DEFAULT_GARMENT_COLOR).lerp(
      new THREE.Color("#ffffff"),
      0.5,
    );
  }, [material, colorHex, fabricId]);

  return material;
}

interface GLTFGarmentProps {
  garmentType: ModeledGarmentType;
  colorHex?: string | null;
  fabric?: string | null;
}

export function GLTFGarment({ garmentType, colorHex, fabric }: GLTFGarmentProps) {
  const config = GARMENT_MODEL_CONFIG[garmentType];
  const { nodes } = useGLTF(config.path);
  const material = useGarmentMaterial(colorHex, fabric);

  const geometries = useMemo(
    () =>
      Object.values(nodes)
        .filter((node): node is THREE.Mesh => node instanceof THREE.Mesh)
        .map((mesh) => mesh.geometry)
        .filter(
          (geometry): geometry is THREE.BufferGeometry =>
            geometry instanceof THREE.BufferGeometry,
        ),
    [nodes],
  );

  return (
    <group
      dispose={null}
      rotation={[config.rotation[0], config.rotation[1], config.rotation[2]]}
      position={[config.position[0], config.position[1], config.position[2]]}
      scale={config.scale}
    >
      {geometries.map((geometry, index) => (
        <mesh
          key={`${garmentType}-mesh-${index}`}
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
