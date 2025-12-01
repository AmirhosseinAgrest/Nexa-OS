import { Folder, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const FileIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'folder': return <Folder className={cn("text-blue-500 fill-blue-500/20", className)} />;
    case 'note': return <FileText className={cn("text-yellow-500 fill-yellow-500/10", className)} />;
    case 'image': return <ImageIcon className={cn("text-purple-500 fill-purple-500/10", className)} />;
    default: return <FileText className={cn("text-gray-400", className)} />;
  }
};