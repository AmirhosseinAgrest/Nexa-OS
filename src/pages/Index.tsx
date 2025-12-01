import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { Desktop } from "@/components/desktop/Desktop";
import { LockScreen } from "@/components/PasswordScreen";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const savedPassword = localStorage.getItem("nexa_password");
  if (savedPassword && !authenticated) {
    return <LockScreen onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
};

export default Index;