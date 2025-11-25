import React, { useEffect, useRef } from "react";
import { RefreshCw, Image, FolderPlus, Settings, LogOut, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
}

export const ContextMenu = ({ x, y, onClose, onAction }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] bg-background/80 backdrop-blur-xl border border-border/50 rounded-lg shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()} 
    >
      <MenuItem icon={RefreshCw} label="Refresh" onClick={() => onAction("refresh")} shortcut="F5" />
      <div className="my-1 h-px bg-border/50" />
      
      <MenuItem icon={FolderPlus} label="New Folder" onClick={() => onAction("new_folder")} />
      <MenuItem icon={Image} label="Change Wallpaper" onClick={() => onAction("wallpaper")} />
      <MenuItem icon={Settings} label="Settings" onClick={() => onAction("settings")} />
      
      <div className="my-1 h-px bg-border/50" />
      <MenuItem icon={Monitor} label="Display Settings" onClick={() => onAction("display")} disabled />
      <div className="my-1 h-px bg-border/50" />
      
      <MenuItem icon={LogOut} label="Shut Down" onClick={() => onAction("shutdown")} className="text-red-500 hover:text-red-600 hover:bg-red-500/10" />
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, shortcut, disabled, className }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
      disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:text-foreground cursor-default",
      className
    )}
  >
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    {shortcut && <span className="text-xs text-muted-foreground ml-4">{shortcut}</span>}
  </button>
);