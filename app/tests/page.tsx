"use client";

import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref } from "firebase/database";
import Link from "next/link";
import { useEffect, useState } from "react";

type TestItem = {
  id: string;
  heading: string;
};

export default function TestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);

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
      }));

      setTests(list);
      setLoadingTests(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700">
                <span>Test Center</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-slate-900">Tests</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Choose a test, challenge yourself, and track your learning with a bright and friendly interface.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1531256379411-2e3f0da8d06c?auto=format&fit=crop&w=500&q=80"
              alt="Test illustration"
              className="hidden h-28 w-28 rounded-3xl object-cover sm:block"
            />
          </div>
        </div>

        {loadingTests ? (
          <p className="mt-8 text-slate-600">Loading tests...</p>
        ) : tests.length === 0 ? (
          <p className="mt-8 text-slate-600">No tests available.</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={`/test/${test.id}`}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{test.heading}</h2>
                    <p className="mt-2 text-sm text-slate-500">Open test details and start your next challenge.</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
