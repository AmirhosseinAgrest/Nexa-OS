import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Slider } from "@/components/ui/slider"; 
import { getFileById } from "@/lib/db";

interface VideoPlayerProps {
  fileId?: string | number;
}

export const VideoPlayer = ({ fileId }: VideoPlayerProps) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (!fileId) return;
      const file = await getFileById(fileId);
      if (file && file.content) {
        setVideoSrc(file.content);
      }
    };
    loadVideo();
  }, [fileId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setProgress(value);
    }
  };

  if (!videoSrc) {
    return <div className="flex items-center justify-center h-full text-white">Loading Video...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="flex-1 relative flex items-center justify-center overflow-hidden group" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={videoSrc}
          className="max-h-full max-w-full w-auto h-auto object-contain"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
        
        {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-white text-white ml-1" />
                </div>
            </div>
        )}
      </div>

      <div className="h-14 bg-zinc-900/90 backdrop-blur-md border-t border-white/10 flex items-center px-4 gap-4 select-none">
        <button onClick={togglePlay} className="hover:bg-white/10 p-2 rounded-full transition-colors">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
        </button>

        <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-zinc-400">{formatTime(progress)}</span>
            <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={progress} 
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="flex-1 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-2 w-24">
           <button onClick={() => setIsMuted(!isMuted)}>
             {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
           </button>
           <input 
                type="range" min={0} max={1} step={0.1} 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    if(videoRef.current) videoRef.current.volume = v;
                }}
                className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-white"
            />
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
    if(isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};