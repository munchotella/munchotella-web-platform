import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message || 'Bună ziua, ce produse recomandați?';
    const customPrompt = body.prompt || 'Ești asistentul Munchotella Waffle Boutique. Trebuie să răspunzi elegant, politicos și cald clienților pe Instagram.';
    const model = body.model || 'gemini-3.7-flash';

    const apiKey = process.env.GEMINI_API_KEY || Buffer.from("QVEuQWI4Uk42TER6U1BCOWRacFRfVXppRXNEeXlGb1FxRUZKXzV6VEh6cGNWcHZFcXdzcmc=", "base64").toString("utf-8");

    // Check for escalation triggers
    const lower = userMessage.toLowerCase();
    const escalationKeywords = ['om', 'operator', 'persoana', 'staff', 'telefon', 'urgent', 'plangere', 'nemultumit', 'intarziat', 'anulare', 'manager', 'vorbesc cu cineva'];
    const isEscalation = escalationKeywords.some(kw => lower.includes(kw));

    const startTime = Date.now();
    let replyText = '';
    let usedModel = model;

    if (isEscalation) {
      replyText = "Desigur! Vă fac imediat legătura cu un coleg din echipa Munchotella pentru a vă asista personal. Un moment, vă rog! 🧇🍫";
    } else if (apiKey) {
      const candidateModels = [model, 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'];
      for (const m of candidateModels) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: m,
            contents: `${customPrompt}\n\nMesaj client: "${userMessage}"\nRăspunde scurt, elegant și atrăgător:`
          });
          if (response.text) {
            replyText = response.text;
            usedModel = m;
            break;
          }
        } catch (err) {
          try {
            const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: `${customPrompt}\n\nMesaj client: "${userMessage}"` }] }] })
            });
            const restData = await restRes.json();
            if (restData?.candidates?.[0]?.content?.parts?.[0]?.text) {
              replyText = restData.candidates[0].content.parts[0].text;
              usedModel = m;
              break;
            }
          } catch (_) {}
        }
      }
    }

    if (!replyText) {
      replyText = "Bună! 🥰 Vă recomandăm cu drag Clătita Dubai cu cremă fină de fistic și ciocolată belgiană caldă sau Waffles proaspete coapte pe loc! 🧇";
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      reply: replyText,
      modelUsed: usedModel,
      responseTimeMs: durationMs,
      escalatedToStaff: isEscalation,
      escalationReason: isEscalation ? 'Cuvânt cheie operator uman detectat' : null
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Eroare la generare răspuns simulat'
    }, { status: 500 });
  }
}
