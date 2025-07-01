"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { api } from "~/trpc/react";

gsap.registerPlugin(ScrollTrigger);

export default function InfinitePhotoGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<LenisRef>(null);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const {
    data: photos,
    isLoading,
    error,
  } = api.instagram.getAllInstagramPhotos.useQuery();

  // Responsive grid configuration
  const gridConfig = useMemo(() => {
    const { width } = screenSize;
    
    if (width < 480) {
      // Mobile
      return {
        columns: 3,
        maxItemsPerRow: 1,
        gap: '0.75rem',
        padding: '1rem',
        rowHeight: '25vh',
        minHeight: '300vh',
      };
    } else if (width < 768) {
      // Large mobile / small tablet
      return {
        columns: 3,
        maxItemsPerRow: 2,
        gap: '1rem',
        padding: '1.5rem',
        rowHeight: '20vh',
        minHeight: '350vh',
      };
    } else if (width < 1024) {
      // Tablet
      return {
        columns: 4,
        maxItemsPerRow: 2,
        gap: '1.5rem',
        padding: '1.5rem',
        rowHeight: '18vh',
        minHeight: '400vh',
      };
    } else if (width < 1440) {
      // Desktop
      return {
        columns: 5,
        maxItemsPerRow: 2,
        gap: '2rem',
        padding: '2rem',
        rowHeight: '15vh',
        minHeight: '400vh',
      };
    } else {
      // Large desktop
      return {
        columns: 5,
        maxItemsPerRow: 2,
        gap: '2rem',
        padding: '2rem',
        rowHeight: '12vh',
        minHeight: '400vh',
      };
    }
  }, [screenSize]);

  // Memoize responsive grid positions ensuring no photos are adjacent
  const photoPositions = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    
    const totalPhotos = photos.length;
    const { columns, maxItemsPerRow } = gridConfig;
    const neededRows = Math.ceil(totalPhotos / maxItemsPerRow);
    const totalRows = Math.ceil(neededRows * 4);
    const usedPositions = new Set<string>();
    const rowCounts: Record<number, number> = {}; // Track items per row
    const positions: { row: number; col: number }[] = [];
    
    // Use a seed based on photos length and columns for consistent positioning
    let seed = totalPhotos * columns;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    // Helper function to check if a position conflicts with existing ones
    const isPositionValid = (row: number, col: number) => {
      // Check if row already has max items
      if ((rowCounts[row] ?? 0) >= maxItemsPerRow) {
        return false;
      }
      
      // Check all 8 adjacent positions (including diagonals)
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r === row && c === col) continue; // Skip the position itself
          if (usedPositions.has(`${r}-${c}`)) {
            return false;
          }
        }
      }
      return true;
    };
    
    // Generate positions for each photo
    for (let i = 0; i < totalPhotos; i++) {
      let attempts = 0;
      let validPosition = false;
      
      while (!validPosition && attempts < 1000) {
        const row = Math.floor(seededRandom() * totalRows) + 1;
        const col = Math.floor(seededRandom() * columns) + 1;
        const positionKey = `${row}-${col}`;
        
        if (!usedPositions.has(positionKey) && isPositionValid(row, col)) {
          positions.push({ row, col });
          usedPositions.add(positionKey);
          rowCounts[row] = (rowCounts[row] ?? 0) + 1;
          validPosition = true;
        }
        
        attempts++;
      }
      
      // Fallback if we can't find a valid position after many attempts
      if (!validPosition) {
        let fallbackRow = Math.floor(seededRandom() * totalRows) + 1;
        let fallbackCol = Math.floor(seededRandom() * columns) + 1;
        
        // Keep trying until we find an unused position with room in the row
        while (usedPositions.has(`${fallbackRow}-${fallbackCol}`) || (rowCounts[fallbackRow] ?? 0) >= maxItemsPerRow) {
          fallbackRow = Math.floor(seededRandom() * totalRows) + 1;
          fallbackCol = Math.floor(seededRandom() * columns) + 1;
        }
        
        positions.push({ row: fallbackRow, col: fallbackCol });
        usedPositions.add(`${fallbackRow}-${fallbackCol}`);
        rowCounts[fallbackRow] = (rowCounts[fallbackRow] ?? 0) + 1;
      }
    }
    
    return positions;
  }, [photos, gridConfig]);

  // Handle screen resize and orientation change
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize events to prevent excessive rerenders
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        // Only update if dimensions actually changed significantly
        if (Math.abs(newWidth - screenSize.width) > 10 || Math.abs(newHeight - screenSize.height) > 10) {
          setScreenSize({
            width: newWidth,
            height: newHeight,
          });
        }
      }, 150);
    };

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated after orientation change
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [screenSize.width, screenSize.height]);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => gsap.ticker.remove(update);
  }, []);

  useEffect(() => {
    if (!photos || photos.length === 0) return;

    // Kill any existing ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Setup GSAP animations for grid items
    const grid = gridRef.current;
    const gridItems = grid?.querySelectorAll('.grid-item');
    
    if (grid && gridItems) {
      gridItems.forEach((item) => {
        gsap.timeline()
          .set(grid, {
            perspective: 1000,
            perspectiveOrigin: `50% ${screenSize.height / 2 + (lenisRef.current?.lenis?.scroll ?? 0)}px`
          })
          .to(item, {
            ease: 'none',
            startAt: { rotationX: 70, scale: 0.7 },
            scale: 1,
            rotationX: -70,
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              onUpdate: () => {
                gsap.set(grid, {
                  perspectiveOrigin: `50% ${screenSize.height / 2 + (lenisRef.current?.lenis?.scroll ?? 0)}px`
                });
              }
            }
          });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [photos, screenSize]);

  if (isLoading) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center">
      </main>
    );
  }

  if (error || !photos) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center">
        <div className="text-white">Error loading photos</div>
      </main>
    );
  }

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      <main className="relative min-h-screen w-full">

        <div className="content">
          <div 
            ref={gridRef} 
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
              gridTemplateRows: `repeat(auto, ${gridConfig.rowHeight})`,
              gap: 0,
              padding: 0,
              minHeight: gridConfig.minHeight,
              perspective: '1000px',
            }}
          >
            {photos.map((photo, index) => {
              const { row, col } = photoPositions[index] ?? { row: 1, col: 1 };
              return (
                <div
                  key={photo.id}
                  className="grid-item"
                  style={{
                    gridRow: row,
                    gridColumn: col,
                    aspectRatio: '1',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                  }}
                >
                  <Image
                    className="grid-item-img"
                    src={photo.mediaUrl}
                    alt={`Instagram photo ${photo.id}`}
                    fill
                    //sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1440px) 20vw, 14vw"
                    style={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (screenSize.width >= 768) { // Only on non-touch devices
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (screenSize.width >= 768) { // Only on non-touch devices
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onTouchStart={(e) => {
                      // Touch feedback for mobile
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    priority={index < 10} // Prioritize first 10 images
                  />
                </div>
              );
            })}
          </div>
          
          <div className="cover fixed inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center text-white px-4">
              <h2 
                className="font-bold mb-4"
                style={{
                  fontSize: screenSize.width < 768 ? '2.5rem' : '6rem',
                  lineHeight: screenSize.width < 768 ? '1.1' : '1.2',
                }}
              >
                Calayo Clothing
                {/* <sup>®</sup> */}
              </h2>
              <h3 
                className="font-light"
                style={{
                  fontSize: screenSize.width < 768 ? '1.25rem' : '2rem',
                }}
              >
                Intentionally yours
              </h3>
            </div>
          </div>
          
        </div>
      </main>
    </ReactLenis>
  );
}