import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, X, Minus, Square, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandHistory {
  id: number;
  command: string;
  output: React.ReactNode;
}

export const Terminal = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState(-1); 
  const [cmdBuffer, setCmdBuffer] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [systemName, setSystemName] = useState("guest");

  useEffect(() => {
    const storedName = localStorage.getItem("systemName");
    if (storedName) {
      setSystemName(storedName);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    const welcomeMessage: CommandHistory = {
      id: 0,
      command: "init",
      output: (
        <div className="mb-4 leading-relaxed">
          <pre className="text-primary font-bold text-xs md:text-sm mb-2 whitespace-pre-wrap">
{`
  _   _   ______   __   __      _   
 | \\ | | |  ____|  \\ \\ / /     / \\  
 |  \\| | | |__      \\ V /     / _ \\ 
 | . \` | |  __|      > <     / ___ \\
 | |\\  | | |____    / . \\   /_/   \\_\\
 |_| \\_| |______|  /_/ \\_\\  v1.0.0
`}
          </pre>
          <p className="text-muted-foreground">Welcome to <span className="text-blue-400 font-bold">Nexa OS</span> developed by <span className="text-blue-400">Agrest</span>.</p>
          <p className="text-muted-foreground">Type <span className="text-yellow-400">'help'</span> to see available commands.</p>
          <div className="w-full h-px bg-border/30 my-2" />
        </div>
      ),
    };
    setHistory([welcomeMessage]);
  }, []);

  const processCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    let output: React.ReactNode;

    switch (cleanCmd) {
      case "help":
        output = (
          <div className="space-y-1 text-sm">
            <p className="text-primary mb-2">Available Commands:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><span className="text-yellow-400">about</span> - Who is Amirhossein?</div>
              <div><span className="text-yellow-400">skills</span> - Technical abilities</div>
              <div><span className="text-yellow-400">contact</span> - Get in touch</div>
              <div><span className="text-yellow-400">socials</span> - Social media links</div>
              <div><span className="text-yellow-400">clear</span> - Clear terminal</div>
              <div><span className="text-yellow-400">date</span> - Show current date</div>
              <div><span className="text-yellow-400">sudo</span> - Admin privileges?</div>
            </div>
          </div>
        );
        break;

      case "about":
        output = (
          <div className="space-y-2">
            <p>Hello! I'm <span className="text-blue-400 font-bold">Amirhossein Agrest</span>.</p>
            <p className="text-muted-foreground">
              I am a passionate Full-Stack Developer and the creator of Nexa OS.
              I specialize in building interactive, modern web applications using cutting-edge technologies.
              My goal is to bridge the gap between complex systems and beautiful user interfaces.
            </p>
          </div>
        );
        break;

      case "skills":
        output = (
          <div className="space-y-2">
            <p className="text-primary">Technical Skills:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="border border-border/30 p-2 rounded">
                <span className="block text-blue-400 mb-1">Frontend</span>
                React.js, Next.js, TypeScript, TailwindCSS
              </div>
              <div className="border border-border/30 p-2 rounded">
                <span className="block text-green-400 mb-1">Backend</span>
                Node.js, Express, Python, Django
              </div>
              <div className="border border-border/30 p-2 rounded">
                <span className="block text-purple-400 mb-1">Database</span>
                MongoDB, PostgreSQL, Redis, IndexedDB
              </div>
              <div className="border border-border/30 p-2 rounded">
                <span className="block text-orange-400 mb-1">Tools</span>
                Git, Docker, Figma, Linux
              </div>
            </div>
          </div>
        );
        break;

      case "contact":
        output = (
          <div className="space-y-1">
            <p>Let's build something amazing together.</p>
            <p>Email: <a href="mailto:amirhosseinagrest@gmail.com" className="text-blue-400 hover:underline">amirhosseinagrest@gmail.com</a></p>
          </div>
        );
        break;

      case "socials":
        output = (
            <div className="flex gap-4 mt-1">
                <a href="https://www.linkedin.com/in/amirhosseinagrest" className="text-blue-400 hover:text-blue-300 hover:underline">LinkedIn</a>
                <a href="https://github.com/amirhosseinagrest" className="text-gray-400 hover:text-gray-300 hover:underline">GitHub</a>
                <a href="https://t.me/amirhosseinagrest" className="text-pink-400 hover:text-pink-300 hover:underline">Telegram</a>
            </div>
        );
        break;

      case "date":
        output = <p>{new Date().toLocaleString()}</p>;
        break;

      case "whoami":
        output = <p className="text-green-400">guest@nexa-os</p>;
        break;
      
      case "sudo":
        output = <p className="text-red-500">Permission denied: You are just a user! 😉</p>;
        break;

      case "clear":
        setHistory([]);
        return;
      
      case "":
        return;

      default:
        output = (
          <p className="text-red-400">
            Command not found: '{cmd}'. Type <span className="text-yellow-400">'help'</span> for list.
          </p>
        );
    }

    setHistory((prev) => [...prev, { id: Date.now(), command: cmd, output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cmd = input;
      setCmdBuffer((prev) => [...prev, cmd]);
      setCmdHistoryIndex(cmdBuffer.length + 1);
      processCommand(cmd);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistoryIndex > 0 && cmdBuffer.length > 0) {
        const newIndex = cmdHistoryIndex - 1;
        setCmdHistoryIndex(newIndex);
        setInput(cmdBuffer[newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdHistoryIndex < cmdBuffer.length - 1) {
        const newIndex = cmdHistoryIndex + 1;
        setCmdHistoryIndex(newIndex);
        setInput(cmdBuffer[newIndex]);
      } else {
        setCmdHistoryIndex(cmdBuffer.length);
        setInput("");
      }
    }
  };

  return (
    <div 
      className="flex flex-col w-full h-full max-w-4xl mx-auto bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-sm md:text-base"
      onClick={handleContainerClick}
    >
      <div className="h-8 bg-muted/10 border-b border-white/10 flex items-center justify-between px-3 select-none">
        <div className="flex items-center gap-2 text-muted-foreground">
            <TerminalIcon className="w-3 h-3" />
            <span className="text-xs">Agrest Terminal</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2 text-gray-200">
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.command !== "init" && (
               <div className="flex items-center gap-2 opacity-80">
                   <span className="text-green-400 font-bold">
      {systemName.toLowerCase()}@nexa
    </span>
                 <span className="text-muted-foreground">:</span>
                 <span className="text-blue-400">~</span>
                 <span className="text-muted-foreground">$</span>
                 <span className="text-foreground">{item.command}</span>
               </div>
            )}
            <div className="pl-2 mb-3 animate-in fade-in duration-300">
                {item.output}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2">
               <span className="text-green-400 font-bold">
      {systemName.toLowerCase()}@nexa
    </span>
             <span className="text-muted-foreground">:</span>
             <span className="text-blue-400">~</span>
             <span className="text-muted-foreground">$</span>
             <div className="relative flex-1">
                 <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none text-foreground w-full caret-transparent absolute inset-0 z-10"
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                 />
                 <span className="pointer-events-none whitespace-pre">
                    {input}
                    <span className="inline-block w-2.5 h-4 bg-gray-400 align-middle ml-0.5 animate-pulse" />
                 </span>
             </div>
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};