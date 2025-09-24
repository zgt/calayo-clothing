"use client";

import { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useMobile } from "~/context/mobile-provider";

export type GarmentType =
  | "shirt"
  | "jacket"
  | "pants"
  | "dress"
  | "skirt"
  | "other";

export type GarmentStatus = "idle" | "loading" | "ready" | "error";

type StatusMap = Record<GarmentType, GarmentStatus>;

const emitter = new EventTarget();
const CHANGE_EVENT = "change";

// Map garment types to GLTF paths (null when no 3D model is available)
const GLTF_PATHS: Record<GarmentType, string | null> = {
  shirt: "/3d-assets/shirt/scene.gltf",
  jacket: "/3d-assets/jacket/scene.gltf",
  pants: "/3d-assets/pants/scene.gltf",
  dress: "/3d-assets/dress/scene.gltf",
  skirt: null, // no dedicated 3D model; allow selection
  other: null, // generic/placeholder; allow selection
};

// Initial statuses: no-model garments are considered ready from the start
const statusMap: StatusMap = {
  shirt: "idle",
  jacket: "idle",
  pants: "idle",
  dress: "idle",
  skirt: "ready",
  other: "ready",
};

let preloadStarted = false;
const loader = new GLTFLoader();

function emitChange() {
  emitter.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getGarmentStatuses(): StatusMap {
  return { ...statusMap };
}

function setStatus(garment: GarmentType, status: GarmentStatus) {
  if (statusMap[garment] !== status) {
    statusMap[garment] = status;
    emitChange();
  }
}

async function preloadGarment(garment: GarmentType) {
  const path = GLTF_PATHS[garment];
  if (!path) return; // treat as ready via initial state
  if (statusMap[garment] === "ready" || statusMap[garment] === "error") return;
  if (statusMap[garment] !== "loading") setStatus(garment, "loading");

  try {
    // loadAsync returns a Promise in modern three/examples GLTFLoader
    await loader.loadAsync(path);
    setStatus(garment, "ready");
  } catch (e) {
    console.error(
      `[garments-preloader] Failed to load GLTF for ${garment}:`,
      e,
    );
    // On error, we mark as error but downstream logic will allow selection and fall back to 2D
    setStatus(garment, "error");
  }
}

export function preloadAllGarments() {
  if (preloadStarted) return;
  preloadStarted = true;
  if (typeof window === "undefined") return;

  void (async () => {
    const garments: GarmentType[] = ["shirt", "jacket", "pants", "dress"]; // only those with GLTFs
    await Promise.all(garments.map((g) => preloadGarment(g)));
  })();
}

export function useGarmentModelReadiness(): StatusMap {
  const [snapshot, setSnapshot] = useState<StatusMap>(() =>
    getGarmentStatuses(),
  );

  useEffect(() => {
    const handler: EventListener = () => setSnapshot(getGarmentStatuses());
    emitter.addEventListener(CHANGE_EVENT, handler);
    return () => emitter.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  return snapshot;
}

// Low-end device detection (aligns with GarmentViewer)
export function useIsLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const { isMobile } = useMobile();

  useEffect(() => {
    const detect = () => {
      try {
        const nav =
          typeof navigator !== "undefined" ? navigator : ({} as Navigator);
        const deviceMemory =
          typeof (nav as { deviceMemory?: number }).deviceMemory === "number"
            ? (nav as { deviceMemory?: number }).deviceMemory
            : undefined;
        const cores =
          typeof nav.hardwareConcurrency === "number"
            ? nav.hardwareConcurrency
            : undefined;
        const uaMobile =
          typeof nav.userAgent === "string" && nav.userAgent.includes("Mobile");
        const low =
          (cores !== undefined && cores <= 2) ||
          (deviceMemory !== undefined && deviceMemory <= 2) ||
          (uaMobile && isMobile);
        setIsLowEnd(Boolean(low));
      } catch {
        setIsLowEnd(false);
      }
    };
    detect();
  }, [isMobile]);

  return isLowEnd;
}
