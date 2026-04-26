"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref } from "firebase/database";
import Link from "next/link";
import { useEffect, useState } from "react";

type TestItem = {
  id: string;
  heading: string;
  locked?: boolean;
  questions?: unknown[];
};

type SubmissionSummary = {
  testId: string;
  studentCount: number;
};

export default function AdminResultsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testsRef = ref(database, "tests");
    const unsubscribeTests = onValue(testsRef, (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<TestItem, "id">> | null;
      if (!value) {
        setTests([]);
        return;
      }
      const list = Object.entries(value).map(([id, test]) => ({
        id,
        heading: test.heading,
        locked: test.locked,
        questions: test.questions ?? [],
      }));
      setTests(list);
    });

    const submissionsRef = ref(database, "submissions");
    const unsubscribeSubmissions = onValue(submissionsRef, (snapshot) => {
      const value = snapshot.val() as Record<string, Record<string, unknown>> | null;
      if (!value) {
        setSubmissions({});
        setLoading(false);
        return;
      }

      const submissionCounts: Record<string, number> = {};
      Object.entries(value).forEach(([testId, students]) => {
        if (students) {
          submissionCounts[testId] = Object.keys(students).length;
        }
      });
      setSubmissions(submissionCounts);
      setLoading(false);
    });

    return () => {
      unsubscribeTests();
      unsubscribeSubmissions();
    };
  }, []);

  const testsWithResults = tests.filter((test) => submissions[test.id] > 0);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Test Results</h1>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-600">Loading results...</p>
          ) : testsWithResults.length === 0 ? (
            <p className="mt-6 text-slate-600">No test results available</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {testsWithResults.map((test) => (
                <Link
                  key={test.id}
                  href={`/admin/results/${test.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <h2 className="text-xl font-semibold text-slate-900">
                    {test.heading}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Submissions: {submissions[test.id]} | Questions: {test.questions?.length ?? 0}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </AdminOnly>
      </main>
    </div>
  );
}