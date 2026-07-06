"use client";

import { Canvas } from "@react-three/fiber";
import { Scene3D } from "./Scene3D";
import { GarmentSilhouette } from "./GarmentSilhouette";
import { useState, useEffect } from "react";
import { useMobile } from "~/context/mobile-provider";
import {
  DEFAULT_GARMENT_COLOR,
  getFabricById,
} from "~/lib/commission-design";

// Hook to detect device performance capabilities
const useDeviceCapabilities = () => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const { isMobile } = useMobile();

  useEffect(() => {
    const checkCapabilities = () => {
      // Detect low-end devices
      const deviceMemory =
        "deviceMemory" in navigator
          ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
          : undefined;
      const isLowEnd =
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
        (deviceMemory !== undefined && deviceMemory <= 2) ||
        (navigator.userAgent.includes("Mobile") && isMobile);

      setIsLowEndDevice(Boolean(isLowEnd));
    };

    checkCapabilities();
  }, [isMobile]);

  return { isMobile, isLowEndDevice };
};

interface GarmentViewerProps {
  className?: string;
  garmentType?: string;
  colorHex?: string | null; // Chosen design color, live-applied to the model
  fabric?: string | null; // Fabric preset id, drives material params
  forceFallback?: boolean; // Force 2D fallback
  disableInteraction?: boolean; // Disable orbit controls for mobile
}

export function GarmentViewer({
  className = "",
  garmentType = "",
  colorHex = null,
  fabric = null,
  forceFallback = false,
  disableInteraction = false,
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

  const handleCreated = () => {
    setIsLoading(false);
  };

  const handleError = (error: unknown) => {
    console.error("3D Scene Error:", error);
    setHasError(true);
    setIsLoading(false);
  };

  // Render 2D fallback if 3D is disabled or has error. The chosen design
  // color still reads here via the tinted silhouette and color chip.
  if (!use3D || hasError) {
    const displayColor = colorHex ?? DEFAULT_GARMENT_COLOR;
    const fabricLabel = getFabricById(fabric)?.label;

    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-emerald-700/10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 shadow-2xl backdrop-blur-xs ${className}`}
      >
        {garmentType ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <GarmentSilhouette
              garmentType={garmentType}
              color={displayColor}
              className="h-3/5 max-h-64 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
            />

            <div className="absolute right-4 bottom-4 left-4">
              <div className="flex items-center justify-between rounded-lg bg-black/20 p-3 backdrop-blur-sm">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {garmentType.charAt(0).toUpperCase() +
                      garmentType.slice(1)}{" "}
                    Preview
                  </h3>
                  {fabricLabel && (
                    <p className="text-xs text-emerald-200/70">{fabricLabel}</p>
                  )}
                  {(isLowEndDevice || hasError) && (
                    <p className="text-xs text-emerald-200/70">
                      {hasError
                        ? "3D preview unavailable"
                        : "Optimized for your device"}
                    </p>
                  )}
                </div>
                {colorHex && (
                  <span
                    className="h-8 w-8 flex-shrink-0 rounded-full border border-white/30 shadow-inner"
                    style={{ backgroundColor: displayColor }}
                    aria-label={`Selected color ${displayColor}`}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-700/30">
                <svg
                  className="h-8 w-8 text-emerald-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <p className="text-sm text-emerald-200/70">Garment Preview</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-emerald-700/10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 shadow-2xl ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-emerald-950/30">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-800/30">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent"></div>
            </div>
            <p className="text-sm text-emerald-200/70">Loading 3D model...</p>
          </div>
        </div>
      )}

      <Canvas
        onCreated={handleCreated}
        onError={handleError}
        gl={{
          antialias: !isMobile, // Disable antialiasing on mobile for performance
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance",
          premultipliedAlpha: false,
        }}
        shadows={!isMobile} // Disable shadows on mobile
        className="h-full w-full"
        dpr={isMobile ? [1, 2] : [1, 2]} // Limit device pixel ratio on mobile
      >
        <Scene3D
          garmentType={garmentType}
          colorHex={colorHex}
          fabric={fabric}
          disableInteraction={disableInteraction || isMobile}
        />
      </Canvas>

      {/*  */}
    </div>
  );
}
