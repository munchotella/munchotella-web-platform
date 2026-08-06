import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { name, phone, message } = await request.json();

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // 2. Send Email via Resend
    if (process.env.RESEND_API_KEY) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Munchotella Site <onboarding@resend.dev>',
          to: 'munchotella@gmail.com',
          subject: `[Website Form] Mesaj nou de la ${name}`,
          html: `
            <div style="font-family: sans-serif; max-w-xl mx-auto p-6 bg-[#fcf9f4] color: #1A120B;">
              <h2 style="color: #D4A853;">Ai primit un mesaj nou de pe site</h2>
              <p><strong>Nume:</strong> ${name}</p>
              <p><strong>Telefon:</strong> ${phone}</p>
              <p><strong>Mesaj:</strong></p>
              <blockquote style="border-left: 4px solid #D4A853; padding-left: 1rem; font-style: italic;">
                ${message.replace(/\n/g, '<br/>')}
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
