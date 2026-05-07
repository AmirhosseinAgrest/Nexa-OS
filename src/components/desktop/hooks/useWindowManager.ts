import { useState } from "react";
import { apps } from "../Taskbar";

interface AppInfo {
  id: string;
  name: string;
  icon: any;
}

interface OpenWindow {
  id: string;
  appId: string;
  title: string;
  icon: any;
  props?: any;
}

export const useWindowManager = () => {
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [minimizedWindows, setMinimizedWindows] = useState<Set<string>>(new Set());

  const openApp = (appId: string, props?: any) => {
    const allowMultiple = appId === "video-player" || appId === "explorer";
    const existingWindow = !allowMultiple && openWindows.find((w) => w.appId === appId);

    if (existingWindow) {
      setActiveWindowId(existingWindow.id);
      setMinimizedWindows(prev => {
        const newSet = new Set(prev);
        newSet.delete(existingWindow.id);
        return newSet;
      });
    } else {
      let appInfo: AppInfo | undefined = apps.find((a) => a.id === appId);

      if (!appInfo && appId === "video-player") {
        appInfo = { id: "video-player", name: "Video Player", icon: null };
      }

      if (!appInfo) return;

      const newWindow: OpenWindow = {
        id: `${appId}-${Date.now()}`,
        appId,
        title: appInfo.name,
        icon: appInfo.icon,
        props: props,
      };

      setOpenWindows((prev) => [...prev, newWindow]);
      setActiveWindowId(newWindow.id);
      setMinimizedWindows(prev => {
        const newSet = new Set(prev);
        newSet.delete(newWindow.id);
        return newSet;
      });
    }
  };

  const closeWindow = (id: string) => {
    setOpenWindows((prev) => {
      const remaining = prev.filter((w) => w.id !== id);
      if (activeWindowId === id) {
        if (remaining.length > 0) {
          setActiveWindowId(remaining[remaining.length - 1].id);
        } else {
          setActiveWindowId(null);
        }
      }
      return remaining;
    });
    
    setMinimizedWindows(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
  };

  const minimizeWindow = (id: string) => {
    setMinimizedWindows(prev => new Set(prev).add(id));
    if (activeWindowId === id) {
      const lastActive = [...openWindows].reverse().find(w => !minimizedWindows.has(w.id) && w.id !== id);
      setActiveWindowId(lastActive?.id || null);
    }
  };

  const restoreWindow = (id: string) => {
    setMinimizedWindows(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setActiveWindowId(id);
  };

  return { 
    openWindows, 
    activeWindowId, 
    openApp, 
    closeWindow, 
    focusWindow, 
    minimizeWindow, 
    restoreWindow, 
    minimizedWindows 
  };
};