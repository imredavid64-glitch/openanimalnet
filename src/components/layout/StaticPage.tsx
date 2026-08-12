import React from 'react';
import Link from 'next/link';

interface StaticPageProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Shared layout for informational/static pages (about, docs, policies, etc.).
 * Server component — no interactivity needed.
 */
export default function StaticPage({ icon, title, subtitle, children }: StaticPageProps) {
  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {/* Hero band */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-900 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          {icon && <div className="text-6xl mb-4">{icon}</div>}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white dark:bg-secondary-900 rounded-2xl shadow-soft p-8 md:p-12 space-y-8 text-secondary-700 dark:text-secondary-300 leading-relaxed">
          {children}
        </div>
      </section>
    </main>
  );
}

/** Simple section heading used inside static page content. */
export function Section({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mt-10 mb-4 first:mt-0">
      {children}
    </h2>
  );
}

/** Inline link styled for static page content. */
export function PageLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
      {children}
    </Link>
  );
}
