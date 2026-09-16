'use client';

import { HelpCircle, CheckCircle2, AlertTriangle, Send, Loader2 } from 'lucide-react';

export function ExitConfirmation({
  isOpen,
  totalQuestions,
  answeredCount,
  unansweredCount,
  markedCount,
  isSubmitting = false,
  onConfirmSubmit,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-slate-800 bg-slate-900/95 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Final Exam Submission</h3>
            <p className="text-xs text-slate-400 font-mono">Verify your response breakdown</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30">
            <div className="text-lg font-bold text-teal-400 font-mono">{answeredCount}</div>
            <div className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Answered</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30">
            <div className="text-lg font-bold text-amber-400 font-mono">{unansweredCount}</div>
            <div className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Unanswered</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30">
            <div className="text-lg font-bold text-purple-400 font-mono">{markedCount}</div>
            <div className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Marked</div>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>You have {unansweredCount} unanswered questions remaining. Once submitted, your payload is finalized and graded.</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 text-slate-300 font-semibold rounded-xl text-xs transition disabled:opacity-50"
          >
            Continue Exam
          </button>
          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all duration-150 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-200" /> Encrypting Payload...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Confirm & Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
