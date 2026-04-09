import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
  description:
    "Access the admin panel to manage educational content and platform tools.",
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
