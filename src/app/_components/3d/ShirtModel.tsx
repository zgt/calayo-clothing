'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect, useRef} from 'react';
import * as THREE from 'three';

export function ShirtModel() {
  const gltf = useGLTF('/3d-assets/shirt/scene.gltf');
  const { nodes } = gltf;
  const shirtRef = useRef<THREE.Group>(null);

  // Create grey material once
  const greyMaterial = new THREE.MeshStandardMaterial({
    color: 'grey-200', // grey-500
    roughness: 0.8,
    metalness: 0.1,
  });

  // Get mesh nodes safely
  const getMeshNode = (name: string): THREE.Mesh | null => {
    const node = nodes[name];
    return node instanceof THREE.Mesh ? node : null;
  };
  const object2 = getMeshNode('Object_2');
  const object3 = getMeshNode('Object_3');
  const object4 = getMeshNode('Object_4');
  const object5 = getMeshNode('Object_5');

  // Helper to safely get geometry
  const getGeometry = (mesh: THREE.Mesh | null): THREE.BufferGeometry | undefined => {
    if (mesh && mesh.geometry instanceof THREE.BufferGeometry) {
      return mesh.geometry;
    }
    return undefined;
  };

  return (
    <group ref={shirtRef} dispose={null} rotation={[Math.PI / 180 * 270, 0, 0]} position={[0, -1.1, 0]}>
      {object2 && getGeometry(object2) && (
        <mesh 
          geometry={getGeometry(object2)} 
          material={greyMaterial}
          castShadow 
          receiveShadow 
        />
      )}
      {object3 && getGeometry(object3) && (
        <mesh 
          geometry={getGeometry(object3)} 
          material={greyMaterial}
          castShadow 
          receiveShadow 
        />
      )}
      {object4 && getGeometry(object4) && (
        <mesh 
          geometry={getGeometry(object4)} 
          material={greyMaterial}
          castShadow 
          receiveShadow 
        />
      )}
      {object5 && getGeometry(object5) && (
        <mesh 
          geometry={getGeometry(object5)} 
          material={greyMaterial}
          castShadow 
          receiveShadow 
        />
      )}
    </group>
  );
}

useGLTF.preload('/3d-assets/shirt/scene.gltf');