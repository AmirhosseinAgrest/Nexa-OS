import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, ArrowRight, RotateCw, Home, Lock, Unlock, 
  Search, Globe, X, ShieldAlert, ExternalLink, Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
const HOMEPAGE = "agrest://newtab";
const QUICK_LINKS = [
  { name: "Wikipedia", url: "https://www.wikipedia.org", icon: "W", color: "bg-gray-200 text-black" },
  { name: "Bing Search", url: "https://www.bing.com", icon: "b", color: "bg-blue-500 text-white" },
  { name: "VS Code", url: "https://vscode.dev", icon: "V", color: "bg-blue-600 text-white" },
  { name: "Excalidraw", url: "https://excalidraw.com", icon: "E", color: "bg-purple-500 text-white" },
  { name: "Agrest OS", url: "https://agrest.com", icon: "A", color: "bg-primary text-primary-foreground" },
];

export const AgrestBrowser = () => {
  const [currentUrl, setCurrentUrl] = useState<string>(HOMEPAGE);
  const [displayUrl, setDisplayUrl] = useState<string>("");
  const [history, setHistory] = useState<string[]>([HOMEPAGE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [securityState, setSecurityState] = useState<'secure' | 'insecure' | 'agrest'>('agrest');
  const [iframeError, setIframeError] = useState<boolean>(false);
const [initials, setInitials] = useState("G"); 

  useEffect(() => {
    const storedName = localStorage.getItem("systemName");
    if (storedName) {
      const letters = storedName.trim().slice(0, 2).toUpperCase();
      setInitials(letters);
    } else {
      setInitials("G"); 
    }
  }, []);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (currentUrl === HOMEPAGE) {
      setDisplayUrl("");
      setSecurityState('agrest');
      setIframeError(false);
    } else {
      setDisplayUrl(currentUrl);
      if (currentUrl.startsWith("https://")) {
        setSecurityState('secure');
      } else {
        setSecurityState('insecure');
      }
    }
    setIsLoading(true);
  }, [currentUrl]);

  const handleNavigate = (urlInput: string) => {
    let targetUrl = urlInput.trim();
    setIframeError(false);

    if (!targetUrl) {
      navigateTo(HOMEPAGE);
      return;
    }

    if (targetUrl === "agrest://newtab") {
        navigateTo(HOMEPAGE);
        return;
    }

    const isUrl = targetUrl.includes(".") && !targetUrl.includes(" ");
    
    if (!isUrl) {
      targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`;
    } else {
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = `https://${targetUrl}`;
      }
    }

    if (targetUrl.startsWith("http://")) {
    }

    navigateTo(targetUrl);
  };

  const navigateTo = (url: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(url);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNavigate(displayUrl);
    }
  };

  const onLoadIframe = () => {
    setIsLoading(false);
  };

  const onErrorIframe = () => {
    setIsLoading(false);
    setIframeError(true);
  };


  const isHomePage = currentUrl === HOMEPAGE;
  const isInsecure = currentUrl.startsWith("http://");

  return (
    <div className="flex flex-col w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-border/50">
      
      <div className="h-14 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center px-3 gap-2 shadow-sm z-10">
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={goBack} disabled={historyIndex === 0}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={goForward} disabled={historyIndex === history.length - 1}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleRefresh}>
             {isLoading ? <X className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleNavigate(HOMEPAGE)}>
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 max-w-3xl mx-auto relative group">
          <div className={cn(
            "flex items-center w-full h-9 bg-muted/50 rounded-full border border-transparent focus-within:border-primary/50 focus-within:bg-background focus-within:shadow-md transition-all px-3",
            isInsecure ? "border-red-500/30 bg-red-500/5" : ""
          )}>
            <div className="mr-2">
               {currentUrl === HOMEPAGE ? (
                  <Globe className="h-4 w-4 text-primary" />
               ) : isInsecure ? (
                  <Unlock className="h-4 w-4 text-red-500" />
               ) : (
                  <Lock className="h-4 w-4 text-green-500" />
               )}
            </div>

            <input
              type="text"
              value={displayUrl}
              onChange={(e) => setDisplayUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => e.target.select()}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              placeholder="Search Google or type a URL"
            />
            
            {currentUrl !== HOMEPAGE && (
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full ml-1 hover:text-yellow-400">
                    <Star className="h-3.5 w-3.5" />
                </Button>
            )}
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80">
      {initials}
    </div>
      </div>

      <div className="flex-1 relative bg-white dark:bg-neutral-900 overflow-hidden">
        
        {isLoading && (
           <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-100 z-20">
              <div className="h-full bg-blue-500 animate-progress-indeterminate" />
           </div>
        )}

        {isHomePage && (
          <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 p-4">
            <div className="mb-8 flex flex-col items-center">
               <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
                   <Globe className="w-10 h-10 text-primary" />
               </div>
               <h1 className="text-3xl font-bold text-foreground">Agrest Browser</h1>
               <p className="text-muted-foreground mt-2">Fast, Secure, Private.</p>
            </div>

            <div className="w-full max-w-lg relative mb-12">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <Input 
                    className="h-12 pl-12 rounded-full shadow-lg border-border/50 text-lg" 
                    placeholder="Search the web..."
                    onKeyDown={(e) => { if(e.key === 'Enter') handleNavigate(e.currentTarget.value) }}
                />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
                {QUICK_LINKS.map((link) => (
                    <button 
                        key={link.name}
                        onClick={() => handleNavigate(link.url)}
                        className="flex flex-col items-center gap-3 group"
                    >
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-md transition-transform group-hover:scale-110", link.color)}>
                            {link.icon}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{link.name}</span>
                    </button>
                ))}
            </div>
          </div>
        )}

        {!isHomePage && isInsecure && (
            <div className="h-full flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/20 text-center p-8 animate-in zoom-in-95">
                <ShieldAlert className="w-24 h-24 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Connection Not Secure</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                    Agrest Browser blocked this site because it uses an insecure connection (HTTP). 
                    Your information (passwords, messages, cards) could be stolen by attackers.
                </p>
                <Button variant="outline" onClick={() => goBack()}>Go Back (Recommended)</Button>
                <button className="mt-4 text-xs text-muted-foreground underline hover:text-red-500">
                    Proceed anyway (Unsafe)
                </button>
            </div>
        )}

        {!isHomePage && !isInsecure && (
            <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full border-none bg-white"
                onLoad={onLoadIframe}
                onError={onErrorIframe}
                title="Web Content"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
        )}

        {!isHomePage && !isInsecure && !isLoading && (
             <div className="absolute bottom-4 right-4 z-30">
                 <div className="bg-background/80 backdrop-blur border border-border p-3 rounded-lg shadow-lg text-xs max-w-xs flex flex-col gap-2">
                     <p className="opacity-70">Is the site not loading?</p>
                     <Button size="sm" variant="secondary" className="w-full gap-2" onClick={() => window.open(currentUrl, '_blank')}>
                        <ExternalLink className="w-3 h-3" /> Open in Real Tab
                     </Button>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};