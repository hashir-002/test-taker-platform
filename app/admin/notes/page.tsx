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
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Notes</h1>
            <Link
              href="/admin/add"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
            >
              Add
            </Link>
          </div>

          {loadingNotes ? (
            <p className="mt-6 text-slate-600">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="mt-6 text-slate-600">no notes available</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/admin/note/${note.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h2 className="text-xl font-semibold text-slate-900">
                    {note.heading}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    PIN: {note.pin} | {note.locked ? "Locked" : "Unlocked"}
                  </p>
                  <div
                    className="prose mt-4 max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </Link>
              ))}
            </div>
          )}
        </AdminOnly>
      </main>
    </div>
  );
}
