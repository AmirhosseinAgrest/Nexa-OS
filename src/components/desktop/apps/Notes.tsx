import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Search, Trash2, Bold, Italic, Underline, 
  List, Type, Palette, MoreVertical, Star, 
  Clock, ChevronLeft, Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"; 

interface Note {
  id: number;
  title: string;
  content: string; 
  date: string;
  rawDate: number; 
  isPinned: boolean;
  color: string; 
}

const COLORS = [
  { name: "Default", value: "bg-transparent" },
  { name: "Red", value: "bg-red-500/10 border-red-500/20" },
  { name: "Blue", value: "bg-blue-500/10 border-blue-500/20" },
  { name: "Green", value: "bg-green-500/10 border-green-500/20" },
  { name: "Yellow", value: "bg-yellow-500/10 border-yellow-500/20" },
  { name: "Purple", value: "bg-purple-500/10 border-purple-500/20" },
];

export const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const savedNotes = localStorage.getItem("nexa_notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    } else {
      const welcomeNote: Note = {
        id: Date.now(),
        title: "Welcome to Nexa Notes 🚀",
        content: "<div><b>Hello!</b> This is your new powerful note-taking app.</div><div><br></div><div><ul><li>Try selecting text and using the toolbar above.</li><li>Pin important notes.</li><li>Change note colors via the menu.</li></ul></div>",
        date: new Date().toLocaleString(),
        rawDate: Date.now(),
        isPinned: true,
        color: "bg-blue-500/10 border-blue-500/20"
      };
      setNotes([welcomeNote]);
      setSelectedNoteId(welcomeNote.id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nexa_notes", JSON.stringify(notes));
  }, [notes]);


  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now(),
      title: "",
      content: "",
      date: new Date().toLocaleString(),
      rawDate: Date.now(),
      isPinned: false,
      color: "bg-transparent"
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  const handleUpdateNote = (id: number, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, date: new Date().toLocaleString(), rawDate: Date.now() } 
        : note
    ));
  };

  const togglePin = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (note) handleUpdateNote(id, { isPinned: !note.isPinned });
  };

  
  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current && selectedNoteId) {
       handleUpdateNote(selectedNoteId, { content: editorRef.current.innerHTML });
    }
  };


  const activeNote = notes.find(n => n.id === selectedNoteId);
  
  const filteredNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (b.isPinned === a.isPinned ? b.rawDate - a.rawDate : b.isPinned ? 1 : -1));

  return (
    <div className="flex w-full h-full max-w-6xl mx-auto bg-background/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden transition-all dark:border-white/10 dark:bg-black/40">
      
      <div className="w-80 bg-muted/30 border-r border-border/40 flex flex-col backdrop-blur-md transition-all">
        <div className="p-5 border-b border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Notes
            </h2>
            <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-border/50">
              {notes.length} Items
            </span>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input
              placeholder="Search anything..."
              className="pl-9 bg-background/50 border-transparent focus:bg-background focus:border-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            onClick={handleNewNote}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Note
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 scroll-smooth custom-scrollbar">
          {filteredNotes.length === 0 ? (
             <div className="text-center pt-10 text-muted-foreground opacity-50">
                <p>No notes found</p>
             </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={cn(
                  "group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border hover:shadow-md",
                  selectedNoteId === note.id
                    ? "bg-background border-primary/50 shadow-lg ring-1 ring-primary/20"
                    : "bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5 hover:border-border/30",
                  note.color !== "bg-transparent" && !selectedNoteId ? note.color : ""
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={cn("font-semibold truncate pr-4 transition-colors", !note.title && "text-muted-foreground italic")}>
                    {note.title || "Untitled Note"}
                  </h3>
                  {note.isPinned && <Star className="w-3 h-3 text-orange-400 fill-orange-400 animate-in zoom-in" />}
                </div>
                
                <div 
                  className="text-xs text-muted-foreground line-clamp-2 h-8 mb-2 opacity-80"
                  dangerouslySetInnerHTML={{ __html: note.content || "No content..." }}
                />
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded-md">
                     <Clock className="w-3 h-3" /> {note.date.split(',')[0]}
                  </span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-orange-500/10 hover:text-orange-500" onClick={(e) => togglePin(note.id, e)}>
                       <Star className={cn("w-3 h-3", note.isPinned ? "fill-current" : "")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-500/10 hover:text-red-600" onClick={(e) => handleDeleteNote(note.id, e)}>
                       <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-background/30 relative">
        {activeNote ? (
          <>
            <div className="h-14 border-b border-border/40 flex items-center justify-between px-4 bg-background/40 backdrop-blur-sm">
               <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-2 hidden md:inline-block">Format:</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')}>
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')}>
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('underline')}>
                    <Underline className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertUnorderedList')}>
                    <List className="w-4 h-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Palette className="w-4 h-4 text-purple-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => execCommand('foreColor', '#000000')}>Default</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => execCommand('foreColor', '#EF4444')} className="text-red-500">Red</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => execCommand('foreColor', '#3B82F6')} className="text-blue-500">Blue</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => execCommand('foreColor', '#10B981')} className="text-green-500">Green</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>

               <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Auto-saving...</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <div className="p-2">
                            <p className="text-xs font-medium mb-2 ml-2">Note Color</p>
                            <div className="grid grid-cols-3 gap-1">
                                {COLORS.map((c, i) => (
                                    <button 
                                        key={i} 
                                        className={cn("w-6 h-6 rounded-full border hover:scale-110 transition-transform", c.value.split(' ')[0])} 
                                        onClick={() => handleUpdateNote(activeNote.id, { color: c.value })}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteNote(activeNote.id)}>
                            Delete Note
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              <Input
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                className="text-4xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 mb-6 h-auto"
                placeholder="Note Title"
              />
              
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                    handleUpdateNote(activeNote.id, { content: e.currentTarget.innerHTML });
                }}
                className="min-h-[500px] outline-none text-lg leading-relaxed text-foreground/90 empty:before:content-['Start_typing_your_ideas...'] empty:before:text-muted-foreground/40"
                dangerouslySetInnerHTML={{ __html: activeNote.content }} 
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center">
                <Type className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-lg font-medium">Select a note to view</p>
            <Button onClick={handleNewNote} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Create New
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};