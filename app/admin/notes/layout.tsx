import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Notes",
  description:
    "Manage and review all notes available to learners on RQ Tech Services.",
};

export default function AdminNotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
