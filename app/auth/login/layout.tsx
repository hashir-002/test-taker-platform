import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Login to RQ Tech Services to access your notes, tests, and learning dashboard.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
