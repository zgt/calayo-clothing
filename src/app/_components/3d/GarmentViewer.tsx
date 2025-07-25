'use client';

import { Canvas } from '@react-three/fiber';
import { Scene3D } from './Scene3D';
import { useState } from 'react';

interface GarmentViewerProps {
  className?: string;
}

export function GarmentViewer({ className = '' }: GarmentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleCreated = () => {
    setIsLoading(false);
  };

  const handleError = (error: unknown) => {
    console.error('3D Scene Error:', error);
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl border border-emerald-700/10 ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-800/30 rounded-xl mb-4 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-200/70 text-sm">Failed to load 3D model</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl border border-emerald-700/10 overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-800/30 rounded-xl mb-4 flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-emerald-200/70 text-sm">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      <Canvas
        onCreated={handleCreated}
        onError={handleError}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        shadows
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        <Scene3D />
      </Canvas>
      
      {!isLoading && !hasError && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3">
            <h3 className="text-lg font-semibold text-white mb-1">
              Shirt Preview
            </h3>
            <p className="text-emerald-200/70 text-xs">
              Drag to rotate • Auto-rotating
            </p>
          </div>
        </div>
      )}
    </div>
  );
}