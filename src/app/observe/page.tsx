'use client';

import ObservationWorkflow from '@/components/ai/ObservationWorkflow';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ObservePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <ObservationWorkflow />
      </main>
      <Footer />
    </div>
  );
}