"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { api } from "~/trpc/react";
import SvgLogo, { type SvgLogoRef } from "./SvgLogo";
import AnimatedSubtitle, { type AnimatedSubtitleRef } from "./AnimatedSubtitle";
import { useMobile } from "~/context/mobile-provider";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

gsap.registerPlugin(ScrollTrigger);

export default function CircularPhotoLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
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

  const lenis = useLenis((lenis) => {
    // console.log('lenis in callback', lenis)
  })

  const {
    data: photos,
    isLoading,
    error,
  } = api.instagram.getAllInstagramPhotos.useQuery();

  console.log(photos)

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
          minHeight: "50vh",
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

    const animate = (time: number) => {
      lenisRef.current?.lenis?.raf(time);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    gsap.ticker.add(update);

    return () => gsap.ticker.remove(update);
  }, []);
  //  useEffect(() => {
  //    console.log('lenis', lenisRef.current)
  //    const raf = (time) => {
  //      lenisRef.raf(time);
  //      requestAnimationFrame(raf);
  //      console.log(lenisRef.current)
  //    }
  //    raf();
  //  }, [lenisRef]);

  // useGSAP(() => {
  //   if (!photos || photos.length === 0) return;

  //   ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

  //   const container = containerRef.current;
  //   const scroll = scrollRef.current;
  //   const photoElements = container?.querySelectorAll(".circular-photo");
  //   console.log('test????')


  //   if (container && photoElements) {
  //     const tl = gsap.timeline();

  //     tl.set(container, {
  //       transformOrigin: '-50'
  //     }, "start")
  //       .to(container, {
  //         scale: 5,
  //         scrollTrigger: {
  //           trigger: scroll,
  //           start: 'top top',
  //           end: 'bottom top',
  //           scrub: true
  //         }
  //       }, "start")
  //   }
  // }, []);

  //  GSAP animations for photos
  useEffect(() => {
    if (!photos || photos.length === 0) return;

    // Kill any existing ScrollTrigger instances
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const container = containerRef.current;
    const scroll = scrollRef.current;
    const spin = spinRef.current;
    const gap = gapRef.current;
    const photoElements = container?.querySelectorAll(".circular-photo");

    if (container && photoElements) {
      const tl = gsap.timeline();

      ScrollTrigger.defaults({
        toggleActions: "restart none reverse none"
      })

      tl.set(container, {
        transformOrigin: '-50'
      }, "start")
        .to(container, {
          scale: 2,
          ease: "none",
          y: 1200,
          scrollTrigger: {
            markers: { startColor: "green", endColor: "red", fontSize: "12px" },
            trigger: scroll,
            start: 'top bottom',
            //endTrigger: spin,
            end: '+=500',
            pin: gap,
            scrub: true,
            onLeave: ({ progress, direction, isActive }) => gsap.set(container, { x: 0, y: 1200 })//console.log(progress, direction, isActive, gsap.getProperty(container, "x"), gsap.getProperty(container, "y"))
          }
        }, "start")
        .to(container, {
          rotation: -360,
          ease: "none",
          scrollTrigger: {
            markers: { startColor: "blue", endColor: "white", fontSize: "12px" },
            trigger: spin,
            start: 'bottom bottom',
            end: '+=1000',
            pin: container,
            scrub: true
          }
        }, "start")

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
            className="z-20 flex items-center justify-center "
            style={{
              minHeight: circleConfig.minHeight,
            }}
          >
            {/* Circular photo layout */}
            <div
              id="circle"
              className=""
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

          <div
            ref={scrollRef}
            style={{
              backgroundColor: 'red',
            }}
          >
            test
          </div>
          <div
            ref={gapRef}
            style={{
              backgroundColor: 'red',
            }}

          >
            test
          </div>

          <div
            ref={spinRef}
            style={{
              backgroundColor: 'red',
            }}
          >
            test
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
          <div className="invis">
          </div>
        </div>
      </main>
    </ReactLenis >
  );
}
