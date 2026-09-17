'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Camera, Mic, Maximize, CheckCircle2, AlertTriangle, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { useFaceTracking } from '@/hooks/useFaceTracking';
import { useAudioAnomaly } from '@/hooks/useAudioAnomaly';
import { MOCK_TESTS } from '@/lib/mockData';

function SystemCheckContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId') || MOCK_TESTS[0].id;
  const test = MOCK_TESTS.find((t) => t.id === testId) || MOCK_TESTS[0];

  const [candidateName, setCandidateName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [isFullscreenTested, setIsFullscreenTested] = useState(false);
  const [isEnteringExam, setIsEnteringExam] = useState(false);

  const { videoRef, isStreamActive, faceDetected, cameraError, startCamera } = useFaceTracking({ enabled: true });
  const { isMicActive, decibels, micError, startMic } = useAudioAnomaly({ enabled: true });

  useEffect(() => {
    const name = sessionStorage.getItem('aegis_candidate_name') || 'Ketan Singla';
    const roll = sessionStorage.getItem('aegis_roll_no') || '2026-AEGIS-901';
    setCandidateName(name);
    setRollNo(roll);

    startCamera();
    startMic();
  }, [startCamera, startMic]);

  const handleTestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreenTested(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTakeSnapshot = () => {
    setSnapshotTaken(true);
    sessionStorage.setItem('aegis_biometric_verified', 'true');
  };

  const isMicRequired = test.securityPolicy?.enableAudioAnalyzer !== false && test.securityPolicy?.audioEnvironmentMode !== 'DISABLED';
  const isMicPassed = !isMicRequired || isMicActive;

  const isAllChecksPassed = isStreamActive && isMicPassed && snapshotTaken && isFullscreenTested;

  const handleEnterExam = () => {
    if (!isAllChecksPassed || isEnteringExam) return;
    setIsEnteringExam(true);
    const pParam = searchParams.get('p');
    const targetUrl = pParam
      ? `/exam/${test.id}?p=${encodeURIComponent(pParam)}`
      : `/exam/${test.id}`;
    router.push(targetUrl);
  };

  return (
    <main suppressHydrationWarning className="min-h-screen bg-slate-950 p-6 md:p-12 flex flex-col justify-between max-w-6xl mx-auto">
      {/* Header */}
      <header suppressHydrationWarning className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Biometric Hardware Diagnostic</h1>
            <p className="text-xs font-mono text-slate-400">Target: {test.title}</p>
          </div>
        </div>

        <div suppressHydrationWarning className="text-right font-mono text-xs text-slate-400">
          <div suppressHydrationWarning>{candidateName}</div>
          <div suppressHydrationWarning className="text-teal-400">{rollNo}</div>
        </div>
      </header>

      {/* Main Diagnostic Content */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Hardware Stream Panels */}
        <div className="md:col-span-6 space-y-6">
          {/* Webcam Diagnostic Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-semibold text-white">Camera & Face Vision Diagnostic</h3>
              </div>
              {isStreamActive ? (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                </span>
              ) : (
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> CHECKING
                </span>
              )}
            </div>

            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${!isStreamActive ? 'hidden' : ''}`}
              />
              {!isStreamActive && (
                <p className="text-xs font-mono text-slate-400">{cameraError || 'Requesting camera...'}</p>
              )}
            </div>

            <button
              onClick={handleTakeSnapshot}
              disabled={!isStreamActive}
              className={`w-full py-2.5 rounded-xl font-mono text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                snapshotTaken
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-teal-600 hover:bg-teal-500 border-teal-500 text-white disabled:opacity-40'
              }`}
            >
              {snapshotTaken ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Identity Snapshot Captured
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" /> Capture Biometric Snapshot
                </>
              )}
            </button>
          </div>

          {/* Microphone Audio Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Audio Microphone Test</h3>
              </div>
              {!isMicRequired ? (
                <span className="text-xs font-mono text-teal-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> SKIPPED (Classroom / Lab Exam Mode)
                </span>
              ) : isMicActive ? (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSED ({decibels} dB)
                </span>
              ) : (
                <span className="text-xs font-mono text-red-400">{micError || 'INIT'}</span>
              )}
            </div>

            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-100"
                style={{ width: `${!isMicRequired ? 100 : Math.min(100, decibels * 1.5)}%` }}
              />
            </div>
          </div>
        </div>


        {/* Right Column: Pre-Exam Rules & Launch Checklist */}
        <div className="md:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Maximize className="w-5 h-5 text-teal-400" /> Fullscreen Lockdown Verification
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test your browser's capability to enter locked fullscreen mode.
            </p>
            <button
              onClick={handleTestFullscreen}
              className={`w-full py-3 rounded-xl font-mono text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                isFullscreenTested
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {isFullscreenTested ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fullscreen Support Verified
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4" /> Test Fullscreen Entry
                </>
              )}
            </button>
          </div>

          {/* Rules Summary */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Exam Environment Guidelines</h4>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Ensure your room is well lit and your face remains visible.</li>
              <li>Close all background applications, secondary monitors, and messaging apps.</li>
              <li>Exceeding {test.maxViolationsAllowed} security violations will terminate your exam.</li>
            </ul>
          </div>

          <button
            onClick={handleEnterExam}
            disabled={!isAllChecksPassed || isEnteringExam}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-95 text-white font-bold rounded-xl text-sm shadow-xl shadow-teal-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 flex items-center justify-center gap-2"
          >
            {isEnteringExam ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Launching Proctored Session...
              </>
            ) : isAllChecksPassed ? (
              <>
                Door Unlocked — Enter Exam Room <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Complete Diagnostic Steps Above
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SystemCheckPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading Diagnostic Wizard...
      </div>
    }>
      <SystemCheckContent />
    </Suspense>
  );
}

