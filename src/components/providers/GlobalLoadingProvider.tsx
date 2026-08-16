"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ZapstersLoadingScreen from "@/components/ui/ZapstersLoadingScreen";

interface GlobalLoadingProviderProps {
  children: React.ReactNode;
}

export const GlobalLoadingProvider: React.FC<GlobalLoadingProviderProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [loaderKey, setLoaderKey] = useState(0);

  // Trigger loader every time route changes or on initial load
  useEffect(() => {
    setIsLoading(true);
    setLoaderKey((prev) => prev + 1);
  }, [pathname]);

  const handleLoadingComplete = () => {
    // Hold slightly on fully drawn text then smoothly reveal page
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
            exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
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
