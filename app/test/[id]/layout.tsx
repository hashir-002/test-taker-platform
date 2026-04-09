import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Details",
  description:
    "Attempt a test with PIN verification, question-wise responses, and instant scoring.",
};

export default function TestDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
