import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Browse all available learning notes with concise previews and secure PIN access.",
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
