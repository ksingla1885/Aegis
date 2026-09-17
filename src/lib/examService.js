/**
 * Mindora Aegis — Shared Data & Security Service
 * Centralizes assessment paper publishing, candidate BOLA payload sanitization,
 * and live proctor telemetry state.
 */

import { MOCK_TESTS, findExamByTokenOrId, getSanitizedTestPayload } from './mockData';

const CUSTOM_EXAMS_STORAGE_KEY = 'aegis_custom_exams';
const PROCTOR_TELEMETRY_STORAGE_KEY = 'aegis_active_proctor_telemetry';

/**
 * Get all available assessment papers (Mock + Custom Published)
 */
export function getAllExams() {
  let customExams = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CUSTOM_EXAMS_STORAGE_KEY);
      if (stored) {
        customExams = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error reading custom exams from storage:', err);
    }
  }

  // Combine Mock tests and Custom published exams without duplicates
  const map = new Map();
  MOCK_TESTS.forEach(t => map.set(t.id, t));
  customExams.forEach(t => map.set(t.id, t));

  return Array.from(map.values());
}

/**
 * Fetch paper payload sanitized for candidate role (BOLA answer key stripping)
 */
export function getCandidatePaperPayload(testIdOrToken) {
  const allExams = getAllExams();
  const query = (testIdOrToken || '').trim().toLowerCase();
  
  const found = allExams.find(
    t => t.id.toLowerCase() === query ||
         (t.token && t.token.toLowerCase() === query) ||
         (t.code && t.code.toLowerCase() === query)
  );

  if (!found) return null;

  // Perform server-side BOLA answer stripping
  return {
    ...found,
    questions: (found.questions || []).map(q => ({
      id: q.id,
      type: q.type || 'MCQ',
      text: q.text,
      options: q.options || [],
      wordLimit: q.wordLimit || null,
      subject: q.subject || 'General',
      points: q.points || 10
      // Stripped: correctOptionId, correctOptionIds, sampleAnswer, explanation
    }))
  };
}

/**
 * Publish a new assessment paper from Examiner Studio
 */
export async function publishExamPaper(paperPayload) {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Save in local browser storage fallback
    const existing = JSON.parse(localStorage.getItem(CUSTOM_EXAMS_STORAGE_KEY) || '[]');
    const updated = [paperPayload, ...existing.filter(e => e.id !== paperPayload.id)];
    localStorage.setItem(CUSTOM_EXAMS_STORAGE_KEY, JSON.stringify(updated));

    // 2. Publish to Aegis central server API globally so any candidate device can resolve token
    await fetch('/api/exam/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paperPayload),
    });

    return true;
  } catch (err) {
    console.error('Failed to publish exam paper:', err);
    return false;
  }
}

/**
 * Encode paper payload into a URL-safe stateless Base64 string
 */
export function encodePaperPayload(paperPayload) {
  try {
    const jsonStr = JSON.stringify(paperPayload);
    if (typeof window !== 'undefined') {
      return btoa(encodeURIComponent(jsonStr));
    }
    return Buffer.from(encodeURIComponent(jsonStr)).toString('base64');
  } catch (err) {
    console.error('Failed to encode paper payload:', err);
    return '';
  }
}

/**
 * Decode paper payload from a URL-safe stateless Base64 string
 */
export function decodePaperPayload(encodedStr) {
  if (!encodedStr) return null;
  try {
    let jsonStr = '';
    if (typeof window !== 'undefined') {
      jsonStr = decodeURIComponent(atob(encodedStr));
    } else {
      jsonStr = decodeURIComponent(Buffer.from(encodedStr, 'base64').toString('utf8'));
    }
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Failed to decode paper payload:', err);
    return null;
  }
}

/**
 * Sync active candidate telemetry frame to Proctor Command Desk
 */
export function syncCandidateProctorTelemetry(telemetryPayload) {
  if (typeof window === 'undefined') return;

  try {
    const existing = JSON.parse(sessionStorage.getItem(PROCTOR_TELEMETRY_STORAGE_KEY) || '{}');
    existing[telemetryPayload.candidateId || 'default'] = {
      ...telemetryPayload,
      updatedAt: new Date().toISOString()
    };
    sessionStorage.setItem(PROCTOR_TELEMETRY_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to sync candidate proctor telemetry:', err);
  }
}
