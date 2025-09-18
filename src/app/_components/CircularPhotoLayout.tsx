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
import MagneticDiv from "./MagneticDiv";

gsap.registerPlugin(InertiaPlugin);
gsap.registerPlugin(useGSAP);
gsap.registerPlugin(Draggable);
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrambleTextPlugin);

export default function CircularPhotoLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const subsubtitleRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
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
  const [containerRotation, setContainerRotation] = useState(0);

  // Animate photos sequentially after all have loaded
  const animatePhotosSequentially = () => {
    const photoElements = document.querySelectorAll(
      ".circular-photo [data-photo-id]",
    );

    gsap.to(photoElements, {
      opacity: 1,
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.out",
    });
  };
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedImagesCount = useRef(0);
  const [clickedPhotos, setClickedPhotos] = useState<Set<string>>(new Set());

  const {
    data: photos,
    isLoading,
    error,
  } = api.instagram.getAllInstagramPhotos.useQuery();

  const handleImageLoad = () => {
    if (!photos) return;

    const totalPhotos = photos.slice(0, circleConfig.maxPhotos).length;

    // Track individual image loading - increment counter

    loadedImagesCount.current += 1;

    // Check if all images are loaded
    if (loadedImagesCount.current === totalPhotos && !imagesLoaded) {
      setImagesLoaded(true);
      // Small delay to ensure all images are rendered
      setTimeout(() => {
        // Start staggered photo animation first
        animatePhotosSequentially();

        // Start subtitle animation after a brief delay
        setTimeout(() => {
          if (isMobile) {
            mobileSubtitleRef.current?.animateIn();
            logoRef.current?.animateIn();
            gsap.to(subsubtitleRef.current, {
              opacity: 1,
              duration: isMobile ? 1.5 : 2,
              scrambleText: {
                text: "SCROLL TO EXPLORE",
                chars: "▄█▀▌▐",
                revealDelay: 0.3,
                speed: 0.5,
              },
            });
          } else {
            subtitleRef.current?.animateIn();
            logoRef.current?.animateIn();
            gsap.to(subsubtitleRef.current, {
              opacity: 1,
              duration: isMobile ? 1.5 : 2,
              scrambleText: {
                text: "SCROLL TO EXPLORE",
                chars: "▄█▀▌▐",
                revealDelay: 0.3,
                speed: 0.5,
              },
            });
          }
        }, 800);
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

      // Calculate rotation to orient photos toward the center using GSAP's coordinate system
      // GSAP: 0° = top, 90° = right, 180° = bottom, -90° = left
      // Convert from mathematical angle (0 = right) to GSAP angle (0 = top)
      let rotation = (angle * 180) / Math.PI + 90;

      // Normalize to GSAP's -180 to 180 range
      if (rotation > 180) {
        rotation = rotation - 360;
      }

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

      // setContainerRotation(gsap.getProperty(containerRef.current, "rotation"));
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
    const circle = circleRef.current;
    const scroll = scrollRef.current;
    const cover = coverRef.current;
    const logo = logoRef.current;
    const mobileCover = mobileCoverRef.current;
    const spin = spinRef.current;
    const gap = gapRef.current;
    const photoElements = container?.querySelectorAll(".circular-photo");
    const photosToShow = photos.slice(0, circleConfig.maxPhotos);

    if (container && photoElements) {
      // Setup hover animations for photo elements
      photoElements.forEach((photoElement, index) => {
        if (!isMobile) {
          const photoId = photosToShow[index]?.id;
          if (!photoId) return;

          const handleMouseEnter = () => {
            // Only apply hover effect if photo is not clicked
            if (!clickedPhotos.has(photoId)) {
              const originalPosition = photoPositions[index];
              if (!originalPosition) return;

              // Calculate movement in the photo's local "up" direction
              // Since photos are rotated, we need to move relative to their rotation
              const moveDistance = 40; // Distance to move "up" in photo's coordinate system
              const rotationRad = (originalPosition.rotation * Math.PI) / 180;
              const moveX = Math.sin(rotationRad) * moveDistance;
              const moveY = -Math.cos(rotationRad) * moveDistance;

              gsap.to(photoElement, {
                scale: 2,
                x: moveX,
                y: moveY,
                duration: 0.3,
                ease: "power4.inOut",
                transformOrigin: "center",
                zIndex: 1000,
              });
            }
          };

          const handleMouseLeave = () => {
            const originalPosition = photoPositions[index];
            if (!originalPosition) return;

            const isCurrentlyClicked = clickedPhotos.has(photoId);
            if (isCurrentlyClicked) {
              // Photo is clicked, remove from clicked state and return to normal
              setClickedPhotos((prev) => {
                const newSet = new Set(prev);
                newSet.delete(photoId);
                return newSet;
              });
            }

            gsap.to(photoElement, {
              scale: 1,
              x: 0,
              y: 0,
              duration: 0.3,
              rotation: originalPosition.rotation,
              ease: "power2.out",
              transformOrigin: "center",
              zIndex: 1,
            });
          };

          const handleClick = () => {
            const isCurrentlyClicked = clickedPhotos.has(photoId);
            const originalPosition = photoPositions[index];

            const containerRotation = gsap.getProperty(container, "rotation");
            if (!originalPosition) return;

            if (isCurrentlyClicked) {
              // Photo is clicked, return to normal with original rotation
              setClickedPhotos((prev) => {
                const newSet = new Set(prev);
                newSet.delete(photoId);
                return newSet;
              });

              gsap.to(photoElement, {
                scale: 1,
                y: 0,
                rotation: originalPosition.rotation,
                duration: 0.3,
                ease: "power2.out",
                transformOrigin: "center",
              });
            } else {
              // Photo is not clicked, enlarge it and make it level (rotation: 0)
              setClickedPhotos((prev) => {
                const newSet = new Set(prev);
                newSet.add(photoId);
                return newSet;
              });

              if (typeof containerRotation !== "number") {
                return;
              }
              const containerScale = gsap.getProperty(container, "scale");
              if (containerScale !== 1) {
                return;
              } else {
                gsap.to(photoElement, {
                  scale: 5,
                  y: 0,
                  rotation: -containerRotation,
                  duration: 0.3,
                  ease: "power2.out",
                  transformOrigin: "center",
                  zIndex: 1000,
                });
              }
            }
          };

          // Add event listeners
          photoElement.addEventListener("mouseenter", handleMouseEnter);
          photoElement.addEventListener("mouseleave", handleMouseLeave);
          photoElement.addEventListener("click", handleClick);

          // Store cleanup functions on the element
          const element = photoElement as HTMLElement & {
            _cleanupHover?: () => void;
          };
          element._cleanupHover = () => {
            photoElement.removeEventListener("mouseenter", handleMouseEnter);
            photoElement.removeEventListener("mouseleave", handleMouseLeave);
            photoElement.removeEventListener("click", handleClick);
          };
        }
      });
      const tl = gsap.timeline();
      const { width } = screenSize;
      const containerWidth = container.offsetWidth;
      gsap.set(subsubtitleRef.current, { opacity: 0 });

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
      } else if (isMobile && mobileCover && circle) {
        const circleMiddle = circle?.getBoundingClientRect().height / 2;
        gsap.set(mobileCover, { y: circleMiddle });
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
          //.add("spin", ">")
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
      // Cleanup hover event listeners
      if (photoElements) {
        photoElements.forEach((photoElement) => {
          const element = photoElement as HTMLElement & {
            _cleanupHover?: () => void;
          };
          if (element._cleanupHover) {
            element._cleanupHover();
          }
        });
      }

      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [
    photos,
    photoPositions,
    screenSize,
    isMobile,
    clickedPhotos,
    circleConfig.maxPhotos,
  ]);

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
          <h3 className="fixed text-center text-white">{containerRotation}</h3>
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
              ref={circleRef}
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
                      transition: "transform 0.3s ease",
                    }}
                  >
                    {/* <a>{position.rotation}</a> */}
                    {/* <MagneticDiv>*/}
                    <div
                      className="relative overflow-hidden rounded-lg shadow-lg"
                      data-photo-id={photo.id}
                      style={{
                        transition: "transform 0.3s ease",
                        width: "100%",
                        height: "100%",
                        transformOrigin: "center",
                        opacity: 0,
                      }}
                    >
                      <Image
                        src={photo.mediaUrl}
                        alt={`Instagram photo ${photo.id}`}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                        onLoad={() => handleImageLoad()}
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
                    {/* </MagneticDiv>*/}
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
                <div ref={subsubtitleRef} className="mt-8 text-sm opacity-70">
                  SCROLL TO EXPLORE
                </div>
              </div>
            </div>
          )}
          <div className="invis"></div>
        </div>
      </main>
    </ReactLenis>
  );
}
