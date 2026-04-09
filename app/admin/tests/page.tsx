"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref, update } from "firebase/database";
import Link from "next/link";
import { useEffect, useState } from "react";

type TestItem = {
  id: string;
  heading: string;
  locked?: boolean;
  questions?: unknown[];
};

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const testsRef = ref(database, "tests");
    const unsubscribe = onValue(testsRef, (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<TestItem, "id">> | null;

      if (!value) {
        setTests([]);
        setLoadingTests(false);
        return;
      }

      const list = Object.entries(value).map(([id, test]) => ({
        id,
        heading: test.heading,
        locked: test.locked,
        questions: test.questions ?? [],
      }));
      setTests(list);
      setLoadingTests(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleDelete(testId: string) {
    setDeletingId(testId);
    try {
      await update(ref(database), {
        [`tests/${testId}`]: null,
        [`submissions/${testId}`]: null,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Tests</h1>
            <Link
              href="/admin/add-test"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
            >
              Add
            </Link>
          </div>

          {loadingTests ? (
            <p className="mt-6 text-slate-600">Loading tests...</p>
          ) : tests.length === 0 ? (
            <p className="mt-6 text-slate-600">no tests available</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {tests.map((test) => (
                <article
                  key={test.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h2 className="text-xl font-semibold text-slate-900">
                    {test.heading}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Questions: {test.questions?.length ?? 0} |{" "}
                    {test.locked ? "Locked" : "Unlocked"}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(test.id)}
                    disabled={deletingId === test.id}
                    className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deletingId === test.id ? "Deleting..." : "Delete"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </AdminOnly>
      </main>
    </div>
  );
}
