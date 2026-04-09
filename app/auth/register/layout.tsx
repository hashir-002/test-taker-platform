import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create a student account on RQ Tech Services to start learning with notes and tests.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
