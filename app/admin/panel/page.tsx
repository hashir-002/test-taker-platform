"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function AdminPanelPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="mt-2 text-slate-600">
            Manage notes and tests from one place.
          </p>

          <section className="mt-8 grid gap-6 md:grid-cols-3">
            <Link
              href="/admin/notes"
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-900">Add Notes</h2>
              <p className="mt-2 text-sm text-slate-600">
                View existing notes and add new notes.
              </p>
            </Link>

            <Link
              href="/admin/tests"
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-900">Add Test</h2>
              <p className="mt-2 text-sm text-slate-600">
                Create and manage tests for your learners.
              </p>
            </Link>

            <Link
              href="/admin/results"
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-900">Check Results</h2>
              <p className="mt-2 text-sm text-slate-600">
                View and analyze test results from students.
              </p>
            </Link>
          </section>
        </AdminOnly>
      </main>
    </div>
  );
}
