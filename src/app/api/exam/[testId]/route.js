import { getSanitizedTestPayload } from '@/lib/mockData';

export async function GET(request, { params }) {
  try {
    const { testId } = await params;
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
