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
    // Verificare Rate Limiting (5 mesaje / minut per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`contact_${clientIp}`, 5, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Prea multe mesaje trimise. Vă rugăm să așteptați 1 minut înainte de a trimite din nou.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetTime)
          }
        }
      );
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (name.length > 100 || phone.length > 30 || message.length > 3000) {
      return NextResponse.json(
        { error: 'Input exceeded maximum allowed character limits' },
        { status: 400 }
      );
    }

    // 1. Save directly to Firebase Firestore (Backup)
    try {
      await addDoc(collection(db, 'contactMessages'), {
        name,
        phone,
        message,
        createdAt: serverTimestamp(),
        status: 'new' 
      });
    } catch (dbError) {
      console.error('Firebase save error (non-blocking):', dbError);
    }

    // 2. Send Email via Resend with Escaped HTML
    if (process.env.RESEND_API_KEY) {
      const safeName = escapeHtml(name);
      const safePhone = escapeHtml(phone);
      const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

      const resendRes = await fetch('https://api.resend.com/emails', {
        credentials: "include",
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Munchotella Site <onboarding@resend.dev>',
          to: 'munchotella@gmail.com',
          subject: `[Website Form] Mesaj nou de la ${safeName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #fcf9f4; color: #1A120B;">
              <h2 style="color: #D4A853;">Ai primit un mesaj nou de pe site</h2>
              <p><strong>Nume:</strong> ${safeName}</p>
              <p><strong>Telefon:</strong> ${safePhone}</p>
              <p><strong>Mesaj:</strong></p>
              <blockquote style="border-left: 4px solid #D4A853; padding-left: 1rem; font-style: italic;">
                ${safeMessage}
              </blockquote>
            </div>
          `
        })
      });

      if (!resendRes.ok) {
        const errorData = await resendRes.json();
        console.error('Resend Error:', errorData);
      }
    } else {
      console.warn('RESEND_API_KEY is not set in environment variables.');
    }

    return NextResponse.json(
      { success: true, message: 'Message saved and sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in contact route:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
