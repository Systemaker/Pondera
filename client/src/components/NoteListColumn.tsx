import { useNotes } from "@/context/NotesContext";
import { Plus, Settings, Pin, MoreVertical, Download, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function NoteListColumn() {
  const { 
    notes, 
    activeNoteId, 
    createNote, 
    setActiveNoteId, 
    togglePinNote, 
    deleteNote,
    exportNoteToMarkdown,
    getFormattedDate
  } = useNotes();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleCreateNote = () => {
    createNote();
  };

  const handleOpenSettings = () => {
    // Handle settings logic here
    console.log("Settings opened");
  };

  return (
    <div className="w-64 min-w-[200px] flex-shrink-0 border-r border-zinc-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-zinc-800">
        <h1 className="text-lg font-semibold text-[#5950a3] truncate flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#5950a3]" /> Notes
        </h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 border border-white/10 hover:border-white/20 text-[#5950a3]"
            onClick={handleCreateNote}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 border border-white/10 hover:border-white/20 text-[#5950a3]"
            onClick={handleOpenSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 py-2">
        {notes.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p>No notes yet</p>
            <p className="text-sm mt-2">Click the + button to create one</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`px-4 py-3 hover:bg-zinc-900 cursor-pointer transition-all flex flex-col ${
                activeNoteId === note.id ? "bg-zinc-900" : ""
              } ${note.is_pinned ? "border-l-2 border-[hsl(var(--priority-high))]" : ""}`}
              onClick={() => setActiveNoteId(note.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-gray-100 truncate flex-1 pr-1">{note.title}</h3>
                <div className="flex-shrink-0 flex items-center space-x-1 text-gray-400">
                  {note.is_pinned && <Pin className="w-3.5 h-3.5" />}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={(e) => e.stopPropagation()} 
                        className="p-0.5 rounded hover:bg-zinc-800 focus:outline-none"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border border-zinc-700 text-gray-200 text-sm">
                      <DropdownMenuItem 
                        className="flex items-center gap-2 focus:bg-zinc-800 focus:text-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinNote(note.id);
                        }}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        {note.is_pinned ? "Unpin Note" : "Pin Note"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 focus:bg-zinc-800 focus:text-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportNoteToMarkdown(note.id);
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export as Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 text-red-400 focus:bg-red-900/20 focus:text-red-300"
                        onClick={(e) => handleDeleteClick(note.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{getFormattedDate(note.updated_at)}</span>
                <span>{note.comments.length} comments</span>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-700 text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete this note and all its comments and highlights.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-gray-200 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}