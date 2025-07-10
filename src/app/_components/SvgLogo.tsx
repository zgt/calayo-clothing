"use client";

import { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { gsap } from "gsap";

interface SvgLogoProps {
  className?: string;
  letterSpacing?: string;
  fontSize?: string;
}

export interface SvgLogoRef {
  animateIn: () => void;
}

const SvgLogo = forwardRef<SvgLogoRef, SvgLogoProps>(({ 
  className = "", 
  letterSpacing = "0.1em",
  fontSize = "6rem" 
}, ref) => {
  const letters = useMemo(() => {
    const calayoLetters = ['c', 'a', 'l', 'a', 'y', 'o'];
    const clothingLetters = ['c', 'l', 'o', 't', 'h', 'i', 'n', 'g'];
    
    return {
      calayo: calayoLetters,
      clothing: clothingLetters
    };
  }, []);

  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    animateIn: () => {
      const isMobile = window.innerWidth < 768;
      const scatterX = isMobile ? window.innerWidth * 0.8 : window.innerWidth;
      const scatterY = isMobile ? window.innerHeight * 0.6 : window.innerHeight;
      
      // Animate letters from scattered positions to their final positions
      gsap.fromTo(letterRefs.current.filter(Boolean), 
        {
          x: () => gsap.utils.random(-scatterX, scatterX),
          y: () => gsap.utils.random(-scatterY, scatterY),
          rotation: () => gsap.utils.random(-360, 360),
          scale: 0,
          opacity: 0
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: isMobile ? 1.2 : 1.5,
          ease: "back.out(1.7)",
          stagger: isMobile ? 0.08 : 0.1
        }
      );
    }
  }));

  useEffect(() => {
    // Set initial scattered state
    if (letterRefs.current.length > 0) {
      const isMobile = window.innerWidth < 768;
      const scatterX = isMobile ? window.innerWidth * 0.8 : window.innerWidth;
      const scatterY = isMobile ? window.innerHeight * 0.6 : window.innerHeight;
      
      gsap.set(letterRefs.current.filter(Boolean), {
        x: () => gsap.utils.random(-scatterX, scatterX),
        y: () => gsap.utils.random(-scatterY, scatterY),
        rotation: () => gsap.utils.random(-360, 360),
        scale: 0,
        opacity: 0
      });
    }
  }, []);

  const renderWord = (wordLetters: string[], wordKey: string, startIndex: number) => (
    <div 
      key={wordKey}
      className="flex items-center justify-center"
      style={{ gap: letterSpacing }}
    >
      {wordLetters.map((letter, index) => {
        const refIndex = startIndex + index;
        return (
          <div
            key={`${wordKey}-${letter}-${index}`}
            ref={(el) => { letterRefs.current[refIndex] = el; }}
            className="svg-letter"
            style={{
              width: fontSize,
              height: fontSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Image
              src={`/svgs/${letter}.svg`}
              alt={letter.toUpperCase()}
              width={100}
              height={100}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={containerRef} className={`svg-logo flex flex-col items-center ${className}`}>
      {renderWord(letters.calayo, 'calayo', 0)}
      {renderWord(letters.clothing, 'clothing', letters.calayo.length)}
    </div>
  );
});

SvgLogo.displayName = 'SvgLogo';

export default SvgLogo;