'use client';

import React, { useEffect, useRef } from 'react';
import { generateCandidateHash } from '@/lib/crypto';

export function DynamicWatermark({ candidateName = "Candidate", rollNo = "2026-REG-991", testId = "AEGIS-TEST" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hash = generateCandidateHash(candidateName, rollNo, testId);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '500 13px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';

      const text = `${candidateName.toUpperCase()} • ${rollNo} • ${hash}`;
      const stepX = 320;
      const stepY = 160;

      ctx.save();
      ctx.rotate((-20 * Math.PI) / 180);

      for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [candidateName, rollNo, testId]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] opacity-90"
      aria-hidden="true"
    />
  );
}
