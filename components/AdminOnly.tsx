"use client";

import { useAuth } from "@/components/AuthProvider";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const { loading, role } = useAuth();

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
        Checking access...
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-700 shadow-sm">
        sorry you are not admin to access this site
      </div>
    );
  }

  return <>{children}</>;
}
