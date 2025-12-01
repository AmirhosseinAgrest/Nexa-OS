import React, { useState, useEffect } from "react";
import { Search, User, Power, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apps } from "./Taskbar";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAppClick: (appId: string) => void;
}

export const StartMenu = ({ isOpen, onClose, onAppClick }: StartMenuProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const [systemName, setSystemName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("systemName");
    if (storedName) {
      setSystemName(storedName);
    } else {
      setSystemName("Guest"); 
    }
  }, []);

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-transparent" onClick={onClose} />

      <div 
        className={cn(
          "fixed bottom-20 left-4 z-[1000] w-[400px] h-[500px]",
          "bg-background/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl", 
          "animate-in slide-in-from-bottom-10 fade-in duration-300" 
        )}
        onClick={(e) => e.stopPropagation()} 
      >
        
        <div className="p-6 pb-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search for apps, settings, and documents" 
                className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary/50 rounded-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
           <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-xs font-semibold text-muted-foreground">Pinned</h3>
              <button className="text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors">All apps {">"}</button>
           </div>

           <div className="grid grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                 <button
                    key={app.id}
                    className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all group active:scale-95"
                    onClick={() => { onAppClick(app.id); onClose(); }}
                 >
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                       <app.icon className={cn("w-6 h-6", app.color)} />
                    </div>
                    <span className="text-xs font-medium text-center line-clamp-1 w-full text-muted-foreground group-hover:text-foreground transition-colors">
                        {app.name}
                    </span>
                 </button>
              ))}
              
              {filteredApps.length === 0 && (
                  <div className="col-span-4 text-center py-8 text-muted-foreground text-sm">
                      No apps found for "{searchTerm}"
                  </div>
              )}
           </div>
        </div>

        <div className="h-16 bg-black/20 border-t border-white/5 flex items-center justify-between px-6">
            <button className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-lg transition-colors -ml-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-inner">
                    <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold">{systemName}</p>
                    <p className="text-[10px] text-muted-foreground">Guest</p>
                </div>
            </button>

            <button 
                className="p-2.5 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="Power"
            >
                <Power className="w-5 h-5" />
            </button>
        </div>

      </div>
    </>
  );
};