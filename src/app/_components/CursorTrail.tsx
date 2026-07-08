"use client";

import { useEffect, useRef } from "react";
import { useMobile } from "~/context/mobile-provider";

export default function CursorTrail() {
  const { isMobile } = useMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const particles = useRef<
    Array<{ x: number; y: number; life: number; element: HTMLDivElement }>
  >([]);

  useEffect(() => {
    if (isMobile) return; // Skip on mobile devices

    let animationFrame: number | null = null;
    let lastSpawnTime = 0;
    let running = false;
    let hasMoved = false; // Set on mousemove; gates spawning so nothing spawns before first move
    const spawnInterval = 50; // Spawn particle every 50ms

    const createParticle = (x: number, y: number) => {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: rgba(0, 255, 127, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 6px rgba(0, 255, 127, 0.6);
        left: ${x - 2}px;
        top: ${y - 2}px;
      `;

      if (containerRef.current) {
        containerRef.current.appendChild(particle);
      }

      return {
        x,
        y,
        life: 1.0,
        element: particle,
      };
    };

    const updateParticles = (timestamp: number) => {
      // Spawn a new particle only if the mouse has moved since the last spawn
      if (hasMoved && timestamp - lastSpawnTime > spawnInterval) {
        const newParticle = createParticle(
          mousePosition.current.x,
          mousePosition.current.y,
        );
        particles.current.push(newParticle);
        lastSpawnTime = timestamp;
        hasMoved = false;
      }

      // Update existing particles
      particles.current = particles.current.filter((particle) => {
        particle.life -= 0.02;

        if (particle.life <= 0) {
          if (particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
          }
          return false;
        }

        // Update particle appearance
        particle.element.style.opacity = particle.life.toString();
        particle.element.style.transform = `scale(${particle.life})`;

        return true;
      });

      // Idle the loop when there is nothing to animate and no pending movement
      if (particles.current.length === 0 && !hasMoved) {
        running = false;
        animationFrame = null;
        return;
      }

      animationFrame = requestAnimationFrame(updateParticles);
    };

    const startLoop = () => {
      if (running) return; // Guard prevents double-starting the loop
      running = true;
      animationFrame = requestAnimationFrame(updateParticles);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      hasMoved = true;
      startLoop();
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", handleMouseMove);

      // Clean up particles
      particles.current.forEach((particle) => {
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
      particles.current = [];
    };
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
    />
  );
}
