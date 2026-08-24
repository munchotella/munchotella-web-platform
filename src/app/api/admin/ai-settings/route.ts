import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/serverAuth';
import { connectToDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/ai-settings — citește setările AI din MongoDB
export async function GET(req: Request) {
  try {
    const adminUser = await verifyAdminRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Acces refuzat: Sesiune de administrator invalidă sau inexistentă.' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const settingsDoc = await db.collection('settings').findOne({ _id: 'ai' as any });

    return NextResponse.json({
      success: true,
      data: settingsDoc || {
        tone: 'elegant',
        systemPrompt: 'Ești asistentul Munchotella Waffle Boutique. Trebuie să răspunzi elegant, politicos și cald clienților pe Instagram și Messenger. Dacă clientul dorește să comande o clătită Dubai, subliniază că este produsul nostru premium cu pastă de fistic 100% pură, kataif crocant și ciocolată belgiană caldă.',
        model: 'gemini-2.0-flash',
        temperature: 0.3,
        autoOrders: true,
        autoPauseHandoff: true,
        telegramAlertsEnabled: true,
        keywords: [
          "om", "operator", "telefon", "urgent", "plangere",
          "nemultumit", "intarziat", "anulare", "manager", "vorbesc cu cineva"
        ]
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Eroare la preluarea setărilor AI' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ai-settings — actualizează setările AI în MongoDB
export async function POST(req: Request) {
  try {
    const adminUser = await verifyAdminRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Acces refuzat: Sesiune de administrator invalidă sau inexistentă.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tone, prompt, systemPrompt, model, temperature, autoOrders, autoPauseHandoff, telegramAlertsEnabled, keywords } = body;

    const finalPrompt = systemPrompt || prompt || '';

    const updateDoc = {
      tone: tone || 'elegant',
      systemPrompt: finalPrompt,
      model: model || 'gemini-2.0-flash',
      temperature: typeof temperature === 'number' ? temperature : 0.3,
      autoOrders: autoOrders !== undefined ? Boolean(autoOrders) : true,
      autoPauseHandoff: autoPauseHandoff !== undefined ? Boolean(autoPauseHandoff) : true,
      telegramAlertsEnabled: telegramAlertsEnabled !== undefined ? Boolean(telegramAlertsEnabled) : true,
      keywords: Array.isArray(keywords) ? keywords : [],
      updatedAt: new Date(),
      updatedBy: adminUser.name || adminUser.email || adminUser.id
    };

    const { db } = await connectToDatabase();
    await db.collection('settings').updateOne(
      { _id: 'ai' as any },
      { $set: updateDoc },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Configurările asistentului AI au fost salvate și sincronizate cu succes în baza de date!',
      data: updateDoc
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Eroare la salvarea setărilor AI' },
      { status: 500 }
    );
  }
}
