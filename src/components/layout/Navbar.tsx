'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Animals', path: '/animal' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Monitor', path: '/monitor' },
  { name: 'AI Analysis', path: '/ai' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 dark:bg-secondary-900/95 backdrop-blur-lg shadow-lg shadow-secondary-200 dark:shadow-secondary-800'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <span className="text-3xl group-hover:text-primary-600 transition-colors duration-300">🐾</span>
              <motion.span
                className="absolute -top-1 -right-1 text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
              >
                NET
              </motion.span>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 transition-colors duration-300">
                OpenAnimal
              </span>
              <span className="text-xs text-secondary-500 dark:text-secondary-400 -mt-1 hidden sm:block">
                Global Animal Data Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={clsx(
                  'relative group',
                  pathname === item.path
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400'
                )}
              >
                <span className="text-sm font-medium transition-colors duration-300">
                  {item.name}
                </span>
                {pathname === item.path && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Items */}
          <div className="hidden lg:flex items-center space-x-6">
            <button className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300">
              <span className="text-xl">🌍</span>
            </button>
            <button className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300">
              <span className="text-xl">🔍</span>
            </button>
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300"
            >
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            <Link
              href="/dashboard"
              className="btn-primary text-sm"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-3">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.path}
                      className={clsx(
                        'block py-3 px-4 rounded-xl transition-all duration-300',
                        pathname === item.path
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                      )}
                    >
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                  <Link href="/dashboard" className="btn-primary text-center">
                    Dashboard
                  </Link>
                  <button className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300">
                    <span className="text-xl">🌍</span>
                    <span>Map View</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300">
                    <span className="text-xl">🔍</span>
                    <span>Search</span>
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors duration-300"
                  >
                    <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
