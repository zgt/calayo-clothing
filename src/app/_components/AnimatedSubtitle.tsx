"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";

interface AnimatedSubtitleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface AnimatedSubtitleRef {
  animateIn: () => void;
}

const AnimatedSubtitle = forwardRef<AnimatedSubtitleRef, AnimatedSubtitleProps>(({ 
  text,
  className = "",
  style = {}
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    animateIn: () => {
      const isMobile = window.innerWidth < 768;
      const scatterY = isMobile ? 150 : 200;
      const scatterX = isMobile ? 60 : 100;
      const rotation = isMobile ? 30 : 45;
      
      // Animate letters from scattered positions to their final positions
      gsap.fromTo(letterRefs.current.filter(Boolean), 
        {
          y: () => gsap.utils.random(-scatterY, scatterY),
          x: () => gsap.utils.random(-scatterX, scatterX),
          rotation: () => gsap.utils.random(-rotation, rotation),
          scale: 0,
          opacity: 0
        },
        {
          y: 0,
          x: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: isMobile ? 1.0 : 1.2,
          ease: "elastic.out(1, 0.75)",
          stagger: isMobile ? 0.04 : 0.05
        }
      );
    }
  }));

  useEffect(() => {
    // Set initial scattered state
    if (letterRefs.current.length > 0) {
      const isMobile = window.innerWidth < 768;
      const scatterY = isMobile ? 150 : 200;
      const scatterX = isMobile ? 60 : 100;
      const rotation = isMobile ? 30 : 45;
      
      gsap.set(letterRefs.current.filter(Boolean), {
        y: () => gsap.utils.random(-scatterY, scatterY),
        x: () => gsap.utils.random(-scatterX, scatterX),
        rotation: () => gsap.utils.random(-rotation, rotation),
        scale: 0,
        opacity: 0
      });
    }
  }, []);

  return (
    <div ref={containerRef} className={className} style={style}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          ref={(el) => { letterRefs.current[index] = el; }}
          className="inline-block"
          style={{ 
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            transformOrigin: 'center center'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
});

AnimatedSubtitle.displayName = 'AnimatedSubtitle';

export default AnimatedSubtitle;