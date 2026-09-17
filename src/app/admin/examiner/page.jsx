'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Shield, Plus, Upload, CheckCircle2, Copy, Sparkles, Sliders, FileText, ArrowLeft, Globe, Lock } from 'lucide-react';
import { registerCustomExam } from '@/lib/mockData';
import { publishExamPaper, encodePaperPayload } from '@/lib/examService';
import { AuthGateModal } from '@/components/security/AuthGateModal';

export default function ExaminerStudioPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState('FORM'); // 'FORM' | 'EXCEL'
  const [testTitle, setTestTitle] = useState('Data Structures & Algorithms Final Midterm');
  const [organization, setOrganization] = useState('Stanford University — CS Dept');
  const [category, setCategory] = useState('UNIVERSITY'); // 'UNIVERSITY' | 'CORPORATE' | 'OLYMPIAD' | 'CERTIFICATION'
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingScore, setPassingScore] = useState(60);
  const [allowedEmailDomain, setAllowedEmailDomain] = useState('');
  const [presetProfile, setPresetProfile] = useState('ACADEMIC_PROCTORED');

  // Security Toggles
  const [enableWebcamAI, setEnableWebcamAI] = useState(true);
  const [enableAudioAnalyzer, setEnableAudioAnalyzer] = useState(true);
  const [enforceFullscreen, setEnforceFullscreen] = useState(true);
  const [allowCalculator, setAllowCalculator] = useState(true);
  const [maxViolationsAllowed, setMaxViolationsAllowed] = useState(3);

  // Question List State
  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      type: 'MCQ',
      text: 'What is the average time complexity of QuickSort?',
      options: [
        { id: 'opt-a', text: 'O(N²)' },
        { id: 'opt-b', text: 'O(N log N)' },
        { id: 'opt-c', text: 'O(N)' },
        { id: 'opt-d', text: 'O(1)' }
      ],
      correctOptionId: 'opt-b',
      explanation: 'QuickSort has O(N log N) average time complexity.',
      subject: 'Algorithms',
      points: 10
    }
  ]);

  // Created Result State
  const [createdExamResult, setCreatedExamResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [audioEnvironmentMode, setAudioEnvironmentMode] = useState('CLASSROOM_LAB_MODE'); // 'QUIET_ROOM' | 'CLASSROOM_LAB_MODE' | 'DISABLED'

  const handleAuthenticate = () => {
    sessionStorage.setItem('aegis_examiner_authed', 'true');
    sessionStorage.setItem('aegis_admin_authed', 'true');
    setIsAuthenticated(true);
  };

  const handleLockSession = () => {
    sessionStorage.removeItem('aegis_examiner_authed');
    sessionStorage.removeItem('aegis_admin_authed');
    setIsAuthenticated(false);
  };

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const isAuthed = sessionStorage.getItem('aegis_examiner_authed') === 'true' ||
                       sessionStorage.getItem('aegis_admin_authed') === 'true';
      setIsAuthenticated(isAuthed);
    }
  }, []);

  if (!mounted) return null;

  // Apply Security Presets
  const handleApplyPreset = (profile) => {
    setPresetProfile(profile);
    if (profile === 'CORPORATE_STRICT') {
      setEnableWebcamAI(true);
      setEnableAudioAnalyzer(true);
      setAudioEnvironmentMode('QUIET_ROOM');
      setEnforceFullscreen(true);
      setAllowCalculator(false);
      setMaxViolationsAllowed(2);
    } else if (profile === 'CLASSROOM_LAB') {
      setEnableWebcamAI(true);
      setEnableAudioAnalyzer(false);
      setAudioEnvironmentMode('DISABLED');
      setEnforceFullscreen(true);
      setAllowCalculator(true);
      setMaxViolationsAllowed(3);
    } else if (profile === 'ACADEMIC_PROCTORED') {
      setEnableWebcamAI(true);
      setEnableAudioAnalyzer(true);
      setAudioEnvironmentMode('CLASSROOM_LAB_MODE');
      setEnforceFullscreen(true);
      setAllowCalculator(true);
      setMaxViolationsAllowed(3);
    } else if (profile === 'LIGHT_OPEN_BOOK') {
      setEnableWebcamAI(false);
      setEnableAudioAnalyzer(false);
      setAudioEnvironmentMode('DISABLED');
      setEnforceFullscreen(true);
      setAllowCalculator(true);
      setMaxViolationsAllowed(5);
    }
  };

  const handleAddQuestion = () => {
    const nextIdx = questions.length + 1;
    setQuestions((prev) => [
      ...prev,
      {
        id: `q${Date.now()}`,
        type: 'MCQ',
        text: `Sample Question ${nextIdx}`,
        options: [
          { id: 'opt-a', text: 'Option A' },
          { id: 'opt-b', text: 'Option B' },
          { id: 'opt-c', text: 'Option C' },
          { id: 'opt-d', text: 'Option D' }
        ],
        correctOptionId: 'opt-a',
        explanation: 'Sample explanation for question.',
        subject: 'General',
        points: 10
      }
    ]);
  };

  const handleCreatePaper = async (e) => {
    e.preventDefault();
    const token = `AEGIS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const paperPayload = {
      id: token.toLowerCase(),
      token,
      code: token,
      title: testTitle,
      organization,
      category,
      durationMinutes: Number(durationMinutes),
      passingScore: Number(passingScore),
      totalQuestions: questions.length,
      maxViolationsAllowed: Number(maxViolationsAllowed),
      securityLevel: presetProfile,
      allowedEmailDomain: allowedEmailDomain.trim(),
      securityPolicy: {
        enableWebcamAI,
        enableAudioAnalyzer,
        audioEnvironmentMode,
        enforceFullscreen,
        allowCalculator,
        watermarkType: 'TILED_HASH',
      },
      instructions: [
        `Assessment issued by ${organization}.`,
        `Access Token: ${token}.`,
        `Exceeding ${maxViolationsAllowed} security violations will lock submission.`
      ],
      questions,
    };

    registerCustomExam(paperPayload);
    await publishExamPaper(paperPayload);

    const fullUrl = `${window.location.origin}/public-test/${token}`;
    setCreatedExamResult({
      token,
      url: fullUrl,
      title: testTitle,
    });
  };

  const handleCopyLink = () => {
    if (createdExamResult?.url) {
      navigator.clipboard.writeText(createdExamResult.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthGateModal
        roleTitle="Examiner Studio Gateway"
        roleSubtitle="Authorized access only. Enter Super-Admin security key to configure assessment papers."
        expectedPin="9999"
        defaultHint="9999"
        onAuthenticate={handleAuthenticate}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-10 max-w-6xl mx-auto space-y-8 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Examiner Studio</h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono text-[10px] uppercase font-bold">
                Admin Module
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">Custom Test Paper Creation & Direct Invite Link Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLockSession}
            className="flex items-center gap-2 px-3.5 py-2 bg-red-950/40 border border-red-500/30 hover:border-red-400 text-red-300 font-mono text-xs rounded-xl transition"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" /> Lock Session
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Admin Control Desk
          </button>
        </div>
      </header>

      {/* Generated Success Banner */}
      {createdExamResult && (
        <div className="glass-panel-glow p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/20 space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <CheckCircle2 className="w-5 h-5" /> Test Published & Token Generated
            </div>
            <span className="text-xs font-mono text-slate-400">Access Code: {createdExamResult.token}</span>
          </div>

          <h3 className="text-xl font-bold text-white">{createdExamResult.title}</h3>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={createdExamResult.url}
              className="flex-1 bg-transparent font-mono text-xs text-teal-300 focus:outline-none px-2"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-semibold rounded-xl shadow-lg transition"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copied!' : 'Copy Direct Link'}
            </button>
          </div>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('FORM')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold border transition ${
            activeTab === 'FORM'
              ? 'bg-teal-950/60 border-teal-500 text-teal-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Web Paper Builder
        </button>
        <button
          onClick={() => setActiveTab('EXCEL')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold border transition ${
            activeTab === 'EXCEL'
              ? 'bg-teal-950/60 border-teal-500 text-teal-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Upload className="w-4 h-4" /> Bulk Excel / CSV Upload
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleCreatePaper} className="space-y-8">
        {/* Paper & Organization Metadata */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400" /> Institution & Paper Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 uppercase mb-1">Examination Paper Title</label>
              <input
                type="text"
                required
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase mb-1">Organization / Department Name</label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase mb-1">Assessment Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="UNIVERSITY">🎓 University & Academic Exam</option>
                <option value="CORPORATE">🏢 Corporate Placement & Hiring</option>
                <option value="CERTIFICATION">📜 Professional Certification</option>
                <option value="OLYMPIAD">🏆 Olympiad & Competitive</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 uppercase mb-1">Restricted Email Domain (Optional)</label>
              <input
                type="text"
                value={allowedEmailDomain}
                onChange={(e) => setAllowedEmailDomain(e.target.value)}
                placeholder="e.g. stanford.edu (Leave blank for open access)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                min={5}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase mb-1">Qualifying Cut-off Score (%)</label>
              <input
                type="number"
                required
                min={10}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Proctoring Policy Preset & Custom Toggles */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" /> Security & Proctoring Presets
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div
              onClick={() => handleApplyPreset('CORPORATE_STRICT')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                presetProfile === 'CORPORATE_STRICT'
                  ? 'bg-teal-950/50 border-teal-500 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-slate-100">🏢 Corporate Strict</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Webcam AI + Mic + Fullscreen + Max 2 Violations</div>
            </div>

            <div
              onClick={() => handleApplyPreset('CLASSROOM_LAB')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                presetProfile === 'CLASSROOM_LAB'
                  ? 'bg-teal-950/50 border-teal-500 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-slate-100">🏫 Classroom / Lab Hall</div>
              <div className="text-[10px] text-teal-400 mt-1 font-mono">Webcam AI + Fullscreen + Mic OFF (30-50 Students)</div>
            </div>

            <div
              onClick={() => handleApplyPreset('ACADEMIC_PROCTORED')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                presetProfile === 'ACADEMIC_PROCTORED'
                  ? 'bg-teal-950/50 border-teal-500 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-slate-100">🎓 Academic Proctored</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Webcam AI + Fullscreen + Calculator Allowed</div>
            </div>

            <div
              onClick={() => handleApplyPreset('LIGHT_OPEN_BOOK')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                presetProfile === 'LIGHT_OPEN_BOOK'
                  ? 'bg-teal-950/50 border-teal-500 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-slate-100">📖 Open-Book / Quiz</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Fullscreen ON, Webcam AI off, Calculator Allowed</div>
            </div>
          </div>

          <div className="pt-3 space-y-3 border-t border-slate-800 font-mono text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWebcamAI}
                  onChange={(e) => setEnableWebcamAI(e.target.checked)}
                  className="rounded accent-teal-500"
                />
                AI Face Vision Check
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAudioAnalyzer}
                  onChange={(e) => {
                    setEnableAudioAnalyzer(e.target.checked);
                    if (!e.target.checked) setAudioEnvironmentMode('DISABLED');
                    else setAudioEnvironmentMode('QUIET_ROOM');
                  }}
                  className="rounded accent-teal-500"
                />
                Audio RMS Mic Analyzer
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCalculator}
                  onChange={(e) => setAllowCalculator(e.target.checked)}
                  className="rounded accent-teal-500"
                />
                On-Screen Calculator
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforceFullscreen}
                  onChange={(e) => setEnforceFullscreen(e.target.checked)}
                  className="rounded accent-teal-500"
                />
                Fullscreen Lockdown
              </label>
            </div>
          </div>
        </div>

        {/* Paper Questions Section */}
        {activeTab === 'FORM' ? (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Questions ({questions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-semibold rounded-xl"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-teal-400 font-bold">
                    <span>Question #{idx + 1} ({q.type})</span>
                    <span>10 Points</span>
                  </div>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].text = e.target.value;
                      setQuestions(updated);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-sans text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4">
            <Upload className="w-12 h-12 text-teal-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Upload Question Paper Spreadsheet</h3>
            <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
              Drag and drop an Excel (`.xlsx`) or CSV template containing question data.
            </p>
            <input type="file" accept=".xlsx,.csv" className="hidden" id="excel-file-input" />
            <label
              htmlFor="excel-file-input"
              className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-semibold rounded-xl cursor-pointer"
            >
              Choose Spreadsheet File
            </label>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-teal-500/20 transition transform hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" /> Publish Paper & Generate Direct Invite Link
        </button>
      </form>
    </main>
  );
}
