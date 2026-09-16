import { useState, useEffect, useRef, useCallback } from 'react';

// Dynamic loader for TensorFlow.js + BlazeFace model
let blazefaceLoadingPromise = null;

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve();
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

async function getBlazeFaceModel() {
  if (typeof window === 'undefined') return null;
  if (window.blazefaceModel) return window.blazefaceModel;

  if (!blazefaceLoadingPromise) {
    blazefaceLoadingPromise = (async () => {
      try {
        if (!window.tf) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js');
        }
        if (!window.blazeface) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js');
        }
        if (window.blazeface && !window.blazefaceModel) {
          window.blazefaceModel = await window.blazeface.load();
        }
        return window.blazefaceModel;
      } catch (err) {
        console.warn('BlazeFace AI model load failed, using multi-cluster canvas fallback:', err);
        return null;
      }
    })();
  }
  return blazefaceLoadingPromise;
}

/**
 * AI Vision Hook for Candidate Face Presence, Multiple Face Detection & Head Pose Tracking
 */
export function useFaceTracking({
  enabled = true,
  onFaceAnomaly,
  checkIntervalMs = 1500,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [faceState, setFaceState] = useState({
    isStreamActive: false,
    faceDetected: true,
    faceCount: 1,
    orientation: 'CENTERED', // 'CENTERED' | 'LOOKING_LEFT' | 'LOOKING_RIGHT' | 'LOOKING_DOWN' | 'ABSENT'
    confidence: 95,
    cameraError: null,
  });

  const onFaceAnomalyRef = useRef(onFaceAnomaly);
  useEffect(() => {
    onFaceAnomalyRef.current = onFaceAnomaly;
  }, [onFaceAnomaly]);

  // Load BlazeFace model on mount
  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      getBlazeFaceModel();
    }
  }, [enabled]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    if (!enabled || typeof window === 'undefined') return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        }
        try {
          await videoRef.current.play();
        } catch (playErr) {
          // Ignore DOMException AbortError caused by rapid stream re-assignment
          if (playErr.name !== 'AbortError') {
            console.warn('Camera video play interrupted:', playErr);
          }
        }
      }

      setFaceState((prev) => ({ ...prev, isStreamActive: true, cameraError: null }));
      return true;
    } catch (err) {
      console.error('Camera access error:', err);
      setFaceState((prev) => ({
        ...prev,
        isStreamActive: false,
        cameraError: 'Camera permission denied or camera unavailable.',
      }));
      return false;
    }
  }, [enabled]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setFaceState((prev) => ({ ...prev, isStreamActive: false }));
  }, []);

  const consecutiveAnomalyRef = useRef({});

  // Fallback Grid-based Connected Component Spatial Cluster Analysis
  const analyzeCanvasGridClusters = useCallback((ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const cols = 16;
    const rows = 12;
    const cellW = width / cols;
    const cellH = height / rows;
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    let totalActivePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      const isSubjectPixel =
        (y > 30 && y < 230 && cr > 130 && cr < 175 && cb > 75 && cb < 138) ||
        (r > 50 && g > 35 && b > 20 && r - g > 5 && r - b > 10);

      if (isSubjectPixel) {
        totalActivePixels++;
        const pixelIdx = i / 4;
        const x = pixelIdx % width;
        const yPos = Math.floor(pixelIdx / width);

        const col = Math.min(cols - 1, Math.floor(x / cellW));
        const row = Math.min(rows - 1, Math.floor(yPos / cellH));
        grid[row][col]++;
      }
    }

    const cellArea = cellW * cellH;
    const activeGrid = Array.from({ length: rows }, () => Array(cols).fill(false));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] / cellArea > 0.18) {
          activeGrid[r][c] = true;
        }
      }
    }

    // Connected Component Labeling (BFS)
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const clusters = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (activeGrid[r][c] && !visited[r][c]) {
          const clusterCells = [];
          const queue = [[r, c]];
          visited[r][c] = true;

          while (queue.length > 0) {
            const [currR, currC] = queue.shift();
            clusterCells.push({ r: currR, c: currC });

            const neighbors = [
              [currR - 1, currC],
              [currR + 1, currC],
              [currR, currC - 1],
              [currR, currC + 1],
            ];

            for (const [nr, nc] of neighbors) {
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && activeGrid[nr][nc] && !visited[nr][nc]) {
                visited[nr][nc] = true;
                queue.push([nr, nc]);
              }
            }
          }

          // Keep clusters with at least 3 grid cells (~300 active pixels)
          if (clusterCells.length >= 3) {
            let sumC = 0;
            let sumR = 0;
            clusterCells.forEach((cell) => {
              sumC += cell.c * cellW + cellW / 2;
              sumR += cell.r * cellH + cellH / 2;
            });
            clusters.push({
              size: clusterCells.length,
              centroidX: sumC / clusterCells.length,
              centroidY: sumR / clusterCells.length,
            });
          }
        }
      }
    }

    // Filter clusters by distance: distinct faces must have centroids > 35px apart
    const distinctClusters = [];
    for (const cl of clusters) {
      const isDuplicate = distinctClusters.some(
        (existing) => Math.hypot(existing.centroidX - cl.centroidX, existing.centroidY - cl.centroidY) < 35
      );
      if (!isDuplicate) {
        distinctClusters.push(cl);
      }
    }

    const ratio = totalActivePixels / (width * height);
    let detected = ratio >= 0.03 || distinctClusters.length > 0;
    let faceCount = distinctClusters.length;
    let orientation = 'CENTERED';

    if (!detected || faceCount === 0) {
      detected = false;
      faceCount = 0;
      orientation = 'ABSENT';
    } else if (faceCount === 1) {
      const mainCluster = distinctClusters[0];
      const centerX = width / 2;
      const centerY = height / 2;
      const diffX = mainCluster.centroidX - centerX;
      const diffY = mainCluster.centroidY - centerY;

      if (diffX < -32) orientation = 'LOOKING_LEFT';
      else if (diffX > 32) orientation = 'LOOKING_RIGHT';
      else if (diffY > 28) orientation = 'LOOKING_DOWN';
    }

    const conf = detected ? Math.min(99, Math.max(75, Math.floor(ratio * 220))) : 30;

    return { faceDetected: detected, faceCount, orientation, confidence: conf };
  }, []);

  // Frame Processing Function
  const processFrame = useCallback(async () => {
    if (isProcessingRef.current || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    isProcessingRef.current = true;

    try {
      let detected = true;
      let faceCount = 1;
      let orientation = 'CENTERED';
      let confidence = 95;

      const model = await getBlazeFaceModel();

      if (model) {
        // AI Model Detection (BlazeFace)
        const predictions = await model.estimateFaces(video, false);
        faceCount = predictions.length;

        if (faceCount === 0) {
          detected = false;
          orientation = 'ABSENT';
          confidence = 25;
        } else {
          detected = true;
          confidence = Math.min(99, Math.max(80, Math.round((predictions[0].probability?.[0] || 0.95) * 100)));

          if (faceCount === 1) {
            const landmarks = predictions[0].landmarks;
            if (landmarks && landmarks.length >= 4) {
              const rightEye = landmarks[0]; // [x, y]
              const leftEye = landmarks[1];  // [x, y]
              const nose = landmarks[2];     // [x, y]
              const mouth = landmarks[3];    // [x, y]

              const eyeMidX = (rightEye[0] + leftEye[0]) / 2;
              const eyeMidY = (rightEye[1] + leftEye[1]) / 2;
              const eyeDist = Math.hypot(leftEye[0] - rightEye[0], leftEye[1] - rightEye[1]) || 1;

              const dx = (nose[0] - eyeMidX) / eyeDist;
              const dy = (nose[1] - eyeMidY) / eyeDist;

              if (dx < -0.26) orientation = 'LOOKING_LEFT';
              else if (dx > 0.26) orientation = 'LOOKING_RIGHT';
              else if (dy > 0.75 || Math.abs(mouth[1] - nose[1]) < eyeDist * 0.22) orientation = 'LOOKING_DOWN';
              else orientation = 'CENTERED';
            }
          }
        }
      } else {
        // Fallback Canvas Vision Grid Cluster Processing
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        canvas.width = 160;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const fallbackRes = analyzeCanvasGridClusters(ctx, canvas.width, canvas.height);
          detected = fallbackRes.faceDetected;
          faceCount = fallbackRes.faceCount;
          orientation = fallbackRes.orientation;
          confidence = fallbackRes.confidence;
        }
      }

      setFaceState((prev) => ({
        ...prev,
        faceDetected: detected,
        orientation,
        confidence,
        faceCount,
      }));

      // Security Anomaly Debouncing
      const currentAnomaly = !detected
        ? 'FACE_ABSENT'
        : orientation !== 'CENTERED'
        ? 'HEAD_POSE_ANOMALY'
        : faceCount > 1
        ? 'MULTIPLE_FACES_DETECTED'
        : null;

      if (currentAnomaly) {
        const count = (consecutiveAnomalyRef.current[currentAnomaly] || 0) + 1;
        consecutiveAnomalyRef.current = { [currentAnomaly]: count };

        // 2 consecutive ticks (~3s) to trigger anomaly warning
        const threshold = currentAnomaly === 'MULTIPLE_FACES_DETECTED' ? 2 : 2;

        if (count >= threshold && onFaceAnomalyRef.current) {
          let msg = 'Vision security anomaly detected.';
          if (currentAnomaly === 'FACE_ABSENT') msg = 'No candidate face detected in camera stream.';
          if (currentAnomaly === 'HEAD_POSE_ANOMALY') msg = `Candidate repeatedly looking away (${orientation}).`;
          if (currentAnomaly === 'MULTIPLE_FACES_DETECTED') msg = `Multiple subjects detected (${faceCount} faces in camera view).`;

          onFaceAnomalyRef.current(currentAnomaly, msg);
          consecutiveAnomalyRef.current = {};
        }
      } else {
        consecutiveAnomalyRef.current = {};
      }
    } catch (err) {
      console.error('Frame processing error:', err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [analyzeCanvasGridClusters]);

  useEffect(() => {
    if (faceState.isStreamActive && enabled) {
      timerRef.current = setInterval(processFrame, checkIntervalMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [faceState.isStreamActive, enabled, checkIntervalMs, processFrame]);

  return {
    ...faceState,
    videoRef,
    startCamera,
    stopCamera,
  };
}
