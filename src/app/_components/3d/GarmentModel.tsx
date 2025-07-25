'use client';

import { ShirtModel } from './ShirtModel';
import { DressModel } from './DressModel';
import { JacketModel } from './JacketModel';
import { PantsModel } from './PantsModel';

interface GarmentModelProps {
  garmentType: string;
}

function PlaceholderModel() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial 
          color="#6b7280" 
          roughness={0.8}
          metalness={0.1}
          wireframe
        />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial 
          color="#6b7280" 
          roughness={0.8}
          metalness={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}

export function GarmentModel({ garmentType }: GarmentModelProps) {
  switch (garmentType) {
    case 'shirt':
      return <ShirtModel />;
    case 'dress':
      return <DressModel />;
    case 'jacket':
      return <JacketModel />;
    case 'pants':
      return <PantsModel />;
    case 'skirt':
    case 'other':
    case '':
    default:
      return <PlaceholderModel />;
  }
}