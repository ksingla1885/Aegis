import { registerCustomExam, findExamByTokenOrId } from '@/lib/mockData';

export async function POST(request) {
  try {
    const paperPayload = await request.json();

    if (!paperPayload || !paperPayload.id || !paperPayload.title) {
      return Response.json(
        { success: false, error: 'Invalid paper payload provided' },
        { status: 400 }
      );
    }

    // Register custom exam in server memory registry globally
    registerCustomExam(paperPayload);

    return Response.json({
      success: true,
      message: 'Assessment paper registered on Aegis server globally',
      paperId: paperPayload.id,
      token: paperPayload.token || paperPayload.code,
    });
  } catch (err) {
    console.error('API Publish Exam Error:', err);
    return Response.json(
      { success: false, error: 'Failed to publish assessment paper on server' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const registry = (typeof globalThis !== 'undefined' && globalThis.AEGIS_CUSTOM_EXAMS) ? globalThis.AEGIS_CUSTOM_EXAMS : [];
    return Response.json({
      success: true,
      count: registry.length,
      exams: registry.map(t => ({ id: t.id, token: t.token, title: t.title, organization: t.organization }))
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
