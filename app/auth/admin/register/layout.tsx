import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Register",
  description:
    "Create an admin account to manage notes and tests on RQ Tech Services.",
};

export default function AdminRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
