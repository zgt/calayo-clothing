"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useMobile } from "~/context/mobile-provider";

gsap.registerPlugin(ScrambleTextPlugin);

interface AnimatedSubtitleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface AnimatedSubtitleRef {
  animateIn: () => void;
}

const AnimatedSubtitle = forwardRef<AnimatedSubtitleRef, AnimatedSubtitleProps>(
  ({ text, className = "", style = {} }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { isMobile } = useMobile();

    useImperativeHandle(
      ref,
      () => ({
        animateIn: () => {
          if (containerRef.current) {
            gsap.to(containerRef.current, {
              duration: isMobile ? 1.5 : 2,
              scrambleText: {
                text: text,
                chars: "▄█▀▌▐|",
                revealDelay: 0.3,
                speed: 0.5,
              },
            });
          }
        },
      }),
      [text, isMobile],
    );

    useEffect(() => {
      // Set initial empty state for scramble text
      if (containerRef.current) {
        containerRef.current.textContent = "";
      }
    }, []);

    return <div ref={containerRef} className={className} style={style} />;
  },
);

AnimatedSubtitle.displayName = "AnimatedSubtitle";

export default AnimatedSubtitle;
