import { Folder } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileIcon } from "./FileIcon";
import { FileItem } from "@/lib/db";

interface FileListProps {
  items: FileItem[];
  viewMode: 'grid' | 'list';
  onItemClick: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  renamingId: number | string | null;
  renameValue: string;
  setRenameValue: (val: string) => void;
  onRenameSubmit: () => void;
}

export const FileList = ({
  items, viewMode, onItemClick, onContextMenu,
  renamingId, renameValue, setRenameValue, onRenameSubmit
}: FileListProps) => {
  
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
        <Folder className="w-20 h-20 mb-4 stroke-[1.5] opacity-20" />
        <p className="text-sm">Empty Folder (IndexedDB)</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", viewMode === 'grid' ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" : "grid-cols-1")}>
      {items.map((item) => (
        <div
          key={item.id}
          onContextMenu={(e) => onContextMenu(e, item)}
          onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
          className={cn(
            "group relative rounded-lg transition-all duration-200 cursor-default border border-transparent",
            viewMode === 'grid'
              ? "flex flex-col items-center p-3 gap-2 hover:bg-blue-500/10 hover:border-blue-500/20"
              : "flex items-center p-2 gap-3 hover:bg-muted/40 px-4"
          )}
        >
          <div className={cn("relative flex items-center justify-center transition-transform group-hover:scale-105", viewMode === 'grid' ? "w-14 h-14" : "w-8 h-8")}>
            {item.type === 'image' && item.content ? (
              <img src={item.content} alt={item.name} className="w-full h-full object-cover rounded shadow-sm aspect-square" />
            ) : (
              <FileIcon type={item.type} className="w-full h-full drop-shadow-sm" />
            )}
          </div>

          <div className={cn("flex-1 min-w-0 overflow-hidden", viewMode === 'grid' && "text-center w-full")}>
            {renamingId === item.id ? (
              <Input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onRenameSubmit()}
                onBlur={onRenameSubmit}
                onClick={(e) => e.stopPropagation()}
                className="h-6 text-xs text-center px-1 min-w-0 w-full"
              />
            ) : (
              <>
                <p className="text-xs font-medium text-foreground/90 truncate" title={item.name}>{item.name}</p>
                {viewMode === 'list' && <span className="text-[10px] text-muted-foreground ml-2">{item.date}</span>}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};