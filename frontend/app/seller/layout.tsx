import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Afrisale Seller",
  description: "Manage your Afrisale catalogue and orders.",
};

/**
 * Seller section chrome. Moved out of the root layout (unchanged visually) so
 * the admin console can define its own full-width layout independently.
 */
export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href="/seller/upload"
            className="text-base font-semibold tracking-tight text-brand"
          >
            Afrisale Seller
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/seller/upload" className="hover:text-brand">
              Upload
            </Link>
            <Link href="/seller/catalogue" className="hover:text-brand">
              Catalogue
            </Link>
            <Link href="/seller/orders" className="hover:text-brand">
              Orders
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">{children}</main>
    </>
  );
}
