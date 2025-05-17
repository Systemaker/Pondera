import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Type, List, 
  ListOrdered, Heading2, Heading3, 
  Highlighter, CheckSquare, Paintbrush,
  Eraser, MessageSquare, Pencil, X
} from 'lucide-react';
import { HIGHLIGHT_COLORS } from '@/lib/constants';

interface EditorToolbarProps {
  editor: Editor | null;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 flex-wrap py-1 justify-center">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-zinc-800/50 ${editor.isActive('bold') ? 'bg-zinc-800/50' : ''}`}
        title="Bold"
      >
        <Bold className="w-3 h-3" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-zinc-800 ${editor.isActive('italic') ? 'bg-zinc-800' : ''}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-zinc-800 ${editor.isActive('underline') ? 'bg-zinc-800' : ''}`}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded hover:bg-zinc-800 ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-800' : ''}`}
        title="Heading 1"
      >
        <Type className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-zinc-800 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-800' : ''}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded hover:bg-zinc-800 ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-800' : ''}`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-zinc-800 ${editor.isActive('bulletList') ? 'bg-zinc-800' : ''}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-zinc-800 ${editor.isActive('orderedList') ? 'bg-zinc-800' : ''}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-1.5 rounded hover:bg-zinc-800 ${editor.isActive('taskList') ? 'bg-zinc-800' : ''}`}
        title="Task List"
      >
        <CheckSquare className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="p-1.5 rounded hover:bg-zinc-800"
        title="Clear Formatting"
      >
        <Eraser className="w-4 h-4" />
      </button>

      <button
        onClick={() => {
          const color = editor.getAttributes('textStyle').color || '#ffffff';
          editor.chain().focus().setColor(color).run();
        }}
        className="p-1.5 rounded hover:bg-zinc-800"
        title="Format Painter"
      >
        <Paintbrush className="w-4 h-4" />
      </button>

      <input
        type="color"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        value={editor.getAttributes('textStyle').color || '#ffffff'}
        className="w-6 h-6 opacity-0 absolute"
        id="colorPicker"
      />
      <label 
        htmlFor="colorPicker" 
        className="p-1.5 rounded hover:bg-zinc-800 cursor-pointer flex items-center"
        title="Text Color"
      >
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: editor.getAttributes('textStyle').color || '#ffffff' }}
        />
      </label>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <button
        onClick={() => {
          const selection = editor.state.selection;
          const text = editor.state.doc.textBetween(selection.from, selection.to);
          if (text) {
            // Trigger add comment functionality
            editor.chain().focus().setMark('comment-highlight').run();
          }
        }}
        className="p-1.5 rounded hover:bg-zinc-800"
        title="Add Comment"
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      <button
        onClick={() => {
          // Trigger edit comment functionality for selected text
          const selection = editor.state.selection;
          if (!selection.empty) {
            editor.chain().focus().toggleMark('comment-highlight').run();
          }
        }}
        className="p-1.5 rounded hover:bg-zinc-800"
        title="Edit Comment"
      >
        <Pencil className="w-4 h-4" />
      </button>

      <button
        onClick={() => {
          // Remove comment mark from selected text
          editor.chain().focus().unsetMark('comment-highlight').run();
        }}
        className="p-1.5 rounded hover:bg-zinc-800"
        title="Remove Comment"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color.class}
          onClick={() => {
            if (editor.isActive('highlight', { class: color.class })) {
              editor.chain().focus().unsetHighlight().run();
            } else {
              editor.chain().focus().setHighlight({ class: color.class }).run();
            }
          }}
          className={`p-1 rounded hover:bg-zinc-800/50 flex items-center gap-1 ${
            editor.isActive('highlight', { class: color.class }) ? 'bg-zinc-800' : ''
          }`}
          title={`${color.name} Highlight`}
        >
          <Highlighter className={`w-4 h-4 ${color.class}`} />
        </button>
      ))}
    </div>
  );
}