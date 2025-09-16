"use client";

import {
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useMobile } from "~/context/mobile-provider";

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

    const renderWord = (wordLines: string[], wordKey: string) => (
      <div
        key={wordKey}
        className="mb-4 flex flex-col items-center justify-center"
      >
        {wordLines.map((line, index) => (
          <div
            key={`${wordKey}-line-${index}`}
            className="text-line font-mono leading-none whitespace-pre select-none"
            style={{
              fontSize: responsiveFontSize,
              letterSpacing: isMobile ? "0.04em" : "0.05em",
              lineHeight: isMobile ? "0.9" : "0.9",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    );

    return (
      <div
        className={`text-logo flex flex-col items-center text-white ${className}`}
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', monospace",
        }}
      >
        {renderWord(asciiArt.calayo, "calayo")}
        {renderWord(asciiArt.clothing, "clothing")}
      </div>
    );
  },
);

TextLogo.displayName = "TextLogo";

export default TextLogo;
