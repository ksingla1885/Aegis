'use client';

import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function ProctorTimeline({ violations = [], maxViolations = 3 }) {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Audit Incident Log</h4>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Violations: {violations.length} / {maxViolations}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2 max-h-[220px]">
        {violations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-6 text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-1" />
            <p className="text-xs font-mono">No security violations recorded.</p>
          </div>
        ) : (
          violations.map((v) => (
            <div
              key={v.id}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-xs font-mono transition hover:border-slate-700"
            >
              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${
                v.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] border font-bold ${getSeverityBadge(v.severity)}`}>
                    {v.type}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {v.timestamp}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">{v.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
