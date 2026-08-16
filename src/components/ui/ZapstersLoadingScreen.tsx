"use client";

import React, { useEffect, useState } from "react";
import StrokeText from "@/components/ui/StrokeText";

export interface ZapstersLoadingScreenProps {
  onComplete?: () => void;
  fullScreen?: boolean;
}

export const ZapstersLoadingScreen: React.FC<ZapstersLoadingScreenProps> = ({
  onComplete,
  fullScreen = true,
}) => {
  const [fontSize, setFontSize] = useState(180);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        if (width < 480) {
          setFontSize(68);
        } else if (width < 768) {
          setFontSize(100);
        } else if (width < 1200) {
          setFontSize(150);
        } else {
          setFontSize(190);
        }
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center bg-[#070709] text-white w-full overflow-hidden font-geist ${
        fullScreen ? "fixed inset-0 z-[99999] min-h-screen" : "min-h-[500px] py-16"
      }`}
    >
      {/* Ambient luxury background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#800000]/15 blur-[160px] rounded-full" />
      </div>

      {/* Main Big Stroke Text Container */}
      <div className="relative z-10 w-full max-w-[1400px] px-4 sm:px-8 flex flex-col items-center justify-center">
        <StrokeText
          text="ZAPSTERS"
          fontFamily="var(--font-geist), sans-serif"
          strokeColor="#ffffff"
          fillColor="#F8FAFC"
          strokeWidth={fontSize > 100 ? 1.8 : 1.4}
          drawDuration={1.6}
          fillDelay={0.2}
          stagger={0.05}
          ease="power2.out"
          trigger="mount"
          fillMode="wipe"
          fontSize={fontSize}
          fontWeight={900}
          letterSpacing={fontSize > 100 ? -6 : -2}
          reverse={false}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
};

export default ZapstersLoadingScreen;
