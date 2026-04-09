import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Test",
  description:
    "Create new tests with multiple questions, options, correct answers, and PIN lock.",
};

export default function AdminAddTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
