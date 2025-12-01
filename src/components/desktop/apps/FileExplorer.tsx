import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { saveFileToDB, getFilesByCategory, deleteFileFromDB, FileItem } from "@/lib/db";

import { Sidebar } from "./file-explorer/Sidebar";
import { Header } from "./file-explorer/Header";
import { FileList } from "./file-explorer/FileList";
import { ContextMenu } from "./file-explorer/ContextMenu";
import { PreviewModal } from "./file-explorer/PreviewModal";

const GeneralContextMenu = ({ x, y, onUpload, onRefresh }: any) => {
  return createPortal(
    <div 
      className="fixed z-[9999] w-40 bg-background/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1"
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button onClick={onUpload} className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 rounded transition-colors">Upload File</button>
      <button onClick={onRefresh} className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 rounded transition-colors">Refresh</button>
    </div>,
    document.body
  );
};

interface FileExplorerProps {
  onOpenApp?: (appId: string, props?: any) => void;
}

export const FileExplorer = ({ onOpenApp }: FileExplorerProps) => {
  const [currentPath, setCurrentPath] = useState<string>("root");
  const [items, setItems] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [fileContextMenu, setFileContextMenu] = useState<{ x: number, y: number, item: FileItem } | null>(null);
  const [generalContextMenu, setGeneralContextMenu] = useState<{ x: number, y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<number | string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const loadFiles = async () => { if (currentPath === "root") { setItems([{ id: 'folder-desktop', name: 'Desktop', type: 'folder', category: 'system', date: '-', size: 'System' }, { id: 'folder-docs', name: 'Documents', type: 'folder', category: 'system', date: '-', size: 'System' }, { id: 'folder-pics', name: 'Pictures', type: 'folder', category: 'system', date: '-', size: 'System' }]); } else { const files = await getFilesByCategory(currentPath); setItems(files); } };
  useEffect(() => { loadFiles(); setSearchQuery(""); const handleClick = () => { setFileContextMenu(null); setGeneralContextMenu(null); }; window.addEventListener('click', handleClick); window.addEventListener('scroll', handleClick, true); return () => { window.removeEventListener('click', handleClick); window.removeEventListener('scroll', handleClick, true); }; }, [currentPath]);
  const processedItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => { let comparison = 0; if (sortBy === 'name') comparison = a.name.localeCompare(b.name); if (sortBy === 'date') comparison = a.date.localeCompare(b.date); if (sortBy === 'size') comparison = (a.size || "").localeCompare(b.size || ""); return sortOrder === 'asc' ? comparison : -comparison; });
  const handleItemClick = (item: FileItem) => { if (renamingId) return; if (item.type === 'folder') { if (item.name.toLowerCase() === 'desktop') setCurrentPath("desktop"); else if (item.name.toLowerCase() === 'documents') setCurrentPath("documents"); else if (item.name.toLowerCase() === 'pictures') setCurrentPath("pictures"); } else { if (item.type === 'video' || item.type === 'music') { if (onOpenApp) onOpenApp("media", { fileId: item.id }); } else { setPreviewItem(item); } } };
  const handleFileUpload = async (files: FileList | null) => { if (!files || files.length === 0) return; if (currentPath === 'root') { alert("Please select a folder first."); return; } const file = files[0]; const reader = new FileReader(); reader.onload = async () => { const base64 = reader.result as string; let fileType: 'image' | 'video' | 'music' | 'file' = 'file'; if (file.type.startsWith('image/')) fileType = 'image'; else if (file.type.startsWith('video/')) fileType = 'video'; else if (file.type.startsWith('audio/')) fileType = 'music'; const newItem: FileItem = { id: Date.now(), name: file.name, type: fileType, category: currentPath, content: base64, date: new Date().toLocaleDateString(), size: `${(file.size / 1024).toFixed(1)} KB` }; await saveFileToDB(newItem); loadFiles(); }; reader.readAsDataURL(file); };
  const handleRename = async () => { if (!renamingId || !renameValue.trim()) { setRenamingId(null); return; } const itemToRename = items.find(i => i.id === renamingId); if (itemToRename) { const updatedItem = { ...itemToRename, name: renameValue }; await saveFileToDB(updatedItem); loadFiles(); } setRenamingId(null); };
  const handleDelete = async (item: FileItem) => { if (!confirm(`Delete "${item.name}" permanently?`)) return; await deleteFileFromDB(item.id); loadFiles(); };
  const handleDownload = (item: FileItem) => { if(!item.content) return; const link = document.createElement("a"); link.href = item.content; link.download = item.name; document.body.appendChild(link); link.click(); document.body.removeChild(link); };


  return (
    <div 
        className="flex w-full h-full bg-background/80 backdrop-blur-2xl rounded-none md:rounded-lg overflow-hidden select-none relative"
        onContextMenu={(e) => { e.preventDefault(); }}
    >
      <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />

      <div className="flex-1 flex flex-col">
        <Header 
            currentPath={currentPath}
            onNavigate={setCurrentPath}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortOrder={sortOrder}
            setSortBy={setSortBy}
            setSortOrder={setSortOrder}
            onUploadClick={() => fileInputRef.current?.click()}
        />
        
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />

        <div 
            className="flex-1 overflow-y-auto p-4 custom-scrollbar"
            onContextMenu={(e) => {
                e.preventDefault();
                setFileContextMenu(null);
                setGeneralContextMenu({ x: e.clientX, y: e.clientY });
            }}
        >
            <FileList 
                items={processedItems}
                viewMode={viewMode}
                onItemClick={handleItemClick}
                onContextMenu={(e, item) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setGeneralContextMenu(null);
                    setFileContextMenu({ x: e.clientX, y: e.clientY, item });
                }}
                renamingId={renamingId}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                onRenameSubmit={handleRename}
            />
        </div>

        <div className="h-7 bg-muted/30 border-t border-white/10 flex items-center px-3 justify-between text-[10px] text-muted-foreground select-none">
            <div className="flex gap-4">
                <span>{processedItems.length} items</span>
                <span>IndexedDB Storage</span>
            </div>
        </div>
      </div>

      {fileContextMenu && (
        <ContextMenu 
            x={fileContextMenu.x}
            y={fileContextMenu.y}
            item={fileContextMenu.item}
            onOpen={() => { handleItemClick(fileContextMenu.item); setFileContextMenu(null); }}
            onDownload={() => { handleDownload(fileContextMenu.item); setFileContextMenu(null); }}
            onRename={() => {
                setRenamingId(fileContextMenu.item.id);
                setRenameValue(fileContextMenu.item.name);
                setFileContextMenu(null);
            }}
            onDelete={() => {
                handleDelete(fileContextMenu.item);
                setFileContextMenu(null);
            }}
        />
      )}

      {generalContextMenu && (
          <GeneralContextMenu 
             x={generalContextMenu.x}
             y={generalContextMenu.y}
             onUpload={() => { fileInputRef.current?.click(); setGeneralContextMenu(null); }}
             onRefresh={() => { loadFiles(); setGeneralContextMenu(null); }}
          />
      )}

      {previewItem && createPortal(
        <PreviewModal 
            item={previewItem}
            onClose={() => setPreviewItem(null)}
            onDownload={handleDownload}
        />,
        document.body
      )}
    </div>
  );
};