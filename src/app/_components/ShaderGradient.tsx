"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function ShaderGradientBackground() {
  return (
    <div className="fixed inset-0 -z-20">
      <ShaderGradientCanvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <ShaderGradient
          type="waterPlane"
          //cameraZoom={2}
          cDistance={4}
          cPolarAngle={125}
          cAzimuthAngle={180}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={-50}
          rotationY={0}
          rotationZ={70}
          animate="on"
          grain="on"
          //shader="none"
          color1="#1a7833"
          color2="#065f2c"
          color3="#005800"
          uSpeed={0.1}
          uStrength={3}
          uDensity={2.7}
          uFrequency={0.5}
          uAmplitude={1.5}
          reflection={0.5}
          lightType="3d"
          brightness={1}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
