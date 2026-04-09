"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { database } from "@/firebase/config";
import { onValue, ref } from "firebase/database";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Submission = {
  submitted?: boolean;
  score?: number;
  total?: number;
  percentage?: number;
};

export default function TestResultPage() {
  const params = useParams<{ id: string }>();
  const testId = params?.id;
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId || !user?.uid) return;
    const submissionRef = ref(database, `submissions/${testId}/${user.uid}`);
    const unsubscribe = onValue(submissionRef, (snapshot) => {
      const value = snapshot.val() as Submission | null;
      setSubmission(value);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [testId, user?.uid]);

  const percentage = useMemo(() => submission?.percentage ?? 0, [submission?.percentage]);
  const wrong = 100 - percentage;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Test Result</h1>

          {loading ? (
            <p className="mt-4 text-slate-600">Loading result...</p>
          ) : !submission?.submitted ? (
            <p className="mt-4 text-slate-600">No submitted result found.</p>
          ) : (
            <div className="mt-6 grid items-center gap-6 md:grid-cols-2">
              <div className="flex justify-center">
                <div
                  className="relative h-52 w-52 rounded-full"
                  style={{
                    background: `conic-gradient(#16a34a 0% ${percentage}%, #ef4444 ${percentage}% 100%)`,
                  }}
                >
                  <div className="absolute inset-6 flex items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold text-slate-900">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-900">
                  Score: {submission.score ?? 0} / {submission.total ?? 0}
                </p>
                <p className="text-slate-700">Correct: {percentage}%</p>
                <p className="text-slate-700">Wrong: {wrong}%</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
