import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { formatDistanceToNow } from "date-fns";

// Types for our data model
export interface Comment {
  id: string;
  target_span_id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  created_at: string;
  order_in_document: number;
}

export interface Highlight {
  id: string;
  target_span_id: string;
  color_class: 'highlight-blue' | 'highlight-purple' | 'highlight-pink';
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  content_html: string;
  comments: Comment[];
  highlights: Highlight[];
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
}

// Structure of our app data in localStorage
interface AppData {
  notes: Note[];
  active_note_id: string | null;
}

// Context interface
interface NotesContextType {
  notes: Note[];
  activeNoteId: string | null;
  activeNote: Note | null;
  createNote: () => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  setActiveNoteId: (id: string | null) => void;
  addComment: (noteId: string, comment: Omit<Comment, 'id' | 'created_at' | 'order_in_document'>) => void;
  updateComment: (noteId: string, commentId: string, updates: Partial<Omit<Comment, 'id'>>) => void;
  deleteComment: (noteId: string, commentId: string) => void;
  addHighlight: (noteId: string, highlight: Omit<Highlight, 'id' | 'created_at'>) => void;
  deleteHighlight: (noteId: string, highlightId: string) => void;
  exportNoteToMarkdown: (noteId: string) => void;
  getFormattedDate: (dateString: string) => string;
}

// Default empty note content
const DEFAULT_NOTE_CONTENT = `<p></p>`;

// Create context
const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'ponderaApp_Data_v1.4';

