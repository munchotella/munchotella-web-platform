import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { Composio } from '@composio/core';

// Variabile de mediu necesare:
// GEMINI_API_KEY - Cheia ta de la Google AI Studio
// COMPOSIO_API_KEY - Cheia ta de la Composio (din Setări Composio)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = "munchotella_secret_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Webhook primit de la Meta:", JSON.stringify(body, null, 2));

    let senderId = null;
    let messageText = null;

    if (body?.entry?.[0]?.messaging?.[0]) {
      const messagingItem = body.entry[0].messaging[0];
      senderId = messagingItem.sender?.id;
      messageText = messagingItem.message?.text;
    } else if (body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const changeMsg = body.entry[0].changes[0].value.messages[0];
      senderId = changeMsg.from || changeMsg.sender?.id;
      messageText = changeMsg.text?.body || changeMsg.text;
    } else {
      senderId = body?.payload?.sender?.id || body?.senderId || body?.id || body?.sender_id;
      messageText = body?.payload?.message?.text || body?.text || body?.message || body?.message_text;
    }

    if (senderId && messageText) {
      console.log(`Mesaj detectat de la ${senderId}: "${messageText}"`);
      const debugResult = await processMessage(senderId, messageText);
      return NextResponse.json({ success: true, status: 'procesat', debug: debugResult });
    } else {
      console.warn("Webhook-ul a fost primit, dar nu conține un text de mesaj valid:", body);
      return NextResponse.json({ success: true, warning: 'lipsesc_date', payload: body });
    }

  } catch (error: any) {
    console.error('Eroare Webhook Meta:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processMessage(senderId: string, messageText: string) {
  try {
    let systemPrompt = "Ești asistentul Munchotella Waffle Boutique. Oferă răspunsuri amabile și scurte legate de meniul nostru de waffles, clătite și băuturi.";
    let tone = "elegant";

    if (db) {
      try {
        const settingsRef = doc(db, 'settings', 'ai_instagram');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.prompt) systemPrompt = data.prompt;
          if (data.tone) tone = data.tone;
        }
      } catch (dbErr) {
        console.warn("Could not fetch Firestore AI settings, using default prompt:", dbErr);
      }
    }

    let finalPrompt = systemPrompt + "\n";
    if (tone === "elegant") finalPrompt += "Răspunde într-un mod elegant, luxos și foarte politicos.";
    else if (tone === "friendly") finalPrompt += "Răspunde într-un mod foarte prietenos, cu emoji-uri drăguțe și cald.";
    else if (tone === "formal") finalPrompt += "Răspunde formal, profesional și la obiect.";

    finalPrompt += `\nMesajul clientului: "${messageText}"\nRăspunsul tău:`;

    let replyText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: finalPrompt,
      });
      replyText = response.text || "";
    } catch (genAiErr) {
      console.warn("GoogleGenAI SDK call failed, falling back to REST API:", genAiErr);
      const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }]
        })
      });
      const restData = await restRes.json();
      replyText = restData?.candidates?.[0]?.content?.parts?.[0]?.text || "Vă mulțumim pentru mesaj! Echipa Munchotella vă va răspunde în cel mai scurt timp.";
    }

    let sendResult = null;
    const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN;

    if (metaAccessToken) {
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${metaAccessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: senderId },
            message: { text: replyText }
          })
        });
        sendResult = await metaRes.json();
        console.log(`Răspuns trimis cu succes prin Meta Graph API către ${senderId}:`, sendResult);
      } catch (metaErr) {
        console.error("Eroare la trimiterea prin Meta Graph API:", metaErr);
      }
    }

    if (!sendResult) {
      const composioApiKey = process.env.COMPOSIO_API_KEY;
      if (composioApiKey) {
        try {
          const composio = new Composio({ apiKey: composioApiKey });
          sendResult = await composio.tools.execute('INSTAGRAM_SEND_TEXT_MESSAGE', {
            params: {
              recipient_id: senderId,
              text: replyText
            }
          });
          console.log(`Răspuns trimis prin Composio către ${senderId}`, sendResult);
        } catch (compErr) {
          console.warn("Composio send fallback failed:", compErr);
        }
      }
    }

    return { success: true, sendResult, replyText };

  } catch (err: any) {
    console.error("Eroare la procesarea mesajului cu Gemini/Meta:", err);
    return { error: err?.message || String(err), stack: err?.stack };
  }
}
