import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Note Details",
  description:
    "View note details and manage note actions including edit and delete.",
};

export default function AdminNoteDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
