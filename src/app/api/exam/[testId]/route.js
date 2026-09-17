import { getSanitizedTestPayload, registerCustomExam } from '@/lib/mockData';
import { decodePaperPayload } from '@/lib/examService';

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
