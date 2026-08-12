'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AIAssistant from '@/components/ai/AIAssistant';
import ConflictPredictor from '@/components/ai/ConflictPredictor';
import HabitatSimulator from '@/components/ai/HabitatSimulator';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals, sampleAnimalData, dataCategoryData } from '@/data/sample/animals';
import { RobotIcon, PawIcon, AntennaIcon, DataCategoryIcon, ShieldIcon, MessageIcon, ChartIcon, SearchIcon, ScaleIcon, StarIcon } from '@/components/icons';

export default function AIPage() {
  const [showFullScreenAI, setShowFullScreenAI] = useState(false);

  const aiFeatures = [
    {
      title: 'Natural Language Queries',
      description: 'Ask questions in plain English and get intelligent responses about animal data.',
      icon: <MessageIcon className="w-8 h-8 mx-auto text-primary-300" />,
      example: '"What are the most endangered mammals in Africa?"',
    },
    {
      title: 'Data Analysis',
      description: 'Analyze complex datasets across species, categories, and time periods.',
      icon: <ChartIcon className="w-8 h-8 mx-auto text-primary-300" />,
      example: '"Show me population trends for big cats over the last decade."',
    },
    {
      title: 'Species Identification',
      description: 'Identify animals based on descriptions, habitats, or characteristics.',
      icon: <SearchIcon className="w-8 h-8 mx-auto text-primary-300" />,
      example: '"Which large cat has a mane and lives in Africa?"',
    },
    {
      title: 'Conservation Insights',
      description: 'Get insights into conservation status, threats, and protection efforts.',
      icon: <ShieldIcon className="w-8 h-8 mx-auto text-primary-300" />,
      example: '"What are the main threats to sea turtles?"',
    },
    {
      title: 'Comparative Analysis',
      description: 'Compare data across different species, regions, or time periods.',
      icon: <ScaleIcon className="w-8 h-8 mx-auto text-primary-300" />,
      example: '"Compare the populations of African and Asian elephants."',
    },
    {
      title: 'Predictive Analytics',
      description: 'Get predictions about population trends, migration patterns, and conservation outcomes.',
      icon: <StarIcon className="w-8 h-8 mx-auto text-primary-300" />,
      example: '"Predict the population of tigers in 2030."',
    },
  ];

  const quickQueries = [
    'Show me all endangered species',
    'What animals are monitored in North America?',
    'Compare lion and tiger populations',
    'What is the conservation status of elephants?',
    'Show me animals with telemetry data',
    'Which species have the largest population decline?',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 dark:from-primary-800 dark:via-primary-900 dark:to-secondary-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <RobotIcon className="w-14 h-14 text-primary-300" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mt-4">
            AI-Powered Animal Intelligence
          </h1>
          <p className="text-xl text-white/80 mt-4 max-w-3xl mx-auto">
            Unlock the power of AI to explore, analyze, and understand animal data like never before.
            Ask questions, get insights, and discover patterns in our comprehensive database.
          </p>
        </motion.div>

        {/* AI Assistant Section */}
        {!showFullScreenAI && (
          <>
            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/80 text-sm mb-4">{feature.description}</p>
                  <div className="bg-white/10 rounded-xl p-3">
                    <code className="text-white/60 text-sm">{feature.example}</code>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* AI Assistant Preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="max-w-4xl mx-auto mb-12"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                      <RobotIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
                      <p className="text-white/60">Ask me anything about animals</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFullScreenAI(true)}
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm transition-colors duration-300"
                  >
                    Open Full Screen
                  </button>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 mb-6">
                  <div className="flex space-x-2">
                    {quickQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setShowFullScreenAI(true)}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors duration-300"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowFullScreenAI(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Start Chatting with AI
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Predictive Tools */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Predictive Tools</h2>
                <p className="text-white/70 mt-2 max-w-2xl mx-auto">
                  Interactive, transparent models built on the dataset&apos;s real migration corridors and population series.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConflictPredictor />
                <HabitatSimulator />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                {
                  label: 'Species in Database',
                  value: sampleAnimals.length.toLocaleString(),
                  icon: <PawIcon className="w-7 h-7 mx-auto text-primary-300" />,
                },
                {
                  label: 'Migration Corridors',
                  value: sampleAnimals.reduce((t, a) => t + (a.migrationRoutes?.length ?? 0), 0).toLocaleString(),
                  icon: <AntennaIcon className="w-7 h-7 mx-auto text-primary-300" />,
                },
                {
                  label: 'Data Categories Tracked',
                  value: dataCategoryData.length.toLocaleString(),
                  icon: <DataCategoryIcon category="population" className="w-7 h-7 mx-auto text-primary-300" />,
                },
                {
                  label: 'IUCN-assessed',
                  value: sampleAnimals.filter((a) => a.conservationStatus !== 'NE').length.toLocaleString(),
                  icon: <ShieldIcon className="w-7 h-7 mx-auto text-primary-300" />,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center"
                >
                  <div className="mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white font-data">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* Full Screen AI Assistant */}
        {showFullScreenAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="w-full max-w-4xl h-[80vh] bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <RobotIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-900 dark:text-white">AI Assistant</div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400">
                      Animal Data Intelligence
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullScreenAI(false)}
                  className="w-10 h-10 rounded-full bg-danger-100 dark:bg-danger-900/20 hover:bg-danger-200 dark:hover:bg-danger-800/20 flex items-center justify-center text-danger-600 dark:text-danger-300 transition-colors duration-300"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIAssistant onClose={() => setShowFullScreenAI(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
