import { getSanitizedTestPayload, registerCustomExam } from '@/lib/mockData';
import { decodePaperPayload } from '@/lib/examService';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    const { testId } = await params;

    // Check if stateless payload parameter ?p= is present in URL
    const url = new URL(request.url);
    const payloadParam = url.searchParams.get('p');
    if (payloadParam) {
      const decoded = decodePaperPayload(payloadParam);
      if (decoded && (decoded.id || decoded.token)) {
        registerCustomExam(decoded);
      }
    }

    // Query MongoDB for published exam by testId
    try {
      const db = await getDatabase();
      const queryStr = (testId || '').trim();
      const dbExam = await db.collection('exams').findOne({
        $or: [
          { id: queryStr.toLowerCase() },
          { token: { $regex: new RegExp(`^${queryStr}$`, 'i') } },
          { code: { $regex: new RegExp(`^${queryStr}$`, 'i') } }
        ]
      });
      if (dbExam) {
        registerCustomExam(dbExam);
      }
    } catch (dbErr) {
      console.error('MongoDB Test Fetch Warning:', dbErr);
    }

    const sanitizedTest = getSanitizedTestPayload(testId);

    if (!sanitizedTest) {
      return Response.json({ success: false, notFound: true, error: 'Test paper not found' }, { status: 200 });
    }

    // Return BOLA-stripped question payload (no answers or explanations)
    return Response.json({
      success: true,
      test: sanitizedTest,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('API Test Fetch Error:', err);
    return Response.json({ error: 'Internal Server Security Error' }, { status: 500 });
  }
}
