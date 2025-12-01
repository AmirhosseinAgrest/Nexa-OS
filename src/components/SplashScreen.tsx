import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setMounted(true);

    const savedName = localStorage.getItem("systemName");
    if (savedName) {
      setUsername(savedName);
      startLoading();
    }
  }, []);

  const startLoading = () => {
    const duration = 3000;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percentage = Math.min(100, (currentStep / steps) * 100);
      setProgress(percentage);

      if (currentStep >= steps) {
        clearInterval(timer);
        setIsFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 700);
      }
    }, intervalTime);
  };

  const handleSubmit = () => {
    if (inputValue.trim().length > 0) {
      localStorage.setItem("systemName", inputValue.trim());
      setUsername(inputValue.trim());
      startLoading(); 
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out select-none",
        "bg-white text-black dark:bg-black dark:text-white",
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="relative flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-1000">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-8 h-8 md:w-10 md:h-10 text-white dark:text-black"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            Nexa<span className="text-blue-600 dark:text-blue-500">OS</span>
          </h1>
          <p className="text-xs font-medium tracking-[0.4em] text-gray-400 dark:text-gray-500 uppercase mt-1">
            Agrest Systems
          </p>
        </div>

        {!username && (
          <div className="flex flex-col items-center gap-4 mt-6">
            <input
              type="text"
              placeholder="Enter your system name..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save & Continue
            </button>
          </div>
        )}

        {username && (
          <>
            <div className="w-48 md:w-64 h-[2px] bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-8">
              <div
                className="h-full bg-black dark:bg-white transition-all ease-linear duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="h-4">
              {progress < 100 && (
                <p className="text-[10px] font-mono text-gray-400 animate-pulse">
                  Loading modules... {Math.floor(progress)}%
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-8 text-[10px] text-gray-400 dark:text-gray-600">
        © 2025 Agrest . All rights reserved.
      </div>
    </div>
  );
};