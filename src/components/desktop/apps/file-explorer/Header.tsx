import { ArrowLeft, Laptop, ChevronRight, Search, ArrowUpDown, Grid, List as ListIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortOrder: 'asc' | 'desc';
  setSortBy: (sort: 'name' | 'date' | 'size') => void;
  setSortOrder: (order: any) => void;
  onUploadClick: () => void;
}

export const Header = ({
  currentPath, onNavigate, searchQuery, setSearchQuery,
  viewMode, setViewMode, sortOrder, setSortBy, setSortOrder, onUploadClick
}: HeaderProps) => {
  return (
    <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 gap-4 bg-background/40">
      <div className="flex items-center gap-2 flex-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPath === "root"} onClick={() => onNavigate("root")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 max-w-md flex gap-2">
          <div className="flex-1 h-8 bg-muted/50 border border-white/10 rounded-md flex items-center px-3 text-sm text-muted-foreground">
            <Laptop className="w-3.5 h-3.5 mr-2 opacity-70" />
            <span className="mx-1">My PC</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1 opacity-50" />
            <span className="text-foreground font-medium capitalize">{currentPath}</span>
          </div>

          <div className="relative w-48 hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search DB"
              className="h-8 pl-8 bg-muted/50 border-white/10 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('date')}>Date</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('size')}>Size</DropdownMenuItem>
            <div className="h-px bg-border my-1" />
            <DropdownMenuItem onClick={() => setSortOrder((prev: any) => prev === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-px bg-white/20 mx-1" />

        <div className="flex bg-muted/50 p-0.5 rounded-md border border-white/10">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-6 w-6" onClick={() => setViewMode('grid')}>
            <Grid className="w-3.5 h-3.5" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-6 w-6" onClick={() => setViewMode('list')}>
            <ListIcon className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Button size="sm" className="h-8 text-xs gap-2 ml-2" onClick={onUploadClick}>
          <Upload className="w-3.5 h-3.5" /> <span className="hidden md:inline">Upload</span>
        </Button>
      </div>
    </div>
  );
};