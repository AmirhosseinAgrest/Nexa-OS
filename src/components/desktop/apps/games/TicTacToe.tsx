import React, { useState, useEffect } from "react";
import { RotateCcw, User, Bot, Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Player = 'X' | 'O';
type Mode = 'PvP' | 'PvE'; 

export const TicTacToe = () => {
  const [board, setBoard] = useState<(Player | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [mode, setMode] = useState<Mode>('PvE');
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });
  const [difficulty, setDifficulty] = useState<'Easy' | 'Hard'>('Hard');

  
  const checkWinner = (squares: (Player | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], 
      [0, 3, 6], [1, 4, 7], [2, 5, 8], 
      [0, 4, 8], [2, 4, 6] 
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.every(Boolean) ? 'Draw' : null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || (mode === 'PvE' && !isXNext)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
        setWinner(result);
        updateScore(result);
    } else {
        setIsXNext(!isXNext);
    }
  };

  useEffect(() => {
    if (mode === 'PvE' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove(board, difficulty === 'Hard');
        if (bestMove !== -1) {
            const newBoard = [...board];
            newBoard[bestMove] = 'O';
            setBoard(newBoard);
            
            const result = checkWinner(newBoard);
            if (result) {
                setWinner(result);
                updateScore(result);
            } else {
                setIsXNext(true);
            }
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, mode, winner]);

  const getBestMove = (currentBoard: (Player | null)[], isHard: boolean): number => {
    const available = currentBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
    
    if (available.length === 0) return -1;

    if (isHard) {
        for (let move of available) {
            const temp = [...currentBoard];
            temp[move] = 'O';
            if (checkWinner(temp) === 'O') return move;
        }
        for (let move of available) {
            const temp = [...currentBoard];
            temp[move] = 'X';
            if (checkWinner(temp) === 'X') return move;
        }
    }

    if (isHard && currentBoard[4] === null) return 4;

    return available[Math.floor(Math.random() * available.length)];
  };

  const updateScore = (result: Player | 'Draw') => {
    setScores(prev => ({ ...prev, [result]: prev[result as keyof typeof prev] + 1 }));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 select-none overflow-hidden">
      
      <div className="flex items-center justify-between mb-6">
         <div className="flex gap-2 bg-black/20 p-1 rounded-lg border border-white/10">
            <Button 
                size="sm" 
                variant={mode === 'PvE' ? 'secondary' : 'ghost'} 
                onClick={() => { setMode('PvE'); resetGame(); }}
                className={cn("gap-2 text-xs", mode === 'PvE' && "bg-blue-600 hover:bg-blue-700 text-white")}
            >
                <Bot className="w-3 h-3" /> vs Bot
            </Button>
            <Button 
                size="sm" 
                variant={mode === 'PvP' ? 'secondary' : 'ghost'} 
                onClick={() => { setMode('PvP'); resetGame(); }}
                className={cn("gap-2 text-xs", mode === 'PvP' && "bg-purple-600 hover:bg-purple-700 text-white")}
            >
                <User className="w-3 h-3" /> vs Friend
            </Button>
         </div>

         <div className="flex items-center gap-4 text-sm">
             <div className="flex items-center gap-2 text-blue-400">
                <User className="w-4 h-4" /> X: <span className="font-bold">{scores.X}</span>
             </div>
             <div className="flex items-center gap-2 text-red-400">
                {mode === 'PvE' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />} 
                O: <span className="font-bold">{scores.O}</span>
             </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {winner && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300 rounded-2xl">
                <Trophy className={cn("w-16 h-16 mb-4 animate-bounce", winner === 'Draw' ? "text-gray-400" : "text-yellow-400")} />
                <h2 className="text-4xl font-bold mb-2">
                    {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
                </h2>
                <Button onClick={resetGame} className="mt-4 gap-2 bg-white text-black hover:bg-gray-200">
                    <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
            </div>
        )}

        <div className="grid grid-cols-3 gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
            {board.map((cell, i) => (
                <button
                    key={i}
                    onClick={() => handleClick(i)}
                    disabled={!!cell || !!winner || (mode === 'PvE' && !isXNext)}
                    className={cn(
                        "w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-5xl font-bold flex items-center justify-center transition-all duration-200",
                        "hover:bg-white/10 active:scale-95 disabled:active:scale-100",
                        !cell && "bg-black/20",
                        cell === 'X' && "bg-blue-500/20 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]",
                        cell === 'O' && "bg-red-500/20 text-red-400 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]"
                    )}
                >
                    <span className={cn("scale-0 transition-transform duration-300", cell && "scale-100")}>
                        {cell}
                    </span>
                </button>
            ))}
        </div>

        <div className="mt-8 text-muted-foreground font-medium flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/5">
            {!winner && (
                <>
                    {isXNext ? (
                        <span className="text-blue-400 flex items-center gap-2"><User className="w-4 h-4"/> Player X Turn</span>
                    ) : (
                        <span className="text-red-400 flex items-center gap-2">
                            {mode === 'PvE' ? <Bot className="w-4 h-4"/> : <User className="w-4 h-4"/>} 
                            {mode === 'PvE' ? "Bot is thinking..." : "Player O Turn"}
                        </span>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};