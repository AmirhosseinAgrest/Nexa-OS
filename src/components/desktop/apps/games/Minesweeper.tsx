import React, { useState, useEffect } from "react";
import { AlertTriangle, Flag, RefreshCw, Trophy, Bomb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEVELS = {
  Easy: { rows: 8, cols: 8, mines: 10 },
  Medium: { rows: 12, cols: 12, mines: 25 },
  Hard: { rows: 16, cols: 16, mines: 40 },
};

type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export const Minesweeper = () => {
  const [level, setLevel] = useState<keyof typeof LEVELS>('Easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [minesLeft, setMinesLeft] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    startNewGame();
  }, [level]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'playing') {
      timer = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const startNewGame = () => {
    const { rows, cols, mines } = LEVELS[level];
    const newBoard: Cell[][] = [];

    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newBoard.push(row);
    }

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!newBoard[r][c].isMine) {
        newBoard[r][c].isMine = true;
        minesPlaced++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i >= 0 && r + i < rows && c + j >= 0 && c + j < cols) {
                if (newBoard[r + i][c + j].isMine) count++;
              }
            }
          }
          newBoard[r][c].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setMinesLeft(mines);
    setStatus('idle');
    setTime(0);
  };


  const revealCell = (r: number, c: number) => {
    if (status === 'lost' || status === 'won') return;
    if (board[r][c].isRevealed || board[r][c].isFlagged) return;

    if (status === 'idle') setStatus('playing');

    const newBoard = [...board];
    const cell = newBoard[r][c];

    if (cell.isMine) {
      cell.isRevealed = true;
      setStatus('lost');
      revealAllMines(newBoard);
      setBoard(newBoard);
      return;
    }

    const revealRecursive = (row: number, col: number) => {
      if (
        row < 0 || row >= LEVELS[level].rows ||
        col < 0 || col >= LEVELS[level].cols ||
        newBoard[row][col].isRevealed ||
        newBoard[row][col].isFlagged
      ) return;

      newBoard[row][col].isRevealed = true;

      if (newBoard[row][col].neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            revealRecursive(row + i, col + j);
          }
        }
      }
    };

    revealRecursive(r, c);
    setBoard(newBoard);
    checkWin(newBoard);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === 'lost' || status === 'won') return;
    if (board[r][c].isRevealed) return;

    if (status === 'idle') setStatus('playing');

    const newBoard = [...board];
    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
    setBoard(newBoard);
    setMinesLeft(prev => newBoard[r][c].isFlagged ? prev - 1 : prev + 1);
  };

  const revealAllMines = (currentBoard: Cell[][]) => {
    currentBoard.forEach(row => {
      row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      });
    });
  };

  const checkWin = (currentBoard: Cell[][]) => {
    let nonMinesRevealed = 0;
    const totalCells = LEVELS[level].rows * LEVELS[level].cols;
    
    currentBoard.forEach(row => row.forEach(cell => {
      if (cell.isRevealed && !cell.isMine) nonMinesRevealed++;
    }));

    if (nonMinesRevealed === totalCells - LEVELS[level].mines) {
      setStatus('won');
      setMinesLeft(0);
    }
  };

  const getNumColor = (num: number) => {
    const colors = [
      '', 'text-blue-500', 'text-green-500', 'text-red-500', 
      'text-purple-500', 'text-orange-500', 'text-cyan-500', 'text-black', 'text-gray-500'
    ];
    return colors[num] || '';
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 dark:bg-slate-900 p-4 select-none overflow-hidden items-center justify-center">
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-border/50 w-fit max-w-full flex flex-col gap-4">

        <div className="flex items-center justify-between bg-slate-200 dark:bg-slate-950 p-3 rounded-lg border-b-4 border-slate-300 dark:border-slate-900">

           <div className="bg-black text-red-500 font-mono text-2xl px-2 rounded border border-red-900/50 shadow-inner min-w-[60px] text-center">
              {minesLeft.toString().padStart(3, '0')}
           </div>

           <button 
              onClick={startNewGame}
              className="w-10 h-10 text-2xl flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 border-b-4 border-yellow-600 rounded-full active:border-b-0 active:translate-y-1 transition-all"
           >
              {status === 'lost' ? '😵' : status === 'won' ? '😎' : '🙂'}
           </button>

           <div className="bg-black text-red-500 font-mono text-2xl px-2 rounded border border-red-900/50 shadow-inner min-w-[60px] text-center">
              {Math.min(999, time).toString().padStart(3, '0')}
           </div>
        </div>

        <div 
            className="grid gap-1 bg-slate-300 dark:bg-slate-700 p-1 rounded border-4 border-slate-300 dark:border-slate-700 overflow-auto max-h-[60vh]"
            style={{ 
                gridTemplateColumns: `repeat(${LEVELS[level].cols}, minmax(0, 1fr))`,
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {board.map((row, r) => (
                row.map((cell, c) => (
                    <div
                        key={`${r}-${c}`}
                        onClick={() => revealCell(r, c)}
                        onContextMenu={(e) => toggleFlag(e, r, c)}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center text-sm font-bold cursor-default transition-all duration-75 select-none",
                            cell.isRevealed 
                                ? cn(
                                    "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                                    cell.isMine ? "bg-red-500 dark:bg-red-600" : getNumColor(cell.neighborMines)
                                  )
                                : 
                                  "bg-slate-400 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 border-b-4 border-r-4 border-slate-500 dark:border-slate-800 active:border-none active:bg-slate-300",
                            (status === 'lost' || status === 'won') && !cell.isRevealed && "opacity-80"
                        )}
                    >
                        {cell.isRevealed ? (
                            cell.isMine ? <Bomb className="w-5 h-5 text-black fill-black animate-pulse" /> : (cell.neighborMines > 0 ? cell.neighborMines : "")
                        ) : (
                            cell.isFlagged ? <Flag className="w-4 h-4 text-red-600 fill-red-600" /> : ""
                        )}
                    </div>
                ))
            ))}
        </div>

        <div className="flex justify-center gap-2">
            {(Object.keys(LEVELS) as Array<keyof typeof LEVELS>).map((l) => (
                <Button 
                    key={l}
                    variant={level === l ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLevel(l)}
                    className="text-xs"
                >
                    {l}
                </Button>
            ))}
        </div>

      </div>

      {status === 'won' && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce z-50 flex gap-2 items-center">
             <Trophy className="w-5 h-5" /> You Won! Great Job!
          </div>
      )}
      {status === 'lost' && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-4 z-50 flex gap-2 items-center">
             <AlertTriangle className="w-5 h-5" /> Game Over! Try Again.
          </div>
      )}

    </div>
  );
};