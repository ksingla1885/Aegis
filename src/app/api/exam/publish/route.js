import { registerCustomExam } from '@/lib/mockData';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const paperPayload = await request.json();

    if (!paperPayload || !paperPayload.id || !paperPayload.title) {
      return Response.json(
        { success: false, error: 'Invalid paper payload provided' },
        { status: 400 }
      );
    }

    // 1. Register in server memory cache
    registerCustomExam(paperPayload);

    // 2. Persist to MongoDB database
    try {
      const db = await getDatabase();
      await db.collection('exams').updateOne(
        { id: paperPayload.id },
        { $set: { ...paperPayload, updatedAt: new Date() } },
        { upsert: true }
      );
    } catch (dbErr) {
      console.error('MongoDB Exam Upsert Warning:', dbErr);
    }

    return Response.json({
      success: true,
      message: 'Assessment paper published to MongoDB & Aegis Server',
      paperId: paperPayload.id,
      token: paperPayload.token || paperPayload.code,
    });
  } catch (err) {
    console.error('API Publish Exam Error:', err);
    return Response.json(
      { success: false, error: 'Failed to publish assessment paper' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    let mongoExams = [];
    try {
      const db = await getDatabase();
      mongoExams = await db.collection('exams').find({}).toArray();
    } catch (dbErr) {
      console.error('MongoDB fetch error:', dbErr);
    }

    const registry = (typeof globalThis !== 'undefined' && globalThis.AEGIS_CUSTOM_EXAMS) ? globalThis.AEGIS_CUSTOM_EXAMS : [];
    const all = [...mongoExams, ...registry];

    return Response.json({
      success: true,
      count: all.length,
      exams: all.map(t => ({ id: t.id, token: t.token, title: t.title, organization: t.organization }))
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
