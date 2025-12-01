import { Eye, Download, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileItem } from "@/lib/db";
import { createPortal } from "react-dom";

interface ContextMenuProps {
  x: number;
  y: number;
  item: FileItem;
  onOpen: () => void;
  onDownload: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const ContextMenu = ({ x, y, item, onOpen, onDownload, onRename, onDelete }: ContextMenuProps) => {
  
  return createPortal(
    <div
      className="fixed z-[9999] w-48 bg-background/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-2 py-1.5 text-xs font-semibold text-foreground/80 border-b border-white/10 mb-1 truncate">
        {item.name}
      </div>
      
      <MenuButton icon={Eye} label="Open" onClick={onOpen} />
      
      {item.content && (
        <MenuButton icon={Download} label="Download" onClick={onDownload} />
      )}
      
      {item.type !== 'folder' && (
        <>
          <div className="h-px bg-white/10 my-1" />
          <MenuButton icon={Edit2} label="Rename" onClick={onRename} />
          <MenuButton 
            icon={Trash2} 
            label="Delete" 
            onClick={onDelete} 
            className="text-red-400 hover:text-red-500 hover:bg-red-500/10" 
          />
        </>
      )}
    </div>,
    document.body
  );
};

const MenuButton = ({ icon: Icon, label, onClick, className }: any) => (
    <Button 
        variant="ghost" 
        size="sm" 
        className={`w-full justify-start text-xs h-8 rounded-sm font-normal px-2 ${className}`} 
        onClick={onClick}
    >
        <Icon className="w-3.5 h-3.5 mr-2 opacity-70" /> {label}
    </Button>
);