'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RANGER_QUESTIONS, RANGER_BADGES, Badge } from '@/lib/challenge';

export default function ChallengePage() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Load badges from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openanimalnet_badges');
      if (saved) {
        try {
          setUnlockedBadges(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const currentQ = RANGER_QUESTIONS[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (showResult) return;
    setSelectedAnswer(opt);
    setShowResult(true);

    const isCorrect = opt === currentQ.correctAnswer;
    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }

    // Check newly earned badges
    const newBadges = RANGER_BADGES.filter((b) => newScore >= b.requiredScore).map((b) => b.id);
    const merged = Array.from(new Set([...unlockedBadges, ...newBadges]));
    setUnlockedBadges(merged);
    if (typeof window !== 'undefined') {
      localStorage.setItem('openanimalnet_badges', JSON.stringify(merged));
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < RANGER_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizFinished(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span>Field Training</span>
          <span>•</span>
          <span>Ranger Species Challenge</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Ranger Identification Challenge
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Test your species identification skills in real field conditions. Earn badges as you progress!
        </p>
      </div>

      {/* Badges Section */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <h2 className="text-sm font-bold uppercase text-emerald-400 tracking-wider">Your Field Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RANGER_BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border flex items-start space-x-3 transition ${
                  isUnlocked
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <div className="font-bold text-sm text-slate-200">{badge.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{badge.description}</div>
                  <div className="text-[10px] mt-2 font-mono uppercase tracking-wider">
                    {isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz Container */}
      {!quizFinished ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          {/* Progress Header */}
          <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span>QUESTION {currentIdx + 1} OF {RANGER_QUESTIONS.length}</span>
            <span>CURRENT SCORE: {score}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image Box */}
            <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              <Image
                src={currentQ.image}
                alt="Species photo for challenge"
                fill
                className="object-cover"
              />
            </div>

            {/* Question & Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {currentQ.question}
              </h3>

              {/* Clue box */}
              <div className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                💡 <span className="font-semibold">Field Clue:</span> {currentQ.clue}
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {currentQ.options.map((opt) => {
                  let btnStyle =
                    'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-500';

                  if (showResult) {
                    if (opt === currentQ.correctAnswer) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                    } else if (opt === selectedAnswer) {
                      btnStyle = 'bg-rose-600 text-white border-rose-600';
                    } else {
                      btnStyle = 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-transparent opacity-50';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={showResult}
                      className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Result explanation */}
              {showResult && (
                <div className="space-y-4 pt-2">
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      selectedAnswer === currentQ.correctAnswer
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300'
                    }`}
                  >
                    <div className="font-bold">
                      {selectedAnswer === currentQ.correctAnswer ? 'Correct!' : 'Incorrect'}
                    </div>
                    <div className="mt-1">{currentQ.fact}</div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition"
                  >
                    {currentIdx + 1 < RANGER_QUESTIONS.length ? 'Next Question →' : 'View Challenge Summary →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Summary view */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl">
          <div className="text-5xl">🏆</div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Field Challenge Complete!</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              You scored <span className="font-bold text-emerald-600">{score}</span> out of{' '}
              <span className="font-bold">{RANGER_QUESTIONS.length}</span>.
            </p>
          </div>

          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition"
            >
              Retake Challenge
            </button>
            <Link
              href="/animal"
              className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-300 transition"
            >
              Browse All Species
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
