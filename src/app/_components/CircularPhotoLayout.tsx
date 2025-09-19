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
//import MagneticDiv from "./MagneticDiv";

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
  const lightRaysRef = useRef<HTMLDivElement>(null);
  const progressRingRef = useRef<SVGCircleElement>(null);
  const cursorTrailRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet, isDesktop } = useMobile();

  // Cursor trail state
  const mousePosition = useRef({ x: 0, y: 0 });
  const particles = useRef<
    Array<{ x: number; y: number; life: number; element: HTMLDivElement }>
  >([]);

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

    // Update progress ring with loading progress
    if (progressRingRef.current) {
      const progress = loadedImagesCount.current / totalPhotos;
      const radius = circleConfig.radius + circleConfig.photoSize * 0.75;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference * (1 - progress);

      gsap.to(progressRingRef.current, {
        strokeDashoffset: offset,
        duration: 0.3,
        ease: "power2.out",
      });
    }

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

          // Fade in light rays and progress ring after subtitle animation starts
          setTimeout(() => {
            if (lightRaysRef.current) {
              gsap.to(lightRaysRef.current, {
                opacity: 1,
                duration: 2,
                ease: "power2.out",
              });
            }

            // Show progress ring but keep it hidden until scroll starts
            if (progressRingRef.current) {
              const progressRingSvg = progressRingRef.current.closest("svg");
              if (progressRingSvg) {
                // Keep it hidden initially, will show on scroll trigger
                gsap.set(progressRingSvg, { opacity: 0 });
              }
            }
          }, 400);
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
          name: "small-mobile",
          radius: minDimension * 0.42,
          photoSize: 70,
          maxPhotos: 12,
          minHeight: "100vh",
        };
      } else {
        // Large mobile
        return {
          name: "large-mobile",
          radius: minDimension * 0.44,
          photoSize: 80,
          maxPhotos: 12,
          minHeight: "100vh",
        };
      }
    } else if (isTablet) {
      // Tablet
      return {
        name: "tablet",
        radius: minDimension * 0.43,
        photoSize: 90,
        maxPhotos: 16,
        minHeight: "100vh",
      };
    } else if (isDesktop) {
      if (width < 1440) {
        // Desktop
        return {
          name: "desktop",
          radius: minDimension * 0.4,
          photoSize: 100,
          maxPhotos: 20,
          minHeight: "50vh",
        };
      } else {
        // Large desktop
        return {
          name: "large-desktop",
          radius: minDimension * 0.4,
          photoSize: 121,
          maxPhotos: 24,
          minHeight: "100vh",
        };
      }
    } else {
      // Fallback
      return {
        name: "fallback",
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

  // Cursor trail effect
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

      if (cursorTrailRef.current) {
        cursorTrailRef.current.appendChild(particle);
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
    const lightRays = lightRaysRef.current;
    const progressRing = progressRingRef.current;
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

              const photoContainer =
                photoElement.querySelector(".photo-container")!;

              gsap.to(photoElement, {
                scale: 1.8,
                x: moveX,
                y: moveY,
                duration: 0.3,
                ease: "power4.inOut",
                transformOrigin: "center",
                zIndex: 1000,
              });

              // Add pulsing glow effect
              if (photoContainer) {
                gsap.to(photoContainer, {
                  boxShadow: "0 0 10px 3px rgba(0, 255, 127, 0.6)",
                  duration: 0.3,
                  ease: "power2.inOut",
                });

                // Start pulsing animation
                gsap.to(photoContainer, {
                  boxShadow: "0 0 15px 5px rgba(0, 255, 127, 0.8)",
                  duration: 2,
                  ease: "sine.inOut",
                  repeat: -1,
                  yoyo: true,
                });
              }

              // Cascade effect: animate neighboring photos
              const totalPhotos = photosToShow.length;
              photoElements?.forEach((neighborElement, neighborIndex) => {
                if (neighborIndex === index) return; // Skip the hovered photo itself

                const neighborPhotoId = photosToShow[neighborIndex]?.id;
                if (!neighborPhotoId || clickedPhotos.has(neighborPhotoId))
                  return;

                // Calculate distance between photos (accounting for circular nature)
                const distance1 = Math.abs(neighborIndex - index);
                const distance2 = totalPhotos - distance1;
                const circularDistance = Math.min(distance1, distance2);

                // Only affect immediate neighbors (1-2 positions away)
                if (circularDistance <= 2) {
                  const intensity = circularDistance === 1 ? 0.5 : 0.25;
                  const neighborContainer =
                    neighborElement.querySelector(".photo-container");

                  // Subtle scale and glow for neighbors
                  gsap.to(neighborElement, {
                    scale: 1 + 0.3 * intensity,
                    duration: 0.3,
                    ease: "power2.inOut",
                  });

                  if (neighborContainer) {
                    gsap.to(neighborContainer, {
                      boxShadow: `0 0 ${5 * intensity}px 2px rgba(0, 255, 127, ${0.3 * intensity})`,
                      duration: 0.3,
                      ease: "power2.inOut",
                    });
                  }
                }
              });
            }
          };

          const handleMouseLeave = () => {
            const originalPosition = photoPositions[index];
            if (!originalPosition) return;

            const isCurrentlyClicked = clickedPhotos.has(photoId);
            if (isCurrentlyClicked) {
              return;
            }

            const photoContainer =
              photoElement.querySelector(".photo-container")!;

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

            // Remove glow effect
            if (photoContainer) {
              gsap.killTweensOf(photoContainer); // Stop any ongoing glow animations
              gsap.to(photoContainer, {
                boxShadow: "0 0 0 0 rgba(0, 255, 127, 0)",
                duration: 0.3,
                ease: "power2.out",
              });
            }

            // Reset cascade effect on neighboring photos
            const totalPhotos = photosToShow.length;
            photoElements?.forEach((neighborElement, neighborIndex) => {
              if (neighborIndex === index) return; // Skip the main photo

              const neighborPhotoId = photosToShow[neighborIndex]?.id;
              if (!neighborPhotoId || clickedPhotos.has(neighborPhotoId))
                return;

              // Calculate distance between photos (accounting for circular nature)
              const distance1 = Math.abs(neighborIndex - index);
              const distance2 = totalPhotos - distance1;
              const circularDistance = Math.min(distance1, distance2);

              // Reset neighbors that were affected
              if (circularDistance <= 2) {
                const neighborContainer =
                  neighborElement.querySelector(".photo-container");
                const neighborOriginalPosition = photoPositions[neighborIndex];

                gsap.to(neighborElement, {
                  scale: 1,
                  duration: 0.3,
                  rotation: neighborOriginalPosition?.rotation || 0,
                  ease: "power2.out",
                });

                if (neighborContainer) {
                  gsap.killTweensOf(neighborContainer);
                  gsap.to(neighborContainer, {
                    boxShadow: "0 0 0 0 rgba(0, 255, 127, 0)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }
              }
            });
          };

          const handleClick = () => {
            const isCurrentlyClicked = clickedPhotos.has(photoId);
            const originalPosition = photoPositions[index];
            if (!originalPosition) return;

            const containerScale = gsap.getProperty(container, "scale");
            if (containerScale !== 1) {
              return;
            }
            const containerRotation = gsap.getProperty(container, "rotation");

            if (isCurrentlyClicked) {
              // Photo is clicked, return to normal with original rotation
              setClickedPhotos((prev) => {
                const newSet = new Set(prev);
                newSet.delete(photoId);

                // Resume breathing animation if no photos are clicked
                if (newSet.size === 0 && circle) {
                  const breathingAnim = (circle as any)._breathingAnimation;
                  if (breathingAnim) {
                    breathingAnim.play();
                  }
                }

                return newSet;
              });

              gsap.to(photoElement, {
                scale: 1,
                y: 0,
                rotation: originalPosition.rotation,
                duration: 0.3,
                ease: "power4.out",
                transformOrigin: "center",
              });
            } else {
              // Photo is not clicked, enlarge it and make it level (rotation: 0)
              setClickedPhotos((prev) => {
                const newSet = new Set(prev);
                newSet.add(photoId);

                // Pause breathing animation when any photo is clicked
                if (newSet.size === 1 && circle) {
                  const breathingAnim = (circle as any)._breathingAnimation;
                  if (breathingAnim) {
                    breathingAnim.pause();
                  }
                }

                return newSet;
              });

              if (typeof containerRotation !== "number") {
                return;
              }
              if (containerScale !== 1) {
                return;
              } else {
                // Calculate movement toward the center of the circle
                // Compute distance from photo's current position to center
                const distanceFromCenter = Math.sqrt(
                  originalPosition.x * originalPosition.x +
                    originalPosition.y * originalPosition.y,
                );
                // Move a percentage of the distance toward center (e.g., 30%)
                const moveDistance = -distanceFromCenter;
                const rotationRad = (originalPosition.rotation * Math.PI) / 180;
                const moveX = Math.sin(rotationRad) * moveDistance;
                const moveY = -Math.cos(rotationRad) * moveDistance;

                gsap.to(photoElement, {
                  scale: 5,
                  x: moveX,
                  y: moveY,
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
          snap: function () {
            return 0;
          },
        });
      }

      // Animate light rays
      if (lightRays) {
        gsap.to(lightRays, {
          rotation: -360,
          duration: 60,
          ease: "none",
          repeat: -1,
        });

        // Subtle opacity pulse for rays
        gsap.to(lightRays, {
          opacity: 0.5,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // Breathing animation for the entire circle
      let breathingAnimation: gsap.core.Tween;
      if (circle) {
        breathingAnimation = gsap.to(circle, {
          scale: 1.02,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Store the breathing animation for later control
        (circle as any)._breathingAnimation = breathingAnimation;
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
        const circleMiddle =
          circle?.getBoundingClientRect().height / 2 +
          mobileCover.getBoundingClientRect().top;
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
            y: screenSize.height / 1.2,
            scrollTrigger: {
              trigger: scroll,
              start: "top bottom",
              //endTrigger: spin,
              end: "+=500",
              pin: gap,
              scrub: true,
              onEnter: () => {
                // Minimize any currently clicked photos when scrolling starts
                if (clickedPhotos.size > 0) {
                  clickedPhotos.forEach((photoId) => {
                    const photoIndex = photosToShow.findIndex(
                      (p) => p.id === photoId,
                    );
                    if (photoIndex !== -1) {
                      const photoElement = photoElements?.[photoIndex];
                      const originalPosition = photoPositions[photoIndex];
                      if (photoElement && originalPosition) {
                        gsap.to(photoElement, {
                          scale: 1,
                          x: 0,
                          y: 0,
                          rotation: originalPosition.rotation,
                          duration: 0.3,
                          ease: "power4.out",
                          transformOrigin: "center",
                          zIndex: 1,
                        });
                      }
                    }
                  });

                  // Resume breathing animation since all photos are being reset
                  if (circle) {
                    const breathingAnim = (circle as any)._breathingAnimation;
                    if (breathingAnim) {
                      breathingAnim.play();
                    }
                  }

                  setClickedPhotos(new Set());
                }

                // Show progress ring when scroll starts
                if (progressRing) {
                  const progressRingSvg = progressRing.closest("svg");
                  if (progressRingSvg) {
                    gsap.to(progressRingSvg, {
                      opacity: 1,
                      duration: 0.5,
                      ease: "power2.out",
                    });
                  }
                }
              },
            },
          },
          "start",
        ).to(
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
              onUpdate: (self) => {
                // Update progress ring with scroll progress (desktop)
                if (progressRing) {
                  const progress = self.progress;
                  const radius =
                    circleConfig.radius + circleConfig.photoSize * 0.75;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference * (1 - progress);

                  gsap.set(progressRing, {
                    strokeDashoffset: offset,
                  });
                }
              },
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
            y: screenSize.height / 1.5,
            scrollTrigger: {
              trigger: scroll,
              start: "top bottom",
              //endTrigger: spin,
              end: "+=500",
              pin: gap,
              scrub: true,
              onEnter: () => {
                // Minimize any currently clicked photos when scrolling starts
                if (clickedPhotos.size > 0) {
                  clickedPhotos.forEach((photoId) => {
                    const photoIndex = photosToShow.findIndex(
                      (p) => p.id === photoId,
                    );
                    if (photoIndex !== -1) {
                      const photoElement = photoElements?.[photoIndex];
                      const originalPosition = photoPositions[photoIndex];
                      if (photoElement && originalPosition) {
                        gsap.to(photoElement, {
                          scale: 1,
                          x: 0,
                          y: 0,
                          rotation: originalPosition.rotation,
                          duration: 0.3,
                          ease: "power4.out",
                          transformOrigin: "center",
                          zIndex: 1,
                        });
                      }
                    }
                  });

                  // Resume breathing animation since all photos are being reset
                  if (circle) {
                    const breathingAnim = (circle as any)._breathingAnimation;
                    if (breathingAnim) {
                      breathingAnim.play();
                    }
                  }

                  setClickedPhotos(new Set());
                }

                // Show progress ring when scroll starts
                if (progressRing) {
                  const progressRingSvg = progressRing.closest("svg");
                  if (progressRingSvg) {
                    gsap.to(progressRingSvg, {
                      opacity: 1,
                      duration: 0.5,
                      ease: "power2.out",
                    });
                  }
                }
              },
              onUpdate: (self) => {
                // Update progress ring with scroll progress (mobile)
                if (progressRing) {
                  const progress = self.progress;
                  const radius =
                    circleConfig.radius + circleConfig.photoSize * 0.75;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference * (1 - progress);

                  gsap.set(progressRing, {
                    strokeDashoffset: offset,
                  });
                }
              },
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
      {/* Cursor trail container */}
      <div
        ref={cursorTrailRef}
        className="pointer-events-none fixed inset-0 z-[9999]"
      />

      <main className="relative -mt-16 min-h-screen w-full">
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
            {/* Progress Ring */}
            <svg
              style={{
                position: "absolute",
                width: circleConfig.radius * 2 + circleConfig.photoSize * 1.5,
                height: circleConfig.radius * 2 + circleConfig.photoSize * 1.5,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) rotate(-90deg)",
                zIndex: 15,
                pointerEvents: "none",
                opacity: 0,
              }}
            >
              <circle
                cx="50%"
                cy="50%"
                r={circleConfig.radius + circleConfig.photoSize * 0.75}
                fill="none"
                stroke="rgba(0, 255, 127, 0.3)"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * (circleConfig.radius + circleConfig.photoSize * 0.75)}`}
                strokeDashoffset={`${2 * Math.PI * (circleConfig.radius + circleConfig.photoSize * 0.75)}`}
                ref={progressRingRef}
                style={{
                  transition: "stroke-dashoffset 0.3s ease",
                }}
              />
            </svg>

            {/* Light rays emanating from center */}
            <div
              ref={lightRaysRef}
              className="light-rays"
              style={{
                position: "absolute",
                width: circleConfig.radius * 2 + circleConfig.photoSize,
                height: circleConfig.radius * 2 + circleConfig.photoSize,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 5,
                pointerEvents: "none",
                opacity: 0,
              }}
            >
              {[...Array(64)].map((_, i) => {
                // Generate random-seeming but consistent angles for each ray
                const seedAngle = (i * 137.5) % 360; // Golden angle for natural distribution
                const randomOffset = Math.sin(i * 2.4) * 15; // Deterministic "random" offset
                const finalAngle = seedAngle + randomOffset;

                // Vary ray lengths randomly but consistently
                const lengthVariation = 0.6 + Math.sin(i * 1.7) * 0.9; // 0.3 to 0.9 multiplier
                const rayLength = circleConfig.radius * lengthVariation;

                // Vary ray width slightly
                const widthVariation = 1 + Math.sin(i * 3.1) * 0.5; // 0.5 to 1.5px

                return (
                  <div
                    key={i}
                    className={`light-ray light-ray-${i}`}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: `${widthVariation}px`,
                      height: `${rayLength}px`,
                      background:
                        "linear-gradient(to bottom, rgba(0, 255, 127, 1) 0%, rgba(0, 255, 127, 0.4) 50%, rgba(0, 255, 127, 0.2) 100%)",
                      transformOrigin: "50% 0%",
                      transform: `translate(-50%, 0%) rotate(${finalAngle}deg)`,
                      opacity: 0.4 + Math.sin(i * 2.8) * 0.6, // 0.2 to 0.6 opacity
                    }}
                  />
                );
              })}
            </div>

            {/* Circular photo layout */}
            <div
              id="circle"
              className=""
              ref={circleRef}
              style={{
                width: circleConfig.radius * 2 + circleConfig.photoSize,
                height: circleConfig.radius * 2 + circleConfig.photoSize,
                position: "relative",
                zIndex: 10,
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
                      className="photo-container relative overflow-hidden rounded-lg shadow-lg"
                      data-photo-id={photo.id}
                      style={{
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        width: "100%",
                        height: "100%",
                        transformOrigin: "center",
                        opacity: 0,
                        boxShadow: "0 0 0 0 rgba(0, 255, 127, 0)",
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
          {/* <div style={{ height: 1500 }} />*/}
          <div style={{ height: screenSize.height }} />
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
              className="cover pointer-events-none fixed inset-0 z-100 flex items-center justify-center"
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
