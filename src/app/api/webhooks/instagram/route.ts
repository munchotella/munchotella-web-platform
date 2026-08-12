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

function detectLanguage(text: string): 'ro' | 'ru' | 'en' {
  const cyrillicPattern = /[\u0400-\u04FF]/;
  if (cyrillicPattern.test(text)) {
    return 'ru';
  }
  const enKeywords = ['hello', 'hi', 'menu', 'price', 'delivery', 'location', 'pancake', 'crepe', 'sweet', 'sweets', 'where', 'address'];
  const lower = text.toLowerCase();
  const isEn = enKeywords.some(w => lower.includes(w)) && !lower.includes('buna') && !lower.includes('salut') && !lower.includes('pret') && !lower.includes('preturi');
  if (isEn && !/(\b(ce|cu|de|la|pe|si|și|nu|un|o|am|ai|au|este|sunt|unde|cat|cât)\b)/i.test(text)) {
    return 'en';
  }
  return 'ro';
}

async function processMessage(senderId: string, messageText: string) {
  try {
    const lang = detectLanguage(messageText);

    let replyText = "";
    const lowerMsg = messageText.toLowerCase();

    // Verificare rapidă a termenilor de argou non-standard ai clienților
    if (lowerMsg.includes('fashafish') || lowerMsg.includes('fasa') || lowerMsg.includes('fașa') || lowerMsg.includes('fashafisha')) {
      replyText = lang === 'ru' 
        ? "Здравствуйте! 👋 Вы имеете в виду: 1. Chocolate bites или 2. Sushi banana? 🍓"
        : "Bună! 👋 Vă doriți: 1. Chocolate bites sau 2. Sushi banana? 🍓";
    } else if (lowerMsg.includes('garuz') || lowerMsg.includes('garose') || lowerMsg.includes('garuzh')) {
      replyText = lang === 'ru'
        ? "Здравствуйте! 🍋 Заказать освежающий Ice Lemonade со льдом можно в меню ниже!"
        : "Bună! 🍋 Puteți comanda un Ice Lemonade rece cu gheață direct din meniul de mai jos!";
    } else if (lowerMsg.includes('mini pancake') || lowerMsg.includes('pancakes mici')) {
      replyText = lang === 'ru'
        ? "Здравствуйте! 🧇 Наша вкуснотища Nutella Mini waffles доступна в меню ниже!"
        : "Bună! 🧇 Delicioasele noastre Nutella Mini waffles le găsiți în meniul de mai jos!";
    }

    if (!replyText) {
      const baseMenuPrompt = `Ești asistentul virtual al Munchotella Waffle Boutique în Chișinău (Str. Nicolae Testemițeanu 21/1). Website oficial: www.munchotella.md.

REGULĂ STRICTĂ DE CONCIZIE & SCURTIME:
- Răspunde SCURT, CLAR și LA OBIECT (maxim 1-3 propoziții). Nu lungi textul cu introduceri lungi pentru că clienții nu vor să citească mesaje uriașe.
- Păstrează amabilitatea primitoare, dar fii direct la întrebări simple (ex: "cât e livrarea?" -> "Bună! 👋 Livrarea este 60 MDL 🛵.").

DENUMIRI OFICIALE DE PRODUSE (folosește-le exact așa cum sunt scrise mai jos):
- WAFFLES: "Waffle sticks" (145 MDL), "Delux mini waffle" (160 MDL), "Nutella Mini waffles" (145 MDL), "Lotus Mini waffles" (200 MDL), "Fruits waffle" (155 MDL), "Classic waffle" (145 MDL), "Belgian panda waffle" (160 MDL), "Biscoff waffle" (195 MDL).
- CREPES & SPECIALITĂȚI: "Delux crepe" (165 MDL), "Biscoff crepe" (205 MDL), "Fruits crepe" (145 MDL), "Oreo crepe" (145 MDL), "Kinder crepe" (145 MDL), "Crepe Dubai" (265 MDL), "Chocolate bites" (165 MDL), "Royal sushi" (155 MDL), "Sushi banana" (140 MDL).
- PANCAKES: "Biskoff pancakes" (190 MDL), "Fruits pancakes" (170 MDL), "Royal pancakes" (165 MDL).
- BĂUTURI & MILKSHAKES: "Milk shake Oreo" (135 MDL), "Milk shake Kinder" (135 MDL), "Milk shake Nutella" (135 MDL), "Milk shake Strawberry" (135 MDL), "Ice Lemonade" (90 MDL), "Black/Green Tea" (50 MDL).

REGULĂ STRICTĂ NUMELE PRODUSULUI: NU folosi NICIODATĂ cuvântul 'americane' sau 'waffles americane'. Spune doar 'waffle', 'waffles' sau denumirea exactă din meniu.
Dacă clientul scrie în Limba Română, răspunde în Română.
Dacă clientul scrie în Limba Rusă (Русский), răspunde în Rusă.
Dacă clientul scrie în Limba Engleză, răspunde în Engleză.`;

      let tone = "elegant";
      let adminCustomPrompt = "";

      // Citește setările de personalitate salvate din Admin Dashboard (Firestore) fără a suprascrie baza de date de produse
      try {
        const settingsRef = doc(db, 'settings', 'ai_instagram');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.prompt) adminCustomPrompt = data.prompt;
          if (data.tone) tone = data.tone;
        }
      } catch (dbErr) {
        console.warn("Nu s-au putut încărca setările AI din Admin Dashboard:", dbErr);
      }

      let finalPrompt = baseMenuPrompt + "\n\n" + (adminCustomPrompt ? `[Instrucțiuni suplimentare Admin: ${adminCustomPrompt}]\n` : "") + `\n[Limba detectată: ${lang.toUpperCase()}]\n[REGULĂ OBLIGATORIE: Răspunde SCURT (1-3 propoziții), amabil și direct! Fără lungimi inutile! Nu folosi deloc cuvântul 'americane'.]\n[Ton dorit: ${tone}]\nMesajul clientului: "${messageText}"\nRăspuns scurt:`;

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
    }

    // Fallback-uri concise în caz că Gemini nu a generat răspuns
    if (!replyText) {
      if (lang === 'ru') {
        if (lowerMsg.includes('цена') || lowerMsg.includes('цены') || lowerMsg.includes('меню') || lowerMsg.includes('сладости') || lowerMsg.includes('вафли') || lowerMsg.includes('блины')) {
          replyText = "Здравствуйте! 🧇 Нажмите кнопку ниже, чтобы открыть полное меню! ✨";
        } else if (lowerMsg.includes('доставка') || lowerMsg.includes('заказ') || lowerMsg.includes('такси')) {
          replyText = "Здравствуйте! 🛵 Доставляем курьером по Кишиневу и такси в пригороды! Нажмите ниже для заказа!";
        } else if (lowerMsg.includes('адрес') || lowerMsg.includes('где')) {
          replyText = "Мы по адресу ул. Н. Тестемицану 21/1! 📍 Ждем вас или заказывайте онлайн ниже! 🛵";
        } else {
          replyText = "Здравствуйте! 🧇 Спасибо за обращение в Munchotella! Откройте меню по кнопке ниже!";
        }
      } else if (lang === 'en') {
        replyText = "Hello! 🧇 Welcome to Munchotella! Click the button below to view our menu and order! ✨";
      } else {
        if (lowerMsg.includes('pret') || lowerMsg.includes('preț') || lowerMsg.includes('meniu') || lowerMsg.includes('waffle') || lowerMsg.includes('clatite') || lowerMsg.includes('clătite') || lowerMsg.includes('dulce') || lowerMsg.includes('desert') || lowerMsg.includes('mancare') || lowerMsg.includes('mâncare')) {
          replyText = "Bună! 🧇 Avem cele mai delicioase Waffles și Crepes! Apasă butonul de mai jos pentru meniu și comandă! ✨";
        } else if (lowerMsg.includes('livrare') || lowerMsg.includes('comanda') || lowerMsg.includes('comandă') || lowerMsg.includes('livrati') || lowerMsg.includes('livrați') || lowerMsg.includes('curier') || lowerMsg.includes('taxi')) {
          replyText = "Bună! 🛵 Livrăm rapid în tot Chișinăul prin curier, iar în suburbii prin taxi! Poți comanda direct mai jos!";
        } else if (lowerMsg.includes('adresa') || lowerMsg.includes('adresă') || lowerMsg.includes('locatie') || lowerMsg.includes('locație') || lowerMsg.includes('unde') || lowerMsg.includes('strada') || lowerMsg.includes('chisinau') || lowerMsg.includes('chișinău')) {
          replyText = "Ne găsești pe Str. Nicolae Testemițeanu 21/1! 📍 Vă așteptăm cu drag sau comandați online mai jos! 🛵";
        } else {
          replyText = "Bună ziua! 🧇 Cu ce vă putem ajuta azi? Consultați meniul nostru mai jos!";
        }
      }
    }

    // Eliminăm forțat absolut orice apariție a cuvântului 'americane' sau 'american'
    replyText = replyText
      .replace(/waffles?\s+americane?/gi, 'waffles')
      .replace(/waffle\s+american[aăe]?/gi, 'waffle')
      .replace(/americane?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    let sendResult = null;
    const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || PERMANENT_META_PAGE_ACCESS_TOKEN;

    const cleanText = replyText.replace(/https?:\/\/(www\.)?munchotella\.md\/[a-z]{2}\/menu\/?/gi, '').replace(/https?:\/\/(www\.)?munchotella\.md\/?/gi, '').trim();

    // Configurare buton & URL direct pe pagina de meniu specifică limbii clientului (/ro/menu, /ru/menu, /en/menu)
    let buttonTitle = "🧇 Deschide Meniul";
    let menuUrl = "https://www.munchotella.md/ro/menu";

    if (lang === 'ru') {
      buttonTitle = "🧇 Открыть Меню";
      menuUrl = "https://www.munchotella.md/ru/menu";
    } else if (lang === 'en') {
      buttonTitle = "🧇 Open Menu";
      menuUrl = "https://www.munchotella.md/en/menu";
    }

    try {
      const buttonPayload = {
        recipient: { id: senderId },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: cleanText || replyText,
              buttons: [
                {
                  type: "web_url",
                  url: menuUrl,
                  title: buttonTitle
                }
              ]
            }
          }
        }
      };

      const metaRes = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${metaAccessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buttonPayload)
      });
      sendResult = await metaRes.json();

      // Dacă Meta returnează eroare la șablonul cu buton, facem fallback automat la mesajul text simplu cu URL-ul specific limbii
      if (sendResult?.error) {
        console.warn("Trimiterea cu buton a returnat atenționare, se încearcă fallback la text simplu:", sendResult.error);
        const textPayload = {
          recipient: { id: senderId },
          message: { text: replyText.includes('munchotella.md') ? replyText : `${replyText}\n\n🌐 ${menuUrl}` }
        };
        const fallbackRes = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${metaAccessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(textPayload)
        });
        sendResult = await fallbackRes.json();
      }

      console.log(`Răspuns trimis cu succes prin Meta Graph API către ${senderId}:`, sendResult);
    } catch (metaErr) {
      console.error("Eroare la trimiterea prin Meta Graph API:", metaErr);
    }

    return { success: true, sendResult, replyText, tone, lang, menuUrl };

  } catch (err: any) {
    console.error("Eroare la procesarea mesajului cu Gemini/Meta:", err);
    return { error: err?.message || String(err), stack: err?.stack };
  }
}
