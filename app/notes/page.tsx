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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                <span>Note Library</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-slate-900">Notes</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Browse fresh study notes with clean cards, quick previews, and soft design accents.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80"
              alt="Notes illustration"
              className="hidden h-28 w-28 rounded-3xl object-cover sm:block"
            />
          </div>
        </div>

        {loadingNotes ? (
          <p className="mt-8 text-slate-600">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="mt-8 text-slate-600">No notes available.</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/note/${note.id}`}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2Z" />
                      <path d="M13 3v7h7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{note.heading}</h2>
                    <p className="mt-1 text-sm text-slate-500">Quick preview of the note content.</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{getPreview(note.content)}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
