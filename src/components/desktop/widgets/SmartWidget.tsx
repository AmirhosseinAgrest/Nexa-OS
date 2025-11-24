import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, Cloud, Sun, CloudRain, CloudSnow, 
  Battery, BatteryCharging, Wifi, WifiOff, Timer, MapPin,
  Thermometer, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="w-12 h-12 text-yellow-500 animate-pulse-slow" />;
  if (code >= 2 && code <= 48) return <Cloud className="w-12 h-12 text-gray-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-12 h-12 text-blue-400" />;
  if (code >= 71) return <CloudSnow className="w-12 h-12 text-white" />;
  return <Sun className="w-12 h-12 text-orange-500" />;
};

export const SmartWidget = () => {
  const [activeTab, setActiveTab] = useState<'clock' | 'weather' | 'timer'>('clock');
  const [time, setTime] = useState(new Date());
  
  const [weather, setWeather] = useState<{ temp: number, code: number, city: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  const [battery, setBattery] = useState<{ level: number, charging: boolean } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [systemName, setSystemName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("systemName");
    if (storedName) {
      setSystemName(storedName);
    } else {
      setSystemName("Guest"); 
    }
  }, []);


  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const getBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        const bat: any = await (navigator as any).getBattery();
        const updateBattery = () => {
          setBattery({
            level: Math.round(bat.level * 100),
            charging: bat.charging
          });
        };
        updateBattery();
        bat.addEventListener('levelchange', updateBattery);
        bat.addEventListener('chargingchange', updateBattery);
      }
    };
    getBatteryStatus();
  }, []);

  const fetchWeather = () => {
    setLoadingWeather(true);
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
        );
        const data = await res.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          city: "Local Area" 
        });
      } catch (err) {
        console.error("Weather fetch failed", err);
      } finally {
        setLoadingWeather(false);
      }
    });
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed top-6 right-6 w-80 backdrop-blur-2xl bg-background/40 dark:bg-black/40 border border-white/20 shadow-2xl rounded-3xl overflow-hidden select-none transition-all hover:bg-background/50 z-10">
      
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex gap-1">
            <Button 
                variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", activeTab === 'clock' && "bg-primary/20 text-primary")}
                onClick={() => setActiveTab('clock')}
            >
                <Clock className="w-4 h-4" />
            </Button>
            <Button 
                variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", activeTab === 'weather' && "bg-blue-500/20 text-blue-500")}
                onClick={() => setActiveTab('weather')}
            >
                <Cloud className="w-4 h-4" />
            </Button>
            <Button 
                variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", activeTab === 'timer' && "bg-orange-500/20 text-orange-500")}
                onClick={() => setActiveTab('timer')}
            >
                <Timer className="w-4 h-4" />
            </Button>
        </div>
        
        <div className="flex items-center gap-3 text-muted-foreground">
            {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
            {battery && (
                <div className="flex items-center gap-1" title={`${battery.level}%`}>
                    <span className="text-[10px] font-mono">{battery.level}%</span>
                    {battery.charging ? <BatteryCharging className="w-4 h-4 text-green-400" /> : <Battery className="w-4 h-4" />}
                </div>
            )}
        </div>
      </div>

      <div className="p-6 min-h-[180px] flex flex-col items-center justify-center relative">
        
        {activeTab === 'clock' && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm font-medium text-muted-foreground mb-1 tracking-wide uppercase">
      {getGreeting()}, {systemName}
    </p>
                <div className="text-6xl font-bold tracking-tighter text-foreground mb-2 drop-shadow-sm">
                    {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
                <div className="flex items-center justify-center gap-2 text-primary/80 bg-primary/10 py-1 px-3 rounded-full text-xs font-medium border border-primary/20">
                    <Calendar className="w-3 h-3" />
                    {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
            </div>
        )}

        {activeTab === 'weather' && (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                {loadingWeather ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                ) : weather ? (
                    <>
                        <div className="flex items-center gap-4 mb-4">
                            {getWeatherIcon(weather.code)}
                            <div className="text-center">
                                <div className="text-5xl font-bold text-foreground">{weather.temp}°</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-widest">Tehran</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-full mt-2">
                            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center gap-1 border border-white/5">
                                <Thermometer className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-muted-foreground">Feels Like</span>
                                <span className="text-sm font-bold">{weather.temp + 2}°</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center gap-1 border border-white/5">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-muted-foreground">Location</span>
                                <span className="text-sm font-bold">Current</span>
                            </div>
                        </div>
                    </>
                ) : (
                   <div className="text-center">
                       <p className="text-sm text-muted-foreground mb-2">Location access needed</p>
                       <Button size="sm" onClick={fetchWeather}>Allow Access</Button>
                   </div>
                )}
            </div>
        )}

        {activeTab === 'timer' && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <p className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-widest">Focus Timer</p>
                <div className="text-6xl font-mono font-bold text-foreground mb-6 tabular-nums">
                    {formatTimer(timerSeconds)}
                </div>
                <div className="flex justify-center gap-3">
                    <Button 
                        variant={isTimerRunning ? "destructive" : "default"}
                        className="w-24 rounded-full shadow-lg"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                    >
                        {isTimerRunning ? "Stop" : "Start"}
                    </Button>
                    <Button 
                        variant="outline"
                        className="rounded-full"
                        onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};