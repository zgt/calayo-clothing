"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { api } from "~/trpc/react";
import SvgLogo, { type SvgLogoRef } from "./SvgLogo";
import AnimatedSubtitle, { type AnimatedSubtitleRef } from "./AnimatedSubtitle";
import { useMobile } from "~/context/mobile-provider";

gsap.registerPlugin(ScrollTrigger);

export default function CircularPhotoLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<LenisRef>(null);
  const logoRef = useRef<SvgLogoRef>(null);
  const subtitleRef = useRef<AnimatedSubtitleRef>(null);
  const { isMobile, isTablet, isDesktop } = useMobile();
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedImagesCount = useRef(0);

  const {
    data: photos,
    isLoading,
    error,
  } = api.instagram.getAllInstagramPhotos.useQuery();

  const handleImageLoad = () => {
    if (!photos) return;

    loadedImagesCount.current += 1;

    // Check if first two images are loaded
    if (loadedImagesCount.current >= 2 && !imagesLoaded) {
      setImagesLoaded(true);
      // Small delay to ensure all images are rendered
      setTimeout(() => {
        logoRef.current?.animateIn();
        // Start subtitle animation slightly after logo animation begins
        setTimeout(() => {
          subtitleRef.current?.animateIn();
        }, 500);
      }, 100);
    }
  };

  // Responsive circle configuration
  const circleConfig = useMemo(() => {
    const { width, height } = screenSize;
    const minDimension = Math.min(width, height);

    if (isMobile) {
      if (width < 480) {
        // Small mobile
        return {
          radius: minDimension * 0.32,
          photoSize: 70,
          maxPhotos: 10,
          minHeight: "100vh",
        };
      } else {
        // Large mobile
        return {
          radius: minDimension * 0.35,
          photoSize: 80,
          maxPhotos: 12,
          minHeight: "100vh",
        };
      }
    } else if (isTablet) {
      // Tablet
      return {
        radius: minDimension * 0.38,
        photoSize: 90,
        maxPhotos: 16,
        minHeight: "100vh",
      };
    } else if (isDesktop) {
      if (width < 1440) {
        // Desktop
        return {
          radius: minDimension * 0.35,
          photoSize: 100,
          maxPhotos: 20,
          minHeight: "100vh",
        };
      } else {
        // Large desktop
        return {
          radius: minDimension * 0.38,
          photoSize: 110,
          maxPhotos: 24,
          minHeight: "100vh",
        };
      }
    } else {
      // Fallback
      return {
        radius: minDimension * 0.35,
        photoSize: 100,
        maxPhotos: 20,
        minHeight: "100vh",
      };
    }
  }, [screenSize, isMobile, isTablet, isDesktop]);

  // Calculate circular positions for photos
  const photoPositions = useMemo(() => {
    if (!photos || photos.length === 0) return [];

    const photosToShow = photos.slice(0, circleConfig.maxPhotos);
    const totalPhotos = photosToShow.length;
    const { radius } = circleConfig;

    return photosToShow.map((_, index) => {
      // Calculate angle for even distribution around the circle
      const angle = (index / totalPhotos) * 2 * Math.PI;
      
      // Calculate x, y positions using trigonometry
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Add some random rotation for visual interest (between -15 and 15 degrees)
      const rotation = (Math.random() - 0.5) * 30;

      return {
        x,
        y,
        rotation,
        angle,
      };
    });
  }, [photos, circleConfig]);

  // Handle screen resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        if (
          Math.abs(newWidth - screenSize.width) > 10 ||
          Math.abs(newHeight - screenSize.height) > 10
        ) {
          setScreenSize({
            width: newWidth,
            height: newHeight,
          });
        }
      }, 150);
    };

    const handleOrientationChange = () => {
      setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [screenSize.width, screenSize.height]);

  // Lenis integration
  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => gsap.ticker.remove(update);
  }, []);

  // GSAP animations for photos
  useEffect(() => {
    if (!photos || photos.length === 0) return;

    // Kill any existing ScrollTrigger instances
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const container = containerRef.current;
    const photoElements = container?.querySelectorAll(".circular-photo");

    if (container && photoElements) {
      photoElements.forEach((photo, index) => {
        // Set initial state
        gsap.set(photo, {
          scale: 0.8,
          opacity: 0.7,
        });

        // Create animation timeline
        gsap.to(photo, {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: photo,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              // Add subtle rotation based on scroll progress
              const progress = self.progress;
              const rotationOffset = progress * 10 - 5; // -5 to +5 degrees
              const currentRotation = photoPositions[index]?.rotation ?? 0;
              
              gsap.set(photo, {
                rotation: currentRotation + rotationOffset,
              });
            },
          },
        });

        // Add entrance animation with staggered delay
        gsap.fromTo(photo, 
          {
            scale: 0,
            rotation: (photoPositions[index]?.rotation ?? 0) + 180,
          },
          {
            scale: 0.8,
            rotation: photoPositions[index]?.rotation ?? 0,
            duration: 0.8,
            delay: index * 0.05, // Stagger the entrance
            ease: "back.out(1.7)",
          }
        );
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [photos, photoPositions, screenSize]);

  if (isLoading) {
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center"></main>
    );
  }

  if (error || !photos) {
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center">
        <div className="text-white">Error loading photos</div>
      </main>
    );
  }

  const photosToShow = photos.slice(0, circleConfig.maxPhotos);

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      <main className="relative min-h-screen w-full">
        <div className="content">
          <div
            ref={containerRef}
            className="relative z-20 flex items-center justify-center min-h-screen"
            style={{
              minHeight: circleConfig.minHeight,
            }}
          >
            {/* Circular photo layout */}
            <div 
              className="relative"
              style={{
                width: circleConfig.radius * 2 + circleConfig.photoSize,
                height: circleConfig.radius * 2 + circleConfig.photoSize,
              }}
            >
              {photosToShow.map((photo, index) => {
                const position = photoPositions[index];
                if (!position) return null;

                return (
                  <div
                    key={photo.id}
                    className="circular-photo absolute"
                    style={{
                      left: `calc(50% + ${position.x}px)`,
                      top: `calc(50% + ${position.y}px)`,
                      width: `${circleConfig.photoSize}px`,
                      height: `${circleConfig.photoSize}px`,
                      transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
                      transformOrigin: 'center',
                    }}
                  >
                    <div
                      className="relative overflow-hidden rounded-lg shadow-lg"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <Image
                        src={photo.mediaUrl}
                        alt={`Instagram photo ${photo.id}`}
                        fill
                        style={{
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onLoad={handleImageLoad}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.transform = "scale(1.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.transform = "scale(1)";
                          }
                        }}
                        onTouchStart={(e) => {
                          e.currentTarget.style.transform = "scale(0.95)";
                        }}
                        onTouchEnd={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                        priority={index < 8}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center overlay with logo and subtitle */}
          <div className="cover pointer-events-none fixed inset-0 z-10 flex items-center justify-center">
            <div className="px-4 text-center text-white">
              <div className="mb-4">
                <SvgLogo
                  ref={logoRef}
                  fontSize={isMobile ? "2.5rem" : "6rem"}
                  letterSpacing="0"
                />
              </div>
              <AnimatedSubtitle
                ref={subtitleRef}
                text="Intentionally yours"
                className="font-light"
                style={{
                  fontSize: isMobile ? "1.25rem" : "2rem",
                }}
              />
              <div className="mt-8 text-sm opacity-70">
                SCROLL TO EXPLORE
              </div>
            </div>
          </div>
        </div>
      </main>
    </ReactLenis>
  );
}