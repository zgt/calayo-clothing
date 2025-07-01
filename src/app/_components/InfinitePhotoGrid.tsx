"use client";

import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "lenis/react";
import { api } from "~/trpc/react";

gsap.registerPlugin(ScrollTrigger);

export default function InfinitePhotoGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);

  const {
    data: photos,
    isLoading,
    error,
  } = api.instagram.getAllInstagramPhotos.useQuery();

  // Memoize random grid positions ensuring no photos are adjacent and max 2 per row
  const photoPositions = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    
    const totalPhotos = photos.length;
    const neededRows = Math.ceil(totalPhotos / 2); // Max 2 items per row
    const totalRows = Math.ceil(neededRows * 4);
    const usedPositions = new Set<string>();
    const rowCounts: Record<number, number> = {}; // Track items per row
    const positions: { row: number; col: number }[] = [];
    
    // Helper function to check if a position conflicts with existing ones
    const isPositionValid = (row: number, col: number) => {
      // Check if row already has 2 items
      if (rowCounts[row] >= 2) {
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
        const row = Math.floor(Math.random() * totalRows) + 1;
        const col = Math.floor(Math.random() * 7) + 1;
        const positionKey = `${row}-${col}`;
        
        if (!usedPositions.has(positionKey) && isPositionValid(row, col)) {
          positions.push({ row, col });
          usedPositions.add(positionKey);
          rowCounts[row] = (rowCounts[row] || 0) + 1;
          validPosition = true;
        }
        
        attempts++;
      }
      
      // Fallback if we can't find a valid position after many attempts
      if (!validPosition) {
        let fallbackRow = Math.floor(Math.random() * totalRows) + 1;
        let fallbackCol = Math.floor(Math.random() * 7) + 1;
        
        // Keep trying until we find an unused position with room in the row
        while (usedPositions.has(`${fallbackRow}-${fallbackCol}`) || (rowCounts[fallbackRow] || 0) >= 2) {
          fallbackRow = Math.floor(Math.random() * totalRows) + 1;
          fallbackCol = Math.floor(Math.random() * 7) + 1;
        }
        
        positions.push({ row: fallbackRow, col: fallbackCol });
        usedPositions.add(`${fallbackRow}-${fallbackCol}`);
        rowCounts[fallbackRow] = (rowCounts[fallbackRow] || 0) + 1;
      }
    }
    
    return positions;
  }, [photos]);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    return () => gsap.ticker.remove(update);
  }, []);

  useEffect(() => {
    if (!photos || photos.length === 0) return;

    let winsize = { width: window.innerWidth, height: window.innerHeight };
    
    const calcWindowSize = () => {
      winsize = { width: window.innerWidth, height: window.innerHeight };
    };
    
    const handleResize = () => {
      calcWindowSize();
    };
    
    calcWindowSize();
    window.addEventListener('resize', handleResize);

    // Setup GSAP animations for grid items
    const grid = gridRef.current;
    const gridItems = grid?.querySelectorAll('.grid-item');
    
    if (grid && gridItems) {
      gridItems.forEach((item) => {
        gsap.timeline()
          .set(grid, {
            perspective: 1000,
            perspectiveOrigin: `50% ${winsize.height / 2 + (lenisRef.current?.lenis?.scroll || 0)}px`
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
                  perspectiveOrigin: `50% ${winsize.height / 2 + (lenisRef.current?.lenis?.scroll || 0)}px`
                });
              }
            }
          });
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [photos]);

  if (isLoading) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center">
        <div className="text-white">Loading photos...</div>
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
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: 'repeat(auto, 12vh)',
              gap: '2rem',
              padding: '2rem',
              minHeight: '400vh',
              perspective: '1000px',
            }}
          >
            {photos.map((photo, index) => {
              const { row, col } = photoPositions[index] || { row: 1, col: 1 };
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
                  <img
                    className="grid-item-img"
                    src={photo.mediaUrl}
                    alt={`Instagram photo ${photo.id}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>
              );
            })}
          </div>
          
          <div className="cover fixed inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center text-white">
              <h2 className="text-6xl font-bold mb-4">Calayo Clothing<sup>®</sup></h2>
              <h3 className="text-2xl font-light">Intentionally yours</h3>
            </div>
          </div>
          
        </div>
      </main>
    </ReactLenis>
  );
}