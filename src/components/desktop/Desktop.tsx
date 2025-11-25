import { useEffect, useState } from "react";
import { Taskbar, apps } from "./Taskbar";
import { Window } from "./Window";
import { Settings } from "./apps/Settings";
import { FileExplorer } from "./apps/FileExplorer";
import { Notes } from "./apps/Notes";
import { MediaPlayer } from "./apps/MediaPlayer";
import { AgrestBrowser } from "./apps/AgrestBrowser";
import { Terminal } from "./apps/Terminal";
import { AboutApp } from "./apps/AboutApp";
import { SmartWidget } from "./widgets/SmartWidget";
import { useTheme } from "@/contexts/ThemeContext";
import { PaintApp } from "./apps/Paint";
import { ContextMenu } from "./ContextMenu";
import { StartMenu } from "./StartMenu";


const appComponents: Record<string, React.ComponentType> = {
  settings: Settings,
  explorer: FileExplorer,
  notes: Notes,
  media: MediaPlayer,
  browser: AgrestBrowser,
  terminal: Terminal,
  paint: PaintApp,
  about: AboutApp,
};

export const Desktop = () => {
  const { isDark } = useTheme();
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectionBox({
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      });
    }
  };
  const [showStartMenu, setShowStartMenu] = useState(false);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  interface OpenWindow {
    id: string;
    appId: string;
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectionBox) {
      setSelectionBox({
        ...selectionBox,
        currentX: e.clientX,
        currentY: e.clientY,
      });
    }
  };

  const handleMouseUp = () => {
    setSelectionBox(null);
  };

  useEffect(() => {
    const savedBg = localStorage.getItem("nexa_background");
    setBgImage(savedBg || "/default-wallpaper.png");
  }, []);

  const handleAppClick = (appId: string) => {
    const existingWindow = openWindows.find((w) => w.appId === appId);
    if (existingWindow) {
      setActiveWindowId(existingWindow.id);
    } else {
      const newWindow: OpenWindow = {
        id: `${appId}-${Date.now()}`,
        appId,
      };
      setOpenWindows([...openWindows, newWindow]);
      setActiveWindowId(newWindow.id);
    }
  };

  const handleCloseWindow = (id: string) => {
    setOpenWindows(openWindows.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(openWindows[0]?.id || null);
    }
  };

  return (
    <div
      className="h-screen w-full overflow-hidden relative transition-colors duration-700"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/10 rounded-full blur-[140px] animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <SmartWidget />

      {openWindows.map((window) => {
        const app = apps.find((a) => a.id === window.appId);
        const AppComponent = appComponents[window.appId];
        if (!app || !AppComponent) return null;

        return (
          <Window
            key={window.id}
            id={window.id}
            title={app.name}
            icon={app.icon}
            onClose={() => handleCloseWindow(window.id)}
            isActive={activeWindowId === window.id}
            onFocus={() => setActiveWindowId(window.id)}
          >
            <AppComponent />
          </Window>
        );
      })}

      {selectionBox && (
        <div
          className="absolute border border-blue-400 bg-blue-400/30 backdrop-blur-sm rounded-sm"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
          }}
        />
      )}

      <Taskbar
        onAppClick={handleAppClick}
        activeApps={openWindows.map((w) => w.appId)}
        isStartOpen={showStartMenu}
        onToggleStart={() => setShowStartMenu(!showStartMenu)} 
      />

      <StartMenu
        isOpen={showStartMenu}
        onClose={() => setShowStartMenu(false)}
        onAppClick={handleAppClick}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={(action) => {
            setContextMenu(null);
            if (action === "refresh") {
              window.location.reload();
            } else if (action === "new_folder") {

            } else if (action === "wallpaper") {

            } else if (action === "settings") {
              handleAppClick("settings");
            } else if (action === "shutdown") {
              alert("Shutting down Nexa OS...");
            }
          }}
        />
      )}

    </div>
  );
};