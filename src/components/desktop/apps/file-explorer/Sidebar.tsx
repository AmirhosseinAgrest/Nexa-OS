import { Home, Monitor, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar = ({ currentPath, onNavigate }: SidebarProps) => {
  return (
    <div className="w-52 bg-muted/30 border-r border-white/10 flex flex-col pt-4 pb-2">
      <div className="px-4 mb-6">
        <h2 className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider mb-2">Quick Access</h2>
        <div className="space-y-0.5">
          <SidebarButton icon={Home} label="Home" active={currentPath === "root"} onClick={() => onNavigate("root")} />
          <SidebarButton icon={Monitor} label="Desktop" active={currentPath === "desktop"} onClick={() => onNavigate("desktop")} />
          <SidebarButton icon={FileText} label="Documents" active={currentPath === "documents"} onClick={() => onNavigate("documents")} color="text-yellow-500" />
          <SidebarButton icon={ImageIcon} label="Pictures" active={currentPath === "pictures"} onClick={() => onNavigate("pictures")} color="text-purple-500" />
        </div>
      </div>
    </div>
  );
};

const SidebarButton = ({ icon: Icon, label, active, onClick, color }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors",
      active ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
    )}
  >
    <Icon className={cn("w-4 h-4", active ? "text-blue-500" : color || "opacity-70")} />
    {label}
  </button>
);