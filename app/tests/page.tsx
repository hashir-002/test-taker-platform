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
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Tests</h1>

        {loadingTests ? (
          <p className="mt-6 text-slate-600">Loading tests...</p>
        ) : tests.length === 0 ? (
          <p className="mt-6 text-slate-600">no tests available</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={`/test/${test.id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-slate-900">{test.heading}</h2>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
