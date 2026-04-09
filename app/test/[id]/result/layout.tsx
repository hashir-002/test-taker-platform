import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Result",
  description:
    "See your test performance with score breakdown and pie chart analysis.",
};

export default function TestResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
