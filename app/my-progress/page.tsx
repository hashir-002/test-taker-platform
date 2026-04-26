"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { database } from "@/firebase/config";
import { onValue, ref } from "firebase/database";
import Link from "next/link";
import { useEffect, useState } from "react";

type Test = {
  heading: string;
};

type Submission = {
  submitted?: boolean;
  score?: number;
  total?: number;
  percentage?: number;
  review?: string;
};

type TestResult = {
  testId: string;
  testHeading: string;
  percentage: number;
  score: number;
  total: number;
};

type Review = {
  testId: string;
  testHeading: string;
  review: string;
};

export default function MyProgressPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const submissionsRef = ref(database, "submissions");
    const unsubscribe = onValue(submissionsRef, async (snapshot) => {
      const submissionsData = snapshot.val() as Record<string, Record<string, Submission>> | null;

      if (!submissionsData) {
        setTestResults([]);
        setReviews([]);
        setLoading(false);
        return;
      }

      const userSubmissions: TestResult[] = [];
      const userReviews: Review[] = [];

      // Get all tests the user has submitted
      for (const [testId, students] of Object.entries(submissionsData)) {
        if (students[user.uid]) {
          const submission = students[user.uid];

          // Fetch test heading
          const testRef = ref(database, `tests/${testId}`);
          const testSnapshot = await new Promise<any>((resolve) => {
            const unsubscribeTest = onValue(testRef, (snapshot) => {
              unsubscribeTest();
              resolve(snapshot.val());
            });
          });

          const testHeading = testSnapshot?.heading || "Unknown Test";

          if (submission.submitted) {
            userSubmissions.push({
              testId,
              testHeading,
              percentage: submission.percentage || 0,
              score: submission.score || 0,
              total: submission.total || 0,
            });
          }

          if (submission.review) {
            userReviews.push({
              testId,
              testHeading,
              review: submission.review,
            });
          }
        }
      }

      setTestResults(userSubmissions);
      setReviews(userReviews);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">My Progress</h1>

        {loading ? (
          <p className="mt-6 text-slate-600">Loading your progress...</p>
        ) : (
          <div className="mt-8 space-y-8">
            {/* Test Results Section */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Test Results</h2>
              {testResults.length === 0 ? (
                <p className="text-slate-600">No test results available yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {testResults.map((result) => (
                    <Link
                      key={result.testId}
                      href={`/test/${result.testId}/result`}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <h3 className="text-lg font-semibold text-slate-900">
                        {result.testHeading}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Score: {result.score} / {result.total}
                      </p>
                      <p className="text-sm text-slate-600">
                        Percentage: {result.percentage}%
                      </p>
                      <div className="mt-3">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Reviews from Admin</h2>
              {reviews.length === 0 ? (
                <p className="text-slate-600">No reviews available yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((review, index) => (
                    <div
                      key={`${review.testId}-${index}`}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-slate-900">
                        {review.testHeading}
                      </h3>
                      <p className="mt-2 text-sm text-slate-700">
                        {review.review}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}