// Provider component
export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppData>(() => {
    // Initialize from localStorage or with default values
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
    
    // Default initial state
    return {
      notes: [],
      active_note_id: null
    };
  });

  // Extract notes and activeNoteId from appData
  const { notes, active_note_id: activeNoteId } = appData;

  // Find the active note
  const activeNote = useMemo(() => {
    if (!activeNoteId) return null;
    return notes.find(note => note.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  // Save to localStorage whenever appData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }, [appData]);

  // Create a new note
  const createNote = () => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: uuidv4(),
      title: "New Note",
      content_html: DEFAULT_NOTE_CONTENT,
      comments: [],
      highlights: [],
      created_at: now,
      updated_at: now,
      is_pinned: false
    };
    
    setAppData(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      active_note_id: newNote.id
    }));
  };

  // Update a note
  const updateNote = (id: string, updates: Partial<Note>) => {
    setAppData(prev => {
      const updatedNotes = prev.notes.map(note => {
        if (note.id === id) {
          return {
            ...note,
            ...updates,
            updated_at: new Date().toISOString(),
            // Apenas atualiza o título se for explicitamente solicitado
            title: updates.title !== undefined ? updates.title : note.title
          };
        }
        return note;
      });
      
      return {
        ...prev,
        notes: updatedNotes
      };
    });
  };

  // Delete a note
  const deleteNote = (id: string) => {
    setAppData(prev => {
      const updatedNotes = prev.notes.filter(note => note.id !== id);
      
      // If we're deleting the active note, set a new active note
      let newActiveId = prev.active_note_id;
      if (newActiveId === id) {
        newActiveId = updatedNotes.length > 0 ? updatedNotes[0].id : null;
      }
      
      return {
        ...prev,
        notes: updatedNotes,
        active_note_id: newActiveId
      };
    });
  };

  // Toggle pin status of a note
  const togglePinNote = (id: string) => {
    setAppData(prev => {
      const updatedNotes = prev.notes.map(note => {
        if (note.id === id) {
          return {
            ...note,
            is_pinned: !note.is_pinned,
            updated_at: new Date().toISOString()
          };
        }
        return note;
      });
      
      return {
        ...prev,
        notes: updatedNotes
      };
    });
  };

  // Set the active note
  const setActiveNoteId = (id: string | null) => {
    setAppData(prev => ({
      ...prev,
      active_note_id: id
    }));
  };

  // Add a comment to a note
  const addComment = (noteId: string, comment: Omit<Comment, 'id' | 'created_at' | 'order_in_document'>) => {
    setAppData(prev => {
      const updatedNotes = prev.notes.map(note => {
        if (note.id === noteId) {
          const newComment: Comment = {
            ...comment,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            order_in_document: note.comments.length // Simple ordering for now
          };
          
          return {
            ...note,
            comments: [...note.comments, newComment],
            updated_at: new Date().toISOString()
          };
        }
        return note;
      });
      
      return {
        ...prev,
        notes: updatedNotes
      };
    });
  };

  // Update a comment
  const updateComment = (noteId: string, commentId: string, updates: Partial<Omit<Comment, 'id'>>) => {
    setAppData(prev => {
      const updatedNotes = prev.notes.map(note => {
        if (note.id === noteId) {
          const updatedComments = note.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, ...updates };
            }
            return comment;
          });
          
          return {
            ...note,
            comments: updatedComments,
            updated_at: new Date().toISOString()
          };
        }
        return note;
      });
      
      return {
        ...prev,
        notes: updatedNotes
      };
    });
  };

  // Delete a comment
  const deleteComment = (noteId: string, commentId: string) => {
    setAppData(prev => {
      const updatedNotes = prev.notes.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            comments: note.comments.filter(comment => comment.id !== commentId),
            updated_at: new Date().toISOString()
          };
        }
        return note;
      });
      
      return {
        ...prev,
        notes: updatedNotes
      };
    });
  };

  // Add a highlight to a note
  const addHighlight = (noteId: string, highlight: Omit<Highlight, 'id' | 'created_at'>) => {
    setAppData(prev => {
      const updatedNotes = prev.notes.map(note => {
        if (note.id === noteId) {
          const newHighlight: Highlight = {
            ...highlight,
            id: uuidv4(),
            created_at: new Date().toISOString()
          };
          
          return {
            ...note,
            highlights: [...note.highlights, newHighlight],
            updated_at: new Date().toISOString()
          };
        }
        return note;
      });
      
      return {
        ...prev,
        notes: updatedNotes
      };
    });
  };

  // Delete a highlight
  const deleteHighlight = (noteId: string, highlightId: string) => {
    setAppData(prev => {
      const updatedNotes = prev.notes.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            highlights: note.highlights.filter(highlight => highlight.id !== highlightId),
            updated_at: new Date().toISOString()
          };
        }
        return note;
      });
      
      return {
        ...prev,
        notes: updatedNotes
      };
    });
  };

  // Export note to Markdown
  const exportNoteToMarkdown = async (noteId: string) => {
    const note = notes.find(note => note.id === noteId);
    if (!note) return;
    
    try {
      // Dynamic import of the turndown library
      const TurndownService = (await import('turndown')).default;
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced'
      });
      
      const markdown = turndownService.turndown(note.content_html);
      
      // Create a blob and download it
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title.replace(/[^\w\s]/gi, '')}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export note to Markdown:', error);
    }
  };

  // Format date for display
  const getFormattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Helper function to extract title from HTML content
  const extractTitleFromContent = (html: string): string => {
    // Create a temporary div to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Try to find a heading, otherwise use the first line
    const heading = temp.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent) {
      return heading.textContent.trim();
    }
    
    // Fall back to first paragraph or any text content
    const firstParagraph = temp.querySelector('p');
    if (firstParagraph && firstParagraph.textContent) {
      return firstParagraph.textContent.trim().substring(0, 30) + (firstParagraph.textContent.length > 30 ? '...' : '');
    }
    
    // Last resort: use any text content
    return temp.textContent ? temp.textContent.trim().substring(0, 30) + (temp.textContent.length > 30 ? '...' : '') : 'Untitled Note';
  };

  // Sort notes for display (pinned first, then by updated_at)
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      // Pinned notes come first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      // Then sort by updated_at (most recent first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [notes]);

  // Context value
  const value = {
    notes: sortedNotes,
    activeNoteId,
    activeNote,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
    setActiveNoteId,
    addComment,
    updateComment,
    deleteComment,
    addHighlight,
    deleteHighlight,
    exportNoteToMarkdown,
    getFormattedDate
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

// Hook to use the notes context
export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
