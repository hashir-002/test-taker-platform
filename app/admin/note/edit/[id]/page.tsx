"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref, update } from "firebase/database";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type Note = {
  heading: string;
  content: string;
  pin: number;
  locked?: boolean;
};

export default function AdminEditNotePage() {
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [heading, setHeading] = useState("");
  const [pin, setPin] = useState("");
  const [locked, setLocked] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!noteId) return;
    const noteRef = ref(database, `notes/${noteId}`);
    const unsubscribe = onValue(noteRef, (snapshot) => {
      const value = snapshot.val() as Note | null;
      if (!value) {
        setError("Note not found.");
        setLoading(false);
        return;
      }
      setHeading(value.heading);
      setPin(String(value.pin));
      setLocked(value.locked ?? true);
      if (editorRef.current) {
        editorRef.current.innerHTML = value.content ?? "";
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [noteId]);

  function runCommand(command: string) {
    document.execCommand(command);
    editorRef.current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!noteId) return;

    const content = editorRef.current?.innerHTML?.trim() ?? "";
    if (!content || content === "<br>") {
      setError("Please add note content.");
      return;
    }

    setIsSubmitting(true);
    try {
      await update(ref(database, `notes/${noteId}`), {
        heading,
        content,
        pin: Number(pin),
        locked,
        updatedAt: Date.now(),
      });
      router.replace(`/admin/note/${noteId}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Update failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          {loading ? (
            <p className="text-slate-600">Loading note...</p>
          ) : (
            <form
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              onSubmit={handleSubmit}
            >
              <h1 className="text-3xl font-bold text-slate-900">Edit Note</h1>

              <div className="mt-6">
                <label
                  htmlFor="heading"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Title
                </label>
                <input
                  id="heading"
                  type="text"
                  required
                  value={heading}
                  onChange={(event) => setHeading(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Content
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => runCommand("bold")}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => runCommand("insertUnorderedList")}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Bullet Points
                  </button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-48 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="pin"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  PIN
                </label>
                <input
                  id="pin"
                  type="number"
                  required
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  id="locked"
                  type="checkbox"
                  checked={locked}
                  onChange={(event) => setLocked(event.target.checked)}
                />
                <label htmlFor="locked" className="text-sm text-slate-700">
                  Keep note locked
                </label>
              </div>

              {error && (
                <p className="mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Updating..." : "Update Note"}
              </button>
            </form>
          )}
        </AdminOnly>
      </main>
    </div>
  );
}
