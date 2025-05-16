import { useEffect, useState } from "react";
import NoteListColumn from "./NoteListColumn";
import EditorColumn from "./EditorColumn";
import CommentListColumn from "./CommentListColumn";
import EnhancedContextMenu from "./EnhancedContextMenu";
import CommentFormModal from "./CommentFormModal";
import { useNotes } from "@/context/NotesContext";

export default function AppLayout() {
  const { activeNoteId, activeNote, updateNote } = useNotes();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedTextInfo, setSelectedTextInfo] = useState<{ text: string; spanId: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // Handler for right-click in the editor
  const handleContextMenu = (e: React.MouseEvent, selectedText: string | null) => {
    e.preventDefault();
    if (!selectedText) return;
    
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // Close the context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handler for adding a comment
  const handleAddComment = (spanId: string, selectedText: string) => {
    setSelectedTextInfo({ text: selectedText, spanId });
    setEditingCommentId(null);
    setShowCommentModal(true);
    setShowContextMenu(false);
  };

  // Handler for editing a comment
  const handleEditComment = (commentId: string) => {
    if (!activeNote) return;
    
    const comment = activeNote.comments.find(c => c.id === commentId);
    if (!comment) return;
    
    setSelectedTextInfo({ text: '', spanId: comment.target_span_id });
    setEditingCommentId(commentId);
    setShowCommentModal(true);
    setShowContextMenu(false);
  };

  // Handler for applying a highlight
  const handleApplyHighlight = (colorClass: string, spanId: string) => {
    if (!activeNoteId) return;
    
    // Add the highlight to the note's data
    if (activeNote) {
      const newHighlight = {
        target_span_id: spanId,
        color_class: colorClass as any,
      };
      
      updateNote(activeNoteId, {
        highlights: [...activeNote.highlights, {
          ...newHighlight,
          id: `highlight-${Date.now()}`,
          created_at: new Date().toISOString()
        }]
      });
    }
    
    setShowContextMenu(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-gray-200">
      <NoteListColumn />
      
      <EditorColumn 
        onContextMenu={handleContextMenu} 
      />
      
      <CommentListColumn 
        onEditComment={handleEditComment} 
      />
      
      {showContextMenu && (
        <EnhancedContextMenu
          position={contextMenuPosition}
          onAddComment={handleAddComment}
          onApplyHighlight={handleApplyHighlight}
          onEditComment={handleEditComment}
          activeNote={activeNote}
        />
      )}
      
      {showCommentModal && (
        <CommentFormModal
          selectedText={selectedTextInfo?.text || ''}
          spanId={selectedTextInfo?.spanId || ''}
          editingCommentId={editingCommentId}
          onClose={() => {
            setShowCommentModal(false);
            setSelectedTextInfo(null);
            setEditingCommentId(null);
          }}
        />
      )}
    </div>
  );
}
