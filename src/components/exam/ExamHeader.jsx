'use client';

import React, { useState } from 'react';
import { Shield, Clock, Send, AlertTriangle, Calculator } from 'lucide-react';
import { ScientificCalculator } from '@/components/exam/ScientificCalculator';

export function ExamHeader({
  testTitle,
  testCode,
  timeRemainingSeconds,
  candidateName,
  rollNo,
  violationCount,
  maxViolations,
  allowCalculator = true,
  onOpenSubmitModal,
}) {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds <= 300;

  return (
    <>
      <header className="glass-panel sticky top-0 z-50 px-6 py-3 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">{testTitle}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>{testCode}</span>
              <span>•</span>
              <span className="text-teal-400">{candidateName} ({rollNo})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* On-Screen Calculator Toggle Button */}
          {allowCalculator && (
            <button
              onClick={() => setIsCalculatorOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 bg-slate-900 border-teal-500/30 hover:border-teal-400 text-teal-300 transition shadow"
            >
              <Calculator className="w-3.5 h-3.5 text-teal-400" />
              <span>Calculator</span>
            </button>
          )}

          {/* Security Violation Counter Badge */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 ${
            violationCount > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Violations: {violationCount} / {maxViolations}</span>
          </div>

          {/* Synchronized Timer Clock */}
          <div className={`px-4 py-1.5 rounded-xl border font-mono font-bold text-base flex items-center gap-2 shadow-inner ${
            isLowTime ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-slate-900 text-teal-300 border-teal-500/30'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-500/20 transition transform hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
            Submit Exam
          </button>
        </div>
      </header>

      {/* Floating Calculator Widget */}
      <ScientificCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </>
  );
}
