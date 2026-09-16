'use client';

import React from 'react';
import { Bookmark, BookmarkCheck, RotateCcw, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';

export function QuestionViewer({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer, // string (MCQ), array (MSQ), or string (Subjective)
  selectedOptionId, // fallback prop alias
  isMarkedForReview,
  onSelectOption,
  onToggleMarkForReview,
  onClearResponse,
  onNext,
  onPrev,
}) {
  if (!question) return null;

  const activeAnswer = selectedAnswer !== undefined ? selectedAnswer : selectedOptionId;
  const isMSQ = question.type === 'MSQ';
  const isSubjective = question.type === 'SUBJECTIVE';
  const isMCQ = !isMSQ && !isSubjective;

  const handleMSQToggle = (optId) => {
    const currentList = Array.isArray(activeAnswer) ? activeAnswer : [];
    if (currentList.includes(optId)) {
      onSelectOption(currentList.filter((id) => id !== optId));
    } else {
      onSelectOption([...currentList, optId]);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between h-full min-h-[480px]">
      <div>
        {/* Question Header & Subject Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono font-bold text-xs rounded-lg">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-xs rounded-lg">
              {question.subject || 'General'}
            </span>
            <span className="text-xs text-slate-400 font-mono">[{question.points} Points]</span>
            {isMSQ && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[10px] rounded">
                MULTI-SELECT (Select all true options)
              </span>
            )}
            {isSubjective && (
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono text-[10px] rounded">
                SUBJECTIVE ESSAY
              </span>
            )}
          </div>

          <button
            onClick={onToggleMarkForReview}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs border transition ${
              isMarkedForReview
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {isMarkedForReview ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-purple-400" /> Marked for Review
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" /> Mark for Review
              </>
            )}
          </button>
        </div>

        {/* Question Text */}
        <div className="py-5">
          <h2 className="text-lg font-medium text-slate-100 leading-relaxed font-sans select-none whitespace-pre-line">
            {question.text}
          </h2>
        </div>

        {/* Render Subjective Essay Field */}
        {isSubjective ? (
          <div className="space-y-2">
            <textarea
              rows={6}
              value={typeof activeAnswer === 'string' ? activeAnswer : ''}
              onChange={(e) => onSelectOption(e.target.value)}
              placeholder="Write your explanation response here..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 font-sans leading-relaxed select-text"
            />
            <div className="text-right text-xs font-mono text-slate-400">
              Word Count: {(typeof activeAnswer === 'string' ? activeAnswer.trim().split(/\s+/).filter(Boolean).length : 0)} / {question.wordLimit || 250} Words
            </div>
          </div>
        ) : (
          /* Render Options (MCQ or MSQ) */
          <div className="space-y-3 my-2">
            {question.options.map((opt, idx) => {
              const isSelected = isMSQ
                ? Array.isArray(activeAnswer) && activeAnswer.includes(opt.id)
                : activeAnswer === opt.id;

              const letter = String.fromCharCode(65 + idx);

              return (
                <div
                  key={opt.id}
                  onClick={() => (isMSQ ? handleMSQToggle(opt.id) : onSelectOption(opt.id))}
                  className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3.5 select-none active:scale-[0.98] ${
                    isSelected
                      ? 'bg-gradient-to-r from-teal-950/70 to-slate-900 border-teal-500 shadow-md shadow-teal-500/15 text-white ring-1 ring-teal-500/50'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 border-teal-400 font-extrabold shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {isMSQ ? (
                        isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />
                      ) : (
                        letter
                      )}
                    </div>
                    <div className="text-sm pt-0.5 leading-relaxed font-sans">{opt.text}</div>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded-full shrink-0 animate-in fade-in zoom-in duration-150">
                      SAVED ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Navigation Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={onClearResponse}
          disabled={!activeAnswer || (Array.isArray(activeAnswer) && activeAnswer.length === 0)}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear Selection
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 text-slate-200 font-semibold rounded-xl text-xs disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
            className="flex items-center gap-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold rounded-xl text-xs disabled:opacity-30 disabled:pointer-events-none transition-all duration-150 shadow-md shadow-teal-500/20"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
