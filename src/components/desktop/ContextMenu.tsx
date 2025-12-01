import React, { useEffect, useRef } from "react";
import { RefreshCw, Image, FolderPlus, Settings, LogOut, Monitor, FolderOpen, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContextMenuType = "desktop" | "folder" | "file";

interface ContextMenuProps {
  x: number;
  y: number;
  type: ContextMenuType; 
  onClose: () => void;
  onAction: (action: string) => void;
}

export const ContextMenu = ({ x, y, type, onClose, onAction }: ContextMenuProps) => {
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
      className="fixed z-[9999] min-w-[220px] bg-background/70 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()} 
    >
      {type === "desktop" && (
        <>
            <MenuItem icon={RefreshCw} label="Refresh" onClick={() => onAction("refresh")} shortcut="F5" />
            <div className="my-1 h-px bg-white/10" />
            
            <MenuItem icon={FolderPlus} label="New Folder" onClick={() => onAction("new_folder")} />
            <MenuItem icon={Image} label="Change Wallpaper" onClick={() => onAction("wallpaper")} />
            <MenuItem icon={Settings} label="Settings" onClick={() => onAction("settings")} />
            
            <div className="my-1 h-px bg-white/10" />
            <MenuItem icon={Monitor} label="Display Settings" onClick={() => onAction("display")} disabled />
            <div className="my-1 h-px bg-white/10" />
            
            <MenuItem icon={LogOut} label="Shut Down" onClick={() => onAction("shutdown")} className="text-red-400 hover:text-red-500 hover:bg-red-500/10" />
        </>
      )}

      {(type === "folder" || type === "file") && (
        <>
            <MenuItem icon={FolderOpen} label="Open" onClick={() => onAction("open")} className="font-bold" />
            <div className="my-1 h-px bg-white/10" />
            <MenuItem icon={Edit2} label="Rename" onClick={() => onAction("rename")} shortcut="F2"/>
            <MenuItem icon={Trash2} label="Delete" onClick={() => onAction("delete")} className="text-red-400 hover:text-red-500 hover:bg-red-500/10" />
        </>
      )}
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, shortcut, disabled, className }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors text-foreground/90",
      disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/20 hover:text-foreground cursor-default",
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