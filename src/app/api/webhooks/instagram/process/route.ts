import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Receiver } from '@upstash/qstash';
import { processMessage, logAIActivity, notifyAgencyDashboard } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getReceiver(): Receiver | null {
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY || "sig_7PWc5SFZNpkWzaBWFKVB3NRLAsrg";
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY || "sig_4mFPAAVYpyzi8sPSh6Mekn99z6oS";
  if (!currentKey || !nextKey) return null;
  return new Receiver({
    currentSigningKey: currentKey,
    nextSigningKey: nextKey,
  });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Verificare semnătură QStash
    const receiver = getReceiver();
    if (receiver) {
      const signature = request.headers.get('upstash-signature') || '';
      try {
        const isValid = await receiver.verify({ signature, body: rawBody });
        if (!isValid) {
          console.warn('[Process] Semnătură QStash invalidă — cerere respinsă.');
          return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
        }
      } catch (sigErr) {
        console.warn('[Process] Eroare verificare semnătură QStash:', sigErr);
        return NextResponse.json({ error: 'signature_verification_failed' }, { status: 401 });
      }
    }

    let body: { senderId: string; channel: 'instagram' | 'messenger' };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    const { senderId, channel } = body;
    if (!senderId || !channel) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 });
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || 'https://trusty-stingray-298895.upstash.io',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAABI-PAAIgcDFhZTMyZGE5NjBiZGU0Y2QxOTI3NGRlNmEzZWJhZmQ3NQ',
    });

    const redisKey = `debounce:msgs:${senderId}`;
    const tsKey = `debounce:ts:${senderId}`;
    const channelKey = `debounce:channel:${senderId}`;

    const now = Date.now();
    const lastTsRaw = await redis.get<number>(tsKey);
    const lastTs = lastTsRaw ? Number(lastTsRaw) : 0;
    const silenceElapsed = now - lastTs;

    // Stale Job Detection: Dacă utilizatorul a trimis un mesaj mai recent (< 5.5s silențiu),
    // renunțăm silențios pentru că un job QStash mai recent va procesa pachetul complet
    if (silenceElapsed < 5500 && lastTs > 0) {
      console.log(`[Process] Job QStash stale pentru ${senderId} — silențiu: ${silenceElapsed}ms < 5.5s.`);
      return NextResponse.json({ status: 'stale_job_skipped', silenceElapsed, senderId });
    }

    // Preluăm toate mesajele acumulate în Redis
    const messages = await redis.lrange<string>(redisKey, 0, -1);
    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'no_messages', senderId });
    }

    // Ștergem cheile Redis atomic
    await redis.del(redisKey, tsKey, channelKey);

    const aggregatedText = messages.join('\n').trim();
    console.log(`[Process] QStash execută ${messages.length} mesaje pentru ${senderId} [${channel.toUpperCase()}]:\n"${aggregatedText}"`);

    // Apel direct în proces fără latency de rețea
    const debugResult = await processMessage(senderId, aggregatedText, channel);
    await logAIActivity(senderId, channel, aggregatedText, debugResult?.status || 'gemini_response');

    // Notificare opțională dashboard agenție
    const isTestSender = String(senderId).startsWith('9999') || String(senderId) === 'test' || String(senderId) === 'sim_user';
    if (!isTestSender) {
      const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || "17841407196466279";
      const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || "2033309050260259";
      const isCrupa = String(senderId) === '1003637612636530' || String(senderId) === '27899196186417959' || String(senderId).toLowerCase().includes('crupa');

      await notifyAgencyDashboard({
        platform: channel,
        asset_id: channel === 'instagram' ? INSTAGRAM_ACCOUNT_ID : FACEBOOK_PAGE_ID,
        sender_id: senderId,
        customer_name: isCrupa ? 'Crupa Grigore' : 'Client Munchotella',
        customer_handle: isCrupa ? '@crupa_grigore' : `@user_${senderId.slice(-4)}`,
        message_text: aggregatedText,
        reply_text: debugResult?.replyText || 'Răspuns trimis automat pe chat',
        status: debugResult?.status || 'gemini_response',
      }).catch(err => console.warn('[Process] Eroare notificare dashboard:', err));
    }

    return NextResponse.json({
      success: true,
      status: 'processed_via_qstash',
      senderId,
      channel,
      messagesCount: messages.length,
      aggregatedText,
      silenceElapsed,
      debug: debugResult,
    });
  } catch (error: any) {
    console.error('[Process] Eroare fatală:', error);
    return NextResponse.json({ error: 'internal_error', message: error?.message }, { status: 500 });
  }
}
