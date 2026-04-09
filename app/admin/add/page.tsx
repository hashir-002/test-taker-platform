"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { database } from "@/firebase/config";
import { push, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

export default function AdminAddNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [heading, setHeading] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function runCommand(command: string) {
    document.execCommand(command);
    editorRef.current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const content = editorRef.current?.innerHTML?.trim() ?? "";
    if (!content || content === "<br>") {
      setError("Please add note content.");
      return;
    }

    if (!pin) {
      setError("Please provide a pin.");
      return;
    }

    setIsSubmitting(true);

    try {
      const notesRef = ref(database, "notes");
      const newNoteRef = push(notesRef);

      await set(newNoteRef, {
        heading,
        content,
        pin: Number(pin),
        locked: true,
        createdBy: user?.uid ?? null,
        createdAt: Date.now(),
      });

      router.replace("/admin/notes");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Upload failed.";
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
          <h1 className="text-3xl font-bold text-slate-900">Add Notes</h1>

          <form
            className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div>
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
              {isSubmitting ? "Uploading..." : "Upload Notes"}
            </button>
          </form>
        </AdminOnly>
      </main>
    </div>
  );
}
