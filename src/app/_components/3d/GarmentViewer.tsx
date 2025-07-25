'use client';

import { Canvas } from '@react-three/fiber';
import { Scene3D } from './Scene3D';
import { useState, useEffect } from 'react';

// Hook to detect mobile and performance capabilities
const useDeviceCapabilities = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  
  useEffect(() => {
    const checkCapabilities = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      
      // Detect low-end devices
      const isLowEnd = (
        navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
      ) || (
        (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2
      ) || (
        navigator.userAgent.includes('Mobile') && width < 768
      );
      
      setIsLowEndDevice(isLowEnd);
    };
    
    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);
  
  return { isMobile, isLowEndDevice };
};

interface GarmentViewerProps {
  className?: string;
  garmentType?: string;
  forceFallback?: boolean; // Force 2D fallback
  disableInteraction?: boolean; // Disable orbit controls for mobile
}

export function GarmentViewer({ 
  className = '', 
  garmentType = '', 
  forceFallback = false,
  disableInteraction = false 
}: GarmentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [use3D, setUse3D] = useState(true);
  const { isMobile, isLowEndDevice } = useDeviceCapabilities();
  
  // Determine if we should use 3D or fallback
  useEffect(() => {
    if (forceFallback || isLowEndDevice) {
      setUse3D(false);
      setIsLoading(false);
    }
  }, [forceFallback, isLowEndDevice]);
  
  // Fallback images for different garment types
  const getFallbackImage = (type: string) => {
    const images: Record<string, string> = {
      shirt: '/images/garments/shirt-preview.jpg',
      jacket: '/images/garments/jacket-preview.jpg', 
      pants: '/images/garments/pants-preview.jpg',
      dress: '/images/garments/dress-preview.jpg',
      skirt: '/images/garments/skirt-preview.jpg',
      other: '/images/garments/generic-preview.jpg'
    };
    return images[type] || images.other;
  };

  const handleCreated = () => {
    setIsLoading(false);
  };

  const handleError = (error: unknown) => {
    console.error('3D Scene Error:', error);
    setHasError(true);
    setIsLoading(false);
  };

  // Render 2D fallback if 3D is disabled or has error
  if (!use3D || hasError) {
    return (
      <div className={`relative bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl border border-emerald-700/10 overflow-hidden ${className}`}>
        {garmentType ? (
          <div className="relative w-full h-full">
            <img
              src={getFallbackImage(garmentType)}
              alt={`${garmentType} preview`}
              className="w-full h-full object-cover object-center"
              onError={() => {
                // If image fails to load, show placeholder
                const img = document.createElement('div');
                img.className = 'w-full h-full flex items-center justify-center bg-emerald-800/20';
                img.innerHTML = `
                  <div class="text-center p-8">
                    <div class="w-16 h-16 bg-emerald-700/30 rounded-xl mb-4 flex items-center justify-center mx-auto">
                      <svg class="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <p class="text-emerald-200/70 text-sm">${garmentType.charAt(0).toUpperCase() + garmentType.slice(1)} Preview</p>
                  </div>
                `;
              }}
            />
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {garmentType.charAt(0).toUpperCase() + garmentType.slice(1)} Preview
                </h3>
                {(isLowEndDevice || hasError) && (
                  <p className="text-emerald-200/70 text-xs">
                    {hasError ? '3D preview unavailable' : 'Optimized for your device'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-emerald-700/30 rounded-xl mb-4 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <p className="text-emerald-200/70 text-sm">Garment Preview</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 rounded-2xl shadow-2xl border border-emerald-700/10 overflow-hidden ${className}`}>
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
          antialias: !isMobile, // Disable antialiasing on mobile for performance
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          premultipliedAlpha: false,
        }}
        shadows={!isMobile} // Disable shadows on mobile
        className="w-full h-full"
        dpr={isMobile ? [1, 2] : [1, 2]} // Limit device pixel ratio on mobile
      >
        <Scene3D 
          garmentType={garmentType} 
          isMobile={isMobile}
          disableInteraction={disableInteraction || isMobile}
        />
        
      </Canvas>
      
      
      {/*  */}
    </div>
  );
}