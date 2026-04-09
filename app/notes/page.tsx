"use client";

import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref } from "firebase/database";
import Link from "next/link";
import { useEffect, useState } from "react";

type Note = {
  id: string;
  heading: string;
  content: string;
};

function getPreview(contentHtml: string) {
  const plainText = contentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!plainText) return "";
  const words = plainText.split(" ");
  const previewWords = words.slice(0, 15).join(" ");
  return words.length > 15 ? `${previewWords}...` : previewWords;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    const notesRef = ref(database, "notes");
    const unsubscribe = onValue(notesRef, (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Note, "id">> | null;

      if (!value) {
        setNotes([]);
        setLoadingNotes(false);
        return;
      }

      const list = Object.entries(value).map(([id, note]) => ({
        id,
        heading: note.heading,
        content: note.content,
      }));

      setNotes(list);
      setLoadingNotes(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Notes</h1>

        {loadingNotes ? (
          <p className="mt-6 text-slate-600">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="mt-6 text-slate-600">no notes available</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/note/${note.id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-slate-900">{note.heading}</h2>
                <p className="mt-2 text-sm text-slate-600">{getPreview(note.content)}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
