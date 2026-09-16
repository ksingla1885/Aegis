'use client';

import React from 'react';
import { Camera, CameraOff, Eye, AlertCircle, ShieldCheck } from 'lucide-react';

export function WebcamMonitor({
  videoRef,
  isStreamActive,
  faceDetected,
  faceCount,
  orientation,
  confidence,
  cameraError,
}) {
  return (
    <div className="glass-panel p-3 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-teal-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">AI Proctor Cam</span>
        </div>
        {isStreamActive ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
            OFFLINE
          </span>
        )}
      </div>

      <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Video feed element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${!isStreamActive ? 'hidden' : ''}`}
        />

        {!isStreamActive && (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <CameraOff className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 font-mono">
              {cameraError || 'Camera Initializing...'}
            </p>
          </div>
        )}

        {/* AI Vision Overlay Target Box */}
        {isStreamActive && (
          <div className={`absolute inset-4 border-2 rounded-xl pointer-events-none transition-colors duration-300 ${
            !faceDetected || orientation !== 'CENTERED' || faceCount > 1
              ? 'border-amber-500/60 bg-amber-500/5'
              : 'border-teal-500/30 bg-teal-500/5'
          }`}>
            <div className="absolute top-1 left-2 text-[9px] font-mono text-teal-400 bg-slate-900/80 px-1.5 py-0.5 rounded">
              POSE: {orientation}
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
              CONF: {confidence}%
            </div>
          </div>
        )}
      </div>

      {/* AI Vision Warning Status Bar */}
      <div className="mt-2 text-[11px] font-mono flex items-center justify-between">
        <span className="text-slate-400">Face Status:</span>
        {!faceDetected ? (
          <span className="text-red-400 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> NO FACE DETECTED
          </span>
        ) : orientation !== 'CENTERED' ? (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {orientation}
          </span>
        ) : faceCount > 1 ? (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> MULTIPLE SUBJECTS
          </span>
        ) : (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> VERIFIED OK
          </span>
        )}
      </div>
    </div>
  );
}
