"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { database } from "@/firebase/config";
import { onValue, ref, update } from "firebase/database";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

type Test = {
  heading: string;
  pin: number;
  locked?: boolean;
  questions: Question[];
};

type Submission = {
  submitted?: boolean;
  answers?: Record<string, number>;
  score?: number;
  total?: number;
  percentage?: number;
};

export default function TestDetailPage() {
  const params = useParams<{ id: string }>();
  const testId = params?.id;
  const { user } = useAuth();

  const [test, setTest] = useState<Test | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [checkingPin, setCheckingPin] = useState(false);

  useEffect(() => {
    if (!testId) return;
    const testRef = ref(database, `tests/${testId}`);
    const unsubscribe = onValue(testRef, (snapshot) => {
      const value = snapshot.val() as Test | null;
      setTest(value);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [testId]);

  useEffect(() => {
    if (!testId || !user?.uid) return;
    const submissionRef = ref(database, `submissions/${testId}/${user.uid}`);
    const unsubscribe = onValue(submissionRef, (snapshot) => {
      const value = snapshot.val() as Submission | null;
      setSubmission(value);
      if (value?.answers) {
        setSelectedAnswers(value.answers);
      }
    });
    return () => unsubscribe();
  }, [testId, user?.uid]);

  const isSubmitted = Boolean(submission?.submitted);
  const showPinDialog = Boolean(test?.locked);

  const canSubmit = useMemo(() => {
    if (!test || isSubmitted) return false;
    return test.questions.every((_, index) => selectedAnswers[String(index)] !== undefined);
  }, [isSubmitted, selectedAnswers, test]);

  function handleSelect(questionIndex: number, optionIndex: number) {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [String(questionIndex)]: optionIndex,
    }));
  }

  async function handlePinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!test || !testId) return;

    setCheckingPin(true);
    setPinError("");

    if (Number(pinInput) !== Number(test.pin)) {
      setPinError("incorrect pin, try again");
      setCheckingPin(false);
      return;
    }

    try {
      await update(ref(database, `tests/${testId}`), { locked: false });
      setPinInput("");
    } finally {
      setCheckingPin(false);
    }
  }

  async function handleSubmitTest() {
    if (!test || !testId || !user?.uid || !canSubmit) return;
    setSubmitting(true);
    try {
      let score = 0;
      test.questions.forEach((question, index) => {
        const selected = selectedAnswers[String(index)];
        if (selected === question.correctIndex) {
          score += 1;
        }
      });

      const total = test.questions.length;
      const percentage = total ? Math.round((score / total) * 100) : 0;

      await update(ref(database, `submissions/${testId}/${user.uid}`), {
        submitted: true,
        answers: selectedAnswers,
        score,
        total,
        percentage,
        submittedAt: Date.now(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <p className="text-slate-600">Loading test...</p>
        ) : !test ? (
          <p className="text-slate-600">Test not found.</p>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">{test.heading}</h1>

            {!showPinDialog && (
              <>
                <div className="mt-6 space-y-6">
                  {test.questions.map((question, questionIndex) => (
                    <article
                      key={`question-${questionIndex}`}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <h2 className="font-semibold text-slate-900">
                        {questionIndex + 1}. {question.question}
                      </h2>
                      <div className="mt-3 space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={`question-${questionIndex}-option-${optionIndex}`}
                            className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2"
                          >
                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              checked={
                                selectedAnswers[String(questionIndex)] === optionIndex
                              }
                              onChange={() => handleSelect(questionIndex, optionIndex)}
                              disabled={isSubmitted}
                            />
                            <span className="text-slate-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {!isSubmitted ? (
                    <button
                      type="button"
                      onClick={handleSubmitTest}
                      disabled={!canSubmit || submitting}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Submitting..." : "Submit Test"}
                    </button>
                  ) : (
                    <Link
                      href={`/test/${testId}/result`}
                      className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-500"
                    >
                      View Result
                    </Link>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {showPinDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">Enter PIN</h2>
            <p className="mt-2 text-sm text-slate-600">
              This test is locked. Enter the correct PIN to continue.
            </p>

            <form className="mt-4" onSubmit={handlePinSubmit}>
              <input
                type="number"
                required
                value={pinInput}
                onChange={(event) => setPinInput(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
              />

              {pinError && (
                <p className="mt-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                disabled={checkingPin}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkingPin ? "Checking..." : "Submit PIN"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
