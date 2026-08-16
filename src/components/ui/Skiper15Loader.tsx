"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export interface Skiper15LoaderProps {
  /**
   * Optional controlled progress value (0 to 100).
   * If not provided, it will automatically animate from 0% to 100%.
   */
  progress?: number;
  /**
   * Duration in milliseconds for auto progress animation (default: 2000ms)
   */
  duration?: number;
  /**
   * Title shown prominently (default: "ZAPSTERS")
   */
  title?: string;
  /**
   * Optional custom letters to display across the flipping boxes (default: ['Z', 'A', 'P', 'S', 'T', 'E', 'R', 'S'])
   */
  letters?: string[];
  /**
   * Text lines for the bottom-left sticky note
   */
  stickyNoteText?: string[];
  /**
   * Custom info text for the bottom-right card
   */
  infoText?: string;
  /**
   * Info card title
   */
  infoTitle?: string;
  /**
   * Show or hide auxiliary ambient cards (sticky note & info card)
   */
  showAuxiliaryCards?: boolean;
  /**
   * Whether to loop the animation continuously (default: false to stay 100% loaded)
   */
  loop?: boolean;
  /**
   * Callback fired when progress reaches 100%
   */
  onComplete?: () => void;
  /**
   * Additional wrapper class
   */
  className?: string;
  /**
   * Custom active box color variant: "dark", "brand-red" (default), "accent"
   */
  variant?: "dark" | "brand-red" | "accent";
  /**
   * Whether it is a full page centered overlay or inline
   */
  fullScreen?: boolean;
}

const DEFAULT_LETTERS = ["Z", "A", "P", "S", "T", "E", "R", "S"];

const DEFAULT_STICKY_LINES = [
  "ZAPSTERS ,",
  "HACKATHON OS ,",
  "GREAT UI/UX",
  "",
  "COLLECTION",
  "2026",
];

const DEFAULT_INFO_TEXT =
  "Next-generation competition platform. Dynamic matchmaking, real-time collaboration, and automated judging intelligence.";

