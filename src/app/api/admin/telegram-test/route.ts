import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/serverAuth';

export async function POST(req: Request) {
  try {
    // 1. Verificare securizată a sesiunii de admin
    const adminUser = await verifyAdminRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Acces refuzat: Sesiune de administrator invalidă sau inexistentă.' },
        { status: 401 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_STAFF_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { success: false, message: 'Configurare incompletă: TELEGRAM_BOT_TOKEN sau TELEGRAM_STAFF_CHAT_ID nu sunt setate în variabilele de mediu.' },
        { status: 500 }
      );
    }

    const now = new Date().toLocaleTimeString('ro-RO', { timeZone: 'Europe/Chisinau' });

    const telegramMsg = `🟢 *TEST CONEXIUNE ADMIN DASHBOARD*\n\n` +
      `✅ *Status:* Conexiune 100% Activă și Operațională\n` +
      `👤 *Admin Inițiator:* ${adminUser.name || adminUser.email || 'Administrator'}\n` +
      `🤖 *Bot:* Munchotella Staff Alert Bot\n` +
      `🧠 *Model AI:* Google Gemini (Cascade Failover Active)\n` +
      `📍 *Origine:* Panou Administrator (Asistent AI Settings)\n` +
      `⏰ *Ora Chișinău:* ${now}\n\n` +
      `🧇🍫 _Toate alertele de comenzi noi și asistență umană sunt perfect sincronizate cu acest grup!_`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMsg,
        parse_mode: 'Markdown'
      })
    });

    const data = await res.json();

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: 'Alertă de test trimisă cu succes pe grupul Telegram al angajaților!',
        timestamp: now,
        telegramResponse: data.result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.description || 'Eroare Telegram API',
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Eroare necunoscută la trimiterea alertelor'
    }, { status: 500 });
  }
}
