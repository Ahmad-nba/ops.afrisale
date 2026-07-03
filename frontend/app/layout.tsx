import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afrisale",
  description: "Afrisale platform.",
};

/**
 * Root layout provides only the html/body shell. Section chrome (seller header,
 * admin sidebar) lives in each section's own layout so the Operations Console
 * can render full-width without the seller navigation.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
