import { useNotes } from "@/context/NotesContext";
import { getPriorityDotClass } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface CommentListColumnProps {
  onEditComment: (commentId: string) => void;
}

export default function CommentListColumn({ onEditComment }: CommentListColumnProps) {
  const { activeNote, getFormattedDate } = useNotes();
  
  // Sort comments by their order in the document
  const sortedComments = activeNote?.comments
    ? [...activeNote.comments].sort((a, b) => a.order_in_document - b.order_in_document)
    : [];

  return (
    <div className="w-64 min-w-[200px] flex-shrink-0 border-l border-zinc-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h1 className="text-lg font-semibold text-gray-400 truncate flex items-center gap-2">
          Comments <MessageSquare className="w-4 h-4" />
        </h1>
      </div>
      
      <div className="overflow-y-auto flex-1 py-2">
        {!activeNote ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p>No note selected</p>
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p>No comments yet</p>
            <p className="text-sm mt-2">Select text and right-click to add a comment</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              className={`px-4 py-3 hover:bg-zinc-900/50 border-l-2 ${getPriorityDotClass(comment.priority)} cursor-pointer transition-all bg-zinc-900`}
              onClick={() => {
  // Find the comment element and scroll it into view
  const commentElement = document.querySelector(`[data-comment-id="${comment.target_span_id}"]`);
  if (commentElement) {
    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Add a temporary highlight effect
    commentElement.classList.add('flash-highlight');
    setTimeout(() => commentElement.classList.remove('flash-highlight'), 2000);
  }
  onEditComment(comment.id);
}}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${getPriorityDotClass(comment.priority)}`}></span>
                  <span className="text-xs font-medium text-gray-300">{comment.category}</span>
                </div>
                <span className="text-xs text-gray-500">{getFormattedDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
