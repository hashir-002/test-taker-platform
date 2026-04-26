"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { database } from "@/firebase/config";
import { onValue, ref } from "firebase/database";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
};

export default function TestResultPage() {
  const params = useParams<{ id: string }>();
  const testId = params?.id;
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId) return;

    const testRef = ref(database, `tests/${testId}`);
    const unsubscribeTest = onValue(testRef, (snapshot) => {
      const value = snapshot.val() as Test | null;
      setTest(value);
    });

    const submissionRef = ref(database, `submissions/${testId}/${user?.uid}`);
    const unsubscribeSubmission = onValue(submissionRef, (snapshot) => {
      const value = snapshot.val() as Submission | null;
      setSubmission(value);
      setLoading(false);
    });

    return () => {
      unsubscribeTest();
      unsubscribeSubmission();
    };
  }, [testId, user?.uid]);

  const percentage = useMemo(() => submission?.percentage ?? 0, [submission?.percentage]);
  const correctCount = submission?.score ?? 0;
  const totalQuestions = submission?.total ?? 0;
  const wrongCount = totalQuestions - correctCount;

  const chartData = [
    { name: "Correct", value: correctCount, color: "#16a34a" },
    { name: "Wrong", value: wrongCount, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Test Result</h1>

          {loading ? (
            <p className="mt-4 text-slate-600">Loading result...</p>
          ) : !submission?.submitted || !test ? (
            <p className="mt-4 text-slate-600">No submitted result found.</p>
          ) : (
            <div className="mt-6 space-y-6">
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
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
