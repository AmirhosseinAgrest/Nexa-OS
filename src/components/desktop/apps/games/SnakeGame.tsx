import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const SnakeGame = () => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const speedRef = useRef(INITIAL_SPEED);

  useEffect(() => {
    const saved = localStorage.getItem("snake_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateFood = useCallback((): Point => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    speedRef.current = INITIAL_SPEED;
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (directionRef.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return prevSnake;
      }

      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood());

        if (speedRef.current > 50) speedRef.current -= SPEED_INCREMENT;
      } else {
        newSnake.pop(); 
      }

      return newSnake;
    });
  }, [food, gameOver, generateFood]);

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    setScore(currentScore => {
        setHighScore(prev => {
            const newHigh = Math.max(prev, currentScore);
            localStorage.setItem("snake_highscore", newHigh.toString());
            return newHigh;
        });
        return currentScore;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') directionRef.current = 'UP';
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') directionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speedRef.current);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, moveSnake, score]); 

  return (
    <div className="flex flex-col h-full w-full bg-black items-center justify-center p-4 font-mono select-none overflow-hidden relative">
      
      <div 
         className="absolute inset-0 opacity-20 pointer-events-none"
         style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
             backgroundSize: '20px 20px'
         }}
      />

      <div className="absolute top-4 left-0 right-0 px-8 flex justify-between text-white z-10">
        <div className="flex flex-col">
             <span className="text-xs text-gray-400">SCORE</span>
             <span className="text-2xl font-bold text-green-400">{score}</span>
        </div>
        <div className="flex flex-col items-end">
             <span className="text-xs text-gray-400 flex items-center gap-1"><Trophy className="w-3 h-3" /> HIGH SCORE</span>
             <span className="text-2xl font-bold text-yellow-400">{highScore}</span>
        </div>
      </div>

      <div 
        className="relative bg-gray-900/80 border-2 border-green-500/30 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.2)] overflow-hidden"
        style={{ 
            width: 'min(400px, 90vw)', 
            height: 'min(400px, 90vw)',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
         {gameOver && (
             <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                 <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
                 <p className="text-gray-300 mb-6">Score: {score}</p>
                 <Button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <RotateCcw className="w-4 h-4" /> Try Again
                 </Button>
             </div>
         )}

         {!isPlaying && !gameOver && (
             <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                 <Zap className="w-16 h-16 text-green-400 mb-4 animate-pulse" />
                 <h1 className="text-3xl font-bold text-white mb-2 text-glow">NEON SNAKE</h1>
                 <p className="text-xs text-gray-400 mb-8">Use Arrow Keys to Move</p>
                 <Button onClick={startGame} size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold rounded-full px-8 shadow-lg shadow-green-500/20 animate-bounce">
                    <Play className="w-5 h-5 mr-2 fill-current" /> START GAME
                 </Button>
             </div>
         )}

         {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
             const x = i % GRID_SIZE;
             const y = Math.floor(i / GRID_SIZE);
             
             const isSnakeHead = snake[0].x === x && snake[0].y === y;
             const isSnakeBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
             const isFood = food.x === x && food.y === y;

             return (
                 <div key={i} className="relative">
                     {isSnakeHead && (
                         <div className="absolute inset-0 bg-green-400 rounded-sm shadow-[0_0_15px_#4ade80] z-10 scale-110" />
                     )}
                     {isSnakeBody && (
                         <div className="absolute inset-0.5 bg-green-600/80 rounded-sm shadow-[0_0_5px_#16a34a]" />
                     )}
                     {isFood && (
                         <div className="absolute inset-1 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444] animate-pulse" />
                     )}
                 </div>
             );
         })}
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
         <div />
         <Button variant="secondary" size="icon" onPointerDown={() => { if(directionRef.current !== 'DOWN') directionRef.current = 'UP' }}><div className="rotate-0">▲</div></Button>
         <div />
         <Button variant="secondary" size="icon" onPointerDown={() => { if(directionRef.current !== 'RIGHT') directionRef.current = 'LEFT' }}><div className="-rotate-90">▲</div></Button>
         <Button variant="secondary" size="icon" onPointerDown={() => { if(directionRef.current !== 'UP') directionRef.current = 'DOWN' }}><div className="rotate-180">▲</div></Button>
         <Button variant="secondary" size="icon" onPointerDown={() => { if(directionRef.current !== 'LEFT') directionRef.current = 'RIGHT' }}><div className="rotate-90">▲</div></Button>
      </div>

    </div>
  );
};