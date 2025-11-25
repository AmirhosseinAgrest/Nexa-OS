import React, { useState, useEffect } from "react";
import { ArrowRight, User, Loader2, Power, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LockScreenProps {
  onSuccess: () => void;
}

export const LockScreen = ({ onSuccess }: LockScreenProps) => {
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState(""); 
  const [hasPassword, setHasPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const storedName = localStorage.getItem("systemName"); 
    if (storedName) {
      setUserName(storedName);
    } else {
      setUserName("Guest"); 
    }

    const storedPass = localStorage.getItem("nexa_password");
    if (storedPass) {
      setHasPassword(true);
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(false);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!hasPassword) {
      onSuccess();
      return;
    }

    const storedHash = localStorage.getItem("nexa_password");
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (hashHex === storedHash) {
      onSuccess();
    } else {
      setIsLoading(false);
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-cover bg-center text-white overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop')`,
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center mt-16 animate-in slide-in-from-top-10 duration-700">
        <h1 className="text-7xl font-thin tracking-tight drop-shadow-lg">
          {currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </h1>
        <p className="text-xl font-medium drop-shadow-md mt-2">
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div
        className={`relative z-10 flex flex-col items-center gap-6 transition-all duration-500 ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="relative">
          <div className="w-32 h-32 rounded-full p-1 bg-white/20 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
              <User className="w-16 h-16 text-white/80" />
            </div>
          </div>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full backdrop-blur-[2px]">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold tracking-wide drop-shadow-md">{userName}</h2>

        <div className={cn("w-64 transition-transform", error ? "animate-shake" : "")}>
          {hasPassword ? (
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-black/30 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 backdrop-blur-md shadow-lg"
                autoFocus
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="bg-white/20 hover:bg-white/30 border border-white/10 shadow-lg backdrop-blur-md"
                onClick={handleLogin}
                disabled={isLoading || !password}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-white/20 hover:bg-white/30 border border-white/10 text-white backdrop-blur-md shadow-xl h-10 text-base font-medium"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          )}

          <div className="h-6 mt-2 text-center">
            {error && (
              <p className="text-xs font-medium text-red-300 drop-shadow-sm animate-in fade-in">
                Password incorrect. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-8 flex gap-6 text-white/70">
        <Wifi className="w-6 h-6" />
        <Power className="w-6 h-6" />
      </div>
    </div>
  );
};