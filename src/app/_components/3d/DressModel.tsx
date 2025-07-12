'use client';

import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

export function DressModel() {
  const gltf = useGLTF('/3d-assets/dress/scene.gltf');
  const { nodes } = gltf;
  const dressRef = useRef<THREE.Group>(null);

  // Create grey material once
  const greyMaterial = new THREE.MeshStandardMaterial({
    color: '#d1d5db', // grey-300
    roughness: 0.8,
    metalness: 0.1,
  });

  // Get mesh nodes safely
  const getMeshNode = (name: string): THREE.Mesh | null => {
    const node = nodes[name];
    return node instanceof THREE.Mesh ? node : null;
  };

  // Helper to safely get geometry
  const getGeometry = (mesh: THREE.Mesh | null): THREE.BufferGeometry | undefined => {
    if (mesh && mesh.geometry instanceof THREE.BufferGeometry) {
      return mesh.geometry;
    }
    return undefined;
  };

  // Get all available mesh nodes from the dress model
  const meshNodes = Object.keys(nodes)
    .map(name => getMeshNode(name))
    .filter((node): node is THREE.Mesh => node !== null);

  return (
    <group
      ref={dressRef}
      dispose={null}
      rotation={[0, 0, 0]}
      position={[0, -.6, 0]}
      scale={0.007}
    >
      {meshNodes.map((mesh, index) => {
        const geometry = getGeometry(mesh);
        return geometry ? (
          <mesh
            key={`dress-mesh-${index}`}
            geometry={geometry}
            material={greyMaterial}
            castShadow
            receiveShadow
          />
        ) : null;
      })}
    </group>
  );
}

useGLTF.preload('/3d-assets/dress/scene.gltf');