import { useEffect, useState, useRef } from "react";
import { Taskbar } from "./Taskbar";
import { Window } from "./Window";
import { SmartWidget } from "./widgets/SmartWidget";
import { ContextMenu, ContextMenuType } from "./ContextMenu";
import { StartMenu } from "./StartMenu";
import { DesktopIcon, DesktopItem } from "./DesktopIcon";
import { saveFileToDB } from "@/lib/db";
import { FileItem } from "@/lib/db";

import { desktopDB } from "./services/desktopDB";
import { findNextAvailablePosition } from "./utils/gridMath";
import { useWindowManager } from "./hooks/useWindowManager";
import { appComponents } from "./config/appRegistry";

export const Desktop = () => {
  const { openWindows, activeWindowId, openApp, closeWindow, focusWindow } = useWindowManager();

  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>("/default-wallpaper.png");
  const [showStartMenu, setShowStartMenu] = useState(false);

  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ [key: string]: { x: number; y: number } }>({});

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: ContextMenuType, targetId?: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const items = await desktopDB.getAllItems();
      if (items.length > 0) {
        setDesktopItems(items);
      } else {
        const defaults: DesktopItem[] = [
          { id: "default-1", name: "Welcome Project", type: "folder", x: 30, y: 30 },
          { id: "default-2", name: "My Resume.pdf", type: "file", x: 30, y: 130 },
        ];
        setDesktopItems(defaults);
        desktopDB.saveAllItems(defaults);
      }
    };
    loadData();

    const savedBg = localStorage.getItem("nexa_background");
    if (savedBg) setBgImage(savedBg);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2" && selectedItemIds.length === 1) setRenamingItemId(selectedItemIds[0]);
      if (e.key === "Delete" && selectedItemIds.length > 0) selectedItemIds.forEach(id => handleDeleteItem(id));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItemIds]);

  const handleCreateFolder = async (name: string, x: number, y: number) => {
    const id = `folder-${Date.now()}`;

    const desktopItem: DesktopItem = {
      id,
      name,
      type: "folder",
      x,
      y,
    };
    await desktopDB.saveItem(desktopItem);

    const fileExplorerItem: FileItem = {
      id,
      name,
      type: "folder",
      category: "desktop",
      date: new Date().toLocaleDateString(),
      size: "-",
    };
    await saveFileToDB(fileExplorerItem);

    setDesktopItems(prev => [...prev, desktopItem]);
  };

  const handleRenameItem = async (id: string, newName: string) => {
    setDesktopItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, name: newName };
        desktopDB.saveItem(updated);
        return updated;
      }
      return item;
    }));
    setRenamingItemId(null);
  };

  const handleDeleteItem = async (id: string) => {
    setDesktopItems(prev => prev.filter(item => item.id !== id));
    setSelectedItemIds([]);
    await desktopDB.deleteItem(id);
  };

  const handleIconMouseDown = (e: React.MouseEvent, item: DesktopItem) => {
    e.stopPropagation();
    if (e.button !== 0) return; 

    let newSelected = selectedItemIds;
    if (!selectedItemIds.includes(item.id)) {
      newSelected = e.ctrlKey ? [...selectedItemIds, item.id] : [item.id];
      setSelectedItemIds(newSelected);
    } else if (e.ctrlKey) {
      newSelected = selectedItemIds.filter(id => id !== item.id);
      setSelectedItemIds(newSelected);
      return;
    }

    const offsets: any = {};
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    desktopItems.forEach(dItem => {
      if (newSelected.includes(dItem.id)) {
        offsets[dItem.id] = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    });
    dragOffset.current = offsets;
    setIsDragging(true);
  };

  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && e.button === 0) {
      setSelectedItemIds([]);
      setRenamingItemId(null);
      setSelectionBox({ startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setDesktopItems(prev => prev.map(item => {
        if (selectedItemIds.includes(item.id) && dragOffset.current[item.id]) {
          return {
            ...item,
            x: e.clientX - dragOffset.current[item.id].x,
            y: e.clientY - dragOffset.current[item.id].y,
          };
        }
        return item;
      }));
    }

    if (selectionBox) {
      setSelectionBox({ ...selectionBox, currentX: e.clientX, currentY: e.clientY });
      const left = Math.min(selectionBox.startX, selectionBox.currentX);
      const top = Math.min(selectionBox.startY, selectionBox.currentY);
      const w = Math.abs(selectionBox.currentX - selectionBox.startX);
      const h = Math.abs(selectionBox.currentY - selectionBox.startY);

      const selected = desktopItems.filter(item =>
        item.x < left + w && item.x + 80 > left && item.y < top + h && item.y + 100 > top
      ).map(i => i.id);
      setSelectedItemIds(selected);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      const updatedItems = desktopItems.map(item => {
        if (selectedItemIds.includes(item.id)) {
          const snapped = findNextAvailablePosition(desktopItems, item.x, item.y, item.id);
          return { ...item, ...snapped };
        }
        return item;
      });
      setDesktopItems(updatedItems);
      desktopDB.saveAllItems(updatedItems);
    }
    setSelectionBox(null);
    setIsDragging(false);
    dragOffset.current = {};
  };

  return (
    <div
      className="h-screen w-full overflow-hidden relative select-none bg-cover bg-center bg-no-repeat transition-colors duration-700"
      style={{ backgroundImage: `url(${bgImage})` }}
      onMouseDown={handleDesktopMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, type: "desktop" });
        }
      }}
    >
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <SmartWidget />

      {desktopItems.map((item) => (
        <div
          key={item.id}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          onMouseDown={(e) => handleIconMouseDown(e, item)}
        >
          <DesktopIcon
            item={{ ...item, x: 0, y: 0 }}
            isSelected={selectedItemIds.includes(item.id)}
            isRenaming={renamingItemId === item.id}
            onClick={(e) => !e.ctrlKey && setSelectedItemIds([item.id])}
            onDoubleClick={() => openApp("explorer")}
            onContextMenu={(e) => {
              e.preventDefault();
              setSelectedItemIds([item.id]);
              setContextMenu({ x: e.clientX, y: e.clientY, type: item.type, targetId: item.id });
            }}
            onRename={(newName) => handleRenameItem(item.id, newName)}
          />
        </div>
      ))}

      {openWindows.map((window) => {
        const AppComponent = appComponents[window.appId];
        if (!AppComponent) return null;
        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            icon={window.icon}
            onClose={() => closeWindow(window.id)}
            isActive={activeWindowId === window.id}
            onFocus={() => focusWindow(window.id)}
          >
            <AppComponent
              {...window.props}
              onOpenApp={openApp}
            />
          </Window>
        );
      })}

      {selectionBox && (
        <div
          className="absolute border border-blue-500/50 bg-blue-500/20 rounded-sm pointer-events-none z-50"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
          }}
        />
      )}

      <Taskbar
        onAppClick={openApp}
        activeApps={openWindows.map((w) => w.appId)}
        isStartOpen={showStartMenu}
        onToggleStart={() => setShowStartMenu(!showStartMenu)}
      />

      <StartMenu
        isOpen={showStartMenu}
        onClose={() => setShowStartMenu(false)}
        onAppClick={openApp}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onClose={() => setContextMenu(null)}
          onAction={(action) => {
            setContextMenu(null);
            if (action === "refresh") window.location.reload();
            if (action === "new_folder") handleCreateFolder("New Folder", contextMenu.x, contextMenu.y);
            if (action === "settings") openApp("settings");
            if (action === "shutdown") alert("Shutting down...");
            if (contextMenu.targetId) {
              if (action === "rename") setRenamingItemId(contextMenu.targetId);
              if (action === "delete") handleDeleteItem(contextMenu.targetId);
              if (action === "open") openApp("explorer");
            }
          }}
        />
      )}
    </div>
  );
};