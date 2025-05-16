// Editor configuration
export const EDITOR_CONFIG = {
  placeholder: 'Start typing here...',
  autofocus: true,
};

// Comment categories
export const COMMENT_CATEGORIES = [
  'Question',
  'Suggestion',
  'Critical',
  'Reference',
  'Improvement',
  'Note',
  'Idea'
];

// Comment priorities with colors
export const COMMENT_PRIORITIES = [
  { value: 'high', label: 'High', colorClass: 'bg-[hsl(var(--priority-high))]' },
  { value: 'medium', label: 'Medium', colorClass: 'bg-[hsl(var(--priority-medium))]' },
  { value: 'low', label: 'Low', colorClass: 'bg-[hsl(var(--priority-low))]' }
];

// Highlight colors
export const HIGHLIGHT_COLORS = [
  { name: 'Blue', class: 'highlight-blue' },
  { name: 'Purple', class: 'highlight-purple' },
  { name: 'Pink', class: 'highlight-pink' }
];

// Span ID prefix for comment and highlight targets
export const SPAN_ID_PREFIX = {
  COMMENT: 'comment-span-',
  HIGHLIGHT: 'highlight-span-'
};
