import React, { useState, useRef, useEffect } from "react";
import { X, Minus, Square, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WindowProps {
  id: string;
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  onClose: () => void;
  isActive: boolean;
  onFocus: () => void;
  initialPosition?: { x: number; y: number };
}

export const Window = ({ 
  id, 
  title, 
  icon: Icon, 
  children, 
  onClose, 
  isActive, 
  onFocus, 
  initialPosition 
}: WindowProps) => {

  const [position, setPosition] = useState(initialPosition || { x: 100 + Math.random() * 50, y: 50 + Math.random() * 50 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosing, setIsClosing] = useState(false); 
  const [isOpening, setIsOpening] = useState(true);  

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const resizeDir = useRef<string | null>(null); 
  const startResizePos = useRef({ x: 0, y: 0, w: 0, h: 0, mx: 0, my: 0 });
  
  const preMaximizeState = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(false), 300); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMaximized) return;

      if (isDragging) {
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;
        
        if (newY < 0) newY = 0; 
        
        setPosition({ x: newX, y: newY });
      }

      if (isResizing && resizeDir.current) {
        const dx = e.clientX - startResizePos.current.mx; 
        const dy = e.clientY - startResizePos.current.my;
        const start = startResizePos.current;

        let newW = start.w;
        let newH = start.h;
        let newX = start.x;
        let newY = start.y;

        const MIN_W = 300;
        const MIN_H = 200;

        if (resizeDir.current.includes("e")) newW = Math.max(MIN_W, start.w + dx);
        if (resizeDir.current.includes("s")) newH = Math.max(MIN_H, start.h + dy);
        
        if (resizeDir.current.includes("w")) {
          const proposedWidth = Math.max(MIN_W, start.w - dx);
          if (proposedWidth > MIN_W) {
             newW = proposedWidth;
             newX = start.x + dx;
          } else {
             newW = MIN_W;
             newX = start.x + (start.w - MIN_W);
          }
        }

        if (resizeDir.current.includes("n")) {
          const proposedHeight = Math.max(MIN_H, start.h - dy);
          if (proposedHeight > MIN_H) {
            newH = proposedHeight;
            newY = start.y + dy;
          } else {
            newH = MIN_H;
            newY = start.y + (start.h - MIN_H);
          }
        }

        setSize({ width: newW, height: newH });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      resizeDir.current = null;
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, isMaximized, isResizing]);


  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    onFocus();
  };

  const startResize = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeDir.current = dir;
    startResizePos.current = {
      x: position.x,
      y: position.y,
      w: size.width,
      h: size.height,
      mx: e.clientX,
      my: e.clientY,
    };
    onFocus();
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setPosition({ x: preMaximizeState.current.x, y: preMaximizeState.current.y });
      setSize({ width: preMaximizeState.current.width, height: preMaximizeState.current.height });
    } else {
      preMaximizeState.current = { x: position.x, y: position.y, width: size.width, height: size.height };
      
      setIsMaximized(true);
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 48 }); 
    }
    onFocus();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClosing(true); 
    
    setTimeout(() => {
      onClose();
    }, 200); 
  };

  const transitionStyle = (isDragging || isResizing) ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'; 

  return (
    <div
      ref={windowRef}
      className={cn(
        "fixed flex flex-col overflow-hidden",
        "bg-background/80 backdrop-blur-2xl border border-white/10 shadow-2xl",
        isOpening ? "scale-95 opacity-0" : "scale-100 opacity-100",
        isClosing ? "scale-90 opacity-0 pointer-events-none" : "scale-100",
        isMaximized ? "rounded-none" : "rounded-xl",
        isActive ? "z-50 shadow-[0_0_40px_rgba(0,0,0,0.3)] border-white/20" : "z-10 shadow-lg opacity-90"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transition: transitionStyle, 
        willChange: (isDragging || isResizing) ? "left, top, width, height" : "auto" 
      }}
      onMouseDown={onFocus}
    >
      <div
        className={cn(
          "h-12 shrink-0 flex items-center justify-between px-4 select-none transition-colors",
          isActive ? "bg-white/5" : "bg-transparent",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-3 opacity-90 pointer-events-none">
          {Icon && (
             <div className={cn("p-1.5 rounded-md transition-colors", isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                <Icon className="h-4 w-4" />
             </div>
          )}
          <span className="text-sm font-medium tracking-wide text-foreground/90">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
            onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
          >
            {isMaximized ? <Square className="h-3 w-3" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-red-500 hover:text-white text-muted-foreground transition-all duration-200"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-background/40">
         {(!isActive || isDragging || isResizing) && <div className="absolute inset-0 bg-transparent z-10" />}
         
         <div className="h-full w-full overflow-auto custom-scrollbar">
            {children}
         </div>
      </div>

      {!isMaximized && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50" onMouseDown={(e) => startResize(e, "nw")} />
          <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50" onMouseDown={(e) => startResize(e, "ne")} />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50" onMouseDown={(e) => startResize(e, "sw")} />
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50" onMouseDown={(e) => startResize(e, "se")} />

          <div className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize z-40" onMouseDown={(e) => startResize(e, "n")} />
          <div className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize z-40" onMouseDown={(e) => startResize(e, "s")} />
          <div className="absolute left-0 top-2 bottom-2 w-1.5 cursor-w-resize z-40" onMouseDown={(e) => startResize(e, "w")} />
          <div className="absolute right-0 top-2 bottom-2 w-1.5 cursor-e-resize z-40" onMouseDown={(e) => startResize(e, "e")} />
        </>
      )}
    </div>
  );
};