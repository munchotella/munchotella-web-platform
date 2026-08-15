import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PERMANENT_META_PAGE_ACCESS_TOKEN = "EAAVxZCgeumYUBSCIdviX1bYuubsuZCp3TWPXSPZCE9TfaJKTHu7fTv542LYbiOFC2ZB16SZAAprVec1Dvx8db6ydyU4shHOb8ZAI6wxLsF9mep5cKYjQivMxLbRp21qoOsdwZBZCe2yc5vZBTwA4noZArn3edbYSs8b9ZA8IDHP4H5l73BuM7xQvhYfXe1TF3Gj8zWVi8kL";
const INSTAGRAM_ACCOUNT_ID = "17841407196466279";
const FACEBOOK_PAGE_ID = "2033309050260259";

// Catalogul oficial de produse cu ingrediente exacte
const MENU_CATALOG = [
  // Waffles
  { id: "waffle_sticks", name: "Waffle sticks", price: 145, category: "waffles", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb3799de38d298ead5916_Waffle%20sticks%2095%20lei.png", ingredients: "2 waffles, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus", hasFistic: false, hasArahide: false },
  { id: "delux_mini_waffle", name: "Delux mini waffle", price: 160, category: "waffles", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a95a6d8f14054865f_Delux%20mini%20waffle%20110%20lei.png", ingredients: "16 mini waffles, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus, fistic, arahide", hasFistic: true, hasArahide: true },
  { id: "nutella_mini_waffles", name: "Nutella Mini waffles", price: 145, category: "waffles", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a2693b04934ff4e38_Nutella%20Mini%20waffles%20100%20lei.png", ingredients: "16 mini waffles, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus", hasFistic: false, hasArahide: false },
  { id: "lotus_mini_waffles", name: "Lotus Mini waffles", price: 200, category: "waffles", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a1dbf645960e17923_Lotus%20mini%20waffle%20105%20lei.png", ingredients: "16 mini waffles, pastă Lotus Biscoff, ciocolată albă Belgiană, biscuiți Baby", hasFistic: false, hasArahide: false },
  { id: "fruits_waffle", name: "Fruits waffle", price: 155, category: "waffles", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbbf696f40c3d241e1d7e_Fruits%20waffle%20100%20lei.png", ingredients: "Waffle, Nutella®, ciocolată albă Belgiană, banane, căpșuni, kiwi", hasFistic: false, hasArahide: false },
  { id: "classic_waffle", name: "Classic waffle", price: 145, category: "waffles", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbbf7b1acf26632f25e9f_Classic%20waffle%2095%20lei.png", ingredients: "Waffle, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus", hasFistic: false, hasArahide: false },
  { id: "belgian_panda_waffle", name: "Belgian panda waffle", price: 160, category: "waffles", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbbf7c1ee0c7aa2016335_Belgian%20panda%20waffle%20100%20lei.png", ingredients: "Waffle, Nutella®, ciocolată albă Belgiană", hasFistic: false, hasArahide: false },
  { id: "biscoff_waffle", name: "Biscoff waffle", price: 195, category: "waffles", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbbf830eec8a3d52670e3_Biscoff%20waffle%20120%20lei.png", ingredients: "Waffle, pastă Lotus Biscoff, ciocolată albă Belgiană, biscuiți Lotus", hasFistic: false, hasArahide: false },

  // Crepes
  { id: "crepe_dubai", name: "Crepe Dubai", price: 265, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc4465b822d64f0b2f15_Delux%20crepe%20110%20lei.png", ingredients: "Clătită, kataif crocant, cremă de fistic, Nutella®", hasFistic: true, hasArahide: false },
  { id: "delux_crepe", name: "Delux crepe", price: 165, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc4465b822d64f0b2f15_Delux%20crepe%20110%20lei.png", ingredients: "Clătită, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus, fistic, arahide", hasFistic: true, hasArahide: true },
  { id: "biscoff_crepe", name: "Biscoff crepe", price: 205, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc434f3c051ae7a296b1_Biscoff%20crepe%20125%20lei.png", ingredients: "Clătită, pastă Lotus Biscoff, ciocolată albă Belgiană, biscuiți Lotus", hasFistic: false, hasArahide: false },
  { id: "fruits_crepe", name: "Fruits crepe", price: 145, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc44c1ee0c7aa201b1cb_Fruits%20crepe%20100%20lei.png", ingredients: "Clătită, Nutella®, ciocolată albă Belgiană, banane, căpșuni, kiwi", hasFistic: false, hasArahide: false },
  { id: "oreo_crepe", name: "Oreo crepe", price: 145, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc440cf1d670ba35b2e9_Oreo%20crepe%20100%20lei.png", ingredients: "Clătită, Nutella®, ciocolată albă Belgiană, biscuiți Oreo", hasFistic: false, hasArahide: false },
  { id: "kinder_crepe", name: "Kinder crepe", price: 145, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc453efae2800d3bb6b6_Kinder%20crepe%20100%20lei.png", ingredients: "Clătită, Nutella®, ciocolată albă Belgiană, Kinder Bueno", hasFistic: false, hasArahide: false },
  { id: "chocolate_bites", name: "Chocolate bites", price: 165, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc45479cb20349a2a7a4_Chocolate%20bites%20110%20lei.png", ingredients: "Bucățele clătită, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus", hasFistic: false, hasArahide: false },
  { id: "royal_sushi", name: "Royal sushi", price: 155, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc45479cb20349a2a78f_Royal%20sushi%20105%20lei.png", ingredients: "Sushi clătită, Nutella®, căpșuni proaspete, banane", hasFistic: false, hasArahide: false },
  { id: "sushi_banana", name: "Sushi banana", price: 140, category: "crepes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc46dfc093a105ae3fc4_Sushi%20banana%2090%20lei.png", ingredients: "Sushi clătită cu banană întreagă, Nutella®, ciocolată albă Belgiană", hasFistic: false, hasArahide: false },

  // Pancakes
  { id: "biskoff_pancakes", name: "Biskoff pancakes", price: 190, category: "pancakes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbd00839e55d5bb2c73eb_Biskoff%20pancakes%20120%20lei.png", ingredients: "Pancakes, pastă Lotus Biscoff, ciocolată albă Belgiană, biscuiți Lotus", hasFistic: false, hasArahide: false },
  { id: "fruits_pancakes", name: "Fruits pancakes", price: 170, category: "pancakes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbd0155b9e59d9c24e8d3_Fruits%20pancakes%20110%20lei.png", ingredients: "Pancakes, Nutella®, ciocolată albă Belgiană, fructe proaspete", hasFistic: false, hasArahide: false },
  { id: "royal_pancakes", name: "Royal pancakes", price: 165, category: "pancakes", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbd0168340d2a45d064cf_Royal%20pancakes%20105%20lei.png", ingredients: "Pancakes, Nutella®, ciocolată albă Belgiană, biscuiți Oreo & Lotus", hasFistic: false, hasArahide: false },

  // Drinks
  { id: "drink_milkshake_oreo", name: "Milkshake Oreo", price: 135, category: "drinks", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbdd865b822d64f0ca2cf_Milk%20shake%20Oreo%2075%20lei.png", ingredients: "Lapte, înghețată, biscuiți Oreo, frișcă", hasFistic: false, hasArahide: false },
  { id: "drink_milkshake_kinder", name: "Milkshake Kinder", price: 135, category: "drinks", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbdd8479cb20349a40552_Milk%20shake%20Kinder%2075%20lei.png", ingredients: "Lapte, înghețată, Kinder Bueno, frișcă", hasFistic: false, hasArahide: false },
  { id: "drink_milkshake_nutella", name: "Milkshake Nutella", price: 135, category: "drinks", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbdd9f83a48e77ce0ea33_Milk%20shake%20Nutella%2075%20lei.png", ingredients: "Lapte, înghețată, Nutella®, frișcă", hasFistic: false, hasArahide: false },
  { id: "drink_milkshake_strawberry", name: "Milkshake Strawberry", price: 135, category: "drinks", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbdd9479cb20349a4066f_Milk%20shake%20Strawberry%2075%20lei.png", ingredients: "Lapte, înghețată, piure căpșuni proaspete, frișcă", hasFistic: false, hasArahide: false },
  { id: "drink_ice_lemonade", name: "Ice Lemonade", price: 90, category: "drinks", image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbe4d96f40c3d242045e7_Ice%20Lemonade%2050%20lei.png", ingredients: "Lămâie proaspătă, mentă, gheață, apă minerală", hasFistic: false, hasArahide: false }
];

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
  const lower = text.toLowerCase().trim();
  
  const enPhrases = [
    'i want to order', 'can i order', 'how much is', 'what is the price', 
    'do you deliver', 'where are you located', 'open menu', 'english please', 
    'good afternoon', 'good evening', 'hello there', 'hi there'
  ];
  
  const hasEnPhrase = enPhrases.some(p => lower.includes(p));
  const hasRoIndicators = /(\b(vreau|sa|să|comand|comanda|comandă|salut|buna|bună|ziua|ce|cu|de|la|pe|si|și|nu|un|o|am|ai|au|este|sunt|unde|cat|cât|fara|fără|atat|atât|multumesc|mulțumesc|mersi)\b)/i.test(text);

  if (hasEnPhrase && !hasRoIndicators) {
    return 'en';
  }

  return 'ro';
}

function matchProductInText(text: string): { product: typeof MENU_CATALOG[0] | null, quantity: number, customization?: string } {
  const lower = text.toLowerCase().trim();
  
  // Detectare cantitate
  let quantity = 1;
  const qtyMatch = lower.match(/\b(\d+)\s*(porți[ie]?|buc[aă]ți?|x)?\b/);
  if (qtyMatch && parseInt(qtyMatch[1]) > 0 && parseInt(qtyMatch[1]) <= 20) {
    quantity = parseInt(qtyMatch[1]);
  } else if (lower.includes('doua') || lower.includes('două') || lower.includes('два') || lower.includes('две')) {
    quantity = 2;
  } else if (lower.includes('trei') || lower.includes('три')) {
    quantity = 3;
  }

  // Detectare preferințe / excluderi
  let customization: string | undefined = undefined;
  if (lower.includes('fără fistic') || lower.includes('fara fistic') || lower.includes('без фисташек') || lower.includes('без фисташки') || lower.includes('no pistachio')) {
    customization = "Fără fistic";
  } else if (lower.includes('fără arahide') || lower.includes('fara arahide') || lower.includes('fără alune') || lower.includes('fara alune') || lower.includes('без арахиса') || lower.includes('no peanuts')) {
    customization = "Fără arahide";
  } else if (lower.includes('fără zahăr') || lower.includes('fara zahar')) {
    customization = "Fără zahăr adăugat";
  }

  // 1. Matcher Argou & Sinonime Speciale
  if (lower.includes('fashafish') || lower.includes('fașa') || lower.includes('fasa') || lower.includes('fashafisha') || lower.includes('gogosi mini') || lower.includes('gogoși mini') || lower.includes('пончики')) {
    const p = MENU_CATALOG.find(m => m.id === 'nutella_mini_waffles');
    return { product: p || null, quantity, customization };
  }

  if (lower.includes('garuz') || lower.includes('garose') || lower.includes('garuzh') || lower.includes('limonada') || lower.includes('limonadă') || lower.includes('lemonade') || lower.includes('лимонад')) {
    const p = MENU_CATALOG.find(m => m.id === 'drink_ice_lemonade');
    return { product: p || null, quantity, customization };
  }

  if (lower.includes('kunafe') || lower.includes('kunafa') || lower.includes('knafe') || lower.includes('кунафе') || lower.includes('dubai') || lower.includes('kataif') || lower.includes('дубай')) {
    const p = MENU_CATALOG.find(m => m.id === 'crepe_dubai');
    return { product: p || null, quantity, customization };
  }

  // 2. Pancakes Matching (inclusiv "pancake delux")
  if (lower.includes('pancake delux') || lower.includes('pancakes delux') || lower.includes('delux pancake') || lower.includes('deluxe pancake') || lower.includes('royal pancake') || lower.includes('royal pancakes') || lower.includes('панкейк роял') || lower.includes('панкейки делюкс')) {
    const p = MENU_CATALOG.find(m => m.id === 'royal_pancakes');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('biscoff pancake') || lower.includes('biskoff pancake') || lower.includes('lotus pancake') || lower.includes('панкейк бискофф')) {
    const p = MENU_CATALOG.find(m => m.id === 'biskoff_pancakes');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('fruits pancake') || lower.includes('pancake cu fructe') || lower.includes('pancakes fructe') || lower.includes('панкейк с фруктами')) {
    const p = MENU_CATALOG.find(m => m.id === 'fruits_pancakes');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('pancake') || lower.includes('pancakes') || lower.includes('панкейк') || lower.includes('панкейки')) {
    const p = MENU_CATALOG.find(m => m.id === 'royal_pancakes');
    return { product: p || null, quantity, customization };
  }

  // 3. Waffles Matching
  if (lower.includes('clatite pe bat') || lower.includes('clătite pe băț') || lower.includes('waffle stick') || lower.includes('waffles stick') || lower.includes('waffle sticks') || lower.includes('sticks') || lower.includes('палочки')) {
    const p = MENU_CATALOG.find(m => m.id === 'waffle_sticks');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('delux mini') || lower.includes('deluxe mini') || lower.includes('mini waffle delux')) {
    const p = MENU_CATALOG.find(m => m.id === 'delux_mini_waffle');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('lotus mini') || lower.includes('mini lotus')) {
    const p = MENU_CATALOG.find(m => m.id === 'lotus_mini_waffles');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('nutella mini') || lower.includes('mini waffle') || lower.includes('mini waffles')) {
    const p = MENU_CATALOG.find(m => m.id === 'nutella_mini_waffles');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('fruits waffle') || lower.includes('waffle cu fructe')) {
    const p = MENU_CATALOG.find(m => m.id === 'fruits_waffle');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('classic waffle') || lower.includes('waffle clasic')) {
    const p = MENU_CATALOG.find(m => m.id === 'classic_waffle');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('panda waffle') || lower.includes('belgian panda')) {
    const p = MENU_CATALOG.find(m => m.id === 'belgian_panda_waffle');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('biscoff waffle') || lower.includes('waffle biscoff') || lower.includes('waffle lotus')) {
    const p = MENU_CATALOG.find(m => m.id === 'biscoff_waffle');
    return { product: p || null, quantity, customization };
  }

  // 4. Crepes Matching
  if (lower.includes('delux crepe') || lower.includes('crepe delux') || lower.includes('delux clatita') || lower.includes('clatita delux') || lower.includes('clătită delux')) {
    const p = MENU_CATALOG.find(m => m.id === 'delux_crepe');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('biscoff crepe') || lower.includes('crepe biscoff') || lower.includes('clatita lotus') || lower.includes('clatita biscoff')) {
    const p = MENU_CATALOG.find(m => m.id === 'biscoff_crepe');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('fruits crepe') || lower.includes('crepe cu fructe') || lower.includes('clatita cu fructe')) {
    const p = MENU_CATALOG.find(m => m.id === 'fruits_crepe');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('oreo crepe') || lower.includes('crepe oreo') || lower.includes('clatita oreo')) {
    const p = MENU_CATALOG.find(m => m.id === 'oreo_crepe');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('kinder crepe') || lower.includes('crepe kinder') || lower.includes('clatita kinder')) {
    const p = MENU_CATALOG.find(m => m.id === 'kinder_crepe');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('chocolate bites') || lower.includes('bites')) {
    const p = MENU_CATALOG.find(m => m.id === 'chocolate_bites');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('royal sushi') || lower.includes('sushi clatita') || lower.includes('sushi royal')) {
    const p = MENU_CATALOG.find(m => m.id === 'royal_sushi');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('sushi banana') || lower.includes('banana sushi')) {
    const p = MENU_CATALOG.find(m => m.id === 'sushi_banana');
    return { product: p || null, quantity, customization };
  }

  // 5. Drinks Matching
  if (lower.includes('milkshake oreo') || lower.includes('milsheic oreo') || lower.includes('коктейль орео')) {
    const p = MENU_CATALOG.find(m => m.id === 'drink_milkshake_oreo');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('milkshake kinder') || lower.includes('milsheic kinder') || lower.includes('коктейль киндер')) {
    const p = MENU_CATALOG.find(m => m.id === 'drink_milkshake_kinder');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('milkshake nutella') || lower.includes('milsheic nutella') || lower.includes('коктейль нутелла')) {
    const p = MENU_CATALOG.find(m => m.id === 'drink_milkshake_nutella');
    return { product: p || null, quantity, customization };
  }
  if (lower.includes('milkshake strawberry') || lower.includes('milkshake capsuni') || lower.includes('milsheic capsuni') || lower.includes('клубничный коктейль')) {
    const p = MENU_CATALOG.find(m => m.id === 'drink_milkshake_strawberry');
    return { product: p || null, quantity, customization };
  }

  // 6. Căutare directă după nume din catalog
  for (const item of MENU_CATALOG) {
    if (lower.includes(item.name.toLowerCase())) {
      return { product: item, quantity, customization };
    }
  }

  return { product: null, quantity, customization };
}

import { connectToDatabase } from '@/lib/mongodb';

const inMemorySessions = new Map<string, any>();

async function getSession(senderId: string) {
  const cached = inMemorySessions.get(senderId);
  if (cached && (Date.now() - (cached.lastUpdated || 0) < 2 * 60 * 60 * 1000)) {
    return cached;
  }

  try {
    const { db: mongoDb } = await connectToDatabase();
    const doc = await mongoDb.collection('instagram_order_sessions').findOne({ senderId });
    if (doc) {
      if (doc.lastUpdated && (Date.now() - doc.lastUpdated < 2 * 60 * 60 * 1000)) {
        inMemorySessions.set(senderId, doc);
        return doc;
      }
    }
  } catch (err) {
    console.warn("Atenționare citire sesiune MongoDB (se folosește memoria locală):", err);
  }

  const initial = {
    senderId,
    state: 'IDLE',
    cart: [],
    isHumanAssistedUntil: 0,
    lastUpdated: Date.now()
  };
  inMemorySessions.set(senderId, initial);
  return initial;
}

async function saveSession(senderId: string, sessionData: any) {
  const updatedData = {
    ...sessionData,
    lastUpdated: Date.now()
  };
  inMemorySessions.set(senderId, updatedData);

  try {
    const { db: mongoDb } = await connectToDatabase();
    await mongoDb.collection('instagram_order_sessions').updateOne(
      { senderId },
      { $set: updatedData },
      { upsert: true }
    );
  } catch (err) {
    console.warn("Atenționare salvare sesiune MongoDB:", err);
  }
}

async function processMessage(senderId: string, messageText: string) {
  try {
    const lang = detectLanguage(messageText);
    const lowerMsg = messageText.toLowerCase().trim();

    // 1. Încărcare sesiune client
    let session = await getSession(senderId);

    // 2. Verificare Human Handoff (Pauză strictă doar pentru această conversație)
    if (session.isHumanAssistedUntil && session.isHumanAssistedUntil > Date.now()) {
      console.log(`Conversația cu ${senderId} este preluată de un operator uman. Botul rămâne în pauză.`);
      return { success: true, status: 'human_assisted_pause_active' };
    }

    // 3. Verificare cerere explicită de operator uman
    if (lowerMsg.includes('operator') || lowerMsg.includes('om real') || lowerMsg.includes('persoana') || lowerMsg.includes('persoană') || lowerMsg.includes('человек') || lowerMsg.includes('оператор') || lowerMsg.includes('human')) {
      session.isHumanAssistedUntil = Date.now() + 30 * 60 * 1000;
      await saveSession(senderId, session);

      const handoffReply = lang === 'ru'
        ? "Конечно! 🤝 Я передал диалог нашему сотруднику. Оператор ответит вам здесь в ближайшее время!"
        : "Desigur! 🤝 V-am pus în legătură cu un coleg din echipa Munchotella. Un operator vă va răspunde aici în câteva momente!";

      await sendMetaResponse(senderId, handoffReply, "https://www.munchotella.md/ro/menu", "🧇 Meniu Munchotella");
      return { success: true, status: 'human_handoff_triggered', replyText: handoffReply };
    }

    // 4. Verificare resetare / anulare comandă
    if (lowerMsg.includes('anuleaza comanda') || lowerMsg.includes('anulează comanda') || lowerMsg.includes('reset') || lowerMsg.includes('goleste cosul') || lowerMsg.includes('golește coșul') || lowerMsg.includes('отмена заказа') || lowerMsg.includes('cancel order')) {
      session.cart = [];
      session.state = 'IDLE';
      await saveSession(senderId, session);

      const cancelReply = lang === 'ru'
        ? "Заказ отменен, а корзина очищена! 🧇 Обращайтесь, когда будете готовы сделать заказ!"
        : "Am anulat comanda și am golit coșul! 🧇 Vă stau la dispoziție oricând doriți să reluăm!";

      await sendMetaResponse(senderId, cancelReply, `https://www.munchotella.md/${lang}/menu`, "🧇 Deschide Meniul");
      return { success: true, status: 'order_cancelled', replyText: cancelReply };
    }

    // 5. State Machine: Conversational Ordering Flow
    let replyText = "";
    let shouldSendCartButton = false;
    let customMenuUrl: string | null = null;
    let customButtonTitle: string | null = null;

    const isOrderIntent = lowerMsg.includes('vreau sa comand') || lowerMsg.includes('vreau să comand') || lowerMsg.includes('as dori sa comand') || lowerMsg.includes('aș dori să comand') || lowerMsg.includes('fac o comanda') || lowerMsg.includes('fac o comandă') || lowerMsg.includes('comanda') || lowerMsg.includes('comandă') || lowerMsg.includes('хочу заказать') || lowerMsg.includes('сделать заказ') || lowerMsg.includes('i want to order');

    // Scenariu: Clientul inițiază comanda din stare IDLE
    if (session.state === 'IDLE' && isOrderIntent && !matchProductInText(messageText).product) {
      session.state = 'AWAITING_PRODUCT';
      await saveSession(senderId, session);

      replyText = lang === 'ru'
        ? "С удовольствием! 🧇 Что бы вы хотели заказать сегодня из меню Munchotella?"
        : "Cu mare drag! 🧇 Ce bunătăți ați dori să comandați astăzi din meniul Munchotella?";

      await sendMetaResponse(senderId, replyText, `https://www.munchotella.md/${lang}/menu`, lang === 'ru' ? "🧇 Открыть Меню" : "🧇 Deschide Meniul");
      return { success: true, status: 'awaiting_product', replyText };
    }

    // Helper pentru generarea linkului de checkout preîncărcat
    const generateCheckoutReply = async () => {
      const currentCart = session.cart || [];
      const totalSum = currentCart.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);

      const cartJsonString = JSON.stringify(currentCart);
      const encodedCart = Buffer.from(unescape(encodeURIComponent(cartJsonString))).toString('base64');
      
      const cartNotes = currentCart.filter((i: any) => i.customization).map((i: any) => `${i.name}: ${i.customization}`).join(', ');
      const notesParam = cartNotes ? `&notes=${encodeURIComponent(cartNotes)}` : '';

      customMenuUrl = `https://www.munchotella.md/${lang}/menu?preloadedCart=${encodeURIComponent(encodedCart)}&openCart=true${notesParam}`;

      if (lang === 'ru') {
        replyText = `Ваш заказ готов (${totalSum} MDL)! 🧇 Нажмите кнопку ниже, чтобы открыть корзину и заполнить адрес доставки на сайте! ✨`;
        customButtonTitle = `🛍️ Открыть Корзину (${totalSum} MDL)`;
      } else {
        replyText = `Am pus în coș produsele dvs. (Total: ${totalSum} MDL)! 🧇 Puteți continua completarea adresei și finalizarea comenzii pe butonul de mai jos! ✨`;
        customButtonTitle = `🛍️ Deschide Coșul (${totalSum} MDL)`;
      }

      session.state = 'IDLE';
      await saveSession(senderId, session);

      await sendMetaResponse(senderId, replyText, customMenuUrl, customButtonTitle);
      return { success: true, status: 'order_completed_link_generated', cart: currentCart, totalSum, customMenuUrl, replyText };
    };

    // Verificare checkout direct dacă există produse în coș
    const isCheckoutIntent = lowerMsg.includes('gata') || lowerMsg.includes('final') || lowerMsg.includes('trimite') || lowerMsg.includes('checkout') || lowerMsg.includes('link') || lowerMsg.includes('vreau doar') || lowerMsg.includes('doar atat') || lowerMsg.includes('doar atât') || lowerMsg.includes('готово') || lowerMsg.includes('отправь');

    if ((session.cart && session.cart.length > 0) && isCheckoutIntent && !matchProductInText(messageText).product) {
      return await generateCheckoutReply();
    }

    // Detectare produs în text
    const matched = matchProductInText(messageText);

    if (matched.product) {
      const itemToAdd = {
        id: matched.product.id,
        name: matched.product.name,
        price: matched.product.price,
        image: matched.product.image,
        quantity: matched.quantity,
        customization: matched.customization
      };

      const existingIndex = (session.cart || []).findIndex((i: any) => i.id === itemToAdd.id && i.customization === itemToAdd.customization);
      if (existingIndex > -1) {
        session.cart[existingIndex].quantity += itemToAdd.quantity;
      } else {
        session.cart = [...(session.cart || []), itemToAdd];
      }

      let customNoteText = "";
      if (matched.customization) {
        customNoteText = ` (${matched.customization})`;
      }

      const isDrink = matched.product.category === 'drinks';

      if (isDrink) {
        session.state = 'AWAITING_DRINKS';
        await saveSession(senderId, session);

        if (lang === 'ru') {
          replyText = `С удовольствием добавил ${itemToAdd.quantity > 1 ? itemToAdd.quantity + 'x ' : ''}${matched.product.name}${customNoteText} (${matched.product.price * itemToAdd.quantity} MDL)! 🥤 Хотите оформить заказ или добавить еще что-нибудь?`;
        } else {
          replyText = `Am adăugat cu drag ${itemToAdd.quantity > 1 ? itemToAdd.quantity + 'x ' : ''}${matched.product.name}${customNoteText} (${matched.product.price * itemToAdd.quantity} MDL)! 🥤 Doriți să finalizăm comanda sau mai adăugăm ceva?`;
        }
      } else {
        session.state = 'AWAITING_MORE_DESSERTS';
        await saveSession(senderId, session);

        if (lang === 'ru') {
          replyText = `С удовольствием добавил ${itemToAdd.quantity > 1 ? itemToAdd.quantity + 'x ' : ''}${matched.product.name}${customNoteText} (${matched.product.price * itemToAdd.quantity} MDL) в ваш заказ! 🧇 Хотите добавить еще что-нибудь сладкое?`;
        } else {
          replyText = `Am adăugat cu drag ${itemToAdd.quantity > 1 ? itemToAdd.quantity + 'x ' : ''}${matched.product.name}${customNoteText} (${matched.product.price * itemToAdd.quantity} MDL) în coșul dvs.! 🧇 Mai doriți încă ceva dulce sau un alt preparat?`;
        }
      }

      await sendMetaResponse(senderId, replyText, `https://www.munchotella.md/${lang}/menu`, lang === 'ru' ? "🧇 Меню" : "🧇 Meniu");
      return { success: true, status: 'product_added', cart: session.cart, replyText };
    }

    // Dacă suntem în starea AWAITING_MORE_DESSERTS și clientul zice "nu"
    const isNegative = lowerMsg === 'nu' || lowerMsg.startsWith('nu ') || lowerMsg.includes('nu mai vreau') || lowerMsg.includes('atat') || lowerMsg.includes('atât') || lowerMsg.includes('nimic') || lowerMsg.includes('mersi') || lowerMsg === 'нет' || lowerMsg.startsWith('нет ') || lowerMsg.includes('больше ничего') || lowerMsg.includes('спасибо') || lowerMsg === 'no';

    if (session.state === 'AWAITING_MORE_DESSERTS' && isNegative) {
      session.state = 'AWAITING_DRINKS';
      await saveSession(senderId, session);

      replyText = lang === 'ru'
        ? "Хотите добавить освежающий напиток? У нас есть Ice Lemonade (90 MDL) или густой Milkshake (Oreo, Kinder, Nutella, Клубника — 135 MDL)? 🥤"
        : "Doriți să adăugăm și o băutură răcoritoare? Avem Ice Lemonade naturală (90 MDL) sau Milkshake cremos (Oreo, Kinder, Nutella, Căpșuni — 135 MDL)? 🥤";

      await sendMetaResponse(senderId, replyText, `https://www.munchotella.md/${lang}/menu`, lang === 'ru' ? "🥤 Напитки" : "🥤 Băuturi");
      return { success: true, status: 'awaiting_drinks', replyText };
    }

    // Dacă suntem în starea AWAITING_DRINKS și clientul refuză băuturile sau cere finalizarea
    if (session.state === 'AWAITING_DRINKS' && (isNegative || isCheckoutIntent || lowerMsg.includes('da') || lowerMsg.includes('da finalizam') || lowerMsg.includes('da finalizăm') || lowerMsg.includes('da trimite'))) {
      return await generateCheckoutReply();
    }

    // 6. Gemini Generative AI cu Ghidul de Scenarii Oficial
    const baseMenuPrompt = `Ești asistentul virtual oficial al cafenelei artizanale Munchotella Waffle Boutique din Chișinău (Str. Nicolae Testemițeanu 21/1). Website: www.munchotella.md.

REGULI STRICTE DE AUR:
1. NU folosi NICIODATĂ cuvântul 'laborator' (suntem cafenea / Waffle Boutique artizanal).
2. NU folosi NICIODATĂ cuvântul 'nuci' (în rețetele noastre nu există nuci). Singurele ingrediente din această categorie sunt FISTIC și ARAHIDE (prezente doar la Crepe Dubai, Delux crepe și Delux mini waffle).
3. NU folosi NICIODATĂ cuvântul 'americane' sau 'waffles americane'. Spune doar 'waffle', 'waffles' sau denumirea exactă din meniu.
4. Răspunde SCURT, CALD și DIRECT (maxim 1-3 propoziții).
5. Dacă clientul cere un preparat fără fistic sau fără arahide (ex: Delux mini waffle fără fistic): confirmă că bucătarul va pregăti desertul fără fistic și enumeră exact ingredientele reale care rămân pe produs (Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus, arahide).

CATALOG MENIU OFICIAL:
- Waffles: Waffle sticks (145 MDL), Delux mini waffle (160 MDL), Nutella Mini waffles (145 MDL), Lotus Mini waffles (200 MDL), Fruits waffle (155 MDL), Classic waffle (145 MDL), Belgian panda waffle (160 MDL), Biscoff waffle (195 MDL).
- Crepes & Specialități: Delux crepe (165 MDL), Biscoff crepe (205 MDL), Fruits crepe (145 MDL), Oreo crepe (145 MDL), Kinder crepe (145 MDL), Crepe Dubai (265 MDL), Chocolate bites (165 MDL), Royal sushi (155 MDL), Sushi banana (140 MDL).
- Pancakes: Biskoff pancakes (190 MDL), Fruits pancakes (170 MDL), Royal pancakes (165 MDL).
- Băuturi: Ice Lemonade (90 MDL), Milkshake Oreo / Kinder / Nutella / Strawberry (135 MDL).
- Program: Zilnic 16:00 - 01:00 noaptea.
- Livrare: În Chișinău (60-70 MDL curier), suburbii (taxi partener).`;

    let tone = "elegant";
    let adminCustomPrompt = "";

    try {
      const settingsRef = doc(db, 'settings', 'ai_instagram');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.prompt) adminCustomPrompt = data.prompt;
        if (data.tone) tone = data.tone;
      }
    } catch (dbErr) {
      console.warn("Nu s-au putut încărca setările AI din Admin:", dbErr);
    }

    const finalPrompt = `${baseMenuPrompt}\n\n${adminCustomPrompt ? `[Instrucțiuni Admin: ${adminCustomPrompt}]\n` : ""}\n[Limbă: ${lang.toUpperCase()}]\n[Mesaj client: "${messageText}"]\n[Răspuns scurt și la obiect]:`;

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
        console.warn("GoogleGenAI SDK fallback to REST:", genAiErr?.message);
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

    // Fallback de siguranță dacă Gemini nu răspunde
    if (!replyText) {
      if (lang === 'ru') {
        replyText = "Здравствуйте! 🧇 С удовольствием поможем вам выбрать что-то вкусное! Откройте меню по кнопке ниже! ✨";
      } else {
        replyText = "Bună! 🧇 Vă ajutăm cu cel mai mare drag să alegeți ceva delicios! Puteți vedea meniul complet pe butonul de mai jos! ✨";
      }
    }

    // Curățare finală a textului
    replyText = replyText
      .replace(/waffles?\s+americane?/gi, 'waffles')
      .replace(/waffle\s+american[aăe]?/gi, 'waffle')
      .replace(/americane?/gi, '')
      .replace(/laborator(ul)?/gi, 'bucătăria')
      .replace(/nuci(le)?/gi, 'fistic')
      .replace(/\s+/g, ' ')
      .trim();

    const menuUrl = customMenuUrl || `https://www.munchotella.md/${lang}/menu`;
    const buttonTitle = customButtonTitle || (lang === 'ru' ? "🧇 Открыть Меню" : lang === 'en' ? "🧇 Open Menu" : "🧇 Deschide Meniul");

    const sendResult = await sendMetaResponse(senderId, replyText, menuUrl, buttonTitle);
    return { success: true, sendResult, replyText, menuUrl, buttonTitle };

  } catch (err: any) {
    console.error("Eroare la procesarea mesajului cu Gemini/Meta:", err);
    return { error: err?.message || String(err), stack: err?.stack };
  }
}

async function sendMetaResponse(senderId: string, text: string, url: string, buttonTitle: string) {
  const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || PERMANENT_META_PAGE_ACCESS_TOKEN;
  const cleanText = text.replace(/https?:\/\/(www\.)?munchotella\.md\/[a-z]{2}\/menu\S*/gi, '').trim();

  try {
    const buttonPayload = {
      recipient: { id: senderId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: cleanText || text,
            buttons: [
              {
                type: "web_url",
                url: url,
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
    let sendResult = await metaRes.json();

    if (sendResult?.error) {
      console.warn("Meta button template warning, fallback to text:", sendResult.error);
      const textPayload = {
        recipient: { id: senderId },
        message: { text: `${text}\n\n🌐 ${url}` }
      };
      const fallbackRes = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${metaAccessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textPayload)
      });
      sendResult = await fallbackRes.json();
    }

    return sendResult;
  } catch (err) {
    console.error("Eroare trimitere Meta:", err);
    return { error: String(err) };
  }
}