export const Skiper15Loader: React.FC<Skiper15LoaderProps> = ({
  progress: controlledProgress,
  duration = 2000,
  title = "ZAPSTERS",
  letters = DEFAULT_LETTERS,
  stickyNoteText = DEFAULT_STICKY_LINES,
  infoTitle = "ZAPSTERS INFO",
  infoText = DEFAULT_INFO_TEXT,
  showAuxiliaryCards = true,
  loop = false,
  onComplete,
  className,
  variant = "brand-red",
  fullScreen = true,
}) => {
  const [internalProgress, setInternalProgress] = useState(0);
  const isControlled = controlledProgress !== undefined;
  const currentProgress = isControlled
    ? Math.min(Math.max(controlledProgress, 0), 100)
    : internalProgress;

  const resolvedLetters = letters && letters.length > 0 ? letters : DEFAULT_LETTERS;
  const totalBoxes = resolvedLetters.length;

  useEffect(() => {
    if (isControlled) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressFraction = Math.min(elapsed / duration, 1);

      // Smooth progress calculation pacing strictly to 100%
      const val = Math.min(100, Math.round(progressFraction * 100));
      setInternalProgress(val);

      if (progressFraction < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setInternalProgress(100);
        if (onComplete) onComplete();
        if (loop) {
          setTimeout(() => {
            startTime = null;
            setInternalProgress(0);
            animationFrameId = requestAnimationFrame(animate);
          }, 2000);
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isControlled, duration, loop, onComplete]);

  // Compute active count (0 to totalBoxes) - guarantees 100% flips all boxes
  const activeCount =
    currentProgress >= 100
      ? totalBoxes
      : currentProgress <= 0
      ? 0
      : Math.min(
          totalBoxes,
          Math.ceil((currentProgress / 100) * totalBoxes)
        );

  const getActiveBoxStyle = () => {
    switch (variant) {
      case "brand-red":
        return "bg-[#800000] text-white border-[#990000] shadow-[#800000]/40 shadow-lg";
      case "accent":
        return "bg-sky-500 text-white border-sky-400 shadow-sky-500/40 shadow-lg";
      case "dark":
      default:
        return "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-700 dark:border-neutral-200 shadow-black/20 shadow-lg";
    }
  };

  return (
    <div
      className={clsx(
        "relative select-none flex items-center justify-center font-sans w-full transition-colors",
        fullScreen
          ? "fixed inset-0 z-[9999] min-h-screen bg-[#F4F4F6] dark:bg-[#070709] text-neutral-900 dark:text-white p-4 sm:p-6 overflow-y-auto"
          : "w-full py-10 bg-transparent p-4",
        className
      )}
    >
      {/* Main Container Stage */}
      <div className="relative z-10 w-full max-w-[820px] flex flex-col items-center justify-center my-auto py-6">
        
        {/* Main 3D Box Loading Card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-20 w-full max-w-[460px] rounded-3xl bg-white/95 dark:bg-[#111113]/95 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] border border-neutral-200/80 dark:border-neutral-800 backdrop-blur-2xl transition-all space-y-6"
        >


          {/* 3D Box Loading Strip with letter boxes (Z A P S T E R S) */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-1 py-1">
            {resolvedLetters.map((letter, index) => {
              const isFlipped = index < activeCount;
              return (
                <motion.div
                  key={index}
                  animate={{
                    scale: isFlipped ? 1.05 : 1,
                    rotateY: isFlipped ? 360 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: isFlipped ? (index % totalBoxes) * 0.03 : 0,
                  }}
                  className={clsx(
                    "relative h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center font-mono font-light text-sm sm:text-base border transition-all duration-300 transform-gpu shrink-0",
                    isFlipped
                      ? getActiveBoxStyle()
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700/60 shadow-inner"
                  )}
                >
                  <span className="select-none tracking-normal">{letter}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Fill Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800/80 p-0.5 border border-neutral-200/60 dark:border-neutral-700/60">
            <motion.div
              className={clsx(
                "h-full rounded-full transition-all duration-150 ease-out",
                variant === "brand-red"
                  ? "bg-[#800000]"
                  : variant === "accent"
                  ? "bg-sky-500"
                  : "bg-neutral-900 dark:bg-white"
              )}
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          {/* Footer - Clean Status & Percentage, no divider line, no dots */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono tracking-wider text-neutral-600 dark:text-neutral-300 font-light uppercase">
              {currentProgress === 100 ? "ZAPSTERS READY" : "ZAPSTERS SYNCING"}
            </span>
            <span className="font-mono text-sm font-light tracking-tight text-neutral-900 dark:text-white tabular-nums">
              {currentProgress}%
            </span>
          </div>
        </motion.div>

        {/* Ambient Auxiliary Bento Cards */}
        {showAuxiliaryCards && (
          <div className="w-full max-w-[760px] mt-6 md:mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 px-2">
            
            {/* Bottom-Left Paper Sticky Note */}
            <motion.div
              initial={{ opacity: 0, rotate: -4, y: 15 }}
              animate={{ opacity: 1, rotate: -4, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full sm:w-auto hover:rotate-0 transition-transform duration-300"
            >
              <div className="w-full sm:w-[210px] rounded-2xl bg-white/95 dark:bg-[#151518]/95 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-neutral-200/80 dark:border-neutral-800 backdrop-blur-md">
                <div className="font-mono text-[10px] sm:text-[11px] font-normal uppercase tracking-wider text-neutral-800 dark:text-neutral-200 leading-tight space-y-1">
                  {stickyNoteText.map((line, idx) => (
                    <div key={idx} className={line === "" ? "h-2" : ""}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bottom-Right Platform Info Card - Clean title & description without ACTIVE badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full sm:w-auto hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="w-full sm:w-[280px] rounded-2xl bg-white/95 dark:bg-[#151518]/95 p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-neutral-200/80 dark:border-neutral-800 backdrop-blur-md space-y-1.5">
                <div className="text-[11px] font-mono font-normal tracking-[0.2em] text-[#800000] dark:text-red-400 uppercase">
                  {infoTitle}
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300 font-sans">
                  {infoText}
                </p>
              </div>
            </motion.div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Skiper15Loader;
