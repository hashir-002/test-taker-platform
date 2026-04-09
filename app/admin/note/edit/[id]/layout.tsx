import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Note",
  description:
    "Edit existing note content, PIN, and lock settings from the admin editor.",
};

export default function AdminEditNoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
