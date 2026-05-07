import { Power, RotateCw, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PowerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export const PowerMenu = ({ isOpen, onClose, position }: PowerMenuProps) => {
  if (!isOpen) return null;

  const options = [
    { id: "shutdown", label: "Shut Down", icon: Power, color: "text-destructive" },
    { id: "restart", label: "Restart", icon: RotateCw, color: "text-primary" },
    { id: "sleep", label: "Sleep", icon: Moon, color: "text-secondary" },
    { id: "logout", label: "Log Out", icon: LogOut, color: "text-muted-foreground" },
  ];

  const handleAction = (id: string) => {
    console.log(`Power action: ${id}`);
    onClose();
  };

  const getMenuPosition = () => {
    if (!position) return { left: "20px", bottom: "80px" };
    
    const menuWidth = 192; 
    const windowWidth = window.innerWidth;
    let left = position.x;
    
    if (left + menuWidth > windowWidth - 16) {
      left = windowWidth - menuWidth - 16;
    }
    
    if (left < 16) left = 16;
    
    return {
      left: `${left}px`,
      bottom: `${window.innerHeight - position.y + 8}px`
    };
  };

  const menuPosition = getMenuPosition();

  return (
    <>
      <div className="fixed inset-0 z-[1100]" onClick={onClose} />
      <div
        className="fixed z-[1101] backdrop-blur-glass bg-card/90 border border-border/50 rounded-lg shadow-glass p-2 animate-fade-in min-w-48"
        style={{ left: menuPosition.left, bottom: menuPosition.bottom }}
      >
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.id}
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-muted/50 transition-all"
              onClick={() => handleAction(option.id)}
            >
              <Icon className={cn("h-4 w-4", option.color)} />
              <span>{option.label}</span>
            </Button>
          );
        })}
      </div>
    </>
  );
};