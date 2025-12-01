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

  const openApp = (appId: string, props?: any) => {
    const allowMultiple = appId === "video-player" || appId === "explorer";
    const existingWindow = !allowMultiple && openWindows.find((w) => w.appId === appId);

    if (existingWindow) {
      setActiveWindowId(existingWindow.id);
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
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
  };

  return { openWindows, activeWindowId, openApp, closeWindow, focusWindow };
};