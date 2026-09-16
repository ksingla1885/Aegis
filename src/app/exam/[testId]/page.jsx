'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAegisSecurity } from '@/hooks/useAegisSecurity';
import { useFaceTracking } from '@/hooks/useFaceTracking';
import { useAudioAnomaly } from '@/hooks/useAudioAnomaly';
import { DynamicWatermark } from '@/components/security/DynamicWatermark';
import { SecurityOverlay } from '@/components/security/SecurityOverlay';
import { WebcamMonitor } from '@/components/security/WebcamMonitor';
import { AudioMonitor } from '@/components/security/AudioMonitor';
import { ProctorTimeline } from '@/components/security/ProctorTimeline';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { QuestionViewer } from '@/components/exam/QuestionViewer';
import { QuestionPalette } from '@/components/exam/QuestionPalette';
import { ExitConfirmation } from '@/components/exam/ExitConfirmation';
import { shuffleArrayWithSeed, encryptDraftPayload } from '@/lib/crypto';
import { ShieldCheck, Lock, Activity, Loader2, CheckCircle2 } from 'lucide-react';

export default function ExamRunnerPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const testId = resolvedParams.testId;

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [rollNo, setRollNo] = useState('2026-REG-901');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Security Proctoring Hooks
  const security = useAegisSecurity({
    testId,
    maxViolations: test ? test.maxViolationsAllowed : 3,
    onAutoSubmit: (reason) => handleFinalSubmission(reason),
    enabled: !isLoading && !!test,
  });

  const faceTracking = useFaceTracking({
    enabled: !isLoading && !!test,
    onFaceAnomaly: (type, message) => security.recordViolation(type, message, 'HIGH'),
  });

  const audioAnomaly = useAudioAnomaly({
    enabled: !isLoading && !!test,
    onAudioAnomaly: (type, message) => security.recordViolation(type, message, 'MEDIUM'),
  });

  // Submit Handler
  const handleFinalSubmission = useCallback(async (terminationReason = null) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Stop hardware camera and mic streams immediately on test submission
    if (faceTracking && faceTracking.stopCamera) faceTracking.stopCamera();
    if (audioAnomaly && audioAnomaly.stopMic) audioAnomaly.stopMic();

    try {
      const payload = {
        userAnswers,
        violations: security.violations || [],
        candidateName,
        rollNo,
        timeSpentSeconds: test ? test.durationMinutes * 60 - timeRemaining : 0,
        terminationReason,
        customTest: test,
      };

      const res = await fetch(`/api/exam/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('aegis_last_result', JSON.stringify(data.result));
        router.push(`/results/${data.result.attemptId}`);
      } else {
        alert('Failed to submit exam: ' + data.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Submission Error:', err);
      setIsSubmitting(false);
    }
  }, [isSubmitting, userAnswers, candidateName, rollNo, test, timeRemaining, testId, router, faceTracking, audioAnomaly, security]);

  // Fetch BOLA-Stripped Test Questions on Mount
  useEffect(() => {
    const name = sessionStorage.getItem('aegis_candidate_name') || 'Ketan Singla';
    const roll = sessionStorage.getItem('aegis_roll_no') || '2026-AEGIS-901';
    setCandidateName(name);
    setRollNo(roll);

    async function loadTestPayload() {
      try {
        const res = await fetch(`/api/exam/${testId}`);
        const data = await res.json();

        if (data.success) {
          const testData = data.test;
          setTest(testData);
          setTimeRemaining(testData.durationMinutes * 60);

          // Seed-randomize questions and options sequence per candidate
          const candidateSeed = `${name}_${roll}_${testId}`;
          const shuffled = shuffleArrayWithSeed(testData.questions, candidateSeed).map((q, idx) => ({
            ...q,
            options: shuffleArrayWithSeed(q.options, `${candidateSeed}_q${idx}`),
          }));

          setQuestions(shuffled);
          setIsLoading(false);
        } else {
          // Check local custom exams created via Examiner Studio
          const customExams = JSON.parse(localStorage.getItem('aegis_custom_exams') || '[]');
          const match = customExams.find(
            (t) =>
              t.id.toLowerCase() === testId.toLowerCase() ||
              (t.code && t.code.toLowerCase() === testId.toLowerCase())
          );

          if (match) {
            setTest(match);
            setTimeRemaining(match.durationMinutes * 60);
            const candidateSeed = `${name}_${roll}_${testId}`;
            const shuffled = shuffleArrayWithSeed(match.questions, candidateSeed).map((q, idx) => ({
              ...q,
              options: q.options ? shuffleArrayWithSeed(q.options, `${candidateSeed}_q${idx}`) : [],
            }));
            setQuestions(shuffled);
            setIsLoading(false);
          } else {
            alert('Test paper not found!');
            router.push('/');
          }
        }
      } catch (e) {
        console.error('Error fetching test:', e);
      }
    }

    loadTestPayload();
  }, [testId, router]);

  // Start Proctoring Media Feeds after Loading
  useEffect(() => {
    if (!isLoading && test) {
      security.requestFullscreenLock();
      faceTracking.startCamera();
      audioAnomaly.startMic();
    }
    return () => {
      if (faceTracking && faceTracking.stopCamera) faceTracking.stopCamera();
      if (audioAnomaly && audioAnomaly.stopMic) audioAnomaly.stopMic();
    };
  }, [isLoading, test]);

  // Timer Countdown Effect
  useEffect(() => {
    if (isLoading || timeRemaining <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmission('TIME_EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, timeRemaining, isSubmitting, handleFinalSubmission]);

  // Encrypted Local Draft Auto-Sync
  useEffect(() => {
    if (Object.keys(userAnswers).length > 0) {
      const encrypted = encryptDraftPayload({ userAnswers, markedForReview });
      if (encrypted) {
        localStorage.setItem(`aegis_draft_${testId}`, encrypted);
      }
    }
  }, [userAnswers, markedForReview, testId]);

  if (isLoading || !test) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 animate-spin">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Engaging Aegis Security Controls</h2>
        <p className="text-xs font-mono text-slate-400">Loading BOLA-stripped question payload & seed shuffling...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Tiled Identity Security Watermark */}
      <DynamicWatermark candidateName={candidateName} rollNo={rollNo} testId={test.code} />

      {/* Security Lockout / Fullscreen Overlay */}
      <SecurityOverlay
        isFullscreen={security.isFullscreen}
        isTabFocused={security.isTabFocused}
        isLockedOut={security.isLockedOut}
        violationCount={security.violationCount}
        maxViolations={test.maxViolationsAllowed}
        lastWarningMessage={security.lastWarningMessage}
        onRequestFullscreen={() => security.requestFullscreenLock()}
      />

      {/* Exam Header */}
      <ExamHeader
        testTitle={test.title}
        testCode={test.code}
        timeRemainingSeconds={timeRemaining}
        candidateName={candidateName}
        rollNo={rollNo}
        violationCount={security.violationCount}
        maxViolations={test.maxViolationsAllowed}
        allowCalculator={test.securityPolicy?.allowCalculator ?? true}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />


      {/* Main Workspace Layout */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-auto">
        {/* Left Column: Active Question View */}
        <div className="lg:col-span-8">
          <QuestionViewer
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedAnswer={userAnswers[currentQuestion?.id]}
            isMarkedForReview={!!markedForReview[currentQuestion?.id]}
            onSelectOption={(optId) => setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: optId }))}
            onToggleMarkForReview={() =>
              setMarkedForReview((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))
            }
            onClearResponse={() =>
              setUserAnswers((prev) => {
                const updated = { ...prev };
                delete updated[currentQuestion.id];
                return updated;
              })
            }
            onNext={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          />
        </div>

        {/* Right Column: Proctor Monitors & Question Grid */}
        <div className="lg:col-span-4 space-y-4">
          <WebcamMonitor
            videoRef={faceTracking.videoRef}
            isStreamActive={faceTracking.isStreamActive}
            faceDetected={faceTracking.faceDetected}
            faceCount={faceTracking.faceCount}
            orientation={faceTracking.orientation}
            confidence={faceTracking.confidence}
            cameraError={faceTracking.cameraError}
          />

          <AudioMonitor
            isMicActive={audioAnomaly.isMicActive}
            decibels={audioAnomaly.decibels}
            peakDecibels={audioAnomaly.peakDecibels}
            isSpeechDetected={audioAnomaly.isSpeechDetected}
            micError={audioAnomaly.micError}
          />

          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            markedForReview={markedForReview}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
          />

          <ProctorTimeline
            violations={security.violations}
            maxViolations={test.maxViolationsAllowed}
          />
        </div>
      </main>

      {/* Final Exit Submission Confirmation Modal */}
      <ExitConfirmation
        isOpen={isSubmitModalOpen}
        totalQuestions={questions.length}
        answeredCount={Object.keys(userAnswers).length}
        unansweredCount={questions.length - Object.keys(userAnswers).length}
        markedCount={Object.values(markedForReview).filter(Boolean).length}
        isSubmitting={isSubmitting}
        onConfirmSubmit={() => {
          handleFinalSubmission();
        }}
        onClose={() => setIsSubmitModalOpen(false)}
      />

      {/* Full-Screen High-Tech Submission Processing Visualizer Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[20000] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
          {/* Background Radial Glow */}
          <div className="absolute w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

          <div className="glass-panel p-8 md:p-10 rounded-3xl max-w-lg w-full border border-teal-500/40 bg-slate-900/95 shadow-2xl relative space-y-6 flex flex-col items-center">
            {/* Spinning Lock & Shield Icon */}
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/20">
                <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 text-slate-950 rounded-xl shadow-lg animate-bounce">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-full text-[10px] font-mono uppercase tracking-wider">
                AEGIS CRYPTOGRAPHIC SUBMISSION ENGINE
              </span>
              <h2 className="text-2xl font-extrabold text-white pt-2">Submitting Examination</h2>
              <p className="text-xs text-slate-400 font-mono">Encrypting responses and generating official scorecard...</p>
            </div>

            {/* Step Checklist */}
            <div className="w-full space-y-2.5 text-left pt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 flex items-center gap-2.5 shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 animate-pulse" />
                <span>Encrypting candidate responses & score vector</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 flex items-center gap-2.5 shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                <span>Deactivating webcam & mic proctoring streams</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 flex items-center gap-2.5 shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span>Transmitting payload to Aegis Security Server...</span>
              </div>
            </div>

            {/* Glowing Loading Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 h-full w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
