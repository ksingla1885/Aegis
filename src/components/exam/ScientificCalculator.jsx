'use client';

import React, { useState } from 'react';
import { Calculator, X, Delete } from 'lucide-react';

export function ScientificCalculator({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(null);

  if (!isOpen) return null;

  const handleAppend = (val) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
  };

  const handleClear = () => setDisplay('0');

  const handleBackspace = () => {
    setDisplay((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  };

  const handleCalculate = () => {
    try {
      let sanitized = display
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(');

      // Evaluate math string safely
      const result = Function(`"use strict"; return (${sanitized})`)();
      setDisplay(String(Number(result.toFixed(6))));
    } catch (e) {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9995] max-w-xs w-full glass-panel-glow p-4 rounded-3xl border border-teal-500/40 shadow-2xl bg-slate-950/95 font-mono animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
          <Calculator className="w-4 h-4" /> Scientific Calculator
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Display */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-right text-lg font-bold text-teal-300 font-mono overflow-x-auto mb-3 shadow-inner">
        {display}
      </div>

      {/* Calculator Buttons Grid */}
      <div className="grid grid-cols-4 gap-1.5 text-xs">
        <button onClick={handleClear} className="p-2 rounded-lg bg-red-950/60 text-red-300 border border-red-500/40 font-bold">C</button>
        <button onClick={handleBackspace} className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 flex items-center justify-center"><Delete className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleAppend('π')} className="p-2 rounded-lg bg-slate-900 text-teal-300 border border-slate-800">π</button>
        <button onClick={() => handleAppend('/')} className="p-2 rounded-lg bg-teal-950/60 text-teal-300 border border-teal-500/40 font-bold">÷</button>

        <button onClick={() => handleAppend('sin(')} className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">sin</button>
        <button onClick={() => handleAppend('cos(')} className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">cos</button>
        <button onClick={() => handleAppend('tan(')} className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">tan</button>
        <button onClick={() => handleAppend('*')} className="p-2 rounded-lg bg-teal-950/60 text-teal-300 border border-teal-500/40 font-bold">×</button>

        <button onClick={() => handleAppend('sqrt(')} className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">√</button>
        <button onClick={() => handleAppend('log(')} className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">log</button>
        <button onClick={() => handleAppend('ln(')} className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">ln</button>
        <button onClick={() => handleAppend('-')} className="p-2 rounded-lg bg-teal-950/60 text-teal-300 border border-teal-500/40 font-bold">-</button>

        <button onClick={() => handleAppend('7')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">7</button>
        <button onClick={() => handleAppend('8')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">8</button>
        <button onClick={() => handleAppend('9')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">9</button>
        <button onClick={() => handleAppend('+')} className="p-2 rounded-lg bg-teal-950/60 text-teal-300 border border-teal-500/40 font-bold">+</button>

        <button onClick={() => handleAppend('4')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">4</button>
        <button onClick={() => handleAppend('5')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">5</button>
        <button onClick={() => handleAppend('6')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">6</button>
        <button onClick={handleCalculate} className="row-span-2 p-2 rounded-lg bg-gradient-to-b from-teal-600 to-emerald-600 text-white font-extrabold shadow-lg flex items-center justify-center text-base">=</button>

        <button onClick={() => handleAppend('1')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">1</button>
        <button onClick={() => handleAppend('2')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">2</button>
        <button onClick={() => handleAppend('3')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">3</button>

        <button onClick={() => handleAppend('0')} className="col-span-2 p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">0</button>
        <button onClick={() => handleAppend('.')} className="p-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">.</button>
      </div>
    </div>
  );
}
