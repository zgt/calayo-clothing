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

    let animationFrame: number;
    let lastSpawnTime = 0;
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
      // Spawn new particle if enough time has passed
      if (timestamp - lastSpawnTime > spawnInterval) {
        const newParticle = createParticle(
          mousePosition.current.x,
          mousePosition.current.y,
        );
        particles.current.push(newParticle);
        lastSpawnTime = timestamp;
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

      animationFrame = requestAnimationFrame(updateParticles);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };

    // Start the animation loop
    animationFrame = requestAnimationFrame(updateParticles);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrame);
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
