import { Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback } from 'react';
import { EDITOR_CONFIG, SPAN_ID_PREFIX } from './constants';
import { v4 as uuidv4 } from 'uuid';

// Custom extensions
const CustomHighlight = Highlight.configure({
  multicolor: true,
  HTMLAttributes: {
    class: 'highlight-blue',
  },
});

const CustomDocument = StarterKit.configure({
  heading: {
    levels: [1, 2, 3, 4],
  },
});

// Initialize editor with our custom configuration
export const useCustomEditor = (
  content: string,
  onUpdate: (html: string) => void
) => {
  return useEditor({
    extensions: [
      CustomDocument.configure({
        // Melhorar suporte a atalhos Markdown
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'text-white',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'text-white',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'text-white',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'text-white border-l-4 border-purple-500 pl-4',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-zinc-900 text-white p-2 rounded',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-zinc-900 text-white px-1 rounded',
          },
        },
        bold: {
          HTMLAttributes: {
            class: 'text-white font-bold',
          },
        },
        italic: {
          HTMLAttributes: {
            class: 'text-white italic',
          },
        },
      }),
      CustomHighlight,
      Placeholder.configure({
        placeholder: EDITOR_CONFIG.placeholder,
      }),
    ],
    content,
    autofocus: EDITOR_CONFIG.autofocus,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    // Habilitar atalhos Markdown
    enableInputRules: true,
    enablePasteRules: true,
    // Configurar suporte a atalhos Markdown para formatação
    editorProps: {
      attributes: {
        class: 'focus:outline-none prose dark:prose-invert prose-sm sm:prose-base max-w-none text-white',
      },
    },
  });
};

// Helper to apply formatting
export const applyFormatting = (editor: Editor | null, formatType: string) => {
  if (!editor) return;

  switch (formatType) {
    case 'h1':
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      break;
    case 'h2':
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      break;
    case 'h3':
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      break;
    case 'h4':
      editor.chain().focus().toggleHeading({ level: 4 }).run();
      break;
    case 'bold':
      editor.chain().focus().toggleBold().run();
      break;
    case 'italic':
      editor.chain().focus().toggleItalic().run();
      break;
    case 'bulletList':
      editor.chain().focus().toggleBulletList().run();
      break;
    case 'orderedList':
      editor.chain().focus().toggleOrderedList().run();
      break;
  }
};

// Apply highlight to selected text
export const applyHighlight = (editor: Editor | null, colorClass: string) => {
  if (!editor) return null;

  const { state, view } = editor;
  const { from, to } = state.selection;
  
  if (from === to) return null; // No selection
  
  // Generate a unique ID for this highlight
  const spanId = `${SPAN_ID_PREFIX.HIGHLIGHT}${uuidv4()}`;
  
  // Apply the highlight with the unique ID and color class
  editor.chain().focus().toggleHighlight({ color: colorClass }).run();
  
  // Return the ID for reference
  return spanId;
};

// Apply a comment span to selected text
export const applyCommentSpan = (editor: Editor | null) => {
  if (!editor || editor.state.selection.empty) return null;

  const { state } = editor;
  const { from, to } = state.selection;
  
  if (from === to) return null;
  
  const spanId = `${SPAN_ID_PREFIX.COMMENT}${uuidv4()}`;
  const selectedText = state.doc.textBetween(from, to);
  
  editor.chain()
    .focus()
    .setMark('comment-highlight')
    .run();
  
  return { spanId, selectedText };
};

// Function to check if text with comment exists
export const checkCommentTextExists = (editor: Editor, spanId: string) => {
  const content = editor.getHTML();
  return content.includes(`data-comment-id="${spanId}"`);
};

// Hook to manage editor commands
export const useEditorCommands = (editor: Editor | null) => {
  const applyFormat = useCallback((formatType: string) => {
    applyFormatting(editor, formatType);
  }, [editor]);

  const applyHighlightColor = useCallback((colorClass: string) => {
    return applyHighlight(editor, colorClass);
  }, [editor]);

  const getSelectedText = useCallback(() => {
    return applyCommentSpan(editor);
  }, [editor]);

  return {
    applyFormat,
    applyHighlightColor,
    getSelectedText,
  };
};
