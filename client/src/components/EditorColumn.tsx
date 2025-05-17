import { useCallback, useEffect, useState } from "react";
import { EditorContent, Editor } from "@tiptap/react";
import { useNotes } from "@/context/NotesContext";
import { useCustomEditor } from "@/lib/editor";
import { Download, FileText } from "lucide-react";
import { countWords } from "@/lib/utils";

interface EditorColumnProps {
  onContextMenu: (e: React.MouseEvent, selectedText: string) => void;
  setEditorRef?: (editor: Editor | null) => void;
}

export default function EditorColumn({ onContextMenu, setEditorRef }: EditorColumnProps) {
  const { activeNote, activeNoteId, updateNote, getFormattedDate, exportNoteToMarkdown } = useNotes();
  const [wordCount, setWordCount] = useState(0);
  
  // Initialize editor with content from active note
  const editor = useCustomEditor(
    activeNote?.content_html || '<p></p>',
    (html) => {
      if (activeNoteId) {
        updateNote(activeNoteId, { content_html: html });
      }
    }
  );
  
  // Pass editor reference to parent component if needed
  useEffect(() => {
    if (setEditorRef) {
      setEditorRef(editor);
    }
  }, [editor, setEditorRef]);
  
  // Update editor content when active note changes
  useEffect(() => {
    if (editor && activeNote) {
      // Only update if the content is different to avoid cursor jumping
      if (editor.getHTML() !== activeNote.content_html) {
        editor.commands.setContent(activeNote.content_html);
      }
    }
  }, [editor, activeNote]);
  
  // Update word count when content changes
  useEffect(() => {
    if (activeNote) {
      setWordCount(countWords(activeNote.content_html));
    }
  }, [activeNote]);
  
  // Handle right-click (context menu)
  const handleEditorContextMenu = useCallback((e: React.MouseEvent) => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const selectedText = selection.empty 
      ? "" 
      : editor.state.doc.textBetween(selection.from, selection.to);
    
    onContextMenu(e, selectedText);
  }, [editor, onContextMenu]);
  
  // Placeholder to show when no note is selected
  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p>No note selected</p>
            <p className="text-sm mt-2">Select a note from the list or create a new one</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
      {/* Title input - separate from content */}
      <div className="border-b border-zinc-800 p-4">
        <input
          type="text"
          value={activeNote?.title || ""}
          onChange={(e) => {
            if (activeNoteId) {
              updateNote(activeNoteId, { title: e.target.value });
            }
          }}
          className="w-full bg-transparent border-none text-xl text-purple-400 font-medium focus:outline-none focus:ring-0"
          placeholder="Título da Nota"
        />
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-6"
        onContextMenu={handleEditorContextMenu}
      >
        <div className="editor-container border border-zinc-800 rounded-md p-4">
          <EditorContent
            editor={editor}
            className="editor-content focus:outline-none min-h-[calc(100vh-200px)]"
          />
        </div>
      </div>
      
      <div className="border-t border-zinc-800 py-2 px-4 flex justify-between items-center text-xs text-gray-400">
        <div>
          <span>Last edited: {getFormattedDate(activeNote.updated_at)}</span>
        </div>
        <div className="flex space-x-4">
          <button 
            className="hover:text-gray-200 transition-colors flex items-center space-x-1" 
            title="Export to Markdown"
            onClick={() => activeNoteId && exportNoteToMarkdown(activeNoteId)}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button className="hover:text-gray-200 transition-colors flex items-center space-x-1" title="Word Count">
            <FileText className="w-3.5 h-3.5" />
            <span>{wordCount} words</span>
          </button>
        </div>
      </div>
    </div>
  );
}
