"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Draggable } from "gsap/Draggable";
import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { api } from "~/trpc/react";
import TextLogo, { type TextLogoRef } from "./TextLogo";
import AnimatedSubtitle, { type AnimatedSubtitleRef } from "./AnimatedSubtitle";
import { useMobile } from "~/context/mobile-provider";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(InertiaPlugin);
gsap.registerPlugin(useGSAP);
gsap.registerPlugin(Draggable);
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrambleTextPlugin);

export default function CircularPhotoLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const mobileCoverRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<TextLogoRef>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<LenisRef>(null);
  const subtitleRef = useRef<AnimatedSubtitleRef>(null);
  const mobileSubtitleRef = useRef<AnimatedSubtitleRef>(null);
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
        // Start subtitle animation
        if (isMobile) {
          mobileSubtitleRef.current?.animateIn();
          logoRef.current?.animateIn();
        } else {
          subtitleRef.current?.animateIn();
          logoRef.current?.animateIn();
        }
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
          radius: minDimension * 0.42,
          photoSize: 70,
          maxPhotos: 12,
          minHeight: "100vh",
        };
      } else {
        // Large mobile
        return {
          radius: minDimension * 0.44,
          photoSize: 80,
          maxPhotos: 12,
          minHeight: "100vh",
        };
      }
    } else if (isTablet) {
      // Tablet
      return {
        radius: minDimension * 0.43,
        photoSize: 90,
        maxPhotos: 16,
        minHeight: "100vh",
      };
    } else if (isDesktop) {
      if (width < 1440) {
        // Desktop
        return {
          radius: minDimension * 0.4,
          photoSize: 100,
          maxPhotos: 20,
          minHeight: "50vh",
        };
      } else {
        // Large desktop
        return {
          radius: minDimension * 0.43,
          photoSize: 110,
          maxPhotos: 24,
          minHeight: "100vh",
        };
      }
    } else {
      // Fallback
      return {
        radius: minDimension * 0.42,
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

      // Calculate rotation to orient photos toward the center
      // When angle is 0 (right side), photo should face left (-90 degrees)
      // When angle is PI/2 (top), photo should be upright (0 degrees)
      // When angle is PI (left side), photo should face right (90 degrees)
      // When angle is 3*PI/2 (bottom), photo should face up (180 degrees)
      const rotation = (angle * 180) / Math.PI + 90;

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

  //  GSAP animations for photos
  useEffect(() => {
    if (!photos || photos.length === 0) return;

    // Kill any existing ScrollTrigger instances
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const container = containerRef.current;
    const scroll = scrollRef.current;
    const cover = coverRef.current;
    const logo = logoRef.current;
    const mobileCover = mobileCoverRef.current;
    const spin = spinRef.current;
    const gap = gapRef.current;
    const photoElements = container?.querySelectorAll(".circular-photo");

    if (container && photoElements) {
      const tl = gsap.timeline();
      const { width } = screenSize;
      const containerWidth = container.offsetWidth;

      if (!isMobile) {
        Draggable.create(container, {
          type: "rotation",
          inertia: true,
          snap: function (value) {
            return Math.round(value / photos.length) * photos.length;
          },
        });
      }
      ScrollTrigger.defaults({
        toggleActions: "restart none reverse none",
      });

      tl.set(
        container,
        {
          //transformOrigin: '-50'
          x: width / 2 - containerWidth / 2,
          y: isMobile ? 0 : 0,
        },
        "start",
      );

      // Only animate cover on non-mobile devices since mobile has separate logo layout
      if (!isMobile && cover) {
        tl.to(
          cover,
          {
            y: -1000,
            scrollTrigger: {
              trigger: scroll,
              start: "top bottom",
              end: "+=500",
              scrub: true,
            },
          },
          "start",
        );
      } else if (isMobile && mobileCover) {
        tl.to(
          mobileCover,
          {
            y: -1000,
            scrollTrigger: {
              trigger: scroll,
              start: "top bottom",
              end: "+=500",
              scrub: true,
            },
          },
          "start",
        ).to(logo, {
          scale: 1.5,
          y: -150,
          scrollTrigger: {
            trigger: scroll,
            start: "top bottom",
            end: "+=500",
            scrub: true,
          },
        });
      }
      if (!isMobile && container) {
        tl.to(
          container,
          {
            scale: 2,
            ease: "none",
            y: 800,
            scrollTrigger: {
              trigger: scroll,
              start: "top bottom",
              //endTrigger: spin,
              end: "+=500",
              pin: gap,
              scrub: true,
            },
          },
          "start",
        )
          .add("spin", ">")
          .to(
            container,
            {
              rotation: -360,
              ease: "none",
              scrollTrigger: {
                trigger: spin,
                start: "bottom bottom",
                end: "+=1000",
                pin: true,
                scrub: true,
              },
            },
            "spin",
          );
      } else if (isMobile && container) {
        tl.to(
          container,
          {
            scale: 3,
            ease: "none",
            y: 400,
            scrollTrigger: {
              trigger: scroll,
              start: "top bottom",
              //endTrigger: spin,
              end: "+=500",
              pin: gap,
              scrub: true,
            },
          },
          "start",
        )
          .add("spin", ">")
          .to(
            container,
            {
              rotation: -360,
              ease: "none",
              scrollTrigger: {
                trigger: spin,
                start: "bottom bottom",
                end: "+=1000",
                pin: true,
                scrub: true,
              },
            },
            "spin",
          );
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [photos, photoPositions, screenSize, isMobile]);

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
    <ReactLenis
      root
      options={{
        autoRaf: false,
        smoothWheel: true,
        duration: 1.5,
      }}
      ref={lenisRef}
    >
      <main className="relative min-h-screen w-full">
        <div className="content">
          {/* Mobile: Logo and subtitle above circle */}
          {isMobile && (
            <div className="pointer-events-none fixed inset-x-0 top-10 z-30 flex flex-col items-center justify-start pt-16">
              <div className="px-4 text-center text-white">
                <div className="mb-4">
                  <TextLogo ref={logoRef} fontSize="2.5rem" letterSpacing="0" />
                </div>
                <div ref={mobileCoverRef}>
                  <AnimatedSubtitle
                    ref={mobileSubtitleRef}
                    text="Intentionally yours"
                    className="font-light"
                    style={{
                      fontSize: "1.25rem",
                    }}
                  />
                  <div className="mt-4 text-sm opacity-70">
                    SCROLL TO EXPLORE
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className={`fixed z-20 flex items-center justify-center ${isMobile ? "top-8" : ""}`}
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
                      transformOrigin: "center",
                    }}
                  >
                    <div
                      className="relative overflow-hidden rounded-lg shadow-lg"
                      style={{
                        transition: "transform 0.3s ease",
                        width: "100%",
                        height: "100%",
                        transformOrigin: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform =
                            "scale(1.8) translate(0, -20px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                      onTouchStart={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform =
                            "scale(2) translate(0, -20px)";
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                    >
                      <Image
                        src={photo.mediaUrl}
                        alt={`Instagram photo ${photo.id}`}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                        onLoad={handleImageLoad}
                        // onMouseEnter={(e) => {
                        //   if (!isMobile) {
                        //     e.currentTarget.style.transform = "scale(1.1)";
                        //   }
                        // }}
                        // onMouseLeave={(e) => {
                        //   if (!isMobile) {
                        //     e.currentTarget.style.transform = "scale(1)";
                        //   }
                        // }}
                        priority={index < 8}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ height: 1000 }} />
          <div
            ref={scrollRef}
            style={{
              top: "500px",
            }}
          ></div>
          <div ref={gapRef} style={{}}></div>

          <div ref={spinRef} style={{}}></div>

          {/* Desktop/Tablet: Center overlay with logo and subtitle */}
          {!isMobile && (
            <div
              ref={coverRef}
              className="cover pointer-events-none fixed inset-0 z-10 flex items-center justify-center"
            >
              <div className="px-4 text-center text-white">
                <div className="mb-4">
                  <TextLogo ref={logoRef} fontSize="6rem" letterSpacing="0" />
                </div>
                <AnimatedSubtitle
                  ref={subtitleRef}
                  text="Intentionally yours"
                  className="font-light"
                  style={{
                    fontSize: "2rem",
                  }}
                />
                <div className="mt-8 text-sm opacity-70">SCROLL TO EXPLORE</div>
              </div>
            </div>
          )}
          <div className="invis"></div>
        </div>
      </main>
    </ReactLenis>
  );
}
