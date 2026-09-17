'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, PlusCircle, Monitor, Lock, KeyRound, Award, Users, FileText, Activity, ArrowRight, Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import { AuthGateModal } from '@/components/security/AuthGateModal';
import { getAllExams } from '@/lib/examService';

export default function AdminCommandCenter() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeGateRole, setActiveGateRole] = useState(null); // 'EXAMINER' | 'PROCTOR' | 'ADMIN'
  const [navigatingRoute, setNavigatingRoute] = useState(null);
  const [examsList, setExamsList] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Check if staff is already authenticated in session
    if (typeof window !== 'undefined') {
      const authed = sessionStorage.getItem('aegis_admin_authed') === 'true' ||
                     sessionStorage.getItem('aegis_examiner_authed') === 'true' ||
                     sessionStorage.getItem('aegis_proctor_authed') === 'true';
      setIsAuthenticated(authed);
      setExamsList(getAllExams());
    }
  }, []);

  if (!mounted) return null;

  const handleAuthSuccess = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aegis_admin_authed', 'true');
      sessionStorage.setItem('aegis_examiner_authed', 'true');
      sessionStorage.setItem('aegis_proctor_authed', 'true');
    }
    setIsAuthenticated(true);
    if (activeGateRole === 'EXAMINER') {
      setActiveGateRole(null);
      handleNavigate('/admin/examiner', 'EXAMINER');
    } else if (activeGateRole === 'PROCTOR') {
      setActiveGateRole(null);
      handleNavigate('/admin/proctor', 'PROCTOR');
    } else {
      setActiveGateRole(null);
    }
  };

  const handleNavigate = (path, key) => {
    setNavigatingRoute(key);
    router.push(path);
  };

  const handleLaunchModule = (targetPath, roleKey) => {
    if (isAuthenticated) {
      handleNavigate(targetPath, roleKey);
    } else {
      setActiveGateRole(roleKey);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('aegis_admin_authed');
      sessionStorage.removeItem('aegis_examiner_authed');
      sessionStorage.removeItem('aegis_proctor_authed');
    }
    setIsAuthenticated(false);
  };

  return (
    <main suppressHydrationWarning className="min-h-screen radar-grid flex flex-col justify-between p-6 md:p-12 relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Glow Background Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Auth Gate Modal if not authenticated */}
      {activeGateRole && (
        <AuthGateModal
          roleTitle={activeGateRole === 'EXAMINER' ? 'Examiner Studio Authentication' : 'Proctor Command Desk Gateway'}
          roleSubtitle="Authorized administrative personnel only. Enter Super-Admin Security Key."
          expectedPin="9999"
          defaultHint="9999"
          onAuthenticate={handleAuthSuccess}
          onClose={() => setActiveGateRole(null)}
        />
      )}

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Shield className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider text-white">MINDORA <span className="text-teal-400">AEGIS</span></h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono text-[10px] uppercase font-bold">
                Admin Command Suite
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">Isolated Faculty & Security Personnel Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl font-mono text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Admin Authenticated
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl font-mono text-xs transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveGateRole('ADMIN')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-950/60 border border-teal-500/40 hover:border-teal-400 text-teal-300 rounded-xl font-mono text-xs transition shadow-lg"
            >
              <KeyRound className="w-4 h-4 text-teal-400" /> Authenticate Staff Access
            </button>
          )}
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <div className="max-w-7xl w-full mx-auto my-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Enterprise Assessment <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Control Center</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Isolated administrative portal for setting up question papers, security thresholds, and monitoring live proctoring telemetry feeds across candidate test sessions.
          </p>
        </div>

        {/* Dual Module Cards: Examiner Studio & Proctor Desk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Examiner Studio */}
          <div className="glass-panel-glow p-8 rounded-3xl border border-teal-500/30 flex flex-col justify-between space-y-6 hover:border-teal-400/60 transition group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition duration-300">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold tracking-wider">Module 01</span>
                <h3 className="text-2xl font-bold text-white mt-1">Examiner Studio</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Author question papers, configure security sensitivity policies, generate invite tokens, set duration limits, and publish assessments.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> MCQ, MSQ & Subjective Question Authoring
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> AI Vision & Audio RMS Policy Customization
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Instant Direct Token & Token QR Generation
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchModule('/admin/examiner', 'EXAMINER')}
              disabled={!!navigatingRoute}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 active:scale-[0.98] text-white font-bold rounded-xl text-xs font-mono transition shadow-lg flex items-center justify-center gap-2"
            >
              {navigatingRoute === 'EXAMINER' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Opening Examiner Studio...
                </>
              ) : (
                <>
                  Launch Examiner Studio <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Card 2: Proctor Command Desk */}
          <div className="glass-panel-glow p-8 rounded-3xl border border-emerald-500/30 flex flex-col justify-between space-y-6 hover:border-emerald-400/60 transition group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition duration-300">
                <Monitor className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">Module 02</span>
                <h3 className="text-2xl font-bold text-white mt-1">Proctor Command Desk</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Real-time multi-candidate video feed matrix, AI vision tracking alerts, audio decibel noise monitors, and remote session controls.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Real-time Candidate Matrix & Telemetry Stream
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AI Head Pose, Absence & Voice Flagging
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Remote Pause, Warning & Force Termination
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchModule('/admin/proctor', 'PROCTOR')}
              disabled={!!navigatingRoute}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] text-white font-bold rounded-xl text-xs font-mono transition shadow-lg flex items-center justify-center gap-2"
            >
              {navigatingRoute === 'PROCTOR' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Opening Proctor Desk...
                </>
              ) : (
                <>
                  Launch Proctor Desk <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white font-mono">{examsList.length}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1">Published Exams</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-400 font-mono">Active</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1">Proctoring Engine</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">BOLA Ready</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1">Payload Sanitization</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-200 font-mono">v1.0.0</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1">Aegis Admin Core</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-6 border-t border-slate-800 text-center text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>Mindora Aegis Admin Control Center • Restricted Enterprise Staff Access</div>
        <a href="/" className="text-teal-400 hover:underline">Return to Candidate Portal</a>
      </footer>
    </main>
  );
}
