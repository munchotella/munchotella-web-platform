import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    // 1. Verificare Rate Limiting (Maxim 3 solicitări per 15 minute per IP pentru a preveni abuzurile)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`delete_req_${clientIp}`, 3, 15 * 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Ai depășit limita de solicitări permise. Te rugăm să aștepți câteva minute înainte de a încerca din nou sau să ne contactezi telefonic la +373 79 006 499.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '900',
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetTime)
          }
        }
      );
    }

    // 2. Extragere & Validare Date Payload
    const body = await request.json();
    const contact = typeof body.contact === 'string' ? body.contact.trim() : '';
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    const confirmed = Boolean(body.confirmed);
    const locale = typeof body.locale === 'string' ? body.locale.trim() : 'ro';

    if (!contact) {
      return NextResponse.json(
        { error: 'Numărul de telefon sau adresa de email este obligatorie.' },
        { status: 400 }
      );
    }

    if (contact.length < 4 || contact.length > 150) {
      return NextResponse.json(
        { error: 'Datele de contact introduse sunt invalide.' },
        { status: 400 }
      );
    }

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Confirmarea acordului de ștergere este obligatorie.' },
        { status: 400 }
      );
    }

    if (reason.length > 1000) {
      return NextResponse.json(
        { error: 'Motivul specificat depășește limita maximă de 1000 de caractere.' },
        { status: 400 }
      );
    }

    // 3. Generare Număr Unic de Tichet (Ex: DEL-L1K9-4F8A)
    const ticketId = `DEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 4. Salvare Persistență în Firestore (Colecția deletionRequests)
    try {
      await addDoc(collection(db, 'deletionRequests'), {
        ticketId,
        contact,
        reason: reason || 'Nespecificat',
        confirmed,
        clientIp,
        locale,
        status: 'pending',
        createdAt: serverTimestamp(),
        source: 'web_form_unauthenticated'
      });
    } catch (dbError) {
      console.error('Firestore deletionRequests error (non-blocking):', dbError);
    }

    // 5. Transmitere Email de Alertă către Echipa Munchotella via Resend
    if (process.env.RESEND_API_KEY) {
      const safeContact = escapeHtml(contact);
      const safeReason = escapeHtml(reason || 'Nespecificat').replace(/\n/g, '<br/>');
      const safeTicket = escapeHtml(ticketId);

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Munchotella Security <onboarding@resend.dev>',
          to: 'munchotella@gmail.com',
          subject: `[URGENT / GDPR] Cerere Ștergere Cont & Date #${safeTicket}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background-color: #FAF7F2; border: 1px solid #E8E2D9; border-radius: 16px; color: #1A120B;">
              <div style="border-bottom: 2px solid #D4A853; padding-bottom: 16px; margin-bottom: 20px;">
                <h2 style="color: #1A120B; margin: 0 0 6px 0; font-size: 22px;">Solicitare Nouă de Ștergere Cont & Date</h2>
                <span style="background-color: #E83434; color: #ffffff; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 6px;">GDPR & Google Play Compliance</span>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 15px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D9; font-weight: bold; color: #736A60; width: 140px;">Număr Tichet:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D9; font-weight: bold; color: #1A120B; font-family: monospace; font-size: 16px;">${safeTicket}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D9; font-weight: bold; color: #736A60;">Contact Utilizator:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D9; font-weight: bold; color: #D4A853;">${safeContact}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D9; font-weight: bold; color: #736A60;">Data Solicitării:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D9; color: #1A120B;">${new Date().toLocaleString('ro-MD', { timeZone: 'Europe/Chisinau' })} (Ora Chișinăului)</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D9; font-weight: bold; color: #736A60;">IP Client:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D9; color: #1A120B; font-family: monospace;">${escapeHtml(clientIp)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #736A60; vertical-align: top;">Motiv Menționat:</td>
                  <td style="padding: 10px 0; color: #4A4238;">${safeReason}</td>
                </tr>
              </table>

              <div style="background-color: #ffffff; border: 1px solid #E8E2D9; border-radius: 12px; padding: 16px; margin-top: 20px; font-size: 13px; color: #736A60;">
                <strong style="color: #1A120B;">Procedură de procesare:</strong>
                <ol style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.6;">
                  <li>Identificați contul în baza de date MongoDB / Panou Admin după telefon sau email.</li>
                  <li>Dacă este confirmat, declanșați anonimizarea comenzilor și ștergerea contului conform politicii Google Play & Legii 133/2011.</li>
                  <li>Termen maxim recomandat de finalizare: <strong>24–48 de ore</strong>.</li>
                </ol>
              </div>
            </div>
          `
        })
      });

      if (!resendRes.ok) {
        const errorData = await resendRes.json();
        console.error('Resend email error in delete-account-request:', errorData);
      }
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Cererea de ștergere a fost recepționată cu succes.'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in delete-account-request API route:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare internă la procesarea cererii. Te rugăm să încerci din nou.' },
      { status: 500 }
    );
  }
}
