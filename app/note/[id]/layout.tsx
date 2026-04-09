import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Note Details",
  description:
    "Read full note content after secure PIN verification on RQ Tech Services.",
};

export default function NoteDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
