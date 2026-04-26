"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref, update } from "firebase/database";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Note = {
  heading: string;
  content?: string;
  link?: string;
  cloudinaryPublicId?: string;
  pin: number;
  locked?: boolean;
};

export default function AdminEditNotePage() {
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const router = useRouter();
  const [heading, setHeading] = useState("");
  const [pin, setPin] = useState("");
  const [locked, setLocked] = useState(true);
  const [existingLink, setExistingLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      setExistingLink(value.link ?? "");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [noteId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!noteId) return;

    setIsSubmitting(true);
    try {
      let updateData: Record<string, unknown> = {
        heading,
        pin: Number(pin),
        locked,
        updatedAt: Date.now(),
      };

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        if (existingLink) {
          formData.append("oldLink", existingLink);
        }

        const response = await fetch("/api/cloudinary/markdown", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Cloudinary upload failed.");
        }

        const uploadResult = (await response.json()) as {
          url: string;
          publicId: string;
        };

        updateData.link = uploadResult.url;
        updateData.cloudinaryPublicId = uploadResult.publicId;
      }

      await update(ref(database, `notes/${noteId}`), updateData);
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
                <label htmlFor="markdownFile" className="mb-1 block text-sm font-medium text-slate-700">
                  Markdown File
                </label>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    const droppedFile = event.dataTransfer.files?.[0] ?? null;
                    if (droppedFile) {
                      setFile(droppedFile);
                    }
                  }}
                  className={`relative rounded-3xl border-2 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50/70"
                      : "border-dashed border-slate-300 bg-slate-50"
                  } p-6 text-center transition`}
                >
                  <input
                    id="markdownFile"
                    type="file"
                    accept=".md,text/markdown"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="pointer-events-none flex flex-col items-center justify-center gap-3">
                    <svg
                      className="h-10 w-10 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 16v-4a3 3 0 0 1 3-3h1V7a3 3 0 0 1 6 0v2h1a3 3 0 0 1 3 3v4" />
                      <path d="M5 10h14" />
                      <path d="M12 16v6" />
                      <path d="M8 20h8" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-900">
                      Drag & drop a markdown file here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500">Supports markdown files up to 10MB.</p>
                  </div>
                </div>
                {existingLink && (
                  <p className="mt-2 text-sm text-slate-600">
                    Current file: <a href={existingLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">View current markdown</a>
                  </p>
                )}
                {file && (
                  <p className="mt-3 text-sm text-slate-600">Selected file: {file.name}</p>
                )}
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
