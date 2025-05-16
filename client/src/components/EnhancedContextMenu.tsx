import { MouseEvent, useRef, useEffect } from 'react';
import { useEditorCommands } from '@/lib/editor';
import { 
  Type, Heading2, Heading3, Bold, Italic, 
  ListOrdered, List, MessageSquarePlus, MessageSquareText
} from 'lucide-react';
import { HIGHLIGHT_COLORS } from '@/lib/constants';
import { useNotes, Note } from '@/context/NotesContext';

interface Position {
  x: number;
  y: number;
}

interface EnhancedContextMenuProps {
  position: Position;
  onAddComment: (spanId: string, selectedText: string) => void;
  onApplyHighlight: (colorClass: string, spanId: string) => void;
  onEditComment: (commentId: string) => void;
  activeNote: Note | null;
}

export default function EnhancedContextMenu({
  position,
  onAddComment,
  onApplyHighlight,
  onEditComment,
  activeNote
}: EnhancedContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { notes } = useNotes();
  
  // Get editor commands
  const { applyFormat, applyHighlightColor, getSelectedText } = useEditorCommands(null);
  
  // Adjust menu position if it goes off screen
  useEffect(() => {
    if (!menuRef.current) return;
    
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    
    // Check if menu is outside viewport
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
  }, [position]);
  
  // Handle formatting
  const handleFormat = (e: MouseEvent, formatType: string) => {
    e.stopPropagation();
    applyFormat(formatType);
  };
  
  // Handle highlight application
  const handleHighlight = (e: MouseEvent, colorClass: string) => {
    e.stopPropagation();
    const spanId = applyHighlightColor(colorClass);
    if (spanId) {
      onApplyHighlight(colorClass, spanId);
    }
  };
  
  // Handle add comment
  const handleAddComment = (e: MouseEvent) => {
    e.stopPropagation();
    const selection = getSelectedText();
    if (selection) {
      onAddComment(selection.spanId, selection.selectedText);
    }
  };
  
  // Check if the current selection has a comment
  const hasComment = () => {
    // This is a placeholder - in a real implementation, we would check if 
    // the current selection corresponds to a comment span
    return false;
  };

  return (
    <div 
      ref={menuRef}
      className="absolute z-50 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden w-52"
      style={{ top: position.y, left: position.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Basic Editing Section */}
      <div className="border-b border-zinc-700 px-1 py-1">
        <p className="text-xs font-medium text-gray-400 px-2 py-1">Basic Editing</p>
        <button 
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
          onClick={(e) => handleFormat(e, 'h1')}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Heading 1</span>
        </button>
        <button 
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
          onClick={(e) => handleFormat(e, 'h2')}
        >
          <Heading2 className="w-3.5 h-3.5" />
          <span>Heading 2</span>
        </button>
        <button 
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
          onClick={(e) => handleFormat(e, 'h3')}
        >
          <Heading3 className="w-3.5 h-3.5" />
          <span>Heading 3</span>
        </button>
        <button 
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
          onClick={(e) => handleFormat(e, 'bold')}
        >
          <Bold className="w-3.5 h-3.5" />
          <span>Bold</span>
        </button>
        <button 
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
          onClick={(e) => handleFormat(e, 'italic')}
        >
          <Italic className="w-3.5 h-3.5" />
          <span>Italic</span>
        </button>
        <button 
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
          onClick={(e) => handleFormat(e, 'bulletList')}
        >
          <List className="w-3.5 h-3.5" />
          <span>Bullet List</span>
        </button>
        <button 
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
          onClick={(e) => handleFormat(e, 'orderedList')}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Numbered List</span>
        </button>
      </div>
      
      {/* Comments Section */}
      <div className="border-b border-zinc-700 px-1 py-1">
        <p className="text-xs font-medium text-gray-400 px-2 py-1">Comments</p>
        <button 
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
          onClick={handleAddComment}
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>Add Comment</span>
        </button>
        <button 
          className={`w-full text-left px-2 py-1.5 text-sm ${hasComment() ? 'hover:bg-zinc-700' : 'opacity-50 cursor-not-allowed'} rounded flex items-center space-x-2`}
          disabled={!hasComment()}
          onClick={(e) => {
            e.stopPropagation();
            // Logic for editing a comment would go here
            // This would require knowing which comment to edit
          }}
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>Edit Comment</span>
        </button>
      </div>
      
      {/* Highlights Section */}
      <div className="px-1 py-1">
        <p className="text-xs font-medium text-gray-400 px-2 py-1">Highlights</p>
        {HIGHLIGHT_COLORS.map((color) => (
          <button 
            key={color.class}
            className="w-full text-left px-2 py-1.5 text-sm hover:bg-zinc-700 rounded flex items-center space-x-2"
            onClick={(e) => handleHighlight(e, color.class)}
          >
            <div className={`w-3 h-3 rounded-full ${color.class}`}></div>
            <span>{color.name} Highlight</span>
          </button>
        ))}
      </div>
    </div>
  );
}
