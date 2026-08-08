'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();

  const scrollToExplore = () => {
    const exploreSection = document.querySelector('#explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 dark:from-primary-800 dark:via-primary-900 dark:to-secondary-950" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Animals */}
        {[
          { emoji: '🦁', top: '10%', left: '5%', size: 40, delay: 0 },
          { emoji: '🐘', top: '20%', right: '10%', size: 50, delay: 0.2 },
          { emoji: '🦅', top: '60%', left: '15%', size: 35, delay: 0.4 },
          { emoji: '🐋', top: '80%', right: '20%', size: 45, delay: 0.6 },
          { emoji: '🐍', top: '30%', left: '80%', size: 30, delay: 0.8 },
          { emoji: '🐸', top: '70%', left: '70%', size: 35, delay: 1.0 },
          { emoji: '🐟', top: '40%', right: '80%', size: 25, delay: 1.2 },
          { emoji: '🦋', top: '90%', left: '60%', size: 20, delay: 1.4 },
        ].map((animal, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -100, scale: 0.5 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3], 
              y: [0, -20, 0], 
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 8 + animal.delay * 2,
              delay: animal.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ top: animal.top, left: animal.left, fontSize: animal.size }}
            className="absolute text-white/20"
          >
            {animal.emoji}
          </motion.div>
        ))}

        {/* Glowing Orbs */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2], 
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{ 
              duration: 6 + i * 1.5,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 18}%`,
              width: `${40 + i * 10}px`,
              height: `${40 + i * 10}px`,
            }}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6">
            <span className="block">Open</span>
            <span className="text-primary-300 block">Animal</span>
            <span className="text-primary-200 block">Net</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 font-light">
            Monitor, analyze, and explore comprehensive animal data from around the world.
            Track biological, behavioral, ecological, and conservation data for all species.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/animal"
            className="btn-primary text-lg px-8 py-4"
          >
            Explore Animals
          </Link>
          <Link
            href="/dashboard"
            className="btn-secondary text-lg px-8 py-4 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            View Dashboard
          </Link>
          <button
            onClick={scrollToExplore}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300"
          >
            <span>Learn More</span>
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓
            </motion.span>
          </button>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { label: 'Species', value: '1.2M+', icon: '🐾' },
            { label: 'Monitored', value: '45K+', icon: '📡' },
            { label: 'Data Points', value: '100M+', icon: '📊' },
            { label: 'Countries', value: '195+', icon: '🌍' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40"
      >
        <span className="text-2xl animate-bounce">↓</span>
      </motion.div>
    </div>
  );
}
