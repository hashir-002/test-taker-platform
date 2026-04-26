"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { database } from "@/firebase/config";
import { push, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminAddNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [heading, setHeading] = useState("");
  const [pin, setPin] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function uploadMarkdown(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/cloudinary/markdown", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Cloudinary upload failed.");
    }

    return response.json() as Promise<{ url: string; publicId: string }>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a markdown file.");
      return;
    }

    if (!pin) {
      setError("Please provide a pin.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadResult = await uploadMarkdown(file);
      const notesRef = ref(database, "notes");
      const newNoteRef = push(notesRef);

      await set(newNoteRef, {
        heading,
        link: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId,
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
                  <p className="text-xs text-slate-500">
                    Supported file type: .md
                  </p>
                </div>
              </div>
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
