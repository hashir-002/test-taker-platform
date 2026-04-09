"use client";

import AdminOnly from "@/components/AdminOnly";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { database } from "@/firebase/config";
import { push, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type QuestionDraft = {
  question: string;
  options: string[];
  correctIndex: number;
};

const EMPTY_QUESTION: QuestionDraft = {
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
};

export default function AdminAddTestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [heading, setHeading] = useState("");
  const [pin, setPin] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([EMPTY_QUESTION]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addQuestion() {
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION, options: ["", "", "", ""] }]);
  }

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((item, i) => {
        if (i !== questionIndex) return item;
        const nextOptions = [...item.options];
        nextOptions[optionIndex] = value;
        return { ...item, options: nextOptions };
      })
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!heading.trim()) {
      setError("Please provide a test heading.");
      return;
    }

    if (!pin) {
      setError("Please provide a pin.");
      return;
    }

    const hasInvalidQuestion = questions.some(
      (item) =>
        !item.question.trim() || item.options.some((option) => !option.trim())
    );

    if (hasInvalidQuestion) {
      setError("Please fill all questions and options.");
      return;
    }

    setIsSubmitting(true);
    try {
      const testsRef = ref(database, "tests");
      const newTestRef = push(testsRef);
      await set(newTestRef, {
        heading: heading.trim(),
        pin: Number(pin),
        locked: true,
        questions: questions.map((item) => ({
          question: item.question.trim(),
          options: item.options.map((option) => option.trim()),
          correctIndex: item.correctIndex,
        })),
        createdBy: user?.uid ?? null,
        createdAt: Date.now(),
      });

      router.replace("/admin/tests");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Failed to add test.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminOnly>
          <h1 className="text-3xl font-bold text-slate-900">Add Test</h1>

          <form
            className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="heading"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Test Heading
              </label>
              <input
                id="heading"
                type="text"
                required
                value={heading}
                onChange={(event) => setHeading(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
              />
            </div>

            <div className="mt-6 space-y-6">
              {questions.map((item, questionIndex) => (
                <section
                  key={`question-${questionIndex}`}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Question {questionIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(event) =>
                      updateQuestion(questionIndex, { question: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
                    placeholder="Enter question"
                    required
                  />

                  <div className="mt-4 space-y-2">
                    {item.options.map((option, optionIndex) => (
                      <div
                        key={`question-${questionIndex}-option-${optionIndex}`}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={item.correctIndex === optionIndex}
                          onChange={() =>
                            updateQuestion(questionIndex, { correctIndex: optionIndex })
                          }
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            updateOption(questionIndex, optionIndex, event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="mt-5 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Add Question
            </button>

            <div className="mt-6">
              <label
                htmlFor="pin"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                PIN
              </label>
              <input
                id="pin"
                type="number"
                required
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
              />
            </div>

            {error && (
              <p className="mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Test"}
            </button>
          </form>
        </AdminOnly>
      </main>
    </div>
  );
}
