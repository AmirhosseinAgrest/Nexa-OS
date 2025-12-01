import React, { useState } from "react";
import {
  Settings, FolderOpen, FileText, Music, Globe,
  Layout, Power, Palette, Terminal as TerminalIcon,
  AppWindow, Monitor, Info, Gamepad
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PowerMenu } from "./PowerMenu";
import { SystemTray } from "./SystemTray";

export interface AppInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}
export const apps: AppInfo[] = [
  { id: "explorer", name: "File Explorer", icon: FolderOpen, color: "text-blue-500" },
  { id: "browser", name: "Agrest Browser", icon: Globe, color: "text-emerald-500" },
  { id: "notes", name: "Notes", icon: FileText, color: "text-yellow-500" },
  { id: "media", name: "Media Player", icon: Music, color: "text-purple-500" },
  { id: "paint", name: "Paint", icon: Palette, color: "text-pink-500" },
  { id: "terminal", name: "Terminal", icon: TerminalIcon, color: "text-gray-400" },
  { id: "settings", name: "Settings", icon: Settings, color: "text-slate-500" },
  { id: "about", name: "About", icon: Info, color: "text-slate-500" },
  { id: "GameCenter", name: "arcade", icon: Gamepad, color: "text-slate-500" },
];

interface TaskbarProps {
  onAppClick: (appId: string) => void;
  activeApps: string[];
  isStartOpen: boolean;
  onToggleStart: () => void;
}


export const Taskbar = ({
  onAppClick,
  activeApps,
  isStartOpen,
  onToggleStart 
}: TaskbarProps) => {

  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  return (
    <>
      <div className="fixed bottom-4 left-0 right-0 flex justify-center items-end z-[1000] pointer-events-none">

        <div className="pointer-events-auto flex items-center gap-4 px-4 py-3 mx-4 bg-background/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 hover:bg-background/70">

          <div className="flex items-center gap-1">
            <TaskbarButton
              icon={Layout}
              label="Start"
              isActive={isStartOpen}
              onClick={onToggleStart}
            />
            <div className="w-px h-8 bg-white/10 mx-1" />
            <TaskbarButton
              icon={Power}
              label="Power"
              onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
              isActive={isPowerMenuOpen}
              className="hover:bg-red-500/10 hover:text-red-500"
            />
          </div>

          <div className="flex items-center gap-2 px-2">
            {apps.map((app) => {
              const isActive = activeApps.includes(app.id);

              return (
                <div
                  key={app.id}
                  className="relative group flex flex-col items-center"
                  onMouseEnter={() => setHoveredApp(app.name)}
                  onMouseLeave={() => setHoveredApp(null)}
                >
                  <div className={cn(
                    "absolute -top-14 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg",
                    hoveredApp === app.name ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
                  )}>
                    {app.name}
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-r border-b border-white/10" />
                  </div>

                  <button
                    onClick={() => onAppClick(app.id)}
                    className={cn(
                      "relative p-3 rounded-xl transition-all duration-300 ease-out group-hover:bg-white/10",
                      "hover:-translate-y-2 hover:scale-110",
                      "active:scale-95 active:translate-y-0",
                      isActive ? "bg-white/5" : ""
                    )}
                  >
                    <app.icon
                      className={cn(
                        "h-6 w-6 transition-all duration-300 drop-shadow-sm",
                        isActive || hoveredApp === app.name ? app.color : "text-muted-foreground",
                        isActive ? `drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]` : ""
                      )}
                    />

                    <span className={cn(
                      "absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-300",
                      isActive
                        ? "w-6 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" 
                        : "w-1 bg-white/30 group-hover:w-2 group-hover:bg-white/50" 
                    )} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <SystemTray />
          </div>

        </div>
      </div>

      <PowerMenu
        isOpen={isPowerMenuOpen}
        onClose={() => setIsPowerMenuOpen(false)}
        position={{ x: 20, y: window.innerHeight - 80 }}
      />
    </>
  );
};

const TaskbarButton = ({ icon: Icon, onClick, className, isActive, label }: any) => (
  <div className="relative group">
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded border border-white/10 pointer-events-none whitespace-nowrap mb-1 z-50">
      {label}
    </div>

    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl transition-all duration-200 active:scale-95",
        isActive ? "bg-white/10 text-foreground" : "text-muted-foreground",
        className
      )}
    >
      <Icon className="h-6 w-6" />
    </button>
  </div>
);