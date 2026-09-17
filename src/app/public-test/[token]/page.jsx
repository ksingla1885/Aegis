'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Clock, AlertTriangle, ArrowRight, UserCheck, Lock, CheckCircle2, Building2, Globe, Loader2 } from 'lucide-react';

function PublicTestContent({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [test, setTest] = useState(null);
  const [scheduleStatus, setScheduleStatus] = useState('LOADING'); // 'LOADING' | 'ACTIVE' | 'COUNTDOWN_LOBBY' | 'CLOSED' | 'INVALID'
  const [secondsUntilStart, setSecondsUntilStart] = useState(0);
  const [allowedDomain, setAllowedDomain] = useState(null);

  const [candidateName, setCandidateName] = useState(searchParams.get('name') || '');
  const [rollNo, setRollNo] = useState(searchParams.get('roll') || '');
  const [candidateEmail, setCandidateEmail] = useState(searchParams.get('email') || '');
  const [emailDomainError, setEmailDomainError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      try {
        const payloadParam = searchParams.get('p');
        const fetchUrl = payloadParam
          ? `/api/invite/${token}?p=${encodeURIComponent(payloadParam)}`
          : `/api/invite/${token}`;

        const res = await fetch(fetchUrl);
        const data = await res.json();

        if (data.success) {
          setTest(data.test);
          setScheduleStatus(data.scheduleStatus);
          setSecondsUntilStart(data.secondsUntilStart || 0);
          setAllowedDomain(data.allowedEmailDomain);
        } else {
          // Check client-side localStorage fallback for custom created paper
          const customExams = JSON.parse(localStorage.getItem('aegis_custom_exams') || '[]');
          const match = customExams.find(
            (t) =>
              t.id.toLowerCase() === token.toLowerCase() ||
              (t.token && t.token.toLowerCase() === token.toLowerCase()) ||
              (t.code && t.code.toLowerCase() === token.toLowerCase())
          );

          if (match) {
            setTest(match);
            setScheduleStatus('ACTIVE');
            setAllowedDomain(match.allowedEmailDomain || null);
          } else {
            setScheduleStatus('INVALID');
          }
        }
      } catch (e) {
        console.error('Token fetch error:', e);
        setScheduleStatus('INVALID');
      }
    }

    verifyToken();
  }, [token, searchParams]);

  // Countdown Lobby Timer Effect
  useEffect(() => {
    if (scheduleStatus !== 'COUNTDOWN_LOBBY' || secondsUntilStart <= 0) return;

    const timer = setInterval(() => {
      setSecondsUntilStart((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setScheduleStatus('ACTIVE');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduleStatus, secondsUntilStart]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!candidateName.trim() || !rollNo.trim() || !candidateEmail.trim() || isNavigating) return;

    // Check institutional email domain restriction if configured
    if (allowedDomain) {
      const parts = candidateEmail.trim().split('@');
      const domain = parts[parts.length - 1]?.toLowerCase();
      if (domain !== allowedDomain.toLowerCase()) {
        setEmailDomainError(`Email domain restriction mismatch: Must use an @${allowedDomain} email address.`);
        return;
      }
    }

    setIsNavigating(true);
    setEmailDomainError(null);
    sessionStorage.setItem('aegis_candidate_name', candidateName.trim());
    sessionStorage.setItem('aegis_roll_no', rollNo.trim());
    sessionStorage.setItem('aegis_candidate_email', candidateEmail.trim());
    sessionStorage.setItem('aegis_target_test', test.id);

    const payloadParam = searchParams.get('p');
    const targetUrl = payloadParam
      ? `/system-check?testId=${test.id}&p=${encodeURIComponent(payloadParam)}`
      : `/system-check?testId=${test.id}`;

    router.push(targetUrl);
  };

  const formatLobbyTime = (totalSecs) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs}s`;
  };

  if (scheduleStatus === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 animate-spin">
          <Shield className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-slate-400">Verifying Test Invite Token...</p>
      </div>
    );
  }

  if (scheduleStatus === 'INVALID') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Invalid or Expired Assessment Link</h2>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          The test invite code ({token}) could not be resolved or has expired. Please contact your university professor or recruiter.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs"
        >
          Return to Candidate Portal
        </button>
      </div>
    );
  }

  if (scheduleStatus === 'CLOSED') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Assessment Window Closed</h2>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          The scheduled examination time window for "{test.title}" has closed. Submissions are no longer accepted.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
        >
          Return to Main Portal
        </button>
      </div>
    );
  }

  if (scheduleStatus === 'COUNTDOWN_LOBBY') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 animate-pulse">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-full text-xs font-mono">
            EXAM COUNTDOWN LOBBY
          </span>
          <h2 className="text-2xl font-bold text-white">{test.title}</h2>
          <p className="text-xs text-slate-400 font-mono">{test.organization}</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel-glow border border-teal-500/40 w-full text-center space-y-2">
          <div className="text-xs text-slate-400 font-mono uppercase">Examination Door Opens In</div>
          <div className="text-4xl font-extrabold font-mono text-teal-400 tracking-wider">
            {formatLobbyTime(secondsUntilStart)}
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Please stay on this page. The test registration door will open automatically when the countdown hits zero.
        </p>
      </div>
    );
  }

  return (
    <main suppressHydrationWarning className="min-h-screen radar-grid flex flex-col justify-between p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      {/* Navigation Header */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Shield className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">MINDORA <span className="text-teal-400">AEGIS</span></h1>
            <p className="text-xs font-mono text-slate-400">Direct Invitation Portal</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-teal-400 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> Token: {token}
        </span>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Test & Institution Context */}
        <div className="md:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
              <Building2 className="w-4 h-4" /> {test.organization}
            </div>

            <h2 className="text-2xl font-bold text-white leading-snug">{test.title}</h2>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Duration</span>
                <span className="text-slate-200 font-bold">{test.durationMinutes} Minutes</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Questions</span>
                <span className="text-slate-200 font-bold">{test.totalQuestions} Questions</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Category</span>
                <span className="text-teal-400 font-bold">{test.category}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Qualifying Cut-off</span>
                <span className="text-slate-200 font-bold">{test.passingScore}%</span>
              </div>
            </div>

            {allowedDomain && (
              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Restricted to verified @{allowedDomain} email domain.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Registration Form */}
        <div className="md:col-span-6">
          <form onSubmit={handleRegister} className="glass-panel-glow p-6 md:p-8 rounded-3xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <UserCheck className="w-6 h-6 text-teal-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Candidate Verification</h3>
                <p className="text-xs text-slate-400 font-mono">Complete details to unlock hardware test</p>
              </div>
            </div>

            {emailDomainError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {emailDomainError}
              </div>
            )}

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 uppercase mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-sans text-sm focus:outline-none focus:border-teal-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-slate-300 uppercase mb-1">Institutional Email Address</label>
                <input
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                  placeholder={allowedDomain ? `yourname@${allowedDomain}` : "yourname@example.com"}
                />
              </div>

              <div>
                <label className="block text-slate-300 uppercase mb-1">Roll No / Student ID / Application No</label>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                  placeholder="e.g. 2026-CS-901"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isNavigating}
              suppressHydrationWarning
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.98] disabled:opacity-70 text-white font-bold rounded-xl text-sm shadow-xl shadow-teal-500/20 transition-all duration-150 flex items-center justify-center gap-2"
            >
              {isNavigating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Verifying & Launching Hardware Test...
                </>
              ) : (
                <>
                  Verify Identity & Proceed <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function PublicTestPage({ params }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading Assessment Portal...
      </div>
    }>
      <PublicTestContent params={params} />
    </Suspense>
  );
}
