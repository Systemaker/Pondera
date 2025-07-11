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

    if (!editorRef.current) return;

    // If no text is selected, select the entire line at cursor position
    if (!selectedText || selectedText.trim() === "") {
      const { view } = editorRef.current;
      const pos = view.posAtCoords({ left: e.clientX, top: e.clientY });

      if (typeof pos === 'number') {
        const $pos = view.state.doc.resolve(pos);
        const line = $pos.parent;
        const lineStart = $pos.before();
        const lineEnd = $pos.after();

        if (lineStart !== lineEnd) {
          view.dispatch(view.state.tr.setSelection(
            view.state.selection.constructor.create(
              view.state.doc,
              lineStart,
              lineEnd
            )
          ));
          selectedText = view.state.doc.textBetween(lineStart, lineEnd);
        }

        if (selectedText) {
          view.dispatch(view.state.tr.setSelection(
            view.state.selection.constructor.create(view.state.doc, wordRange.from, wordRange.to)
          ));
          selectedText = word;
        }
      }
    }

    if (selectedText && selectedText.trim() !== "") {
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
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
  const handleEditComment = (commentId: string, selectedText?: string) => {
    setEditingCommentId(commentId);
    if (selectedText) {
      setSelectedTextInfo({ text: selectedText, spanId: '' });
    }
    setShowCommentModal(true);
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

      // Adicionar classe ao body para indicar que está redimensionando
      document.body.classList.add('resizing');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft && leftColumnRef.current) {
        const newWidth = startWidth + (e.clientX - startX);
        if (newWidth >= 150 && newWidth <= 500) {
          leftColumnRef.current.style.width = `${newWidth}px`;
          leftColumnRef.current.style.minWidth = `${newWidth}px`;
          leftColumnRef.current.style.flexShrink = '0';
        }
      } else if (isDraggingRight && rightColumnRef.current) {
        const newWidth = startWidth - (e.clientX - startX);
        if (newWidth >= 150 && newWidth <= 500) {
          rightColumnRef.current.style.width = `${newWidth}px`;
          rightColumnRef.current.style.minWidth = `${newWidth}px`;
          rightColumnRef.current.style.flexShrink = '0';
        }
      }
    };

    const handleMouseUp = () => {
      isDraggingLeft = false;
      isDraggingRight = false;

      // Remover classe do body
      document.body.classList.remove('resizing');
    };

    // Event listeners para os elementos de redimensionamento
    const handleLeftMouseDown = (e: MouseEvent) => handleMouseDown(e, true);
    const handleRightMouseDown = (e: MouseEvent) => handleMouseDown(e, false);

    // Adicionar event listeners
    const leftResizeElement = leftResizeRef.current;
    const rightResizeElement = rightResizeRef.current;

    if (leftResizeElement) {
      leftResizeElement.addEventListener('mousedown', handleLeftMouseDown);
    }

    if (rightResizeElement) {
      rightResizeElement.addEventListener('mousedown', handleRightMouseDown);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      // Remover event listeners
      if (leftResizeElement) {
        leftResizeElement.removeEventListener('mousedown', handleLeftMouseDown);
      }

      if (rightResizeElement) {
        rightResizeElement.removeEventListener('mousedown', handleRightMouseDown);
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [showLeftColumn, showRightColumn]);

  // Handler for clicking on comment spans
  useEffect(() => {
    const handleCommentSpanClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute('data-comment-id')) {
        const spanId = target.getAttribute('data-comment-id');
        const selectedText = target.textContent || '';
        if (spanId && activeNote) {
          // Find the comment that matches this span ID
          const comment = activeNote.comments.find(c => c.target_span_id === spanId);
          if (comment) {
            handleEditComment(comment.id);
            setShowCommentModal(true);
            setSelectedTextInfo({ text: selectedText, spanId });
            setEditingCommentId(comment.id);
          }
        }
      }
    };

    document.addEventListener('click', handleCommentSpanClick);
    return () => document.removeEventListener('click', handleCommentSpanClick);
  }, [activeNote, handleEditComment]);

  return (
    <div className="flex h-screen overflow-hidden bg-black text-gray-200">
      {/* Coluna de notas (esquerda) */}
      {showLeftColumn ? (
        <>
          <div ref={leftColumnRef} className="flex-shrink-0 w-64 min-w-[200px] max-w-[400px] overflow-hidden">
            <NoteListColumn />
          </div>
          <div 
            ref={leftResizeRef} 
            className="w-1.5 bg-zinc-800 hover:bg-purple-500 cursor-col-resize transition-colors"
          />
        </>
      ) : (
        <button 
          onClick={() => setShowLeftColumn(true)} 
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-gray-400 transition-colors border-r border-zinc-700"
          title="Mostrar lista de notas"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Coluna do editor (centro) */}
      <div className="flex-1 flex flex-col relative">
        {showLeftColumn && (
          <button 
            onClick={() => setShowLeftColumn(false)}
            className="absolute top-3 left-3 z-10 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-gray-400 transition-colors"
            title="Ocultar lista de notas"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <EditorColumn 
          onContextMenu={handleContextMenu}
          setEditorRef={(editor) => editorRef.current = editor}
        />

        {showRightColumn && (
          <button 
            onClick={() => setShowRightColumn(false)}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-gray-400 transition-colors"
            title="Ocultar lista de comentários"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Coluna de comentários (direita) */}
      {showRightColumn ? (
        <>
          <div 
            ref={rightResizeRef} 
            className="w-1.5 bg-zinc-800 hover:bg-purple-500 cursor-col-resize transition-colors" 
          />
          <div ref={rightColumnRef} className="flex-shrink-0 w-64 min-w-[200px] max-w-[400px] overflow-hidden">
            <CommentListColumn 
              onEditComment={handleEditComment}
              setShowCommentModal={setShowCommentModal}
              setSelectedTextInfo={setSelectedTextInfo}
              setEditingCommentId={setEditingCommentId}
            />
          </div>
        </>
      ) : (
        <button 
          onClick={() => setShowRightColumn(true)} 
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-gray-400 transition-colors border-l border-zinc-700"
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