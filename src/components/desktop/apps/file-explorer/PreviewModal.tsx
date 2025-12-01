import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./FileIcon";
import { FileItem } from "@/lib/db";

interface PreviewModalProps {
  item: FileItem;
  onClose: () => void;
  onDownload: (item: FileItem) => void;
}

export const PreviewModal = ({ item, onClose, onDownload }: PreviewModalProps) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-background/95 backdrop-blur-2xl rounded-xl shadow-2xl max-w-3xl w-full max-h-[80%] flex flex-col overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileIcon type={item.type} className="w-4 h-4" />
            <span>{item.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/20 hover:text-red-500" onClick={onClose}>
            <div className="w-4 h-4">✕</div>
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-8 bg-muted/10 flex items-center justify-center">
          {item.type === 'image' && item.content ? (
            <img src={item.content} alt={item.name} className="max-w-full max-h-[50vh] rounded shadow-2xl" />
          ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
              <FileText className="w-16 h-16 opacity-20" />
              <p>Preview not available</p>
              <Button size="sm" onClick={() => onDownload(item)}>Download to view</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};