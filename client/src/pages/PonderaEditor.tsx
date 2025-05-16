import { useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useNotes } from "@/context/NotesContext";

export default function PonderaEditor() {
  const { notes, createNote } = useNotes();
  
  // Create a default note if none exists
  useEffect(() => {
    if (notes.length === 0) {
      createNote();
    }
  }, [notes.length, createNote]);

  return <AppLayout />;
}
