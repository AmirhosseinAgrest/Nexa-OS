import { Settings } from "../apps/Settings";
import { FileExplorer } from "../apps/FileExplorer";
import { Notes } from "../apps/Notes";
import { MediaPlayer } from "../apps/MediaPlayer";
import { AgrestBrowser } from "../apps/AgrestBrowser";
import { Terminal } from "../apps/Terminal";
import { PaintApp } from "../apps/Paint";
import { AboutApp } from "../apps/AboutApp";
import { GameCenter } from "../apps/GameCenter";
import { VideoPlayer } from "../apps/VideoPlayer";

export const appComponents: Record<string, React.ComponentType> = {
  settings: Settings,
  explorer: FileExplorer,
  notes: Notes,
  media: MediaPlayer,
  browser: AgrestBrowser,
  terminal: Terminal,
  paint: PaintApp,
  about: AboutApp,
  GameCenter: GameCenter,
  VideoPlayer: VideoPlayer,
};