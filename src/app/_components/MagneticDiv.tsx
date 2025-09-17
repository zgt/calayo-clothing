"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { MouseEvent } from "react";

export default function MagneticDiv({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const mouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current!.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };

  const mouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={mouseMove}
      onMouseLeave={mouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 50, damping: 100, mass: 0.3 }}
      //transition={{ ease: ["easeIn", "easeOut"] }}
      style={{
        width: "100%",
        height: "100%",
      }}
      ref={ref}
    >
      {children}
    </motion.div>
  );
}
