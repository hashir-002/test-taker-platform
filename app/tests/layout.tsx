import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tests",
  description:
    "View all available tests and attempt assessments with secure PIN-protected access.",
};

export default function TestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
