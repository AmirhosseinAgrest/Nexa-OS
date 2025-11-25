import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX,
  Shuffle, Repeat, Upload, Music as MusicIcon, Settings2, Mic2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const DB_NAME = "NexaMusicDB";
const STORE_NAME = "tracks";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const addTrackToDB = async (file: File) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add({
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Unknown Artist",
      blob: file,
      date: new Date().toISOString()
    });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllTracks = async (): Promise<Track[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteTrackFromDB = async (id: number) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
};

interface Track {
  id: number;
  title: string;
  artist: string;
  blob: Blob;
}

const formatTime = (seconds: number) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const MediaPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); 
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPlaylist();
  }, []);

  const loadPlaylist = async () => {
    const loadedTracks = await getAllTracks();
    setTracks(loadedTracks);
  };

  useEffect(() => {
    if (tracks.length > 0 && audioRef.current) {
      const track = tracks[currentTrackIndex];
      const url = URL.createObjectURL(track.blob);
      audioRef.current.src = url;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
      }

      return () => URL.revokeObjectURL(url);
    }
  }, [currentTrackIndex, tracks]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || tracks.length === 0) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolume = (value: number[]) => {
    const newVol = value[0];
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const nextSpeedIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newSpeed = speeds[nextSpeedIndex];
    setPlaybackRate(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      await addTrackToDB(files[i]);
    }
    loadPlaylist();
  };

  const handleDeleteTrack = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      await deleteTrackFromDB(id);
      loadPlaylist();
      if (tracks.length === 1) {
          setIsPlaying(false);
          setCurrentTrackIndex(0);
      }
  };

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="flex flex-col h-full bg-background/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl dark:bg-black/60">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />

      <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden group">
        <div className={cn(
            "absolute inset-0 opacity-30 transition-all duration-1000 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20",
            isPlaying ? "animate-pulse-slow" : ""
        )} />
        
        <div className="relative z-10 mb-8">
            <div className={cn(
                "w-64 h-64 rounded-full bg-gradient-to-tr from-gray-900 to-gray-800 shadow-2xl flex items-center justify-center border-4 border-white/5 transition-all duration-700 relative",
                isPlaying ? "scale-105 shadow-[0_0_50px_rgba(168,85,247,0.4)]" : "scale-100"
            )}>
                 <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />
                 <div className="absolute inset-8 rounded-full border border-white/5 opacity-40" />
                 <div className="absolute inset-16 rounded-full border border-white/5 opacity-30" />
                 
                 <div className={cn(
                     "w-24 h-24 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center overflow-hidden animate-[spin_3s_linear_infinite]",
                     !isPlaying && "[animation-play-state:paused]"
                 )}>
                    <MusicIcon className="w-10 h-10 text-primary" />
                 </div>
            </div>

            {isPlaying && (
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1 h-8 items-end">
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-1.5 bg-primary/80 rounded-t-sm animate-music-bar" 
                            style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }}
                        />
                    ))}
                 </div>
            )}
        </div>

        <div className="text-center z-10 space-y-1 max-w-md">
          <h2 className="text-2xl font-bold truncate text-foreground">
            {currentTrack ? currentTrack.title : "No Track Selected"}
          </h2>
          <p className="text-sm text-muted-foreground truncate">
            {currentTrack ? currentTrack.artist : "Upload music to start"}
          </p>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-xl border-t border-white/10 p-6 pb-8 space-y-6">
        
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs font-medium text-muted-foreground px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("hover:text-primary transition-colors", isShuffle && "text-primary bg-primary/10")}
            onClick={() => setIsShuffle(!isShuffle)}
          >
            <Shuffle className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 hover:border-primary hover:text-primary transition-all" onClick={handlePrev}>
                <SkipBack className="h-5 w-5 fill-current" />
            </Button>
            
            <Button 
                className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/30"
                onClick={togglePlay}
            >
                {isPlaying ? <Pause className="h-8 w-8 fill-white" /> : <Play className="h-8 w-8 fill-white ml-1" />}
            </Button>
            
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 hover:border-primary hover:text-primary transition-all" onClick={handleNext}>
                <SkipForward className="h-5 w-5 fill-current" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("hover:text-primary transition-colors", isRepeat && "text-primary bg-primary/10")}
            onClick={() => setIsRepeat(!isRepeat)}
          >
            <Repeat className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground w-12" onClick={handleSpeed}>
                {playbackRate}x
            </Button>

            <div className="flex items-center gap-3 w-1/3">
                <button onClick={() => handleVolume([volume === 0 ? 0.5 : 0])}>
                    {volume === 0 ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
                </button>
                <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolume} />
            </div>

            <div className="flex gap-2">
                <input 
                    type="file" 
                    accept="audio/*" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                />
                <Button variant="secondary" size="sm" className="gap-2 shadow-sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-3 h-3" /> Add Music
                </Button>
            </div>
        </div>
      </div>

      <div className="h-32 bg-background/50 overflow-y-auto border-t border-white/5 p-2 custom-scrollbar">
         {tracks.length === 0 && (
             <p className="text-center text-xs text-muted-foreground py-4">Playlist is empty. Upload some tunes!</p>
         )}
         {tracks.map((track, index) => (
             <div 
                key={track.id}
                className={cn(
                    "flex items-center justify-between p-2 rounded-lg mb-1 cursor-pointer text-xs group transition-all",
                    index === currentTrackIndex ? "bg-primary/20 border border-primary/30" : "hover:bg-white/10"
                )}
                onClick={() => { setCurrentTrackIndex(index); setIsPlaying(true); }}
             >
                <div className="flex items-center gap-3 overflow-hidden">
                     <span className={cn("w-4 text-center font-mono opacity-50", index === currentTrackIndex && "text-primary font-bold")}>
                        {index === currentTrackIndex && isPlaying ? <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> : index + 1}
                     </span>
                     <span className="truncate font-medium">{track.title}</span>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-500"
                    onClick={(e) => handleDeleteTrack(e, track.id)}
                >
                    <Trash2 className="w-3 h-3" />
                </Button>
             </div>
         ))}
      </div>
    </div>
  );
};