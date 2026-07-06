"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./ShaderGradientInner"), { ssr: false });

export default function ShaderGradientBackground() {
  return <Inner />;
}
