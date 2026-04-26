"use client";

import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Login failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center bg-gradient-to-b from-sky-600 via-blue-600 to-indigo-600 px-7 py-10 text-white sm:px-10">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-4 text-sm text-slate-100 sm:text-base">
            Log in to access your notes, tests, and personalized learning space.
            Keep building your skills with RQ Tech Services.
          </p>
          <p className="mt-6 text-sm text-slate-200">
            New here?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-white underline decoration-white/60 hover:text-slate-100"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="px-7 py-10 sm:px-10">
          <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-blue-500 transition focus:border-blue-500 focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-blue-500 transition focus:border-blue-500 focus:ring-2"
              />
            </div>

            {error && (
              <p className="rounded-2xl bg-red-100 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/40 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
