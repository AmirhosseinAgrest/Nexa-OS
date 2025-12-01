import React, { useState, useEffect, useRef } from "react";
import {
  Calendar, Clock, Cloud, Sun, CloudRain, CloudSnow,
  Battery, BatteryCharging, Wifi, WifiOff, Timer, MapPin,
  Thermometer, RefreshCw, Plus, Search, Trash2, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="w-12 h-12 text-yellow-500 animate-pulse-slow" />;
  if (code >= 2 && code <= 48) return <Cloud className="w-12 h-12 text-gray-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-12 h-12 text-blue-400" />;
  if (code >= 71) return <CloudSnow className="w-12 h-12 text-white" />;
  return <Sun className="w-12 h-12 text-orange-500" />;
};

type WeatherLocation = {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  isGPS: boolean;
};

export const SmartWidget = () => {
  const [activeTab, setActiveTab] = useState<'clock' | 'weather' | 'timer'>('clock');

  const [time, setTime] = useState(new Date());
  const [systemName, setSystemName] = useState("User");

  const [locations, setLocations] = useState<WeatherLocation[]>([
    { id: 'gps', name: 'Current Location', isGPS: true },
  ]);
  const [currentLocIndex, setCurrentLocIndex] = useState(0);
  const [weatherData, setWeatherData] = useState<{ temp: number, code: number } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const [battery, setBattery] = useState<{ level: number, charging: boolean } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [initialDuration, setInitialDuration] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);

  useEffect(() => {
    const storedName = localStorage.getItem("nexa_username");
    if (storedName) setSystemName(storedName);

    const storedLocs = localStorage.getItem("nexa_weather_locations");
    if (storedLocs) {
      setLocations(JSON.parse(storedLocs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nexa_weather_locations", JSON.stringify(locations));
  }, [locations]);

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

  const fetchWeather = async () => {
    const loc = locations[currentLocIndex];
    setLoadingWeather(true);
    setWeatherData(null);

    if (loc.isGPS) {
      if (!navigator.geolocation) {
        setLoadingWeather(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await getWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error("GPS Error", err);
          setLoadingWeather(false);
        }
      );
    } else if (loc.lat && loc.lon) {
      await getWeatherData(loc.lat, loc.lon);
    }
  };

  const getWeatherData = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
      );
      const data = await res.json();
      setWeatherData({
        temp: Math.round(data.current.temperature_2m),
        code: data.current.weather_code,
      });
    } catch (err) {
      console.error("Weather API Error", err);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [currentLocIndex, locations]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleAddCity = async () => {
    if (!citySearch.trim()) return;
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${citySearch}&count=1&language=en&format=json`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const city = data.results[0];
        const newLoc: WeatherLocation = {
          id: Date.now().toString(),
          name: city.name,
          lat: city.latitude,
          lon: city.longitude,
          isGPS: false
        };
        setLocations([...locations, newLoc]);
        setCurrentLocIndex(locations.length);
        setIsAddingCity(false);
        setCitySearch("");
      } else {
        alert("City not found!");
      }
    } catch (e) {
      alert("Error finding city");
    }
  };

  const handleDeleteCity = () => {
    if (locations[currentLocIndex].isGPS) return;
    const newLocs = locations.filter((_, i) => i !== currentLocIndex);
    setLocations(newLocs);
    setCurrentLocIndex(0);
  };

  const nextLocation = () => {
    setCurrentLocIndex((prev) => (prev + 1) % locations.length);
  };

  const prevLocation = () => {
    setCurrentLocIndex((prev) => (prev - 1 + locations.length) % locations.length);
  };

  const saveCustomTimer = () => {
    const seconds = customMinutes * 60;
    setTimerSeconds(seconds);
    setInitialDuration(seconds);
    setIsEditingTimer(false);
    setIsTimerRunning(false);
  };

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
    <div className="fixed top-6 right-6 w-80 backdrop-blur-3xl bg-card/40 dark:bg-black/60 border border-white/10 shadow-2xl rounded-3xl overflow-hidden select-none transition-all hover:bg-card/50 z-10 group">

      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex gap-1">
          <Button
            variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full transition-colors", activeTab === 'clock' && "bg-primary/20 text-primary")}
            onClick={() => setActiveTab('clock')}
          >
            <Clock className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full transition-colors", activeTab === 'weather' && "bg-blue-500/20 text-blue-500")}
            onClick={() => setActiveTab('weather')}
          >
            <Cloud className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full transition-colors", activeTab === 'timer' && "bg-orange-500/20 text-orange-500")}
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

      <div className="p-6 min-h-[200px] flex flex-col items-center justify-center relative">

        {activeTab === 'clock' && (
          <div className="text-center animate-in fade-in zoom-in-95 duration-500">
            <p className="text-sm font-medium text-muted-foreground mb-1 tracking-wide uppercase">
              {getGreeting()}, {systemName}
            </p>
            <div className="text-6xl font-bold tracking-tighter text-foreground mb-2 drop-shadow-lg">
              {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </div>
            <div className="flex items-center justify-center gap-2 text-primary/80 bg-primary/10 py-1 px-3 rounded-full text-xs font-medium border border-primary/20">
              <Calendar className="w-3 h-3" />
              {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-right-8 duration-500">
            
            {!isAddingCity ? (
              <>
                <div className="flex items-center justify-between w-full mb-4 px-2">
                   <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={prevLocation}>
                      <ChevronLeft className="w-4 h-4" />
                   </Button>
                   
                   <div className="flex flex-col items-center">
                      <span className="text-sm font-bold flex items-center gap-1">
                         {locations[currentLocIndex].isGPS ? <MapPin className="w-3 h-3 text-blue-500" /> : null}
                         {locations[currentLocIndex].name}
                      </span>
                      <div className="flex gap-1 mt-1">
                         {locations.map((_, i) => (
                            <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i === currentLocIndex ? "bg-foreground" : "bg-muted-foreground/30")} />
                         ))}
                      </div>
                   </div>

                   <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={nextLocation}>
                      <ChevronRight className="w-4 h-4" />
                   </Button>
                </div>

                {loadingWeather ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground my-4" />
                ) : weatherData ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      {getWeatherIcon(weatherData.code)}
                      <div className="text-center">
                        <div className="text-5xl font-bold text-foreground">{weatherData.temp}°</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">
                            {locations[currentLocIndex].isGPS ? "Auto Detected" : "Saved City"}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">Unavailable</p>
                    <Button size="sm" variant="outline" onClick={fetchWeather}>Retry</Button>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                    <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={() => setIsAddingCity(true)}>
                        <Plus className="w-3 h-3 mr-1" /> Add City
                    </Button>
                    {!locations[currentLocIndex].isGPS && (
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={handleDeleteCity}>
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    )}
                </div>
              </>
            ) : (
              <div className="w-full space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Add New Location</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsAddingCity(false)}>
                          <X className="w-4 h-4" />
                      </Button>
                  </div>
                  <div className="flex gap-2">
                      <Input 
                        placeholder="City name (e.g. London)..." 
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="h-8 text-xs"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                      />
                      <Button size="sm" className="h-8 px-2" onClick={handleAddCity}>
                          <Search className="w-3 h-3" />
                      </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                      Uses Open-Meteo Geocoding API to find coordinates.
                  </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-right-8 duration-500">
            <p className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-widest">Focus Timer</p>
            
            {!isEditingTimer ? (
                <>
                    <div 
                        className="text-6xl font-mono font-bold text-foreground mb-6 tabular-nums cursor-pointer hover:scale-105 transition-transform active:scale-95 select-none"
                        onClick={() => !isTimerRunning && setIsEditingTimer(true)}
                        title="Click to Edit Time"
                    >
                        {formatTimer(timerSeconds)}
                    </div>
                    <div className="flex justify-center gap-3">
                        <Button
                            variant={isTimerRunning ? "destructive" : "default"}
                            className="w-24 rounded-full shadow-lg transition-all hover:scale-105"
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                        >
                            {isTimerRunning ? "Stop" : "Start"}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={() => { setIsTimerRunning(false); setTimerSeconds(initialDuration); }}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setCustomMinutes(m => Math.max(1, m - 5))}>-5</Button>
                        <Button variant="outline" size="icon" onClick={() => setCustomMinutes(m => Math.max(1, m - 1))}>-1</Button>
                        
                        <div className="w-16 text-center">
                            <span className="text-3xl font-bold">{customMinutes}</span>
                            <span className="text-xs text-muted-foreground block">min</span>
                        </div>

                        <Button variant="outline" size="icon" onClick={() => setCustomMinutes(m => m + 1)}>+1</Button>
                        <Button variant="outline" size="icon" onClick={() => setCustomMinutes(m => m + 5)}>+5</Button>
                    </div>
                    
                    <div className="flex gap-2 w-full">
                        <Button variant="ghost" className="flex-1" onClick={() => setIsEditingTimer(false)}>Cancel</Button>
                        <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={saveCustomTimer}>Set Timer</Button>
                    </div>
                </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};