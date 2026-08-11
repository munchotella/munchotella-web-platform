import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
    let body: any = null;
    const rawText = await request.text();
    try {
      body = JSON.parse(rawText);
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (_) {}
      }
    } catch (e) {
      body = rawText;
    }

    console.log("Webhook primit de la Meta:", JSON.stringify(body, null, 2));

    let senderId: string | null = null;
    let messageText: string | null = null;

    if (body && typeof body === 'object') {
      if (Array.isArray(body?.entry) && body.entry[0]?.messaging?.[0]) {
        const item = body.entry[0].messaging[0];
        senderId = item.sender?.id || item.sender_id || (typeof item.sender === 'string' ? item.sender : null);
        messageText = item.message?.text || item.text || (typeof item.message === 'string' ? item.message : null);
      } else if (Array.isArray(body?.entry) && body.entry[0]?.changes?.[0]?.value?.messages?.[0]) {
        const item = body.entry[0].changes[0].value.messages[0];
        senderId = item.from || item.sender?.id;
        messageText = item.text?.body || item.text;
      }
      
      if (!senderId) {
        senderId = body?.senderId || body?.sender_id || body?.id || body?.from || body?.payload?.sender?.id || (typeof body?.sender === 'string' ? body.sender : null);
      }
      if (!messageText) {
        messageText = body?.messageText || body?.message_text || body?.text || (typeof body?.message === 'string' ? body.message : null) || body?.payload?.message?.text;
      }
    }

    if (senderId && messageText) {
      console.log(`Mesaj detectat de la ${senderId}: "${messageText}"`);
      const debugResult = await processMessage(senderId, messageText);
      return NextResponse.json({ success: true, status: 'procesat', senderId, messageText, debug: debugResult });
    } else {
      return NextResponse.json({ 
        success: true, 
        warning: 'lipsesc_date', 
        extracted: { senderId, messageText }, 
        bodyType: typeof body, 
        rawText,
        body 
      });
    }

  } catch (error: any) {
    console.error('Eroare Webhook Meta:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processMessage(senderId: string, messageText: string) {
  try {
    let systemPrompt = "Ești asistentul virtual Munchotella Waffle Boutique în Chișinău (Strada Nicolae Testemițeanu 21/1). Oferă răspunsuri amabile, elegante și scurte despre meniul nostru de waffles americane, mini waffles, clătite franțuzești cu Nutella®, fructe proaspete și băuturi. Prețuri orientative: Waffle cu Ciocolată 120 MDL, Waffle cu Fistic 150 MDL, Cafea 40 MDL. Livrăm rapid prin serviciul nostru de curierat și taxi.";
    let tone = "elegant";

    let finalPrompt = systemPrompt + "\n";
    if (tone === "elegant") finalPrompt += "Răspunde într-un mod elegant, luxos și foarte politicos.";
    else if (tone === "friendly") finalPrompt += "Răspunde într-un mod foarte prietenos, cu emoji-uri drăguțe și cald.";

    finalPrompt += `\nMesajul clientului: "${messageText}"\nRăspunsul tău:`;

    let replyText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    try {
      if (!apiKey) throw new Error("GEMINI_API_KEY not set");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: finalPrompt,
      });
      replyText = response.text || "";
    } catch (genAiErr: any) {
      console.warn("GoogleGenAI SDK call failed, falling back to REST API:", genAiErr?.message);
      if (apiKey) {
        try {
          const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: finalPrompt }] }]
            })
          });
          const restData = await restRes.json();
          replyText = restData?.candidates?.[0]?.content?.parts?.[0]?.text || "Vă mulțumim pentru mesaj! Echipa Munchotella vă va răspunde în cel mai scurt timp.";
        } catch (restErr) {
          replyText = "Vă mulțumim pentru mesaj! Echipa Munchotella vă va răspunde în cel mai scurt timp.";
        }
      } else {
        replyText = "Bună ziua! Vă mulțumim că ați contactat Munchotella Waffle Boutique! Cu ce vă putem ajuta azi?";
      }
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
