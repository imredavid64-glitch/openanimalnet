'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_AUDIO_SIGNATURES, matchAudioSignature, SoundSignature } from '@/lib/acoustics';
import { soundSynthesizer } from '@/lib/audioSynthesizer';

export default function AcousticsPage() {
  const [selectedSig, setSelectedSig] = useState<SoundSignature>(SAMPLE_AUDIO_SIGNATURES[0]);
  const [targetFreq, setTargetFreq] = useState<number>(250);
  const [isPlayingSim, setIsPlayingSim] = useState<boolean>(false);

  const matches = matchAudioSignature(targetFreq);
  const topMatch = matches[0];

  const handlePlaySound = (sig: SoundSignature) => {
    soundSynthesizer.playBioPulse(sig.frequencyRangeHz[0], sig.peakFreqHz, sig.durationSec > 3 ? 2 : sig.durationSec);
  };

  const handleTestTone = () => {
    soundSynthesizer.playTone(targetFreq, 1.2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span>Acoustic Bio-Monitoring</span>
          <span>•</span>
          <span>Audio Signature Explorer</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Wildlife Bioacoustic Simulator
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-3xl">
          Explore sound frequency signatures recorded by hydrophones, bio-acoustic microphone arrays, and field sensors.
          Tune frequencies to match acoustic signatures to wild species.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Frequency Tuner & Spectrogram Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-emerald-400">Interactive Spectrogram Tuner</h2>
                <p className="text-xs text-slate-400">Adjust frequency slider to match target acoustic signatures</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleTestTone}
                  className="px-3 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold hover:bg-emerald-600/30 transition"
                >
                  🔊 Play Tone
                </button>
                <button
                  onClick={() => setIsPlayingSim(!isPlayingSim)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    isPlayingSim
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {isPlayingSim ? '⏸ Pause Frequency Sweep' : '▶ Simulate Audio Pulse'}
                </button>
              </div>
            </div>

            {/* Spectrogram visual box */}
            <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 opacity-20 pointer-events-none">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="border-r border-b border-emerald-500" />
                ))}
              </div>

              {/* Peak frequency marker line */}
              <div
                className="absolute left-0 right-0 border-t-2 border-emerald-400 border-dashed transition-all duration-300 z-10"
                style={{
                  top: `${Math.max(10, Math.min(90, 100 - (targetFreq / 8000) * 100))}%`,
                }}
              >
                <span className="absolute right-2 -top-3 bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {targetFreq} Hz Target
                </span>
              </div>

              {/* Waveform Bars */}
              <div className="relative z-0 h-full flex items-end justify-between space-x-1.5 pt-6 pb-2">
                {selectedSig.waveformPattern.map((val, idx) => {
                  const isActive = isPlayingSim ? Math.random() * val : val;
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-emerald-600 via-teal-400 to-cyan-300 rounded-t transition-all duration-150 opacity-85"
                      style={{ height: `${Math.max(8, isActive * 100)}%` }}
                    />
                  );
                })}
              </div>

              {/* Bottom Legend */}
              <div className="flex justify-between text-xs font-mono text-slate-400 z-10">
                <span>0.0s</span>
                <span>{(selectedSig.durationSec / 2).toFixed(1)}s</span>
                <span>{selectedSig.durationSec.toFixed(1)}s</span>
              </div>
            </div>

            {/* Frequency Control Slider */}
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium">Frequency Tuner</span>
                <span className="text-emerald-400 font-mono font-bold">{targetFreq} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="8000"
                step="10"
                value={targetFreq}
                onChange={(e) => setTargetFreq(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>20 Hz (Infrasound)</span>
                <span>1,000 Hz</span>
                <span>8,000 Hz (Ultrasound)</span>
              </div>
            </div>

            {/* Top Match Card */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-400 font-semibold uppercase">Bio-Acoustic Match Result</div>
                <div className="text-lg font-bold text-white">{topMatch.signature.commonName}</div>
                <div className="text-xs text-slate-400 italic">{topMatch.signature.scientificName}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">{topMatch.matchScore}%</div>
                <div className="text-xs text-slate-400">Match Confidence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Signature Library */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Acoustic Reference Library</h2>
          <div className="space-y-3">
            {SAMPLE_AUDIO_SIGNATURES.map((sig) => {
              const isSelected = selectedSig.id === sig.id;
              return (
                <div
                  key={sig.id}
                  onClick={() => {
                    setSelectedSig(sig);
                    setTargetFreq(sig.peakFreqHz);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{sig.commonName}</h3>
                      <p className="text-xs text-slate-500 italic">{sig.scientificName}</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {sig.peakFreqHz} Hz
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Call:</span> {sig.callType}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {sig.description}
                  </div>
                  <div className="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                    <span>Range: {sig.frequencyRangeHz[0]}-{sig.frequencyRangeHz[1]} Hz</span>
                    <Link
                      href={`/animal/${sig.speciesId}`}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
