"use client";

import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/notes",
    label: "Notes",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4h16v16H4z" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    ),
  },
  {
    href: "/tests",
    label: "Tests",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6" />
        <path d="M12 9v6" />
        <path d="M4 5h16" />
        <path d="M6 5v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5" />
      </svg>
    ),
  },
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 11.5L12 4l9 7.5" />
        <path d="M5 10.5V20h14v-9.5" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, role } = useAuth();
  const router = useRouter();
  const isAdmin = role === "admin";
  const visibleNavItems = isAdmin
    ? [
        ...navItems,
        {
          href: "/admin/panel",
          label: "Admin Panel",
          icon: (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" />
              <path d="M9.5 12l1.8 1.8L15 10" />
            </svg>
          ),
        },
      ]
    : navItems;

  async function handleLogout() {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
      router.replace("/auth/login");
    } catch {
      // Keep UX simple if sign out fails; user can retry.
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-slate-950/75 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-wide text-white transition hover:text-blue-300"
        >
          RQ Tech Services
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
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
            {isMenuOpen ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-6">
            {visibleNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-blue-300"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-white/10 px-4 pb-4 md:hidden">
          <ul className="space-y-1 py-3">
            {visibleNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-blue-300"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div
            className={`mt-2 grid gap-3 ${
              user ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-rose-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full border border-white/40 px-4 py-2 text-center text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full bg-blue-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
