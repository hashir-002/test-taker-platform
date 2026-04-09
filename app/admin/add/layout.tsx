import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Note",
  description:
    "Create a new note with rich formatted content and PIN protection settings.",
};

export default function AdminAddNoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
