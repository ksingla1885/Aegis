'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Monitor,
  Eye,
  Mic,
  AlertCircle,
  CheckCircle2,
  Lock,
  Send,
  RefreshCcw,
  ArrowLeft,
  Users,
  Grid,
  Maximize2,
  Sliders,
  Camera,
  Check,
  X,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { MOCK_TESTS } from '@/lib/mockData';
import { AuthGateModal } from '@/components/security/AuthGateModal';

export default function ProctorDeskPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthed = sessionStorage.getItem('aegis_proctor_authed') === 'true';
      setIsAuthenticated(isAuthed);
    }
  }, []);

  const handleAuthenticate = () => {
    sessionStorage.setItem('aegis_proctor_authed', 'true');
    setIsAuthenticated(true);
  };

  const handleLockDesk = () => {
    sessionStorage.removeItem('aegis_proctor_authed');
    setIsAuthenticated(false);
  };

  // Command Center Feature Toggles (Convenience Panel)
  const [featureToggles, setFeatureToggles] = useState({
    enableSnapshots: true, // Option A: Violation Snapshots
    enableRemoteActions: true, // Option B: Remote Action Suite
    enableRiskBadges: true, // Option C: Risk Classifier
    enableMultiGrid: true, // Option D: 2x2 Surveillance Grid
  });

  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [viewMode, setViewMode] = useState('SINGLE'); // 'SINGLE' | 'GRID'
  const [selectedSnapshot, setSelectedSnapshot] = useState(null); // Inspection Modal state

  const [activeCandidates, setActiveCandidates] = useState([
    {
      id: 'cand-01',
      name: 'Ketan Singla',
      rollNo: '2026-AEGIS-901',
      testTitle: 'NSO Advanced Security Level 3',
      status: 'ACTIVE',
      faceStatus: 'VERIFIED_OK',
      audioLevel: '18 dB',
      fps: 30,
      isFullscreen: true,
      violationsCount: 1,
      violations: [
        {
          id: 'v1',
          type: 'FULLSCREEN_EXITED',
          message: 'Exited proctored fullscreen mode for 2 seconds',
          timestamp: '22:45:10',
          snapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          aiBoxLabel: 'FULLSCREEN LOSS'
        }
      ]
    },
    {
      id: 'cand-02',
      name: 'Rahul Sharma',
      rollNo: '2026-AEGIS-812',
      testTitle: 'NSO Advanced Security Level 3',
      status: 'ACTIVE',
      faceStatus: 'LOOKING_LEFT',
      audioLevel: '45 dB',
      fps: 28,
      isFullscreen: true,
      violationsCount: 2,
      violations: [
        {
          id: 'v2',
          type: 'TAB_SWITCH_DETECTED',
          message: 'Navigated away to external browser window',
          timestamp: '22:42:04',
          snapshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          aiBoxLabel: 'WINDOW UNFOCUS'
        },
        {
          id: 'v3',
          type: 'HEAD_POSE_ANOMALY',
          message: 'Turned head left away from display (>45° pitch angle)',
          timestamp: '22:46:18',
          snapshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          aiBoxLabel: 'POSE ANOMALY'
        }
      ]
    },
    {
      id: 'cand-03',
      name: 'Priya Patel',
      rollNo: '2026-AEGIS-441',
      testTitle: 'IMO Security Tier 1',
      status: 'ACTIVE',
      faceStatus: 'VERIFIED_OK',
      audioLevel: '12 dB',
      fps: 30,
      isFullscreen: true,
      violationsCount: 0,
      violations: []
    },
    {
      id: 'cand-04',
      name: 'Aarav Mehta',
      rollNo: '2026-AEGIS-519',
      testTitle: 'IMO Security Tier 1',
      status: 'ACTIVE',
      faceStatus: 'NO_FACE',
      audioLevel: '62 dB',
      fps: 25,
      isFullscreen: false,
      violationsCount: 3,
      violations: [
        {
          id: 'v4',
          type: 'MULTIPLE_FACES_DETECTED',
          message: 'Secondary person detected in candidate background',
          timestamp: '22:40:11',
          snapshotUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
          aiBoxLabel: 'MULTIPLE FACES'
        }
      ]
    }
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState(activeCandidates[0]);
  const [warningMessage, setWarningMessage] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Option B Actions:
  const handleSendWarning = (e, cand = selectedCandidate) => {
    if (e) e.preventDefault();
    if (!warningMessage.trim() && !e) return;
    const msgToSend = warningMessage.trim() || 'Please keep your face centered and maintain focus on the exam screen.';
    showNotice(`Warning alert broadcasted to ${cand.name} (${cand.rollNo})`);
    setWarningMessage('');
  };

  const handleForceBiometricCheck = (candId) => {
    showNotice(`Mandatory Biometric Re-Verification triggered for Candidate ${candId}`);
  };

  const handleDismissViolation = (candId, violationId) => {
    setActiveCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candId) {
          const updatedViolations = c.violations.filter((v) => v.id !== violationId);
          return {
            ...c,
            violations: updatedViolations,
            violationsCount: Math.max(0, updatedViolations.length)
          };
        }
        return c;
      })
    );
    if (selectedCandidate.id === candId) {
      setSelectedCandidate((prev) => {
        const updatedViolations = prev.violations.filter((v) => v.id !== violationId);
        return {
          ...prev,
          violations: updatedViolations,
          violationsCount: Math.max(0, updatedViolations.length)
        };
      });
    }
    setSelectedSnapshot(null);
    showNotice('False positive violation dismissed and counter decremented.');
  };

  const handleForceTerminate = (candId) => {
    if (confirm(`Are you sure you want to FORCE TERMINATE session for candidate ${selectedCandidate.name}?`)) {
      setActiveCandidates((prev) =>
        prev.map((c) => (c.id === candId ? { ...c, status: 'TERMINATED', faceStatus: 'LOCKED' } : c))
      );
      setSelectedCandidate((prev) => ({ ...prev, status: 'TERMINATED', faceStatus: 'LOCKED' }));
      showNotice(`Candidate session force terminated.`);
    }
  };

  // Option C: Helper to compute Risk Level
  const getRiskLevel = (cand) => {
    if (cand.status === 'TERMINATED') return { label: 'TERMINATED', color: 'bg-red-950 text-red-400 border-red-500/40' };
    if (cand.violationsCount >= 2 || !cand.isFullscreen || cand.faceStatus === 'NO_FACE') {
      return { label: 'HIGH RISK', color: 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse' };
    }
    if (cand.violationsCount === 1 || cand.faceStatus !== 'VERIFIED_OK') {
      return { label: 'ELEVATED RISK', color: 'bg-amber-500/15 text-amber-400 border-amber-500/40' };
    }
    return { label: 'LOW RISK', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' };
  };

  if (!isAuthenticated) {
    return (
      <AuthGateModal
        roleTitle="Proctor Command Desk Gateway"
        roleSubtitle="Security personnel authorization required. Enter Super-Admin security key to monitor live candidate feeds."
        expectedPin="9999"
        defaultHint="9999"
        onAuthenticate={handleAuthenticate}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-10 flex flex-col justify-between max-w-7xl mx-auto space-y-6 select-none">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-[10000] p-4 rounded-2xl bg-teal-950 border border-teal-500 text-teal-200 text-xs font-mono shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Zap className="w-4 h-4 text-teal-400 animate-bounce" /> {actionNotice}
        </div>
      )}

      {/* Option A: High-Resolution Snapshot Inspection Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-[20000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full border border-teal-500/40 bg-slate-900/95 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedSnapshot(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
              <Camera className="w-4 h-4" /> Incident Snapshot Verification
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={selectedSnapshot.violation.snapshotUrl}
                alt="Incident Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-red-500/90 text-white font-mono text-[10px] font-bold shadow">
                AI DETECTED: {selectedSnapshot.violation.aiBoxLabel}
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-slate-300 font-mono text-[10px]">
                {selectedSnapshot.violation.timestamp}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-white">{selectedSnapshot.candidate.name} ({selectedSnapshot.candidate.rollNo})</div>
              <div className="text-xs font-mono text-amber-400">{selectedSnapshot.violation.type}: {selectedSnapshot.violation.message}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleDismissViolation(selectedSnapshot.candidate.id, selectedSnapshot.violation.id)}
                className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600 text-emerald-300 font-mono text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Dismiss False Positive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Proctor Desk Command Center</h1>
            <p className="text-xs font-mono text-slate-400">Live Examination Surveillance & Interactive Controls</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Option D: Multi-Grid Mode Switcher */}
          {featureToggles.enableMultiGrid && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode('SINGLE')}
                className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                  viewMode === 'SINGLE' ? 'bg-teal-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" /> Focus View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                  viewMode === 'GRID' ? 'bg-teal-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> 2x2 Grid View
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleLockDesk}
            className="flex items-center gap-2 px-3.5 py-2 bg-red-950/40 border border-red-500/30 hover:border-red-400 text-red-300 font-mono text-xs rounded-xl transition"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" /> Lock Desk
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Portal
          </button>
        </div>
      </header>

      {/* Dedicated Proctor Command Hub & Feature Control Center Section */}
      <section className="glass-panel p-6 rounded-3xl border border-teal-500/30 bg-slate-900/90 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">PROCTOR COMMAND HUB & SURVEILLANCE MODULE CONTROL</h2>
              <p className="text-xs font-mono text-slate-400">Enable or disable monitoring modules according to your institutional convenience</p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-teal-400 bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-500/30">
            <Activity className="w-4 h-4 animate-pulse" /> Active Modules: {Object.values(featureToggles).filter(Boolean).length} / 4
          </div>
        </div>

        {/* 4 Feature Control Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feature 1: Option A */}
          <div
            onClick={() => setFeatureToggles((prev) => ({ ...prev, enableSnapshots: !prev.enableSnapshots }))}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
              featureToggles.enableSnapshots
                ? 'bg-teal-950/40 border-teal-500 text-white shadow-lg'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-400" /> Option A
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                featureToggles.enableSnapshots
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {featureToggles.enableSnapshots ? 'ENABLED ✓' : 'DISABLED ✗'}
              </span>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Incident Snapshots</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Captures timestamped webcam frames on security violations with click-to-enlarge inspection.
              </p>
            </div>
          </div>

          {/* Feature 2: Option B */}
          <div
            onClick={() => setFeatureToggles((prev) => ({ ...prev, enableRemoteActions: !prev.enableRemoteActions }))}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
              featureToggles.enableRemoteActions
                ? 'bg-teal-950/40 border-teal-500 text-white shadow-lg'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Send className="w-4 h-4 text-teal-400" /> Option B
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                featureToggles.enableRemoteActions
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {featureToggles.enableRemoteActions ? 'ENABLED ✓' : 'DISABLED ✗'}
              </span>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Remote Action Suite</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Broadcast candidate warnings, force biometric re-checks, dismiss false alerts, & terminate sessions.
              </p>
            </div>
          </div>

          {/* Feature 3: Option C */}
          <div
            onClick={() => setFeatureToggles((prev) => ({ ...prev, enableRiskBadges: !prev.enableRiskBadges }))}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
              featureToggles.enableRiskBadges
                ? 'bg-teal-950/40 border-teal-500 text-white shadow-lg'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-teal-400" /> Option C
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                featureToggles.enableRiskBadges
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {featureToggles.enableRiskBadges ? 'ENABLED ✓' : 'DISABLED ✗'}
              </span>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">Security Risk Classifier</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Automated Low / Elevated / High Risk AI threat badges with live audio dB & FPS telemetry.
              </p>
            </div>
          </div>

          {/* Feature 4: Option D */}
          <div
            onClick={() => setFeatureToggles((prev) => ({ ...prev, enableMultiGrid: !prev.enableMultiGrid }))}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
              featureToggles.enableMultiGrid
                ? 'bg-teal-950/40 border-teal-500 text-white shadow-lg'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-teal-400" /> Option D
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                featureToggles.enableMultiGrid
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {featureToggles.enableMultiGrid ? 'ENABLED ✓' : 'DISABLED ✗'}
              </span>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">2x2 Multi-Grid View</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Switches between single-candidate focus inspection and a 2x2 multi-feed surveillance grid.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {viewMode === 'GRID' && featureToggles.enableMultiGrid ? (
        /* Option D: 2x2 Multi-Candidate Surveillance Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCandidates.map((cand) => {
            const risk = getRiskLevel(cand);
            return (
              <div key={cand.id} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{cand.name}</h3>
                    <p className="text-xs font-mono text-slate-400">{cand.rollNo}</p>
                  </div>

                  {featureToggles.enableRiskBadges && (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${risk.color}`}>
                      {risk.label}
                    </span>
                  )}
                </div>

                {/* Live Video Canvas Stream */}
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <div className="absolute inset-0 radar-grid opacity-40"></div>
                  <div className="relative z-10 text-center space-y-1">
                    <Eye className="w-8 h-8 text-teal-400 mx-auto animate-pulse" />
                    <div className="text-xs font-mono text-white">LIVE CANDIDATE TELEMETRY</div>
                    <div className="text-[10px] font-mono text-emerald-400">{cand.faceStatus}</div>
                  </div>

                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-slate-300">
                    Audio: {cand.audioLevel} • FPS: {cand.fps}
                  </div>
                </div>

                {/* Option B: Quick Action Suite */}
                {featureToggles.enableRemoteActions && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSendWarning(null, cand)}
                      className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[11px] rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Warn Candidate
                    </button>

                    <button
                      onClick={() => handleForceBiometricCheck(cand.id)}
                      className="py-2 px-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-mono text-[11px] rounded-xl transition flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" /> Re-Verify
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Standard Single Candidate Focus View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Roster Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                <Users className="w-4 h-4 text-teal-400" /> Active Roster ({activeCandidates.length})
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="space-y-3">
              {activeCandidates.map((cand) => {
                const risk = getRiskLevel(cand);
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      selectedCandidate.id === cand.id
                        ? 'bg-teal-950/40 border-teal-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-100">{cand.name}</span>
                      {featureToggles.enableRiskBadges ? (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${risk.color}`}>
                          {risk.label}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {cand.status}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400">{cand.rollNo}</div>
                    <div className="mt-2 text-[11px] font-mono flex items-center justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                      <span>Violations: {cand.violationsCount}</span>
                      <span>Audio: {cand.audioLevel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Selected Focus Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                    {featureToggles.enableRiskBadges && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getRiskLevel(selectedCandidate).color}`}>
                        {getRiskLevel(selectedCandidate).label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-teal-400 mt-0.5">
                    {selectedCandidate.rollNo} • {selectedCandidate.testTitle}
                  </p>
                </div>

                {/* Option B: Action Controls */}
                {featureToggles.enableRemoteActions && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleForceBiometricCheck(selectedCandidate.id)}
                      className="px-3.5 py-2 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-300 font-mono text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Force Biometric Check
                    </button>

                    <button
                      onClick={() => handleForceTerminate(selectedCandidate.id)}
                      disabled={selectedCandidate.status === 'TERMINATED'}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold rounded-xl text-xs disabled:opacity-40 shadow-lg shadow-red-500/20 transition"
                    >
                      <Lock className="w-4 h-4" /> Force Terminate
                    </button>
                  </div>
                )}
              </div>

              {/* Simulated Live Video Canvas */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 radar-grid opacity-50"></div>
                <div className="relative z-10 text-center space-y-2">
                  <Eye className="w-12 h-12 text-teal-400 mx-auto animate-pulse" />
                  <div className="text-sm font-mono text-white tracking-wider">LIVE AI WEBCAM TELEMETRY STREAM</div>
                  <div className="text-xs font-mono text-emerald-400">FACE POSE: {selectedCandidate.faceStatus}</div>
                </div>

                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-900/90 text-xs font-mono text-slate-300 border border-slate-800 flex items-center gap-3">
                  <span>Audio: <strong className="text-teal-400">{selectedCandidate.audioLevel}</strong></span>
                  <span>FPS: <strong className="text-emerald-400">{selectedCandidate.fps}</strong></span>
                  <span>Fullscreen: <strong className={selectedCandidate.isFullscreen ? 'text-emerald-400' : 'text-red-400'}>{selectedCandidate.isFullscreen ? 'ACTIVE ✓' : 'EXITED ✗'}</strong></span>
                </div>
              </div>
            </div>

            {/* Warning Broadcast Form & Option A Incident Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option B: Warning Broadcast Form */}
              {featureToggles.enableRemoteActions ? (
                <form onSubmit={handleSendWarning} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-teal-400" /> Broadcast Remote Warning Popup
                  </h4>
                  <textarea
                    rows={3}
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    placeholder="Enter custom warning to pop up on candidate screen..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" /> Send Warning Notification
                  </button>
                </form>
              ) : (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-xs font-mono text-slate-500 flex items-center justify-center">
                  Remote Action Controls disabled in Feature Toggle Bar.
                </div>
              )}

              {/* Option A: Candidate Incident History & Snapshot Gallery */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-400" /> Violation Timeline & Snapshots
                </h4>
                {selectedCandidate.violations.length === 0 ? (
                  <div className="text-xs font-mono text-slate-500 py-6 text-center">
                    No violations logged for this session.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedCandidate.violations.map((v) => (
                      <div key={v.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-400 font-bold">[{v.timestamp}] {v.type}</span>
                          {featureToggles.enableRemoteActions && (
                            <button
                              type="button"
                              onClick={() => handleDismissViolation(selectedCandidate.id, v.id)}
                              className="text-[10px] text-emerald-400 hover:underline"
                            >
                              Dismiss False Positive
                            </button>
                          )}
                        </div>
                        <div className="text-slate-300">{v.message}</div>

                        {/* Option A Snapshot Frame Thumbnail */}
                        {featureToggles.enableSnapshots && v.snapshotUrl && (
                          <div
                            onClick={() => setSelectedSnapshot({ candidate: selectedCandidate, violation: v })}
                            className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:border-teal-500 transition group"
                          >
                            <img src={v.snapshotUrl} alt="Snapshot" className="w-full h-full object-cover group-hover:scale-105 transition" />
                            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <span className="px-2 py-1 bg-teal-600 text-white rounded text-[10px] font-bold">Inspect Frame</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
