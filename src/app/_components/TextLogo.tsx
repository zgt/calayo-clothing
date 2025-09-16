"use client";

import {
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useMobile } from "~/context/mobile-provider";

gsap.registerPlugin(ScrambleTextPlugin);

interface TextLogoProps {
  className?: string;
  letterSpacing?: string;
  fontSize?: string;
}

export interface TextLogoRef {
  animateIn: () => void;
}

const TextLogo = forwardRef<TextLogoRef, TextLogoProps>(
  (
    {
      className = "",
      letterSpacing: _letterSpacing = "0.1em",
      fontSize: _fontSize = "6rem",
    },
    ref,
  ) => {
    const { isMobile } = useMobile();
    const calayoRef = useRef<HTMLDivElement>(null);
    const clothingRef = useRef<HTMLDivElement>(null);

    // ASCII art for CALAYO CLOTHING - using the block letter style
    const asciiArt = useMemo(() => {
      const calayoLines = [
        " ▄████████    ▄████████  ▄█          ▄████████    ▄█   █▄     ▄██████▄  ",
        "███    ███   ███    ███ ███         ███    ███   ███   ███   ███    ███ ",
        "███    █▀    ███    ███ ███         ███    ███   ███▄▄▄███   ███    ███ ",
        "███          ███    ███ ███         ███    ███   ▀▀▀▀▀▀███   ███    ███ ",
        "███        ▀███████████ ███       ▀███████████    ▄█   ███   ███    ███ ",
        "███    █▄    ███    ███ ███         ███    ███   ███   ███   ███    ███ ",
        "███    ███   ███    ███ ███     ▄   ███    ███   ███   ███   ███    ███ ",
        "████████▀    ███    █▀  ████▄▄▄██   ███    █▀     ▀█████▀     ▀██████▀  ",
      ];

      const clothingLines = [
        " ▄████████    ▄█        ▄██████▄   ▀▀█████████▀▀   ▄█    █▄     ▄█  ███▄▄▄▄      ▄██████▄ ",
        "███    ███   ███       ███    ███       ███       ███    ███   ███  ███▀▀▀██▄   ███    ███",
        "███    █▀    ███       ███    ███       ███       ███    ███   ███  ███   ███   ███    █▀ ",
        "███          ███       ███    ███       ███      ▄███▄▄▄▄███▄▄ ███  ███   ███  ▄███       ",
        "███          ███       ███    ███       ███     ▀▀███▀▀▀▀███▀  ███  ███   ███ ▀▀███ ████▄ ",
        "███    █▄    ███       ███    ███       ███       ███    ███   ███  ███   ███   ███    ███",
        "███    ███   ███     ▄ ███    ███       ███       ███    ███   ███  ███   ███   ███    ███",
        "████████▀    ████▄▄▄██  ▀██████▀       ▄███▄      ███    █▀    █▀    ▀█   █▀    ████████▀ ",
      ];

      return { calayo: calayoLines, clothing: clothingLines };
    }, []);

    // Calculate responsive font size
    const responsiveFontSize = useMemo(() => {
      if (isMobile) {
        return "0.4rem"; // Much smaller for mobile
      }
      return "0.7rem"; // Smaller for desktop to fit better
    }, [isMobile]);

    useImperativeHandle(
      ref,
      () => ({
        animateIn: () => {
          const timeline = gsap.timeline();

          // Animate CALAYO first - set the final text immediately and animate opacity
          if (calayoRef.current) {
            // Set the final ASCII art text with preserved spaces
            calayoRef.current.innerHTML = asciiArt.calayo
              .map(
                (line) =>
                  `<div class="text-line font-mono leading-none whitespace-pre select-none">${line.replace(/ /g, "&nbsp;")}</div>`,
              )
              .join("");

            // Apply styles to the lines
            const lines = calayoRef.current.querySelectorAll(".text-line");
            lines.forEach((line: Element) => {
              (line as HTMLElement).style.fontSize = responsiveFontSize;
              (line as HTMLElement).style.letterSpacing = isMobile
                ? "0.04em"
                : "0.05em";
              (line as HTMLElement).style.lineHeight = isMobile ? "0.9" : "0.9";
            });

            // Animate each line with scramble effect
            timeline.fromTo(
              lines,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
              },
            );

            // Add scramble effect to each line, preserving spaces
            lines.forEach((line, index) => {
              const originalText = (asciiArt.calayo[index] ?? "").replace(
                / /g,
                "&nbsp;",
              );

              gsap.to(line, {
                duration: 0.75,
                delay: index * 0.1,
                scrambleText: {
                  text: originalText,
                  chars: "▄█▀▌▐",
                  revealDelay: 0.2,
                  speed: 0.2,
                  tweenLength: false,
                  delimiter: "",
                },
              });
            });
          }

          // Then animate CLOTHING
          if (clothingRef.current) {
            timeline.call(
              () => {
                // Set the final ASCII art text with preserved spaces
                clothingRef.current!.innerHTML = asciiArt.clothing
                  .map(
                    (line) =>
                      `<div class="text-line font-mono leading-none whitespace-pre select-none">${line.replace(/ /g, "&nbsp;")}</div>`,
                  )
                  .join("");

                // Apply styles to the lines
                const lines =
                  clothingRef.current!.querySelectorAll(".text-line");
                lines.forEach((line: Element) => {
                  (line as HTMLElement).style.fontSize = responsiveFontSize;
                  (line as HTMLElement).style.letterSpacing = isMobile
                    ? "0.04em"
                    : "0.05em";
                  (line as HTMLElement).style.lineHeight = isMobile
                    ? "0.9"
                    : "0.9";
                });

                // Animate each line with scramble effect
                gsap.fromTo(
                  lines,
                  { opacity: 0 },
                  {
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power2.out",
                  },
                );

                // Add scramble effect to each line, preserving spaces
                lines.forEach((line, index) => {
                  const originalText = (asciiArt.clothing[index] ?? "").replace(
                    / /g,
                    "&nbsp;",
                  );

                  gsap.to(line, {
                    duration: 0.75,
                    delay: index * 0.1,
                    scrambleText: {
                      text: originalText,
                      chars: "▄█▀▌▐",
                      revealDelay: 0.3,
                      speed: 0.2,
                      tweenLength: false,
                      delimiter: "",
                    },
                  });
                });
              },
              [],
              "-=1",
            );
          }
        },
      }),
      [asciiArt, responsiveFontSize, isMobile],
    );

    // Set initial state for scramble text (empty)
    useEffect(() => {
      if (calayoRef.current) {
        calayoRef.current.textContent = "";
      }
      if (clothingRef.current) {
        clothingRef.current.textContent = "";
      }
    }, []);

    return (
      <div
        className={`text-logo flex flex-col items-center text-white ${className}`}
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', monospace",
        }}
      >
        <div
          ref={calayoRef}
          className="mb-4 font-mono leading-none whitespace-pre select-none"
          style={{
            fontSize: responsiveFontSize,
            letterSpacing: isMobile ? "0.04em" : "0.05em",
            lineHeight: isMobile ? "0.9" : "0.9",
          }}
        />
        <div
          ref={clothingRef}
          className="font-mono leading-none whitespace-pre select-none"
          style={{
            fontSize: responsiveFontSize,
            letterSpacing: isMobile ? "0.04em" : "0.05em",
            lineHeight: isMobile ? "0.9" : "0.9",
          }}
        />
      </div>
    );
  },
);

TextLogo.displayName = "TextLogo";

export default TextLogo;
