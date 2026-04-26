"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { database } from "@/firebase/config";
import { onValue, ref, update } from "firebase/database";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

type Test = {
  heading: string;
  questions: Question[];
};

type Submission = {
  submitted?: boolean;
  answers?: Record<string, number>;
  score?: number;
  total?: number;
  percentage?: number;
  review?: string;
};

export default function AdminStudentResultPage() {
  const params = useParams<{ id: string; studentId: string }>();
  const testId = params?.id;
  const studentId = params?.studentId;
  const [test, setTest] = useState<Test | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    if (!testId || !studentId) return;

    const testRef = ref(database, `tests/${testId}`);
    const unsubscribeTest = onValue(testRef, (snapshot) => {
      const value = snapshot.val() as Test | null;
      setTest(value);
    });

    const submissionRef = ref(database, `submissions/${testId}/${studentId}`);
    const unsubscribeSubmission = onValue(submissionRef, (snapshot) => {
      const value = snapshot.val() as Submission | null;
      setSubmission(value);
      setReviewText(value?.review || "");
      setLoading(false);
    });

    const userRef = ref(database, `users/${studentId}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const value = snapshot.val() as { email?: string } | null;
      setStudentEmail(value?.email || `${studentId.slice(0, 8)}...`);
    });

    return () => {
      unsubscribeTest();
      unsubscribeSubmission();
      unsubscribeUser();
    };
  }, [testId, studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <AdminOnly>
            <p className="text-slate-600">Loading result...</p>
          </AdminOnly>
        </main>
      </div>
    );
  }

  if (!test || !submission?.submitted) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <AdminOnly>
            <p className="text-slate-600">Result not found</p>
          </AdminOnly>
        </main>
      </div>
    );
  }

  const percentage = submission.percentage ?? 0;
  const correctCount = submission.score ?? 0;
  const totalQuestions = submission.total ?? 0;
  const wrongCount = totalQuestions - correctCount;

  const chartData = [
    { name: "Correct", value: correctCount, color: "#16a34a" },
    { name: "Wrong", value: wrongCount, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          <div className="mb-6">
            <Link
              href={`/admin/results/${testId}`}
              className="text-blue-600 hover:text-blue-500"
            >
              ← Back to Students
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {test.heading} - Student Result
            </h1>
            <p className="text-slate-600">Student: {studentEmail}</p>
          </div>

          <div className="space-y-6">
            {test.questions.map((question, index) => {
              const selectedAnswer = submission.answers?.[String(index)];
              const isCorrect = selectedAnswer === question.correctIndex;
              const selectedOption = selectedAnswer !== undefined ? question.options[selectedAnswer] : null;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Question {index + 1}: {question.question}
                  </h3>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      let bgColor = "bg-white";
                      let textColor = "text-slate-700";
                      let borderColor = "border-slate-200";

                      if (selectedAnswer === optionIndex) {
                        if (isCorrect) {
                          bgColor = "bg-green-50";
                          textColor = "text-green-800";
                          borderColor = "border-green-300";
                        } else {
                          bgColor = "bg-red-50";
                          textColor = "text-red-800";
                          borderColor = "border-red-300";
                        }
                      } else if (optionIndex === question.correctIndex) {
                        bgColor = "bg-green-50";
                        textColor = "text-green-800";
                        borderColor = "border-green-300";
                      }

                      return (
                        <div
                          key={optionIndex}
                          className={`rounded-lg border p-3 ${bgColor} ${borderColor}`}
                        >
                          <span className={`font-medium ${textColor}`}>
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </span>
                          {selectedAnswer === optionIndex && (
                            <span className="ml-2 text-sm font-semibold">
                              (Your Answer)
                            </span>
                          )}
                          {optionIndex === question.correctIndex && selectedAnswer !== optionIndex && (
                            <span className="ml-2 text-sm font-semibold text-green-700">
                              (Correct Answer)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Result Summary</h3>
              <div className="grid items-center gap-6 md:grid-cols-2">
                <div className="flex justify-center">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-semibold text-slate-900">
                    Score: {correctCount} / {totalQuestions}
                  </p>
                  <p className="text-slate-700">Correct: {percentage}%</p>
                  <p className="text-slate-700">Wrong: {100 - percentage}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Review</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!testId || !studentId) return;

                  setSavingReview(true);
                  try {
                    await update(ref(database, `submissions/${testId}/${studentId}`), {
                      review: reviewText,
                    });
                  } finally {
                    setSavingReview(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-slate-700 mb-2">
                    Add or update review for this student
                  </label>
                  <textarea
                    id="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
                    placeholder="Enter your review..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingReview ? "Saving..." : "Save Review"}
                </button>
              </form>
            </div>
          </div>
        </AdminOnly>
      </main>
    </div>
  );
}