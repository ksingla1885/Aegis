'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Eye, Mic, Award, ArrowRight, UserCheck, Activity, Monitor, KeyRound, Building2, PlusCircle, Search, Loader2 } from 'lucide-react';
import { MOCK_TESTS } from '@/lib/mockData';
import { AuthGateModal } from '@/components/security/AuthGateModal';

export default function CandidatePortal() {
  const router = useRouter();

  // Route Navigation Loading State
  const [navigatingRoute, setNavigatingRoute] = useState(null); // '/examiner' | '/proctor' | '/unlock' | '/diagnostic'

  // Security Auth Gate Modal State
  const [activeAuthGate, setActiveAuthGate] = useState(null); // null | 'EXAMINER' | 'PROCTOR'

  // Dual Access Bar State
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [codeError, setCodeError] = useState(null);

  // Registration Form State
  const [candidateName, setCandidateName] = useState('Ketan Singla');
  const [rollNo, setRollNo] = useState('2026-AEGIS-901');
  const [selectedTestId, setSelectedTestId] = useState(MOCK_TESTS[0].id);

  const handleNavigate = (targetPath, labelKey) => {
    setNavigatingRoute(labelKey);
    router.push(targetPath);
  };

  const handleExaminerClick = () => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('aegis_examiner_authed') === 'true') {
      handleNavigate('/examiner', '/examiner');
    } else {
      setActiveAuthGate('EXAMINER');
    }
  };

  const handleProctorClick = () => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('aegis_proctor_authed') === 'true') {
      handleNavigate('/proctor', '/proctor');
    } else {
      setActiveAuthGate('PROCTOR');
    }
  };

  const handleAuthGateSuccess = () => {
    if (activeAuthGate === 'EXAMINER') {
      sessionStorage.setItem('aegis_examiner_authed', 'true');
      setActiveAuthGate(null);
      handleNavigate('/examiner', '/examiner');
    } else if (activeAuthGate === 'PROCTOR') {
      sessionStorage.setItem('aegis_proctor_authed', 'true');
      setActiveAuthGate(null);
      handleNavigate('/proctor', '/proctor');
    }
  };

  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    const query = accessCodeInput.trim();
    if (!query || navigatingRoute) return;

    setNavigatingRoute('/unlock');
    // Check if token exists in mock tests
    const found = MOCK_TESTS.find(t => t.id === query || t.token === query || t.code === query);
    const targetToken = found ? found.token : query;
    router.push(`/public-test/${targetToken}`);
  };

  const handleStartSystemCheck = (e) => {
    e.preventDefault();
    if (!candidateName.trim() || !rollNo.trim() || navigatingRoute) return;

    setNavigatingRoute('/diagnostic');
    sessionStorage.setItem('aegis_candidate_name', candidateName.trim());
    sessionStorage.setItem('aegis_roll_no', rollNo.trim());
    sessionStorage.setItem('aegis_target_test', selectedTestId);

    router.push(`/system-check?testId=${selectedTestId}`);
  };

  return (
    <main suppressHydrationWarning className="min-h-screen radar-grid flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Active Auth Gate Modal Popup */}
      {activeAuthGate === 'EXAMINER' && (
        <AuthGateModal
          roleTitle="Examiner Studio Gateway"
          roleSubtitle="Authorized access only. Enter Super-Admin security key to configure assessment papers."
          expectedPin="9999"
          defaultHint="9999"
          onAuthenticate={handleAuthGateSuccess}
          onClose={() => setActiveAuthGate(null)}
        />
      )}

      {activeAuthGate === 'PROCTOR' && (
        <AuthGateModal
          roleTitle="Proctor Command Desk Gateway"
          roleSubtitle="Security personnel authorization required. Enter Super-Admin security key to monitor live candidate feeds."
          expectedPin="9999"
          defaultHint="9999"
          onAuthenticate={handleAuthGateSuccess}
          onClose={() => setActiveAuthGate(null)}
        />
      )}

      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Shield className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">MINDORA <span className="text-teal-400">AEGIS</span></h1>
            <p className="text-xs font-mono text-slate-400">Universal Online Examination Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExaminerClick}
            disabled={!!navigatingRoute}
            suppressHydrationWarning
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-950/60 border border-teal-500/40 hover:border-teal-400 active:scale-95 text-teal-300 rounded-xl font-mono text-xs transition-all duration-150 shadow-lg disabled:opacity-70"
          >
            {navigatingRoute === '/examiner' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-300" /> Launching Examiner Gateway...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-teal-400" /> Examiner Studio (Create Paper)
              </>
            )}
          </button>
          <button
            onClick={handleProctorClick}
            disabled={!!navigatingRoute}
            suppressHydrationWarning
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 text-slate-300 rounded-xl font-mono text-xs transition-all duration-150 shadow-lg disabled:opacity-70"
          >
            {navigatingRoute === '/proctor' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-300" /> Opening Proctor Desk...
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 text-teal-400" /> Proctor Desk Portal
              </>
            )}
          </button>
        </div>
      </header>

      {/* Dual Access Code Search Banner */}
      <div className="max-w-7xl w-full mx-auto mt-8 mb-4">
        <form onSubmit={handleAccessCodeSubmit} className="glass-panel-glow p-4 rounded-3xl border border-teal-500/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 pl-2">
            <KeyRound className="w-6 h-6 text-teal-400 animate-pulse" />
            <div>
              <div className="text-sm font-bold text-white">Have a Direct Invite Code or Exam Key?</div>
              <div className="text-xs font-mono text-slate-400">e.g. YtuvwTZn4CC3ENSrC or CS101-2026-FINAL</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              suppressHydrationWarning
              placeholder="Paste Exam Invite Code / Token..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!!navigatingRoute}
              suppressHydrationWarning
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all duration-150 shrink-0 flex items-center gap-1.5 disabled:opacity-70"
            >
              {navigatingRoute === '/unlock' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> Unlocking...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" /> Unlock Paper
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Platform Capabilities */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            UNIVERSAL PROCTORING FOR UNIVERSITIES & HIRING
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            High-Stakes Examination Engine with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">AI Security Personnel</span>
          </h2>

          <p className="text-slate-300 text-base leading-relaxed">
            Mindora Aegis serves universities, corporate placement drives, and certification bodies. Featuring AI vision face tracking, Web Audio RMS meters, devtools interception, dynamic identity watermarking, and server BOLA answer protection.
          </p>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <Eye className="w-6 h-6 text-teal-400 mb-2" />
              <h4 className="font-semibold text-white text-sm">AI Vision Face Tracking</h4>
              <p className="text-xs text-slate-400 mt-1">Real-time head pose, absence, and multiple subject detection.</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <Mic className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-semibold text-white text-sm">Audio RMS Noise Analyzer</h4>
              <p className="text-xs text-slate-400 mt-1">Continuous mic frequency meter flagging speech & whispers.</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <Lock className="w-6 h-6 text-teal-400 mb-2" />
              <h4 className="font-semibold text-white text-sm">Strict Environment Lock</h4>
              <p className="text-xs text-slate-400 mt-1">Fullscreen enforcement, devtools block, & shortcut interception.</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <Award className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-semibold text-white text-sm">BOLA Security Stripping</h4>
              <p className="text-xs text-slate-400 mt-1">Server payloads strip all answers & explanations prior to submission.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Entry Form & Test Picker */}
        <div className="lg:col-span-5">
          <form onSubmit={handleStartSystemCheck} className="glass-panel-glow p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <UserCheck className="w-6 h-6 text-teal-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Candidate Registration</h3>
                <p className="text-xs text-slate-400 font-mono">Initiate pre-exam verification</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500 font-sans"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">Roll Number / Registration ID</label>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-teal-500"
                  placeholder="e.g. 2026-REG-901"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">Select Assessment Paper</label>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {MOCK_TESTS.map((test) => (
                    <div
                      key={test.id}
                      onClick={() => setSelectedTestId(test.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        selectedTestId === test.id
                          ? 'bg-teal-950/50 border-teal-500 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-200">{test.title}</div>
                        <div className="text-[10px] font-mono text-teal-400 mt-0.5">{test.organization}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {test.durationMinutes} mins • {test.totalQuestions} Questions • {test.securityLevel}
                        </div>
                      </div>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedTestId === test.id ? 'border-teal-400 bg-teal-500' : 'border-slate-700'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!!navigatingRoute}
              suppressHydrationWarning
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.98] disabled:opacity-70 text-white font-bold rounded-xl text-sm shadow-xl shadow-teal-500/20 transition-all duration-150 flex items-center justify-center gap-2"
            >
              {navigatingRoute === '/diagnostic' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Securing Identity & Opening Diagnostic...
                </>
              ) : (
                <>
                  Proceed to Hardware Diagnostic <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-6 border-t border-slate-800/80 text-center text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>Mindora Aegis Universal Assessment Engine v1.0.0 • OWASP Top 10 Hardened</div>
        <div>Built for Universities, Hiring Drives, and High-Stakes Certification</div>
      </footer>
    </main>
  );
}
