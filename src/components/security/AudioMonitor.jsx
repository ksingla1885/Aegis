'use client';

import React from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

export function AudioMonitor({
  isMicActive,
  decibels,
  peakDecibels,
  isSpeechDetected,
  micError,
}) {
  return (
    <div className="glass-panel p-3 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Audio RMS Meter</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          PEAK: {peakDecibels} dB
        </span>
      </div>

      <div className="relative w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5 flex items-center">
        <div
          className={`h-full rounded-full transition-all duration-100 ${
            isSpeechDetected ? 'bg-amber-500 shadow-lg shadow-amber-500/50' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
          }`}
          style={{ width: `${Math.min(100, decibels)}%` }}
        />
      </div>

      <div className="mt-2 text-[11px] font-mono flex items-center justify-between">
        <span className="text-slate-400">Mic State:</span>
        {micError ? (
          <span className="text-red-400 font-semibold flex items-center gap-1">
            <MicOff className="w-3 h-3" /> ERROR
          </span>
        ) : isSpeechDetected ? (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400 animate-ping" /> NOISE SPIKE ({decibels} dB)
          </span>
        ) : isMicActive ? (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Mic className="w-3 h-3" /> NORMAL ({decibels} dB)
          </span>
        ) : (
          <span className="text-slate-500">INACTIVE</span>
        )}
      </div>
    </div>
  );
}
