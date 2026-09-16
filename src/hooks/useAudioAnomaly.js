import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Web Audio API Microphone RMS Sound & Noise Spike Monitor Hook
 */
export function useAudioAnomaly({
  enabled = true,
  onAudioAnomaly,
  decibelThreshold = 65,
}) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const [audioState, setAudioState] = useState({
    isMicActive: false,
    decibels: 0,
    peakDecibels: 0,
    isSpeechDetected: false,
    micError: null,
  });

  const onAudioAnomalyRef = useRef(onAudioAnomaly);
  useEffect(() => {
    onAudioAnomalyRef.current = onAudioAnomaly;
  }, [onAudioAnomaly]);

  // Start Mic Audio Analysis
  const startMic = useCallback(async () => {
    if (!enabled || typeof window === 'undefined') return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setAudioState((prev) => ({ ...prev, isMicActive: true, micError: null }));

      // Continuously monitor RMS level with sustained spike duration & cooldown
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let spikeFrameCount = 0;
      let lastViolationTime = 0;

      const analyzeAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        // Normalize RMS to 0 - 100 dB scale approximation
        const db = Math.min(100, Math.floor((rms / 128) * 100));

        const isSpike = db > decibelThreshold;
        if (isSpike) {
          spikeFrameCount++;
        } else {
          spikeFrameCount = Math.max(0, spikeFrameCount - 2);
        }

        setAudioState((prev) => ({
          ...prev,
          decibels: db,
          peakDecibels: Math.max(prev.peakDecibels, db),
          isSpeechDetected: isSpike,
        }));

        // Require sustained noise spike for at least ~90 frames (~1.5s) with a 10s cooldown
        const now = Date.now();
        if (spikeFrameCount >= 90 && now - lastViolationTime > 10000 && onAudioAnomalyRef.current) {
          lastViolationTime = now;
          spikeFrameCount = 0;
          onAudioAnomalyRef.current('AUDIO_NOISE_SPIKE', `Sustained high mic noise anomaly: ${db} dB (Threshold: ${decibelThreshold} dB).`);
        }

        animFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();
      return true;
    } catch (err) {
      console.error('Microphone access error:', err);
      setAudioState((prev) => ({
        ...prev,
        isMicActive: false,
        micError: 'Microphone access denied or audio input unavailable.',
      }));
      return false;
    }
  }, [enabled, decibelThreshold]);

  // Stop Mic Analysis
  const stopMic = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setAudioState((prev) => ({ ...prev, isMicActive: false, decibels: 0 }));
  }, []);

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  return {
    ...audioState,
    startMic,
    stopMic,
  };
}
