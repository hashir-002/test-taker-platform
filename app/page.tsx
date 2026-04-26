import Link from "next/link";
import Navbar from "@/components/Navbar";

const cardItems = [
  {
    href: "/my-progress",
    title: "My Progress",
    description: "Track your learning journey, scores, and admin feedback in one place.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    icon: (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 ring-1 ring-blue-200">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 19h16" />
          <path d="M5 15l4-4 2 2 4-5 4 6" />
        </svg>
      </div>
    ),
  },
  {
    href: "/tests",
    title: "Tests",
    description: "Explore practice tests, challenge yourself, and improve with each attempt.",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
    icon: (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-700 ring-1 ring-pink-200">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 6h13" />
          <path d="M8 12h13" />
          <path d="M8 18h13" />
          <path d="M3 6h.01" />
          <path d="M3 12h.01" />
          <path d="M3 18h.01" />
        </svg>
      </div>
    ),
  },
  {
    href: "/notes",
    title: "Notes",
    description: "Capture ideas, upload markdown notes, and keep study material organized.",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    icon: (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2Z" />
          <path d="M13 3v7h7" />
        </svg>
      </div>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <main className="relative overflow-hidden">
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-sky-100/80" />
          <div className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-200/60 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-56 w-56 rounded-full bg-pink-200/70 blur-3xl" />

          <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <span className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-700 shadow-sm shadow-blue-200/50">
              Creative learning for every student
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Build confidence with notes, tests, and progress that inspires.
            </h1>
            <p className="mt-4 max-w-3xl text-base text-slate-700 sm:text-lg md:text-xl">
              Explore thoughtfully designed study material, quick assessments, and progress tracking in a fresh, lighter workspace.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/tests"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-200/40 transition hover:bg-blue-500 sm:text-base"
              >
                Explore Tests
              </Link>
              <Link
                href="/notes"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-blue-300 hover:bg-slate-50 sm:text-base"
              >
                Browse Notes
              </Link>
            </div>
          </section>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Your learning dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Jump into the tools that boost your progress.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {cardItems.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-blue-200/40"
              >
                <div className="flex items-center justify-between gap-4">
                  {card.icon}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-20 w-20 rounded-3xl object-cover shadow-lg shadow-slate-200/30"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition group-hover:text-blue-800">
                  <span>Open {card.title}</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
