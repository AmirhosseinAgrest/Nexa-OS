import { useState, useEffect } from "react";
import { Wifi, Battery, Volume2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SystemTray = () => {
  const [time, setTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="flex items-center gap-1 h-full">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 hover:bg-primary/20 transition-all"
      >
        <Wifi className="h-4 w-4 text-primary" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 hover:bg-primary/20 transition-all"
      >
        <Volume2 className="h-4 w-4 text-foreground" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 hover:bg-secondary/20 transition-all"
      >
        <Battery className="h-4 w-4 text-secondary" />
      </Button>

      <div className="h-8 w-px bg-border/50 mx-2" />

      <div className="relative">
        <Button
          variant="ghost"
          className="h-10 px-3 hover:bg-primary/20 transition-all flex flex-col items-end leading-none"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <span className="text-xs font-semibold">{formatTime(time)}</span>
          <span className="text-[10px] text-muted-foreground">{formatDate(time)}</span>
        </Button>

        {showCalendar && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
            <div className="absolute right-0 bottom-full mb-2 z-50 backdrop-blur-glass bg-card/90 border border-border/50 rounded-lg shadow-glass p-4 animate-fade-in w-72">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Calendar</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">
                  {time.getDate()}
                </div>
                <div className="text-lg text-foreground mb-2">
                  {time.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {formatTime(time)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};