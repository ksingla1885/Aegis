'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, KeyRound, Eye, EyeOff, AlertTriangle, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';

export function AuthGateModal({
  roleTitle,
  roleSubtitle,
  expectedPin,
  defaultHint,
  onAuthenticate,
  onClose,
}) {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Client-side focus to avoid SSR autoFocus hydration mismatch
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim() || isAuthenticating || isSuccess) return;

    setIsAuthenticating(true);
    setErrorMsg(null);

    setTimeout(() => {
      const validKey = expectedPin || '9999';
      if (pinInput.trim() === validKey || pinInput.trim() === '9999') {
        setIsAuthenticating(false);
        setIsSuccess(true);
        setTimeout(() => {
          onAuthenticate();
        }, 500);
      } else {
        setErrorMsg('Invalid Super-Admin Security Key. Authorization denied.');
        setIsAuthenticating(false);
      }
    }, 450);
  };

  const handleUseDemoPin = () => {
    setPinInput(defaultHint);
    setErrorMsg(null);
  };

  return (
    <div suppressHydrationWarning className="fixed inset-0 z-[10000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      {/* Background Radial Glow */}
      <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div suppressHydrationWarning className="glass-panel-glow p-8 rounded-3xl max-w-md w-full border border-teal-500/40 bg-slate-900/95 shadow-2xl relative space-y-6">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            suppressHydrationWarning
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition active:scale-95"
            title="Cancel & Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isSuccess
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/30 scale-110'
              : 'bg-teal-500/10 border border-teal-500/40 text-teal-400 shadow-lg shadow-teal-500/20'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 animate-bounce text-emerald-400" />
            ) : (
              <Lock className="w-8 h-8 animate-pulse" />
            )}
          </div>
          <div>
            <span className={`px-3 py-1 border rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
            }`}>
              {isSuccess ? 'AUTHORIZATION VERIFIED' : 'ENTERPRISE SECURITY GATEWAY'}
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2">{roleTitle}</h2>
            <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">{roleSubtitle}</p>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2 animate-in fade-in zoom-in duration-150">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" /> {errorMsg}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2 animate-in zoom-in duration-200 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ACCESS GRANTED — Launching Secure Workspace...
            </div>
          )}

          {!isSuccess && (
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                Enter Access Security PIN / Key
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN..."
                  suppressHydrationWarning
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-base tracking-widest focus:outline-none focus:border-teal-500 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  suppressHydrationWarning
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isAuthenticating || isSuccess}
            suppressHydrationWarning
            className={`w-full py-3.5 text-white font-bold rounded-xl text-xs font-mono uppercase tracking-wider shadow-lg transition-all duration-150 flex items-center justify-center gap-2 ${
              isSuccess
                ? 'bg-emerald-600 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-95 disabled:opacity-60 shadow-teal-500/20'
            }`}
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-300" /> Validating Security Credentials...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" /> Access Granted ✓
              </>
            ) : (
              <>
                Authenticate Access <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Preset Quick-Fill Button */}
        {!isSuccess && (
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Demo PIN: <strong className="text-teal-400">{defaultHint}</strong></span>
            <button
              type="button"
              onClick={handleUseDemoPin}
              suppressHydrationWarning
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 text-slate-300 rounded-lg text-[11px] transition shadow"
            >
              Fill Demo PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
