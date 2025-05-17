import { useEffect, useState, useRef } from "react";
import NoteListColumn from "./NoteListColumn";
import EditorColumn from "./EditorColumn";
import CommentListColumn from "./CommentListColumn";
import EnhancedContextMenu from "./EnhancedContextMenu";
import CommentFormModal from "./CommentFormModal";
import { useNotes } from "@/context/NotesContext";
import { Editor } from "@tiptap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AppLayout() {
  const { activeNoteId, activeNote, updateNote } = useNotes();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedTextInfo, setSelectedTextInfo] = useState<{ text: string; spanId: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);
  
  // Estado para controlar a visibilidade das colunas laterais
  const [showLeftColumn, setShowLeftColumn] = useState(true);
  const [showRightColumn, setShowRightColumn] = useState(true);
  
  // Referências para arrastar e redimensionar as colunas
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const leftResizeRef = useRef<HTMLDivElement>(null);
  const rightResizeRef = useRef<HTMLDivElement>(null);
  
  // Handler for right-click in the editor
  const handleContextMenu = (e: React.MouseEvent, selectedText: string) => {
    e.preventDefault();
    if (!selectedText || selectedText.trim() === "") return;
    
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

  // Função para lidar com o redimensionamento de colunas
  useEffect(() => {
    // Variáveis para controlar o arrasto
    let isDraggingLeft = false;
    let isDraggingRight = false;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (e: MouseEvent, isLeft: boolean) => {
      e.preventDefault();
      if (isLeft) {
        isDraggingLeft = true;
        startX = e.clientX;
        startWidth = leftColumnRef.current?.offsetWidth || 0;
      } else {
        isDraggingRight = true;
        startX = e.clientX;
        startWidth = rightColumnRef.current?.offsetWidth || 0;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft && leftColumnRef.current) {
        const newWidth = startWidth + (e.clientX - startX);
        if (newWidth >= 200 && newWidth <= 400) {
          leftColumnRef.current.style.width = `${newWidth}px`;
          leftColumnRef.current.style.minWidth = `${newWidth}px`;
        }
      } else if (isDraggingRight && rightColumnRef.current) {
        const newWidth = startWidth - (e.clientX - startX);
        if (newWidth >= 200 && newWidth <= 400) {
          rightColumnRef.current.style.width = `${newWidth}px`;
          rightColumnRef.current.style.minWidth = `${newWidth}px`;
        }
      }
    };

    const handleMouseUp = () => {
      isDraggingLeft = false;
      isDraggingRight = false;
    };

    // Adicionar event listeners
    leftResizeRef.current?.addEventListener('mousedown', (e) => handleMouseDown(e, true));
    rightResizeRef.current?.addEventListener('mousedown', (e) => handleMouseDown(e, false));
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      // Remover event listeners
      leftResizeRef.current?.removeEventListener('mousedown', (e) => handleMouseDown(e, true));
      rightResizeRef.current?.removeEventListener('mousedown', (e) => handleMouseDown(e, false));
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-black text-gray-200">
      {/* Coluna de notas (esquerda) */}
      {showLeftColumn ? (
        <>
          <div ref={leftColumnRef} className="flex-shrink-0">
            <NoteListColumn />
          </div>
          <div 
            ref={leftResizeRef} 
            className="w-1 bg-zinc-800 hover:bg-purple-500 cursor-col-resize transition-colors"
          />
        </>
      ) : (
        <button 
          onClick={() => setShowLeftColumn(true)} 
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-purple-400 transition-colors border-r border-zinc-700"
          title="Mostrar lista de notas"
        >
          <ChevronRight size={16} />
        </button>
      )}
      
      {/* Coluna do editor (centro) */}
      <div className="flex-1 flex flex-col">
        {!showLeftColumn && (
          <div className="absolute top-2 left-2 z-10">
            <button 
              onClick={() => setShowLeftColumn(false)} 
              className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-purple-400 transition-colors"
              title="Ocultar lista de notas"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
        
        <EditorColumn 
          onContextMenu={handleContextMenu}
          setEditorRef={(editor) => editorRef.current = editor}
        />
        
        {!showRightColumn && (
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={() => setShowRightColumn(false)} 
              className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-purple-400 transition-colors"
              title="Ocultar lista de comentários"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Coluna de comentários (direita) */}
      {showRightColumn ? (
        <>
          <div 
            ref={rightResizeRef} 
            className="w-1 bg-zinc-800 hover:bg-purple-500 cursor-col-resize transition-colors" 
          />
          <div ref={rightColumnRef} className="flex-shrink-0">
            <CommentListColumn 
              onEditComment={handleEditComment} 
            />
          </div>
        </>
      ) : (
        <button 
          onClick={() => setShowRightColumn(true)} 
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-purple-400 transition-colors border-l border-zinc-700"
          title="Mostrar lista de comentários"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      
      {showContextMenu && (
        <EnhancedContextMenu
          position={contextMenuPosition}
          onAddComment={handleAddComment}
          onApplyHighlight={handleApplyHighlight}
          onEditComment={handleEditComment}
          activeNote={activeNote}
          editor={editorRef.current}
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
