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
          control="query"
          urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23003d00&bgColor2=%23003d00&brightness=0.9&cAzimuthAngle=180&cDistance=11.9&cPolarAngle=120&cameraZoom=15.6&color1=%231a7833&color2=%23065f2c&color3=%23005800&destination=onCanvas&embedMode=off&envPreset=lobby&format=gif&fov=50&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=2.7&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.4&rotationX=-50&rotationY=0&rotationZ=70&shader=positionMix&toggleAxis=false&type=sphere&uAmplitude=1.2&uDensity=2.6&uFrequency=5.5&uSpeed=0.1&uStrength=3.2&uTime=7.4&wireframe=false&zoomOut=false"
        />
      </ShaderGradientCanvas>
    </div>
  );
}