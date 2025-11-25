import React, { useState } from "react";
import { ArrowLeft, Gamepad2, Sparkles, Trophy, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { TicTacToe } from "./games/TicTacToe";
import { SnakeGame } from "./games/SnakeGame";
import { Minesweeper } from "./games/Minesweeper";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ReactNode;
  color: string;
  isComingSoon?: boolean;
}

export const GameCenter = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games: Game[] = [
    {
      id: "tictactoe",
      title: "Tic Tac Toe",
      description: "Classic strategy game. Play vs Bot or Friend.",
      icon: Gamepad2,
      component: <TicTacToe />,
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "snake",
      title: "Neon Snake",
      description: "Eat, grow, and survive in the neon grid.",
      icon: Sparkles,
      component: <SnakeGame />,
      color: "from-green-500 to-emerald-700",
    },
    {
      id: "minesweeper",
      title: "Minesweeper",
      description: "Logic puzzle. Clear the board without detonating.",
      icon: Trophy,
      component: <Minesweeper />,
      color: "from-red-500 to-orange-600",
    },
    {
      id: "2048",
      title: "2048",
      description: "Join the numbers and get to the 2048 tile!",
      icon: Grid,
      component: null, 
      color: "from-yellow-400 to-orange-500", 
      isComingSoon: true 
    }
  ];

  const currentGame = games.find(g => g.id === activeGame);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-foreground select-none overflow-hidden">

      <div className="h-16 px-6 flex items-center justify-between border-b border-border/40 bg-background/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {activeGame ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveGame(null)}
              className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
          )}

          <div>
            <h1 className="font-bold text-lg leading-none">
              {activeGame ? currentGame?.title : "Agrest Arcade"}
            </h1>
            {!activeGame && <p className="text-xs text-muted-foreground">Game Collection</p>}
          </div>
        </div>

        {!activeGame && (
          <div className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">
            FREE TO PLAY
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0B0F17] relative">

        {!activeGame && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {games.map((game) => (
              <div
                key={game.id}
                className={cn(
                  "group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300",
                  game.isComingSoon ? "opacity-70 grayscale-[0.5]" : "hover:-translate-y-1 cursor-pointer"
                )}
                onClick={() => !game.isComingSoon && setActiveGame(game.id)}
              >
                <div className={cn("h-32 w-full bg-gradient-to-br relative overflow-hidden", game.color)}>
                  <game.icon className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-white/20 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md p-2 rounded-xl">
                    <game.icon className="w-6 h-6 text-white" />
                  </div>
                  {game.isComingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <span className="text-white font-bold text-xs tracking-widest border border-white/30 px-3 py-1 rounded-full">COMING SOON</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{game.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{game.description}</p>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">v1.0</span>
                    {!game.isComingSoon && (
                      <Button size="sm" className="rounded-full px-6 bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90">
                        Play
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeGame && currentGame && (
          <div className="w-full h-full animate-in zoom-in-95 duration-300">
            {currentGame.component}
          </div>
        )}

      </div>
    </div>
  );
};