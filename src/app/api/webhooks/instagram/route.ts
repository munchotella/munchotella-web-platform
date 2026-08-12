import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const PERMANENT_META_PAGE_ACCESS_TOKEN = "EAAVxZCgeumYUBSCIdviX1bYuubsuZCp3TWPXSPZCE9TfaJKTHu7fTv542LYbiOFC2ZB16SZAAprVec1Dvx8db6ydyU4shHOb8ZAI6wxLsF9mep5cKYjQivMxLbRp21qoOsdwZBZCe2yc5vZBTwA4noZArn3edbYSs8b9ZA8IDHP4H5l73BuM7xQvhYfXe1TF3Gj8zWVi8kL";
const INSTAGRAM_ACCOUNT_ID = "17841407196466279";
const FACEBOOK_PAGE_ID = "2033309050260259";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "munchotella_secret_token";

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
    let isEcho = false;

    if (body && typeof body === 'object') {
      if (Array.isArray(body?.entry)) {
        for (const entry of body.entry) {
          if (Array.isArray(entry?.messaging)) {
            for (const item of entry.messaging) {
              if (item?.message?.is_echo) {
                isEcho = true;
                continue;
              }
              const sId = item?.sender?.id || item?.sender_id || (typeof item?.sender === 'string' ? item.sender : null);
              const text = item?.message?.text || item?.text || (typeof item?.message === 'string' ? item.message : null);
              
              if (sId === INSTAGRAM_ACCOUNT_ID || sId === FACEBOOK_PAGE_ID) {
                isEcho = true;
                continue;
              }

              if (sId && text) {
                senderId = String(sId);
                messageText = text;
                break;
              }
            }
          } else if (Array.isArray(entry?.changes)) {
            for (const change of entry.changes) {
              const val = change?.value;
              if (val) {
                if (val?.message?.is_echo || val?.is_echo) {
                  isEcho = true;
                  continue;
                }
                const sId = val?.from?.id || val?.from || val?.sender?.id || val?.sender;
                const text = val?.text?.body || val?.text || val?.message?.text || val?.message;
                
                if (sId === INSTAGRAM_ACCOUNT_ID || sId === FACEBOOK_PAGE_ID) {
                  isEcho = true;
                  continue;
                }

                if (sId && typeof text === 'string') {
                  senderId = String(sId);
                  messageText = text;
                  break;
                }
              }
            }
          }
        }
      }
    }

    if (isEcho) {
      console.log("Ignorat mesaj ecou / propriu.");
      return NextResponse.json({ success: true, status: 'echo_ignored' });
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
    let systemPrompt = "Ești asistentul virtual Munchotella Waffle Boutique în Chișinău (Strada Nicolae Testemițeanu 21/1). Oferă răspunsuri amabile, elegante și scurte despre meniul nostru de waffles americane, mini waffles, clătite franțuzești cu Nutella®, fistic, ciocolată Belgiană, fructe proaspete și băuturi. Prețuri orientative: Waffle cu Ciocolată 120 MDL, Waffle cu Fistic 150 MDL, Cafea 40 MDL. Livrăm rapid prin serviciul nostru de curierat și taxi. Site oficial: www.munchotella.md.";
    let tone = "elegant";

    // Citește setările de personalitate salvate din Admin Dashboard (Firestore)
    try {
      const settingsRef = doc(db, 'settings', 'ai_instagram');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.prompt) systemPrompt = data.prompt;
        if (data.tone) tone = data.tone;
        console.log("Setări AI încărcate din Admin Dashboard:", { tone, promptLength: systemPrompt.length });
      }
    } catch (dbErr) {
      console.warn("Nu s-au putut încărca setările AI din Admin Dashboard, se folosește configurarea implicită:", dbErr);
    }

    let finalPrompt = systemPrompt + `\n\n[Ton dorit: ${tone}]\nMesajul clientului: "${messageText}"\nRăspunde într-un mod ${tone === 'friendly' ? 'prietenos, cald și cu emoji-uri drăguțe' : tone === 'formal' ? 'formal, scurt și foarte politicos' : 'elegant, luxos și amabil'}, scurt și clar:`;

    let replyText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: finalPrompt,
        });
        replyText = response.text || "";
      } catch (genAiErr: any) {
        console.warn("GoogleGenAI SDK call failed, falling back to REST API:", genAiErr?.message);
        try {
          const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
          });
          const restData = await restRes.json();
          replyText = restData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (_) {}
      }
    }

    // Răspuns inteligent bazat pe meniul Munchotella dacă cheia AI nu este configurată sau a eșuat
    if (!replyText) {
      const lower = messageText.toLowerCase();
      if (lower.includes('pret') || lower.includes('preț') || lower.includes('meniu') || lower.includes('waffle') || lower.includes('clatite') || lower.includes('clătite') || lower.includes('dulce') || lower.includes('desert') || lower.includes('mancare') || lower.includes('mâncare')) {
        replyText = "Bună! 🧇 La Munchotella avem cele mai delicioase Waffles americane, Mini Waffles și Clătite franțuzești cu Nutella®, fistic, ciocolată Belgiană și fructe proaspete! 🍓 Vezi meniul complet și comanda direct pe www.munchotella.md ✨";
      } else if (lower.includes('livrare') || lower.includes('comanda') || lower.includes('comandă') || lower.includes('livrati') || lower.includes('livrați') || lower.includes('curier') || lower.includes('taxi')) {
        replyText = "Bună! 🛵 Livrăm rapid în tot Chișinăul! Poți plasa comanda simplu și rapid direct pe site-ul nostru www.munchotella.md! Ce bunătăți ai dori să-ți trimitem?";
      } else if (lower.includes('adresa') || lower.includes('adresă') || lower.includes('locatie') || lower.includes('locație') || lower.includes('unde') || lower.includes('strada') || lower.includes('chisinau') || lower.includes('chișinău')) {
        replyText = "Ne găsești în Chișinău pe Str. Nicolae Testemițeanu 21/1! 📍 Vă așteptăm cu drag pentru o experiență dulce de neuitat! Sau comandați online pe www.munchotella.md 🛵";
      } else if (lower.includes('salut') || lower.includes('buna') || lower.includes('bună') || lower.includes('hei') || lower.includes('hello') || lower.includes('hi')) {
        replyText = "Bună ziua! 👋 Bine ați venit la Munchotella Waffle Boutique! Cu ce vă putem îndulci ziua? Puteți explora meniul nostru special pe www.munchotella.md 🧇✨";
      } else {
        replyText = "Bună ziua! 🧇 Vă mulțumim că ați contactat Munchotella Waffle Boutique! Cu ce vă putem ajuta azi? Puteți consulta meniul nostru complet și comanda pe www.munchotella.md!";
      }
    }

    let sendResult = null;
    const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || PERMANENT_META_PAGE_ACCESS_TOKEN;

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

    return { success: true, sendResult, replyText, tone };

  } catch (err: any) {
    console.error("Eroare la procesarea mesajului cu Gemini/Meta:", err);
    return { error: err?.message || String(err), stack: err?.stack };
  }
}
