"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ZapstersLoadingScreen from "@/components/ui/ZapstersLoadingScreen";

interface GlobalLoadingProviderProps {
  children: React.ReactNode;
}

const isDashboardRoute = (path: string | null): boolean => {
  if (!path) return false;
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/my-teams") ||
    path.startsWith("/my-hackathons") ||
    path.startsWith("/organizer") ||
    path.startsWith("/judge") ||
    path.startsWith("/team") ||
    path.startsWith("/teams")
  );
};

export const GlobalLoadingProvider: React.FC<GlobalLoadingProviderProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [loaderKey, setLoaderKey] = useState(0);
  const isFirstMount = useRef(true);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    prevPathRef.current = pathname;

    // Never show loading screen on any dashboard route or navigation within dashboard
    if (isDashboardRoute(pathname)) {
      setIsLoading(false);
      isFirstMount.current = false;
      return;
    }

    // On initial mount of public / marketing pages, show smooth intro loader
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setIsLoading(true);
      setLoaderKey((prev) => prev + 1);
      return;
    }

    // If coming from a dashboard page to public page, or navigating between public pages
    if (prevPath && isDashboardRoute(prevPath)) {
      setIsLoading(false);
      return;
    }

    // Trigger loader only for public page transitions
    setIsLoading(true);
    setLoaderKey((prev) => prev + 1);
  }, [pathname]);

  const handleLoadingComplete = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key={`loader-${loaderKey}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
            className="fixed inset-0 z-[99999]"
          >
            <ZapstersLoadingScreen
              fullScreen={true}
              onComplete={handleLoadingComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="w-full min-h-full">
        {children}
      </div>
    </>
  );
};

export default GlobalLoadingProvider;
