import { MOCK_TESTS, findExamByTokenOrId } from '@/lib/mockData';
import { generateCandidateHash } from '@/lib/crypto';

export async function POST(request, { params }) {
  try {
    const { testId } = await params;
    const body = await request.json();

    const {
      userAnswers = {},
      violations = [],
      candidateName = 'Candidate',
      rollNo = '2026-AEGIS-901',
      timeSpentSeconds = 0,
      terminationReason = null,
      customTest = null,
    } = body;

    let fullTest = findExamByTokenOrId(testId) || customTest;
    if (!fullTest && MOCK_TESTS.length > 0) {
      fullTest = MOCK_TESTS[0]; // Emergency fallback to first mock test
    }

    if (!fullTest) {
      return Response.json({ success: false, error: 'Test paper configuration not found' }, { status: 404 });
    }

    let earnedScore = 0;
    let totalPossibleScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const breakdown = (fullTest.questions || []).map((q) => {
      const points = q.points || 10;
      totalPossibleScore += points;
      const candidateAnswer = userAnswers[q.id];

      let isCorrect = false;
      const isAttempted = candidateAnswer !== undefined && candidateAnswer !== null && candidateAnswer !== '';

      if (q.type === 'MSQ') {
        const correctArr = q.correctOptionIds || [];
        const candidateArr = Array.isArray(candidateAnswer) ? candidateAnswer : [];
        isCorrect = correctArr.length === candidateArr.length && correctArr.every((id) => candidateArr.includes(id));
      } else if (q.type === 'SUBJECTIVE') {
        // Subjective essay is awarded points if meaningful explanation is written
        isCorrect = typeof candidateAnswer === 'string' && candidateAnswer.trim().length >= 10;
      } else {
        isCorrect = candidateAnswer === q.correctOptionId;
      }

      if (!isAttempted) {
        unattemptedCount++;
      } else if (isCorrect) {
        correctCount++;
        earnedScore += points;
      } else {
        incorrectCount++;
      }

      return {
        questionId: q.id,
        questionText: q.text,
        subject: q.subject || 'General',
        candidateAnswer: isAttempted ? (Array.isArray(candidateAnswer) ? candidateAnswer.join(', ') : candidateAnswer) : null,
        correctAnswer: q.type === 'MSQ' ? (q.correctOptionIds || []).join(', ') : (q.correctOptionId || 'Evaluated Essay'),
        explanation: q.explanation || 'Evaluated based on standard rubric.',
        isCorrect,
        points,
      };
    });

    const percentage = Math.round((earnedScore / totalPossibleScore) * 100) || 0;
    const isPassed = percentage >= fullTest.passingScore && violations.length < fullTest.maxViolationsAllowed;

    const attemptId = `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const auditHash = generateCandidateHash(candidateName, rollNo, attemptId);

    const resultPayload = {
      attemptId,
      testId,
      testTitle: fullTest.title,
      candidateName,
      rollNo,
      earnedScore,
      totalPossibleScore,
      percentage,
      isPassed,
      correctCount,
      incorrectCount,
      unattemptedCount,
      timeSpentSeconds,
      violations,
      violationCount: violations.length,
      maxViolations: fullTest.maxViolationsAllowed,
      auditHash,
      terminationReason,
      submittedAt: new Date().toISOString(),
      breakdown,
    };

    return Response.json({
      success: true,
      result: resultPayload,
    });
  } catch (err) {
    console.error('API Submit Error:', err);
    return Response.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
