'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from './I18nProvider';

export default function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = locales.find(l => l.code === locale) ?? locales[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 transition-colors"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-secondary-800 rounded-xl shadow-xl border border-secondary-200 dark:border-secondary-700 z-50 py-2"
          >
            {locales.map(l => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  l.code === locale
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}