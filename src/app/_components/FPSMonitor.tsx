"use client";

import { useEffect, useRef } from "react";
import Stats from "stats.js";

/**
 * FPS Monitor component using stats.js
 * Shows FPS, MS (frame time), and MB (memory) panels
 * Only renders in development mode
 */
export function FPSMonitor() {
  const statsRef = useRef<Stats | null>(null);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") return;

    // Initialize stats
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

    // Position it in top-left corner
    stats.dom.style.position = "fixed";
    stats.dom.style.left = "0";
    stats.dom.style.top = "0";
    stats.dom.style.zIndex = "9999";

    document.body.appendChild(stats.dom);
    statsRef.current = stats;

    // Animation loop
    function animate() {
      stats.begin();
      // Your rendering code here (if any)
      stats.end();
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (statsRef.current?.dom.parentNode) {
        document.body.removeChild(statsRef.current.dom);
      }
    };
  }, []);

  return null;
}
