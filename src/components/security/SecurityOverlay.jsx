'use client';

import React from 'react';
import { ShieldAlert, Maximize2, AlertTriangle, Lock } from 'lucide-react';

export function SecurityOverlay({
  isFullscreen,
  isTabFocused,
  isLockedOut,
  violationCount,
  maxViolations,
  lastWarningMessage,
  onRequestFullscreen,
}) {
  if (isLockedOut) {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 mb-6 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Test Session Terminated</h2>
        <p className="text-red-400 font-mono text-sm max-w-md mb-6">
          Security policy threshold exceeded ({violationCount} / {maxViolations} violations logged). Your examination response has been automatically submitted and locked.
        </p>
        <div className="glass-panel p-4 rounded-xl max-w-md text-left text-xs text-slate-300 font-mono space-y-1 mb-6 border border-red-500/30">
          <div className="text-red-400 font-semibold mb-1">TERMINATION SUMMARY:</div>
          <div>• BOLA Security Lock: ENGAGED</div>
          <div>• Answer State: AUTO-GRADED</div>
          <div>• Incident Report ID: AEGIS-LOCK-{Date.now().toString(36).toUpperCase()}</div>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg transition"
        >
          Return to Candidate Dashboard
        </button>
      </div>
    );
  }

  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9990] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400 mb-5 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Fullscreen Lock Required</h3>
        <p className="text-slate-300 text-sm max-w-md mb-6">
          Mindora Aegis requires full-screen mode to enforce exam integrity. Exiting fullscreen increments security violation counter.
        </p>

        {lastWarningMessage && (
          <div className="bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs px-4 py-2 rounded-lg mb-6 max-w-md font-mono">
            ⚠️ {lastWarningMessage}
          </div>
        )}

        <button
          onClick={onRequestFullscreen}
          className="flex items-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition transform hover:scale-105 active:scale-95"
        >
          <Maximize2 className="w-5 h-5" />
          Re-Enter Fullscreen Mode
        </button>
      </div>
    );
  }

  if (!isTabFocused) {
    return (
      <div className="fixed inset-0 z-[9980] bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center justify-center text-red-400 mb-4 animate-pulse">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Focus Lost Warning!</h3>
        <p className="text-slate-300 text-sm max-w-md">
          Please click anywhere inside this window to resume your test session.
        </p>
      </div>
    );
  }

  return null;
}
