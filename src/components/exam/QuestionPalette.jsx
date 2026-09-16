'use client';

import React from 'react';
import { Grid } from 'lucide-react';

export function QuestionPalette({
  questions = [],
  currentIndex,
  userAnswers = {},
  markedForReview = {},
  onSelectQuestion,
}) {
  const answeredCount = Object.keys(userAnswers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const unattemptedCount = questions.length - answeredCount;

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Question Palette</h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Total: {questions.length}</span>
      </div>

      {/* Grid Status Legend */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-teal-500 border border-teal-400"></span> Answered ({answeredCount})
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-purple-500 border border-purple-400"></span> Review ({reviewCount})
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700"></span> Unanswered ({unattemptedCount})
        </div>
      </div>

      {/* Interactive Question Grid Buttons */}
      <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = !!userAnswers[q.id];
          const isMarked = !!markedForReview[q.id];

          let styleClass = 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700';

          if (isCurrent) {
            styleClass = 'ring-2 ring-teal-400 border-teal-500 text-white font-extrabold bg-slate-900';
          } else if (isMarked) {
            styleClass = 'bg-purple-950/80 text-purple-300 border-purple-500/60 font-semibold';
          } else if (isAnswered) {
            styleClass = 'bg-teal-950/80 text-teal-300 border-teal-500/60 font-semibold';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`h-9 rounded-xl font-mono text-xs border transition flex items-center justify-center ${styleClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
