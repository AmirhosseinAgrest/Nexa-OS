import React, { useState, useEffect, useRef } from "react";
import { Folder, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DesktopItem {
  id: string;
  name: string;
  type: "folder" | "file";
  x: number;
  y: number;
}

interface DesktopIconProps {
  item: DesktopItem;
  isSelected: boolean;
  isRenaming: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onRename: (newName: string) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
}

export const DesktopIcon = ({
  item,
  isSelected,
  isRenaming,
  onClick,
  onDoubleClick,
  onContextMenu,
  onRename,
  onMouseDown,
  className
}: DesktopIconProps) => {
  const [tempName, setTempName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
  if (tempName.trim()) {
    onRename(tempName);
  } else {
    setTempName(item.name);
    onRename(item.name);
  }
};

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center justify-start w-[84px] p-2 rounded-md cursor-default group transition-none",
        isSelected ? "bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm" : "hover:bg-white/5 border border-transparent",
        className
      )}
      style={{ left: item.x, top: item.y }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
     onContextMenu={(e) => {
  e.preventDefault();
  e.stopPropagation();
  onContextMenu(e);
}}
      onMouseDown={(e) => {
        if (onMouseDown) onMouseDown(e);
      }}
    >
      <div className="mb-1 drop-shadow-md pointer-events-none">
        {item.type === "folder" ? (
          <Folder className="w-12 h-12 text-blue-400 fill-blue-400/20" strokeWidth={1.5} />
        ) : (
          <FileText className="w-12 h-12 text-gray-200 fill-gray-100/10" strokeWidth={1} />
        )}
      </div>

      {isRenaming ? (
        <input
          ref={inputRef}
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit();
          }}
          className="w-full text-center text-xs bg-background border border-blue-500 rounded px-1 text-foreground outline-none z-50 shadow-xl"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={cn(
          "text-xs text-center text-white font-medium break-words w-full px-1.5 py-0.5 rounded-sm shadow-black/80 drop-shadow-md select-none pointer-events-none",
          isSelected ? "bg-blue-600" : "line-clamp-2"
        )}>
          {item.name}
        </span>
      )}
    </div>
  );
};