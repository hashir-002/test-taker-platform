"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref, remove } from "firebase/database";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MarkdownViewer from "@/components/MarkdownViewer";

type Note = {
  heading: string;
  content?: string;
  link?: string;
  pin: number;
  locked?: boolean;
};

export default function AdminNoteDetailPage() {
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);
  const [markdownHtml, setMarkdownHtml] = useState("");
  const [deleting, setDeleting] = useState(false);

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
    if (!note?.link) {
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
  }, [note?.link]);

  async function handleDelete() {
    if (!noteId) return;
    setDeleting(true);
    try {
      await remove(ref(database, `notes/${noteId}`));
      router.replace("/admin/notes");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          {loading ? (
            <p className="text-slate-600">Loading note...</p>
          ) : !note ? (
            <p className="text-slate-600">Note not found.</p>
          ) : (
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900">{note.heading}</h1>
              <p className="mt-2 text-sm text-slate-500">
                PIN: {note.pin} | {note.locked ? "Locked" : "Unlocked"}
              </p>
              {note.link ? (
                <div className="prose mt-6 max-w-none text-slate-800">
                  {loadingMarkdown ? (
                    <p className="text-slate-600">Loading markdown preview...</p>
                  ) : (
                    <div className="prose max-w-none text-slate-800">
                      <MarkdownViewer content={markdownHtml} />
                    </div>
                  )}
                </div>
              ) : note.content ? (
                <div className="prose mt-6 max-w-none text-slate-800">
                  <MarkdownViewer content={note.content} />
                </div>
              ) : (
                <p className="mt-6 text-slate-600">No preview available.</p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <Link
                  href={`/admin/note/edit/${noteId}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
                >
                  Edit
                </Link>
              </div>
            </article>
          )}
        </AdminOnly>
      </main>
    </div>
  );
}
