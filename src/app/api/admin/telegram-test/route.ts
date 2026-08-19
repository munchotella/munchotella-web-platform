import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || "8450338336:AAGxHCnV7B-k9ufC2O3MSgwrlymiTdHMPUc";
    const chatId = process.env.TELEGRAM_STAFF_CHAT_ID || "-4164368978";

    const now = new Date().toLocaleTimeString('ro-RO', { timeZone: 'Europe/Chisinau' });

    const telegramMsg = `🟢 *TEST CONEXIUNE ADMIN DASHBOARD*\n\n` +
      `✅ *Status:* Conexiune 100% Activă și Operațională\n` +
      `🤖 *Bot:* Munchotella Staff Alert Bot\n` +
      `🧠 *Model AI:* Google Gemini 3.7-Flash (Cascade Failover Active)\n` +
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
