"use client";

import React, { useState } from "react";
import StrokeText from "@/components/ui/StrokeText";
import { RotateCcw, Moon, Sun } from "lucide-react";

export default function Skiper15Page() {
  const [key, setKey] = useState(0);
  const [fillMode, setFillMode] = useState<"wipe" | "fade" | "none">("wipe");
  const [trigger, setTrigger] = useState<"mount" | "hover" | "loop">("mount");

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  const replay = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070709] text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden font-geist">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#800000]/15 blur-[160px] rounded-full" />
      </div>

      {/* Floating Interactive Control Panel */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-zinc-900/90 p-2 shadow-xl backdrop-blur-md border border-white/10 text-xs font-inter">
        {/* Replay Button */}
        <button
          onClick={replay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-medium cursor-pointer"
          title="Replay animation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay</span>
        </button>

        {/* Trigger Mode */}
        <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setTrigger("mount")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
              trigger === "mount" ? "bg-white text-zinc-900" : "text-zinc-400"
            }`}
          >
            Once
          </button>
          <button
            onClick={() => setTrigger("loop")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
              trigger === "loop" ? "bg-white text-zinc-900" : "text-zinc-400"
            }`}
          >
            Loop
          </button>
          <button
            onClick={() => setTrigger("hover")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
              trigger === "hover" ? "bg-white text-zinc-900" : "text-zinc-400"
            }`}
          >
            Hover
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          <Moon className="w-3.5 h-3.5 dark:hidden" />
          <Sun className="w-3.5 h-3.5 hidden dark:block" />
        </button>
      </div>

      {/* Main Big StrokeText Display */}
      <div className="relative z-10 w-full max-w-[1400px] px-4 flex flex-col items-center justify-center">
        <StrokeText
          key={key}
          text="ZAPSTERS"
          fontFamily="var(--font-geist), sans-serif"
          strokeColor="#ffffff"
          fillColor="#F8FAFC"
          strokeWidth={1.8}
          drawDuration={1.6}
          fillDelay={0.2}
          stagger={0.05}
          ease="power2.out"
          trigger={trigger}
          fillMode={fillMode}
          fontSize={190}
          fontWeight={900}
          letterSpacing={-6}
          reverse={false}
        />
      </div>
    </div>
  );
}
