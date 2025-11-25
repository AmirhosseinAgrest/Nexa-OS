<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, FileText, Image as ImageIcon, Music, Video, 
  ChevronRight, Upload, MoreVertical, Trash2, Edit2, 
  Eye, Grid, List as ListIcon, ArrowLeft, Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FileItem {
  id: number | string;
  name: string;
  type: 'folder' | 'note' | 'image' | 'file';
  content?: string;
  date: string;
  size?: string;
}

const FileIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'folder': return <Folder className={cn("text-blue-400 fill-blue-400/20", className)} />;
    case 'note': return <FileText className={cn("text-yellow-500", className)} />;
    case 'image': return <ImageIcon className={cn("text-purple-500", className)} />;
    default: return <FileText className={cn("text-gray-400", className)} />;
  }
};

export const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState<string>("root"); 
  const [items, setItems] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: FileItem } | null>(null);
  const [renamingId, setRenamingId] = useState<number | string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadFiles = () => {
    const allItems: FileItem[] = [];

    if (currentPath === "root") {
      allItems.push(
        { id: 'folder-docs', name: 'Documents', type: 'folder', date: '-', size: 'System' },
        { id: 'folder-pics', name: 'Pictures', type: 'folder', date: '-', size: 'System' },
      );
    } 
    else if (currentPath === "documents") {
      const savedNotes = localStorage.getItem("nexa_notes");
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        parsed.forEach((note: any) => {
          allItems.push({ 
            id: note.id, 
            name: note.title || "Untitled", 
            type: 'note', 
            content: note.content,
            date: note.date 
          });
        });
      }
    } 
    else if (currentPath === "pictures") {
      const savedUploads = localStorage.getItem("nexa_uploads");
      if (savedUploads) {
        const parsed = JSON.parse(savedUploads);
        allItems.push(...parsed);
      }
    }
    setItems(allItems);
  };

  useEffect(() => {
    loadFiles();
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [currentPath]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newItem: FileItem = {
        id: Date.now(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        content: base64,
        date: new Date().toLocaleDateString(),
        size: `${(file.size / 1024).toFixed(1)} KB`
      };

      const existing = JSON.parse(localStorage.getItem("nexa_uploads") || "[]");
      const updated = [...existing, newItem];
      localStorage.setItem("nexa_uploads", JSON.stringify(updated));
      
      if (currentPath === "pictures") loadFiles();
      else if (file.type.startsWith('image/')) setCurrentPath("pictures");
    };
    reader.readAsDataURL(file);
  };

  const handleRename = () => {
    if (!renamingId || !renameValue.trim()) {
        setRenamingId(null);
        return;
    }

    if (currentPath === "documents") {
        const savedNotes = JSON.parse(localStorage.getItem("nexa_notes") || "[]");
        const updated = savedNotes.map((n: any) => n.id === renamingId ? { ...n, title: renameValue } : n);
        localStorage.setItem("nexa_notes", JSON.stringify(updated));
    } else if (currentPath === "pictures") {
        const savedUploads = JSON.parse(localStorage.getItem("nexa_uploads") || "[]");
        const updated = savedUploads.map((n: any) => n.id === renamingId ? { ...n, name: renameValue } : n);
        localStorage.setItem("nexa_uploads", JSON.stringify(updated));
    }

    loadFiles();
    setRenamingId(null);
  };

  const handleDelete = (item: FileItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        if (item.type === 'note') {
            const savedNotes = JSON.parse(localStorage.getItem("nexa_notes") || "[]");
            const updated = savedNotes.filter((n: any) => n.id !== item.id);
            localStorage.setItem("nexa_notes", JSON.stringify(updated));
        } else {
            const savedUploads = JSON.parse(localStorage.getItem("nexa_uploads") || "[]");
            const updated = savedUploads.filter((n: any) => n.id !== item.id);
            localStorage.setItem("nexa_uploads", JSON.stringify(updated));
        }
        loadFiles();
    }
  };

  const onRightClick = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleItemClick = (item: FileItem) => {
    if (renamingId) return;

    if (item.type === 'folder') {
        if (item.name === 'Documents') setCurrentPath("documents");
        if (item.name === 'Pictures') setCurrentPath("pictures");
    } else {
        setPreviewItem(item);
    }
  };

  return (
    <div className="flex w-full h-full max-w-6xl mx-auto bg-background/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden select-none dark:bg-black/50">
      
      <div className="w-60 bg-muted/40 border-r border-border/30 flex flex-col p-4 pt-6 gap-1">
        <h2 className="px-4 mb-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Favorites</h2>
        
        <Button 
            variant={currentPath === "root" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 font-medium"
            onClick={() => setCurrentPath("root")}
        >
            <Laptop className="w-4 h-4 text-blue-500" /> This PC
        </Button>
        <Button 
            variant={currentPath === "documents" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 font-medium"
            onClick={() => setCurrentPath("documents")}
        >
            <FileText className="w-4 h-4 text-yellow-500" /> Documents
        </Button>
        <Button 
            variant={currentPath === "pictures" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 font-medium"
            onClick={() => setCurrentPath("pictures")}
        >
            <ImageIcon className="w-4 h-4 text-purple-500" /> Pictures
        </Button>

        <div className="mt-auto pt-4 border-t border-border/30">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
            <Button className="w-full bg-primary shadow-lg shadow-primary/20" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Upload File
            </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col" ref={containerRef}>
        
        <div className="h-16 border-b border-border/30 flex items-center justify-between px-6 bg-background/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled={currentPath === "root"} onClick={() => setCurrentPath("root")}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center text-sm bg-muted/50 px-3 py-1.5 rounded-md border border-border/20">
                    <span className="text-muted-foreground">This PC</span>
                    {currentPath !== "root" && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                            <span className="font-medium capitalize">{currentPath}</span>
                        </>
                    )}
                </div>
            </div>
            
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border border-border/20">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('grid')}>
                    <Grid className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('list')}>
                    <ListIcon className="w-4 h-4" />
                </Button>
            </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto" onClick={() => { setRenamingId(null); setContextMenu(null); }}>
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <Folder className="w-16 h-16 mb-4 stroke-1" />
                    <p>This folder is empty</p>
                </div>
            ) : (
                <div className={cn("grid gap-4", viewMode === 'grid' ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-1")}>
                    {items.map((item) => (
                        <div 
                            key={item.id}
                            onContextMenu={(e) => onRightClick(e, item)}
                            onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                            className={cn(
                                "group relative rounded-xl transition-all duration-200 cursor-pointer border hover:shadow-md hover:scale-[1.02]",
                                viewMode === 'grid' 
                                    ? "flex flex-col items-center p-4 gap-3 bg-card/40 border-transparent hover:bg-card/80 hover:border-border/50" 
                                    : "flex items-center p-3 gap-4 bg-card/20 border-border/20 hover:bg-card/50"
                            )}
                        >
                            <div className={cn("relative flex items-center justify-center transition-transform", viewMode === 'grid' ? "w-16 h-16" : "w-10 h-10")}>
                                {item.type === 'image' && item.content ? (
                                    <img src={item.content} alt={item.name} className="w-full h-full object-cover rounded-lg shadow-sm" />
                                ) : (
                                    <FileIcon type={item.type} className="w-full h-full" />
                                )}
                            </div>

                            <div className={cn("flex-1 min-w-0", viewMode === 'grid' && "text-center w-full")}>
                                {renamingId === item.id ? (
                                    <Input 
                                        autoFocus
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                        onBlur={handleRename}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-7 text-xs text-center px-1"
                                    />
                                ) : (
                                    <>
                                        <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.date}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {contextMenu && (
        <div 
            className="fixed z-50 w-48 bg-background/95 backdrop-blur border border-border/50 rounded-lg shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border/50 mb-1 truncate">
                {contextMenu.item.name}
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8" onClick={() => setPreviewItem(contextMenu.item)}>
                <Eye className="w-3 h-3 mr-2" /> Open / Preview
            </Button>
            {contextMenu.item.type !== 'folder' && (
                <>
                    <Button 
                        variant="ghost" size="sm" className="w-full justify-start text-xs h-8" 
                        onClick={() => {
                            setRenamingId(contextMenu.item.id);
                            setRenameValue(contextMenu.item.name);
                            setContextMenu(null);
                        }}
                    >
                        <Edit2 className="w-3 h-3 mr-2" /> Rename
                    </Button>
                    <Button 
                        variant="ghost" size="sm" className="w-full justify-start text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => {
                            handleDelete(contextMenu.item);
                            setContextMenu(null);
                        }}
                    >
                        <Trash2 className="w-3 h-3 mr-2" /> Delete
                    </Button>
                </>
            )}
        </div>
      )}

      {previewItem && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-full flex flex-col overflow-hidden border border-border/50">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <FileIcon type={previewItem.type} className="w-5 h-5" />
                        <h3 className="font-bold">{previewItem.name}</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>Close</Button>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-muted/10 flex items-center justify-center">
                    {previewItem.type === 'image' ? (
                        <img src={previewItem.content} alt={previewItem.name} className="max-w-full max-h-[60vh] rounded shadow-lg" />
                    ) : previewItem.type === 'note' ? (
                        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 p-8 shadow-lg rounded min-h-[300px]" dangerouslySetInnerHTML={{ __html: previewItem.content || "" }} />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <p>Preview not available for this file type.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
=======
import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, FileText, Image as ImageIcon, Music, Video, 
  ChevronRight, Upload, MoreVertical, Trash2, Edit2, 
  Eye, Grid, List as ListIcon, ArrowLeft, Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FileItem {
  id: number | string;
  name: string;
  type: 'folder' | 'note' | 'image' | 'file';
  content?: string;
  date: string;
  size?: string;
}

const FileIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'folder': return <Folder className={cn("text-blue-400 fill-blue-400/20", className)} />;
    case 'note': return <FileText className={cn("text-yellow-500", className)} />;
    case 'image': return <ImageIcon className={cn("text-purple-500", className)} />;
    default: return <FileText className={cn("text-gray-400", className)} />;
  }
};

export const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState<string>("root"); 
  const [items, setItems] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: FileItem } | null>(null);
  const [renamingId, setRenamingId] = useState<number | string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadFiles = () => {
    const allItems: FileItem[] = [];

    if (currentPath === "root") {
      allItems.push(
        { id: 'folder-docs', name: 'Documents', type: 'folder', date: '-', size: 'System' },
        { id: 'folder-pics', name: 'Pictures', type: 'folder', date: '-', size: 'System' },
      );
    } 
    else if (currentPath === "documents") {
      const savedNotes = localStorage.getItem("nexa_notes");
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        parsed.forEach((note: any) => {
          allItems.push({ 
            id: note.id, 
            name: note.title || "Untitled", 
            type: 'note', 
            content: note.content,
            date: note.date 
          });
        });
      }
    } 
    else if (currentPath === "pictures") {
      const savedUploads = localStorage.getItem("nexa_uploads");
      if (savedUploads) {
        const parsed = JSON.parse(savedUploads);
        allItems.push(...parsed);
      }
    }
    setItems(allItems);
  };

  useEffect(() => {
    loadFiles();
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [currentPath]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newItem: FileItem = {
        id: Date.now(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        content: base64,
        date: new Date().toLocaleDateString(),
        size: `${(file.size / 1024).toFixed(1)} KB`
      };

      const existing = JSON.parse(localStorage.getItem("nexa_uploads") || "[]");
      const updated = [...existing, newItem];
      localStorage.setItem("nexa_uploads", JSON.stringify(updated));
      
      if (currentPath === "pictures") loadFiles();
      else if (file.type.startsWith('image/')) setCurrentPath("pictures");
    };
    reader.readAsDataURL(file);
  };

  const handleRename = () => {
    if (!renamingId || !renameValue.trim()) {
        setRenamingId(null);
        return;
    }

    if (currentPath === "documents") {
        const savedNotes = JSON.parse(localStorage.getItem("nexa_notes") || "[]");
        const updated = savedNotes.map((n: any) => n.id === renamingId ? { ...n, title: renameValue } : n);
        localStorage.setItem("nexa_notes", JSON.stringify(updated));
    } else if (currentPath === "pictures") {
        const savedUploads = JSON.parse(localStorage.getItem("nexa_uploads") || "[]");
        const updated = savedUploads.map((n: any) => n.id === renamingId ? { ...n, name: renameValue } : n);
        localStorage.setItem("nexa_uploads", JSON.stringify(updated));
    }

    loadFiles();
    setRenamingId(null);
  };

  const handleDelete = (item: FileItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        if (item.type === 'note') {
            const savedNotes = JSON.parse(localStorage.getItem("nexa_notes") || "[]");
            const updated = savedNotes.filter((n: any) => n.id !== item.id);
            localStorage.setItem("nexa_notes", JSON.stringify(updated));
        } else {
            const savedUploads = JSON.parse(localStorage.getItem("nexa_uploads") || "[]");
            const updated = savedUploads.filter((n: any) => n.id !== item.id);
            localStorage.setItem("nexa_uploads", JSON.stringify(updated));
        }
        loadFiles();
    }
  };

  const onRightClick = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleItemClick = (item: FileItem) => {
    if (renamingId) return;

    if (item.type === 'folder') {
        if (item.name === 'Documents') setCurrentPath("documents");
        if (item.name === 'Pictures') setCurrentPath("pictures");
    } else {
        setPreviewItem(item);
    }
  };

  return (
    <div className="flex w-full h-full max-w-6xl mx-auto bg-background/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden select-none dark:bg-black/50">
      
      <div className="w-60 bg-muted/40 border-r border-border/30 flex flex-col p-4 pt-6 gap-1">
        <h2 className="px-4 mb-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Favorites</h2>
        
        <Button 
            variant={currentPath === "root" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 font-medium"
            onClick={() => setCurrentPath("root")}
        >
            <Laptop className="w-4 h-4 text-blue-500" /> This PC
        </Button>
        <Button 
            variant={currentPath === "documents" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 font-medium"
            onClick={() => setCurrentPath("documents")}
        >
            <FileText className="w-4 h-4 text-yellow-500" /> Documents
        </Button>
        <Button 
            variant={currentPath === "pictures" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3 font-medium"
            onClick={() => setCurrentPath("pictures")}
        >
            <ImageIcon className="w-4 h-4 text-purple-500" /> Pictures
        </Button>

        <div className="mt-auto pt-4 border-t border-border/30">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
            <Button className="w-full bg-primary shadow-lg shadow-primary/20" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Upload File
            </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col" ref={containerRef}>
        
        <div className="h-16 border-b border-border/30 flex items-center justify-between px-6 bg-background/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled={currentPath === "root"} onClick={() => setCurrentPath("root")}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center text-sm bg-muted/50 px-3 py-1.5 rounded-md border border-border/20">
                    <span className="text-muted-foreground">This PC</span>
                    {currentPath !== "root" && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                            <span className="font-medium capitalize">{currentPath}</span>
                        </>
                    )}
                </div>
            </div>
            
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border border-border/20">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('grid')}>
                    <Grid className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('list')}>
                    <ListIcon className="w-4 h-4" />
                </Button>
            </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto" onClick={() => { setRenamingId(null); setContextMenu(null); }}>
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <Folder className="w-16 h-16 mb-4 stroke-1" />
                    <p>This folder is empty</p>
                </div>
            ) : (
                <div className={cn("grid gap-4", viewMode === 'grid' ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-1")}>
                    {items.map((item) => (
                        <div 
                            key={item.id}
                            onContextMenu={(e) => onRightClick(e, item)}
                            onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                            className={cn(
                                "group relative rounded-xl transition-all duration-200 cursor-pointer border hover:shadow-md hover:scale-[1.02]",
                                viewMode === 'grid' 
                                    ? "flex flex-col items-center p-4 gap-3 bg-card/40 border-transparent hover:bg-card/80 hover:border-border/50" 
                                    : "flex items-center p-3 gap-4 bg-card/20 border-border/20 hover:bg-card/50"
                            )}
                        >
                            <div className={cn("relative flex items-center justify-center transition-transform", viewMode === 'grid' ? "w-16 h-16" : "w-10 h-10")}>
                                {item.type === 'image' && item.content ? (
                                    <img src={item.content} alt={item.name} className="w-full h-full object-cover rounded-lg shadow-sm" />
                                ) : (
                                    <FileIcon type={item.type} className="w-full h-full" />
                                )}
                            </div>

                            <div className={cn("flex-1 min-w-0", viewMode === 'grid' && "text-center w-full")}>
                                {renamingId === item.id ? (
                                    <Input 
                                        autoFocus
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                        onBlur={handleRename}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-7 text-xs text-center px-1"
                                    />
                                ) : (
                                    <>
                                        <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.date}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {contextMenu && (
        <div 
            className="fixed z-50 w-48 bg-background/95 backdrop-blur border border-border/50 rounded-lg shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border/50 mb-1 truncate">
                {contextMenu.item.name}
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8" onClick={() => setPreviewItem(contextMenu.item)}>
                <Eye className="w-3 h-3 mr-2" /> Open / Preview
            </Button>
            {contextMenu.item.type !== 'folder' && (
                <>
                    <Button 
                        variant="ghost" size="sm" className="w-full justify-start text-xs h-8" 
                        onClick={() => {
                            setRenamingId(contextMenu.item.id);
                            setRenameValue(contextMenu.item.name);
                            setContextMenu(null);
                        }}
                    >
                        <Edit2 className="w-3 h-3 mr-2" /> Rename
                    </Button>
                    <Button 
                        variant="ghost" size="sm" className="w-full justify-start text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => {
                            handleDelete(contextMenu.item);
                            setContextMenu(null);
                        }}
                    >
                        <Trash2 className="w-3 h-3 mr-2" /> Delete
                    </Button>
                </>
            )}
        </div>
      )}

      {previewItem && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-full flex flex-col overflow-hidden border border-border/50">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <FileIcon type={previewItem.type} className="w-5 h-5" />
                        <h3 className="font-bold">{previewItem.name}</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>Close</Button>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-muted/10 flex items-center justify-center">
                    {previewItem.type === 'image' ? (
                        <img src={previewItem.content} alt={previewItem.name} className="max-w-full max-h-[60vh] rounded shadow-lg" />
                    ) : previewItem.type === 'note' ? (
                        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 p-8 shadow-lg rounded min-h-[300px]" dangerouslySetInnerHTML={{ __html: previewItem.content || "" }} />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <p>Preview not available for this file type.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
>>>>>>> f5d5eb86e14e0304daf65e69e1f9fe5fb5b06183
};