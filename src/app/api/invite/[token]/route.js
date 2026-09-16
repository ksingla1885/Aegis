import { findExamByTokenOrId, getSanitizedTestPayload } from '@/lib/mockData';

export async function GET(request, { params }) {
  try {
    const { token } = await params;
    const sanitizedTest = getSanitizedTestPayload(token);

    if (!sanitizedTest) {
      return Response.json({
        success: false,
        notFound: true,
        error: 'Invalid or expired test invite token/code.',
      }, { status: 200 });
    }

    const now = new Date();
    let scheduleStatus = 'ACTIVE';
    let secondsUntilStart = 0;

    if (sanitizedTest.startTime) {
      const start = new Date(sanitizedTest.startTime);
      if (now < start) {
        scheduleStatus = 'COUNTDOWN_LOBBY';
        secondsUntilStart = Math.ceil((start.getTime() - now.getTime()) / 1000);
      }
    }

    if (sanitizedTest.endTime) {
      const end = new Date(sanitizedTest.endTime);
      if (now > end) {
        scheduleStatus = 'CLOSED';
      }
    }

    return Response.json({
      success: true,
      test: sanitizedTest,
      scheduleStatus,
      secondsUntilStart,
      allowedEmailDomain: sanitizedTest.allowedEmailDomain || null,
      serverTime: now.toISOString(),
    });
  } catch (err) {
    console.error('API Invite Validation Error:', err);
    return Response.json({ success: false, error: 'Internal server token verification error' }, { status: 500 });
  }
}
