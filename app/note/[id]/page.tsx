"use client";

import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref, update } from "firebase/database";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import MarkdownViewer from "@/components/MarkdownViewer";

type Note = {
  heading: string;
  content?: string;
  link?: string;
  pin: number;
  locked?: boolean;
};

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [checkingPin, setCheckingPin] = useState(false);
  const [markdownHtml, setMarkdownHtml] = useState("");
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);

  useEffect(() => {
    if (!noteId) return;
    const noteRef = ref(database, `notes/${noteId}`);
    const unsubscribe = onValue(noteRef, (snapshot) => {
      const value = snapshot.val() as Note | null;
      setNote(value);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [noteId]);

  useEffect(() => {
    if (!note?.link || note.locked) {
      setMarkdownHtml("");
      return;
    }

    setLoadingMarkdown(true);
    fetch(note.link)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch markdown preview.");
        }
        return response.text();
      })
      .then(async (markdown) => {
        setMarkdownHtml(markdown);
      })
      .catch((error) => {
        console.error(error);
        setMarkdownHtml("<p class='text-red-600'>Failed to load markdown preview.</p>");
      })
      .finally(() => setLoadingMarkdown(false));
  }, [note?.link, note?.locked]);

  async function handlePinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note || !noteId) return;

    setCheckingPin(true);
    setPinError("");

    if (Number(pinInput) !== Number(note.pin)) {
      setPinError("incorrect pin, try again");
      setCheckingPin(false);
      return;
    }

    try {
      await update(ref(database, `notes/${noteId}`), { locked: false });
      setPinInput("");
    } finally {
      setCheckingPin(false);
    }
  }

  const showPinDialog = Boolean(note?.locked);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <p className="text-slate-600">Loading note...</p>
        ) : !note ? (
          <p className="text-slate-600">Note not found.</p>
        ) : (
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">{note.heading}</h1>
            {!showPinDialog && (
              <div className="mt-6">
                {note.link ? (
                  loadingMarkdown ? (
                    <p className="text-slate-600">Loading markdown preview...</p>
                  ) : (
                    <div className="prose max-w-none text-slate-800">
                      <MarkdownViewer content={markdownHtml} />
                    </div>
                  )
                ) : note.content ? (
                  <div className="prose mt-6 max-w-none text-slate-800">
                    <MarkdownViewer content={note.content} />
                  </div>
                ) : (
                  <p className="text-slate-600">No preview available.</p>
                )}
              </div>
            )}
          </article>
        )}
      </main>

      {showPinDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">Enter PIN</h2>
            <p className="mt-2 text-sm text-slate-600">
              This note is locked. Enter the correct PIN to view it.
            </p>

            <form className="mt-4" onSubmit={handlePinSubmit}>
              <input
                type="number"
                required
                value={pinInput}
                onChange={(event) => setPinInput(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
              />

              {pinError && (
                <p className="mt-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                disabled={checkingPin}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkingPin ? "Checking..." : "Submit PIN"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
