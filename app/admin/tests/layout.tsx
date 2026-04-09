import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Tests",
  description:
    "Manage all tests, review status, and maintain assessment data for students.",
};

export default function AdminTestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
