"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref } from "firebase/database";
import Link from "next/link";
import { useEffect, useState } from "react";

type Note = {
  id: string;
  heading: string;
  content: string;
  pin: number;
  locked?: boolean;
};

export default function AdminNotesPage() {
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
        pin: note.pin,
        locked: note.locked,
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
        <AdminOnly>
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  <span>Admin Notes</span>
                </div>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Notes Dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Manage uploaded notes with a clear creative view and quick access to pin and lock status.
                </p>
              </div>
              <Link
                href="/admin/add"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Add Note
              </Link>
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
                  href={`/admin/note/${note.id}`}
                  className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 6h13" />
                        <path d="M8 12h13" />
                        <path d="M8 18h13" />
                        <path d="M4 6h.01" />
                        <path d="M4 12h.01" />
                        <path d="M4 18h.01" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{note.heading}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        PIN: {note.pin} | {note.locked ? "Locked" : "Unlocked"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminOnly>
      </main>
    </div>
  );
}
