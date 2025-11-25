import React, { useRef, useState, useEffect } from "react";
import { 
  Pencil, Eraser, Download, Trash2, Undo, 
  Palette, Minus, Plus, Circle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export const PaintApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (parent) {
        canvas.width = parent.clientWidth * 2;
        canvas.height = parent.clientHeight * 2;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2); 
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
    }

    const handleResize = () => {
        if (parent && ctx) {
        }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (ctxRef.current) {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctxRef.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    
    if (tool === 'eraser') {
        ctxRef.current.strokeStyle = "#ffffff"; 
        ctxRef.current.globalCompositeOperation = "destination-out"; 
    } else {
        ctxRef.current.strokeStyle = color;
        ctxRef.current.globalCompositeOperation = "source-over";
    }

    ctxRef.current.lineWidth = brushSize;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (ctxRef.current) {
        ctxRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `nexa-art-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    "#000000", "#ef4444", "#f97316", "#facc15", "#22c55e", 
    "#3b82f6", "#a855f7", "#ec4899", "#78716c"
  ];

  return (
    <div className="flex flex-col h-full w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-border/50 select-none">
      
      <div className="h-16 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 gap-4">
        
        <div className="flex items-center gap-2">
            <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                <Button 
                    variant={tool === 'brush' ? "secondary" : "ghost"} 
                    size="icon" 
                    className={cn("h-9 w-9", tool === 'brush' && "bg-white dark:bg-black shadow-sm")}
                    onClick={() => setTool('brush')}
                >
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                    variant={tool === 'eraser' ? "secondary" : "ghost"} 
                    size="icon" 
                    className={cn("h-9 w-9", tool === 'eraser' && "bg-white dark:bg-black shadow-sm")}
                    onClick={() => setTool('eraser')}
                >
                    <Eraser className="w-4 h-4" />
                </Button>
            </div>

            <div className="w-px h-8 bg-border/50 mx-2" />

            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border/50 min-w-[140px]">
                <Circle className="w-3 h-3 fill-current opacity-50" />
                <Slider 
                    value={[brushSize]} 
                    max={50} 
                    min={1} 
                    step={1} 
                    onValueChange={(val) => setBrushSize(val[0])}
                    className="w-20"
                />
                <Circle 
                    className="fill-current" 
                    style={{ width: Math.min(20, Math.max(8, brushSize / 2)), height: Math.min(20, Math.max(8, brushSize / 2)) }} 
                />
            </div>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/50 p-2 rounded-lg border border-border/50 overflow-x-auto hide-scrollbar">
            {colors.map((c) => (
                <button
                    key={c}
                    className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                        color === c && tool === 'brush' ? "border-primary scale-110 ring-2 ring-offset-1 ring-primary/50" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => { setColor(c); setTool('brush'); }}
                />
            ))}
            <div className="w-px h-6 bg-border/50 mx-1" />
            <input 
                type="color" 
                value={color} 
                onChange={(e) => { setColor(e.target.value); setTool('brush'); }}
                className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
            />
        </div>

        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={clearCanvas} title="Clear All" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-5 h-5" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={saveImage}>
                <Download className="w-4 h-4 mr-2" /> Save
            </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-white cursor-crosshair overflow-hidden touch-none">
         <div className="absolute inset-0 pointer-events-none opacity-20" 
              style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
         </div>
         
         <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full block"
         />
      </div>
      
      <div className="h-6 bg-muted/80 border-t border-border/50 flex items-center justify-between px-3 text-[10px] text-muted-foreground">
         <span>{canvasRef.current ? `${canvasRef.current.width / 2} x ${canvasRef.current.height / 2}px` : 'Canvas Ready'}</span>
         <span>Tool: {tool === 'brush' ? 'Brush' : 'Eraser'} | Size: {brushSize}px</span>
      </div>
    </div>
  );
};