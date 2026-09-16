'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Award, CheckCircle2, XCircle, AlertTriangle, Clock, RotateCcw, Lock, FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function ExamResultPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const attemptId = resolvedParams.attemptId;

  const [result, setResult] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  // Hardware & Fullscreen Cleanup Function
  const cleanupHardwareAndFullscreen = () => {
    // 1. Exit Fullscreen if currently active
    try {
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err) => console.log('Fullscreen exit notice:', err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (e) {
      console.error('Fullscreen exit error:', e);
    }

    // 2. Stop all video & audio MediaTracks in DOM
    try {
      if (typeof document !== 'undefined') {
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach((el) => {
          if (el.srcObject && typeof el.srcObject.getTracks === 'function') {
            el.srcObject.getTracks().forEach((track) => {
              track.stop();
              track.enabled = false;
            });
            el.srcObject = null;
          }
        });
      }
    } catch (e) {
      console.error('Media DOM cleanup error:', e);
    }

    // 3. Clear hardware proctoring flags from session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('aegis_biometric_verified');
    }
  };

  useEffect(() => {
    // Automatically turn off camera, mic, and fullscreen on landing on results page
    cleanupHardwareAndFullscreen();

    const cached = sessionStorage.getItem('aegis_last_result');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.attemptId === attemptId) {
          setResult(parsed);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [attemptId]);

  const handleExitPortal = () => {
    if (isExiting) return;
    setIsExiting(true);
    cleanupHardwareAndFullscreen();
    setTimeout(() => {
      router.push('/');
    }, 250);
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Audit Report Processing</h2>
        <p className="text-xs font-mono text-slate-400 mb-4">Fetching verified exam submission record...</p>
        <button
          onClick={handleExitPortal}
          disabled={isExiting}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2"
        >
          {isExiting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" /> Exiting Portal...
            </>
          ) : (
            'Return to Portal'
          )}
        </button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Candidate Assessment & Audit Report</h1>
            <p className="text-xs font-mono text-slate-400">Attempt ID: {result.attemptId}</p>
          </div>
        </div>

        <button
          onClick={handleExitPortal}
          disabled={isExiting}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 disabled:opacity-70 text-slate-200 font-mono text-xs rounded-xl transition shadow"
        >
          {isExiting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-teal-300" /> Exiting & Deactivating Hardware...
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" /> Exit to Portal
            </>
          )}
        </button>
      </header>

      {/* Outcome Card */}
      <div className={`glass-panel-glow p-8 rounded-3xl border ${
        result.isPassed ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-red-500/40 bg-red-950/20'
      } flex flex-wrap items-center justify-between gap-6`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
            result.isPassed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
          }">
            {result.isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.isPassed ? 'QUALIFIED / PASSED' : 'NOT QUALIFIED'}
          </div>
          <h2 className="text-3xl font-extrabold text-white">{result.testTitle}</h2>
          <p className="text-xs font-mono text-slate-400">
            Candidate: {result.candidateName} ({result.rollNo}) • Time Taken: {formatTime(result.timeSpentSeconds)}
          </p>
        </div>

        <div className="text-center bg-slate-950/80 p-6 rounded-2xl border border-slate-800 min-w-[180px]">
          <div className="text-4xl font-extrabold font-mono text-teal-400">{result.percentage}%</div>
          <div className="text-xs text-slate-400 font-mono uppercase mt-1">
            Score: {result.earnedScore} / {result.totalPossibleScore}
          </div>
        </div>
      </div>

      {/* Metrics breakdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-2xl font-bold font-mono text-emerald-400">{result.correctCount}</div>
          <div className="text-xs text-slate-400 font-mono uppercase mt-1">Correct Answers</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-2xl font-bold font-mono text-red-400">{result.incorrectCount}</div>
          <div className="text-xs text-slate-400 font-mono uppercase mt-1">Incorrect</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-2xl font-bold font-mono text-slate-400">{result.unattemptedCount}</div>
          <div className="text-xs text-slate-400 font-mono uppercase mt-1">Unattempted</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-2xl font-bold font-mono text-amber-400">{result.violationCount}</div>
          <div className="text-xs text-slate-400 font-mono uppercase mt-1">Violations Logged</div>
        </div>
      </div>

      {/* Security Audit Log Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cryptographic Security Verification</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">HASH: {result.auditHash}</span>
        </div>

        {result.violations && result.violations.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-amber-400 font-mono font-semibold">Proctoring Incidents Registered During Session:</div>
            {result.violations.map((v) => (
              <div key={v.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
                <span className="text-slate-300">[{v.timestamp}] {v.message}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/30">{v.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-emerald-400 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Zero security anomalies detected during live examination. Clean audit certificate.
          </div>
        )}
      </div>

      {/* Question Response Breakdown (Unlocked post-submission) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <FileText className="w-5 h-5 text-teal-400" /> Question-by-Question Solution Breakdown
        </h3>

        <div className="space-y-3">
          {result.breakdown.map((q, idx) => {
            const isExpanded = expandedQuestion === q.questionId;

            return (
              <div
                key={q.questionId}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3"
              >
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.questionId)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center text-xs ${
                      q.isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200 text-sm">{q.questionText}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    {q.isCorrect ? (
                      <span className="text-emerald-400 font-bold">+10 Pts</span>
                    ) : (
                      <span className="text-red-400 font-bold">0 Pts</span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-slate-300 font-mono">
                    <div><span className="text-slate-500">Your Answer:</span> {q.candidateAnswer || 'UNANSWERED'}</div>
                    <div><span className="text-teal-400 font-semibold">Correct Option:</span> {q.correctAnswer}</div>
                    <div className="p-3 bg-slate-900 rounded-xl text-slate-300 leading-relaxed font-sans text-xs border border-slate-800">
                      <span className="font-bold text-teal-400">Explanation:</span> {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
