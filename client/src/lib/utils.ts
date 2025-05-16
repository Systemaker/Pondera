import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to create a random UUID (v4)
export const generateUniqueId = (): string => {
  // Implementation from RFC4122 version 4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, 
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Format bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Count words in a string
export const countWords = (str: string): number => {
  if (!str) return 0;
  // Remove HTML tags
  const text = str.replace(/<[^>]*>?/gm, ' ');
  // Remove multiple spaces
  const cleanText = text.replace(/\s+/g, ' ').trim();
  return cleanText ? cleanText.split(' ').length : 0;
};

// Extract plain text from HTML
export const htmlToPlainText = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Get the priority color class based on priority
export const getPriorityColorClass = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'border-[hsl(var(--priority-high))]';
    case 'medium':
      return 'border-[hsl(var(--priority-medium))]';
    case 'low':
      return 'border-[hsl(var(--priority-low))]';
    default:
      return 'border-gray-400';
  }
};

// Get the dot color class based on priority
export const getPriorityDotClass = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-[hsl(var(--priority-high))]';
    case 'medium':
      return 'bg-[hsl(var(--priority-medium))]';
    case 'low':
      return 'bg-[hsl(var(--priority-low))]';
    default:
      return 'bg-gray-400';
  }
};
