import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNotes } from "@/context/NotesContext";
import { COMMENT_CATEGORIES, COMMENT_PRIORITIES } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CommentFormModalProps {
  selectedText: string;
  spanId: string;
  editingCommentId: string | null;
  onClose: () => void;
}

export default function CommentFormModal({
  selectedText,
  spanId,
  editingCommentId,
  onClose
}: CommentFormModalProps) {
  const { activeNote, activeNoteId, addComment, updateComment } = useNotes();
  
  const [commentText, setCommentText] = useState("");
  const [category, setCategory] = useState(COMMENT_CATEGORIES[0].toLowerCase());
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  
  // If editing, load the existing comment data
  useEffect(() => {
    if (editingCommentId && activeNote) {
      const comment = activeNote.comments.find(c => c.id === editingCommentId);
      if (comment) {
        setCommentText(comment.text);
        setCategory(comment.category);
        setPriority(comment.priority);
      }
    }
  }, [editingCommentId, activeNote]);
  
  const handleSave = () => {
    if (!activeNoteId) return;
    
    if (editingCommentId) {
      // Update existing comment
      updateComment(activeNoteId, editingCommentId, {
        text: commentText,
        category,
        priority
      });
    } else {
      // Add new comment
      addComment(activeNoteId, {
        target_span_id: spanId,
        text: commentText,
        category,
        priority
      });
    }
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border border-zinc-700 text-gray-100">
        <DialogHeader>
          <DialogTitle>{editingCommentId ? "Edit Comment" : "Add Comment"}</DialogTitle>
        </DialogHeader>
        
        {selectedText && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-400 mb-1">Selected Text</Label>
            <div className="bg-zinc-800 p-3 rounded text-sm text-gray-300 italic">
              {selectedText}
            </div>
          </div>
        )}
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="comment-text">Comment</Label>
            <Textarea
              id="comment-text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              className="bg-zinc-800 border border-zinc-700 text-gray-200 resize-none"
              placeholder="Add your comment here..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="comment-category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value)}
            >
              <SelectTrigger className="bg-zinc-800 border border-zinc-700 text-gray-200">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border border-zinc-700 text-gray-200">
                {COMMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.toLowerCase()} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={(value) => setPriority(value as "high" | "medium" | "low")}
              className="flex space-x-4"
            >
              {COMMENT_PRIORITIES.map((p) => (
                <div key={p.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={p.value}
                    id={`priority-${p.value}`}
                    className="text-white border-zinc-700"
                  />
                  <Label
                    htmlFor={`priority-${p.value}`}
                    className="flex items-center space-x-1 cursor-pointer"
                  >
                    <span className={`inline-block w-2 h-2 rounded-full ${p.colorClass}`}></span>
                    <span className="text-sm text-gray-300">{p.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-transparent text-gray-300 hover:bg-zinc-800 hover:text-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!commentText.trim()}
          >
            {editingCommentId ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
