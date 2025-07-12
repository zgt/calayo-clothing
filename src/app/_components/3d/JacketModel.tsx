'use client';

import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

export function JacketModel() {
  const gltf = useGLTF('/3d-assets/jacket/scene.gltf');
  const { nodes } = gltf;
  const jacketRef = useRef<THREE.Group>(null);

  // Create grey material once
  const greyMaterial = new THREE.MeshStandardMaterial({
    color: 'grey-300', // grey-400
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

  // Get all available mesh nodes from the jacket model
  const meshNodes = Object.keys(nodes)
    .map(name => getMeshNode(name))
    .filter((node): node is THREE.Mesh => node !== null);

  return (
    <group ref={jacketRef} dispose={null} rotation={[Math.PI / 180 * 270, 0, 0]} position={[0, -0.3, 0]} scale={.07}>
      {meshNodes.map((mesh, index) => {
        const geometry = getGeometry(mesh);
        return geometry ? (
          <mesh
            key={`jacket-mesh-${index}`}
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

useGLTF.preload('/3d-assets/jacket/scene.gltf');