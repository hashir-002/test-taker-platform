import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RQ Tech Services | Online Tutor and Developer",
    template: "%s | RQ Tech Services",
  },
  description:
    "RQ Tech Services offers online tutoring, notes, tests, and developer-focused learning experiences.",
  keywords: [
    "RQ Tech Services",
    "online tutor",
    "programming notes",
    "developer learning",
    "online tests",
  ],
  icons: {
    icon: "/rq-favicon.svg",
    shortcut: "/rq-favicon.svg",
    apple: "/rq-favicon.svg",
  },
  openGraph: {
    title: "RQ Tech Services | Online Tutor and Developer",
    description:
      "Learn with guided notes and tests on RQ Tech Services, your online tutor and developer platform.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RQ Tech Services | Online Tutor and Developer",
    description:
      "Guided notes, tests, and developer-focused learning by RQ Tech Services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
