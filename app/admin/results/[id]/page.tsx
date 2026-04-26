"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref } from "firebase/database";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Submission = {
  submitted?: boolean;
  score?: number;
  total?: number;
  percentage?: number;
};

type StudentSubmission = {
  uid: string;
  email: string;
  submission: Submission;
};

export default function AdminTestResultsPage() {
  const params = useParams<{ id: string }>();
  const testId = params?.id;
  const [testHeading, setTestHeading] = useState("");
  const [students, setStudents] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId) return;

    const testRef = ref(database, `tests/${testId}`);
    const unsubscribeTest = onValue(testRef, (snapshot) => {
      const value = snapshot.val() as { heading: string } | null;
      if (value) {
        setTestHeading(value.heading);
      }
    });

    const submissionsRef = ref(database, `submissions/${testId}`);
    const unsubscribeSubmissions = onValue(submissionsRef, async (snapshot) => {
      const value = snapshot.val() as Record<string, Submission> | null;
      if (!value) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Fetch emails for all student UIDs
      const studentPromises = Object.keys(value).map(async (uid) => {
        try {
          const userRef = ref(database, `users/${uid}`);
          const userSnapshot = await new Promise<any>((resolve) => {
            const unsubscribe = onValue(userRef, (snapshot) => {
              unsubscribe();
              resolve(snapshot.val());
            });
          });
          return {
            uid,
            email: userSnapshot?.email || `${uid.slice(0, 8)}...`,
            submission: value[uid],
          };
        } catch (error) {
          return {
            uid,
            email: `${uid.slice(0, 8)}...`,
            submission: value[uid],
          };
        }
      });

      const studentList = await Promise.all(studentPromises);
      setStudents(studentList);
      setLoading(false);
    });

    return () => {
      unsubscribeTest();
      unsubscribeSubmissions();
    };
  }, [testId]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          <div className="mb-6">
            <Link
              href="/admin/results"
              className="text-blue-600 hover:text-blue-500"
            >
              ← Back to Results
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {testHeading || "Test Results"}
            </h1>
          </div>

          {loading ? (
            <p className="text-slate-600">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-slate-600">No submissions found</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {students.map((student) => (
                <Link
                  key={student.uid}
                  href={`/admin/results/${testId}/${student.uid}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {student.email}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Score: {student.submission.score ?? 0} / {student.submission.total ?? 0}
                  </p>
                  <p className="text-sm text-slate-600">
                    Percentage: {student.submission.percentage ?? 0}%
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