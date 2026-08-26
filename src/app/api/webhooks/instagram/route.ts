import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PERMANENT_META_PAGE_ACCESS_TOKEN = "EAAVxZCgeumYUBSCIdviX1bYuubsuZCp3TWPXSPZCE9TfaJKTHu7fTv542LYbiOFC2ZB16SZAAprVec1Dvx8db6ydyU4shHOb8ZAI6wxLsF9mep5cKYjQivMxLbRp21qoOsdwZBZCe2yc5vZBTwA4noZArn3edbYSs8b9ZA8IDHP4H5l73BuM7xQvhYfXe1TF3Gj8zWVi8kL";
const INSTAGRAM_ACCOUNT_ID = "17841407196466279";
const FACEBOOK_PAGE_ID = "2033309050260259";

// Catalogul oficial de produse cu ingrediente exacte și alias-uri extinse
const MENU_CATALOG = [
  // Waffles
  { 
    id: "waffle_sticks", 
    name: "Waffle sticks", 
    price: 145, 
    category: "waffles", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb3799de38d298ead5916_Waffle%20sticks%2095%20lei.png", 
    ingredients: "2 waffles, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["waffle sticks", "waffle stick", "waffles stick", "wafflesticks", "clatite pe bat", "clatita pe bat", "clătite pe băț", "clătită pe băț", "wafa pe bat", "vafle pe bat", "sticks", "wafel stiks", "wafel stick", "палочки", "вафли на палочке"]
  },
  { 
    id: "delux_mini_waffle", 
    name: "Delux mini waffle", 
    price: 160, 
    category: "waffles", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a95a6d8f14054865f_Delux%20mini%20waffle%20110%20lei.png", 
    ingredients: "16 mini waffles, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus, fistic, arahide", 
    hasFistic: true, 
    hasArahide: true,
    aliases: ["delux mini waffle", "delux mini waffles", "deluxe mini", "mini waffle delux", "delux mini", "mini vafli delux", "deluxe mini waffle", "делюкс мини", "мини вафли делюкс"]
  },
  { 
    id: "nutella_mini_waffles", 
    name: "Nutella Mini waffles", 
    price: 145, 
    category: "waffles", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fb37a2693b04934ff4e38_Nutella%20Mini%20waffles%20100%20lei.png", 
    ingredients: "16 mini waffles, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["nutella mini waffles", "nutella mini waffle", "mini waffle", "mini waffles", "fashafish", "fashafisha", "fasa", "fașa", "fasa fish", "fashafis", "gogosi mini", "gogoși mini", "mini clatite", "пончики", "нутелла мини вафли"]
  },
  { 
    id: "lotus_mini_waffles", 
    name: "Lotus Mini waffles", 
    price: 200, 
    category: "waffles", 
    image: "https://cdn.prod.website-files.com/651fb37a1dbf645960e17923_Lotus%20mini%20waffle%20105%20lei.png", 
    ingredients: "16 mini waffles, pastă Lotus Biscoff, ciocolată albă Belgiană, biscuiți Baby", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["lotus mini waffles", "lotus mini waffle", "mini lotus", "lotus mini", "mini waffle lotus", "лотус мини"]
  },
  { 
    id: "fruits_waffle", 
    name: "Fruits waffle", 
    price: 155, 
    category: "waffles", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbbf696f40c3d241e1d7e_Fruits%20waffle%20100%20lei.png", 
    ingredients: "Waffle, Nutella®, ciocolată albă Belgiană, banane, căpșuni, kiwi", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["fruits waffle", "fruit waffle", "fruits waffles", "fuits waflle", "fuit waffle", "waffle cu fructe", "vafli cu fructe", "wafa cu fructe", "fructe waffle", "fructe vafle", "waffle fruits", "waffles fruits", "вафли с фруктами"]
  },
  { 
    id: "classic_waffle", 
    name: "Classic waffle", 
    price: 145, 
    category: "waffles", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbbf7b1acf26632f25e9f_Classic%20waffle%2095%20lei.png", 
    ingredients: "Waffle, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["classic waffle", "classic waffles", "waffle clasic", "waffle simpla", "vafle clasic", "clasic waffle", "vafli simpla", "классические вафли"]
  },
  { 
    id: "belgian_panda_waffle", 
    name: "Belgian panda waffle", 
    price: 160, 
    category: "waffles", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbbf7c1ee0c7aa2016335_Belgian%20panda%20waffle%20100%20lei.png", 
    ingredients: "Waffle, Nutella®, ciocolată albă Belgiană", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["belgian panda waffle", "panda waffle", "panda waffles", "belgian panda", "waffle panda", "vafli panda", "панда вафли"]
  },
  { 
    id: "biscoff_waffle", 
    name: "Biscoff waffle", 
    price: 195, 
    category: "waffles", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbbf830eec8a3d52670e3_Biscoff%20waffle%20120%20lei.png", 
    ingredients: "Waffle, pastă Lotus Biscoff, ciocolată albă Belgiană, biscuiți Lotus", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["biscoff waffle", "biscoff waffles", "waffle biscoff", "waffle lotus", "vafli biscoff", "vafle lotus", "biskof waffle", "бискофф вафли"]
  },

  // Crepes
  { 
    id: "crepe_dubai", 
    name: "Crepe Dubai", 
    price: 265, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc4465b822d64f0b2f15_Delux%20crepe%20110%20lei.png", 
    ingredients: "Clătită, kataif crocant, cremă de fistic, Nutella®", 
    hasFistic: true, 
    hasArahide: false,
    aliases: ["crepe dubai", "clatita dubai", "crepes dubai", "dubai", "kunafa", "kunafe", "knafe", "clatite dubai", "kataif", "ciocolata dubai", "clatita dubay", "кунафе", "дубай", "блинчик дубай"]
  },
  { 
    id: "delux_crepe", 
    name: "Delux crepe", 
    price: 165, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc4465b822d64f0b2f15_Delux%20crepe%20110%20lei.png", 
    ingredients: "Clătită, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus, fistic, arahide", 
    hasFistic: true, 
    hasArahide: true,
    aliases: ["delux crepe", "deluxe crepe", "crepe delux", "delux clatita", "clatita delux", "clatite delux", "deluxe clatita", "clătită delux", "делюкс блинчик"]
  },
  { 
    id: "biscoff_crepe", 
    name: "Biscoff crepe", 
    price: 205, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc434f3c051ae7a296b1_Biscoff%20crepe%20125%20lei.png", 
    ingredients: "Clătită, pastă Lotus Biscoff, ciocolată albă Belgiană, biscuiți Lotus", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["biscoff crepe", "biscoff crepes", "crepe biscoff", "clatita lotus", "clatita biscoff", "clatite biscoff", "clatite lotus", "biskof crepe", "бискофф блинчик"]
  },
  { 
    id: "fruits_crepe", 
    name: "Fruits crepe", 
    price: 145, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc44c1ee0c7aa201b1cb_Fruits%20crepe%20100%20lei.png", 
    ingredients: "Clătită, Nutella®, ciocolată albă Belgiană, banane, căpșuni, kiwi", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["fruits crepe", "fruit crepe", "fruits crepes", "fuits crepe", "crepe cu fructe", "clatita cu fructe", "clatite cu fructe", "crepe fruits", "блинчик с фруктами"]
  },
  { 
    id: "oreo_crepe", 
    name: "Oreo crepe", 
    price: 145, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc440cf1d670ba35b2e9_Oreo%20crepe%20100%20lei.png", 
    ingredients: "Clătită, Nutella®, ciocolată albă Belgiană, biscuiți Oreo", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["oreo crepe", "oreo crepes", "crepe oreo", "clatita oreo", "clatite oreo", "clatita cu oreo", "орео блинчик"]
  },
  { 
    id: "kinder_crepe", 
    name: "Kinder crepe", 
    price: 145, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/651fbc453efae2800d3bb6b6_Kinder%20crepe%20100%20lei.png", 
    ingredients: "Clătită, Nutella®, ciocolată albă Belgiană, Kinder Bueno", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["kinder crepe", "kinder crepes", "crepe kinder", "clatita kinder", "clatite kinder", "clatita cu kinder", "киндер блинчик"]
  },
  { 
    id: "chocolate_bites", 
    name: "Chocolate bites", 
    price: 165, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc45479cb20349a2a7a4_Chocolate%20bites%20110%20lei.png", 
    ingredients: "Bucățele clătită, Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["chocolate bites", "chocobites", "bites", "chocolate bite", "bucatele clatita", "ciocolata bites", "шоколадные байтсы"]
  },
  { 
    id: "royal_sushi", 
    name: "Royal sushi", 
    price: 155, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc45479cb20349a2a78f_Royal%20sushi%20105%20lei.png", 
    ingredients: "Sushi clătită, Nutella®, căpșuni proaspete, banane", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["royal sushi", "sushi royal", "sushi clatita", "sushi clatite", "clatita sushi", "роял суши"]
  },
  { 
    id: "sushi_banana", 
    name: "Sushi banana", 
    price: 140, 
    category: "crepes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbc46dfc093a105ae3fc4_Sushi%20banana%2090%20lei.png", 
    ingredients: "Sushi clătită cu banană întreagă, Nutella®, ciocolată albă Belgiană", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["sushi banana", "banana sushi", "sushi cu banana", "clatita cu banana sushi", "банановые суши"]
  },

  // Pancakes
  { 
    id: "biskoff_pancakes", 
    name: "Biskoff pancakes", 
    price: 190, 
    category: "pancakes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbd00839e55d5bb2c73eb_Biskoff%20pancakes%20120%20lei.png", 
    ingredients: "Pancakes, pastă Lotus Biscoff, ciocolată albă Belgiană, biscuiți Lotus", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["biskoff pancakes", "biscoff pancakes", "biscoff pancake", "pancake biscoff", "pancakes biscoff", "lotus pancake", "pancakes lotus", "панкейк бискофф"]
  },
  { 
    id: "fruits_pancakes", 
    name: "Fruits pancakes", 
    price: 170, 
    category: "pancakes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbd0155b9e59d9c24e8d3_Fruits%20pancakes%20110%20lei.png", 
    ingredients: "Pancakes, Nutella®, ciocolată albă Belgiană, fructe proaspete", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["fruits pancakes", "fruit pancake", "fruits pancake", "fuits pancake", "pancake cu fructe", "pancakes cu fructe", "pancakes fructe", "панкейк с фруктами"]
  },
  { 
    id: "royal_pancakes", 
    name: "Royal pancakes", 
    price: 165, 
    category: "pancakes", 
    image: "https://cdn.prod.website-files.com/6512d4990c0eb6724e204777/651fbd0168340d2a45d064cf_Royal%20pancakes%20105%20lei.png", 
    ingredients: "Pancakes, Nutella®, ciocolată albă Belgiană, biscuiți Oreo & Lotus", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["royal pancakes", "royal pancake", "pancake royal", "pancake delux", "pancakes delux", "delux pancake", "deluxe pancake", "pancake", "pancakes", "панкейк роял", "панкейки делюкс", "панкейк", "панкейки"]
  },

  // Drinks
  { 
    id: "drink_milkshake_oreo", 
    name: "Milkshake Oreo", 
    price: 135, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/milkshake_oreo.png", 
    ingredients: "Lapte, înghețată, biscuiți Oreo, frișcă", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["milkshake oreo", "milk shake oreo", "milsheic oreo", "shake oreo", "milsheik oreo", "milcsec oreo", "milsheic orio", "коктейль орео", "милкшейк орео", "шейк орео"]
  },
  { 
    id: "drink_milkshake_kinder", 
    name: "Milkshake Kinder", 
    price: 135, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/milkshake_kinder.png", 
    ingredients: "Lapte, înghețată, Kinder Bueno, frișcă", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["milkshake kinder", "milk shake kinder", "milsheic kinder", "shake kinder", "milsheik kinder", "milcsec kinder", "коктейль киндер", "милкшейк киндер", "шейк киндer"]
  },
  { 
    id: "drink_milkshake_nutella", 
    name: "Milkshake Nutella", 
    price: 135, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/milkshake_nutella.png", 
    ingredients: "Lapte, înghețată, Nutella®, frișcă", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["milkshake nutella", "milk shake nutella", "milsheic nutella", "shake nutella", "milsheik nutella", "milcsec nutella", "коктейль нутелла", "милкшейк нутелла", "шейк нутелла"]
  },
  { 
    id: "drink_milkshake_strawberry", 
    name: "Milkshake Strawberry", 
    price: 135, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/milkshake_strawberry.png", 
    ingredients: "Lapte, înghețată, piure căpșuni proaspete, frișcă", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["milkshake strawberry", "milk shake strawberry", "milkshake capsuni", "milkshake căpșuni", "milsheic capsuni", "shake capsuni", "milsheik capsuni", "клубничный коктейль", "милкшейк клубника", "клубничный милкшейк"]
  },
  { 
    id: "drink_ice_lemonade", 
    name: "Ice Lemonade", 
    price: 90, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/ice_lemonade.png", 
    ingredients: "Lămâie proaspătă, mentă, gheață, apă minerală", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["ice lemonade", "lemonade", "limonada", "limonadă", "limonada naturala", "garuz", "garose", "garuzh", "limonada rece", "лимонад", "лимонада", "лемонад"]
  },
  { 
    id: "drink_cola", 
    name: "Coca-Cola", 
    price: 20, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/cola.png", 
    ingredients: "Coca-Cola (doză 330ml / sticlă)", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["coca-cola", "coca cola", "coca", "cola", "coke", "cola zero", "coca cola zero", "cola rece", "кока кола", "кола", "кока-кола", "колу", "колы", "pepsi"]
  },
  { 
    id: "drink_fanta", 
    name: "Fanta", 
    price: 20, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/fanta.png", 
    ingredients: "Fanta Orange (doză 330ml)", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["fanta", "fantă", "fanta orange", "fanta portocale", "fanta rece", "фанта", "фанту", "фанты"]
  },
  { 
    id: "drink_sprite", 
    name: "Sprite", 
    price: 20, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/sprite.png", 
    ingredients: "Sprite (doză 330ml)", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["sprite", "sprait", "sprajt", "sprite rece", "спрайт", "спрайта"]
  },
  { 
    id: "drink_apa_dorna", 
    name: "Apă Dorna", 
    price: 15, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/dorna.png", 
    ingredients: "Apă plată / minerală carbogazoasă Dorna 500ml", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["apa dorna", "apă dorna", "dorna", "apa plata", "apă plată", "apa minerala", "apă minerală", "apa", "apă", "o apa", "o apă", "apica", "вода", "минералка", "минеральная вода", "водичка", "дорна"]
  },
  { 
    id: "drink_tea", 
    name: "Black/Green Tea", 
    price: 50, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/tea.png", 
    ingredients: "Infuzie de ceai premium (Negru sau Verde)", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["black/green tea", "black green tea", "ceai", "ceai negru", "ceai verde", "ceai cald", "tea", "black tea", "green tea", "ceai aromat", "чай", "черный чай", "зеленый чай", "чая", "чаёк"]
  },
  { 
    id: "drink_coffee", 
    name: "Cafea / Espresso", 
    price: 40, 
    category: "drinks", 
    image: "https://www.munchotella.md/images/drinks/coffee.png", 
    ingredients: "Cafea proaspăt măcinată (Espresso, Americano, Cappuccino, Latte)", 
    hasFistic: false, 
    hasArahide: false,
    aliases: ["cafea", "espresso", "espreso", "cappuccino", "capucino", "latte", "americano", "cafea neagra", "cafea cu lapte", "кофе", "капучино", "латте", "эспрессо", "американо"]
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

async function logAIActivity(senderId: string, channel: string, messageText: string, status: string) {
  const actionMap: Record<string, string> = {
    'human_assisted_pause_active': 'Pauză (Asistență Umană)',
    'human_handoff_triggered': 'Escalat la Om',
    'order_cancelled': 'Comandă Anulată / Coș Golit',
    'order_completed_link_generated': 'Link Finalizare Trimis',
    'awaiting_product': 'Întrebare Generală / Start',
    'product_added': 'Comandă Preluată Automat de AI',
    'product_clarification_sent': 'Clarificare Produs',
    'awaiting_drinks': 'Așteaptă Băuturi',
    'gemini_response': 'Răspuns AI Generat'
  };

  const aiAction = actionMap[status] || 'Interacțiune Procesată';
  const telegramAlertSent = ['human_handoff_triggered'].includes(status);

  try {
    const { db: mongoDb } = await connectToDatabase();
    await mongoDb.collection('ai_activity_logs').insertOne({
      senderId,
      channel,
      messageText,
      aiAction,
      telegramAlertSent,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Eroare la salvarea log-ului AI:", err);
  }
}

export async function POST(request: Request) {
  try {
    const rawText = await request.text();

    // ═══ SECURITATE: Verificare Semnătură Criptografică Meta (X-Hub-Signature-256) ═══
    const appSecret = process.env.META_APP_SECRET;
    const signatureHeader = request.headers.get('x-hub-signature-256') || '';

    if (appSecret && signatureHeader && signatureHeader.startsWith('sha256=')) {
      try {
        const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawText, 'utf8').digest('hex');
        const sigBuffer = Buffer.from(signatureHeader, 'utf8');
        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
        if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
          console.warn("⚠️ Webhook Meta: Semnătură X-Hub-Signature-256 diferită de META_APP_SECRET.");
        }
      } catch (err) {
        console.warn("⚠️ Eroare verificare semnătură:", err);
      }
    }

    let body: any = null;
    try {
      body = JSON.parse(rawText);
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (_) {}
      }
    } catch (e) {
      body = rawText;
    }

    try {
      const { db: mongoDb } = await connectToDatabase();
      await mongoDb.collection('debug_webhooks').insertOne({
        timestamp: new Date(),
        rawText,
        body,
        signatureHeader
      });
    } catch (e) {}

    let senderId: string | null = null;
    let messageText: string | null = null;
    let isEcho = false;
    let channel: 'instagram' | 'messenger' = 'instagram';

    if (body && typeof body === 'object') {
      // 1. Detectare Facebook Messenger sau Instagram Direct
      if (body.object === 'page') {
        channel = 'messenger';
      } else {
        channel = 'instagram';
      }

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
      console.log(`Mesaj detectat pe canalul [${channel.toUpperCase()}] de la ${senderId}: "${messageText}"`);
      const debugResult = await processMessage(senderId, messageText, channel);
      await logAIActivity(senderId, channel, messageText, debugResult.status || 'gemini_response');
      return NextResponse.json({ success: true, status: 'procesat', channel, senderId, messageText, debug: debugResult });
    } else {
      return NextResponse.json({ 
        success: true, 
        warning: 'lipsesc_date', 
        extracted: { senderId, messageText, channel }, 
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

// ─── ALGORITM FUZZY MATCHING (LEVENSHTEIN + DICE COEFFICIENT) ───
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let i = 1; i <= an; i++) matrix[0][i] = i;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bn][an];
}

function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const getBigrams = (str: string) => {
    const s = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) s.add(str.substring(i, i + 2));
    return s;
  };
  const aBigrams = getBigrams(a);
  const bBigrams = getBigrams(b);
  let intersection = 0;
  for (const item of aBigrams) {
    if (bBigrams.has(item)) intersection++;
  }
  return (2.0 * intersection) / (aBigrams.size + bBigrams.size);
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  
  const minLen = Math.min(s1.length, s2.length);
  const maxLen = Math.max(s1.length, s2.length);
  const lenRatio = minLen / maxLen;

  // Substring matching doar dacă lungimea este foarte apropiată sau dacă e cuvânt distinct
  if (minLen >= 3 && (s1.includes(s2) || s2.includes(s1))) {
    // Excludere fals-pozitiv: 'cola' în 'ciocolata' / 'ciocolată'
    if ((s1.includes('ciocolat') || s2.includes('ciocolat')) && (s1 === 'cola' || s2 === 'cola' || s1 === 'coca-cola' || s2 === 'coca-cola')) {
      // nu e cola
    } else if (lenRatio >= 0.70 || new RegExp(`\\b${s2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(s1) || new RegExp(`\\b${s1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(s2)) {
      return Math.max(0.85, lenRatio);
    }
  }

  const levDist = levenshtein(s1, s2);
  const levScore = 1 - (levDist / maxLen);
  const diceScore = diceCoefficient(s1, s2);
  
  if (minLen < 4) {
    return levScore >= 0.5 ? levScore : 0;
  }

  return Math.max(levScore, diceScore);
}

function cleanTextForMatching(text: string): string {
  let t = text.toLowerCase().trim();
  const stopwords = [
    /\b(vreau|sa|să|comand|comanda|comandă|as|aș|dori|te|rog|va|vă|un|o|doua|două|trei|patru|portii|porții|portie|porție|de|la|pe|si|și|salut|buna|bună|ziua|hey|adaugati|adăugați|adaugă|adauga|pune|da-mi|trimite|хочу|заказать|мне|пожалуйста|один|два|три|порции|порция)\b/gi,
    /\b(fara|fără|без)\s+[a-zăâîșțа-яё]+/gi
  ];
  for (const sw of stopwords) {
    t = t.replace(sw, ' ');
  }
  return t.replace(/\s+/g, ' ').trim();
}

function matchProductInText(text: string): { 
  product: typeof MENU_CATALOG[0] | null, 
  quantity: number, 
  customization?: string,
  score: number,
  suggestedProduct?: typeof MENU_CATALOG[0] | null
} {
  const lower = text.toLowerCase().trim();
  
  // Detectare dacă mesajul este o întrebare generală FAQ fără intenție explicită de comandă
  const isGeneralQuestion = /(\b(unde|cat costa|cât costă|cat timp|cât timp|in cat|în cât|cand ajunge|când ajunge|cat dureaza|cât durează|mese|masa|masă|locuri|terasa|terasă|pe loc|cafenea|local|rezervare|rezervari|rezervări|interior|program|orar|deschis|închis|inchis|adresa|adresă|livrati|livrați|livrare|preturi|prețuri|plata|plată|achita|achitare|cum pot|cum platesc|cum plătesc|metode de plata|pana la|până la|valuta|valută|euro|dolari|до скольки|где находитесь|доставка|сколько стоит|посидеть|столик|время|как оплатить)\b)/i.test(text);
  const isExplicitOrder = /(\b(vreau|sa comand|să comand|adaugă|adauga|pune|da-mi|хочу|заказать|добавь|порция|portie|porție|cola|fanta|sprite|bautura|băutură|ceai|cafea|dorna|limonada)\b)/i.test(text);

  // Detectare cantitate
  let quantity = 1;
  const qtyMatch = lower.match(/\b(\d+)\s*(porți[ie]?|buc[aă]ți?|doze?|sticle?|pahare?|x)?\b/);
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

  const cleaned = cleanTextForMatching(text);
  let bestFoodMatch: typeof MENU_CATALOG[0] | null = null;
  let bestFoodScore = 0;
  let bestDrinkMatch: typeof MENU_CATALOG[0] | null = null;
  let bestDrinkScore = 0;

  for (const item of MENU_CATALOG) {
    const isDrink = item.category === 'drinks';
    const allAliases = [item.name.toLowerCase(), ...(item.aliases || [])];
    
    for (const alias of allAliases) {
      if (cleaned === alias) {
        if (isDrink) {
          bestDrinkScore = 1.0;
          bestDrinkMatch = item;
        } else {
          bestFoodScore = 1.0;
          bestFoodMatch = item;
        }
        break;
      }

      const fullScore = calculateSimilarity(cleaned, alias);
      if (isDrink && fullScore > bestDrinkScore) {
        bestDrinkScore = fullScore;
        bestDrinkMatch = item;
      } else if (!isDrink && fullScore > bestFoodScore) {
        bestFoodScore = fullScore;
        bestFoodMatch = item;
      }

      // Verificare pe cuvinte individuale și fraze
      const words = cleaned.split(' ').filter(w => w.length >= 2);
      if (words.length > 0) {
        for (let i = 0; i < words.length; i++) {
          for (let j = i + 1; j <= words.length; j++) {
            const phrase = words.slice(i, j).join(' ');
            if (phrase.length >= 2) {
              const phraseScore = calculateSimilarity(phrase, alias);
              if (isDrink && phraseScore > bestDrinkScore) {
                bestDrinkScore = phraseScore;
                bestDrinkMatch = item;
              } else if (!isDrink && phraseScore > bestFoodScore) {
                bestFoodScore = phraseScore;
                bestFoodMatch = item;
              }
            }
          }
        }
      }
    }
  }

  // Dacă e întrebare generală FAQ și nu e comandă explicită, nu declanșăm potrivire forțată sub 0.85
  if (isGeneralQuestion && !isExplicitOrder && Math.max(bestFoodScore, bestDrinkScore) < 0.85) {
    return {
      product: null,
      suggestedProduct: null,
      score: 0,
      quantity,
      customization
    };
  }

  // Regula de toleranță cerută:
  // Pentru băuturi: acceptare directă de la un scor de 40% (0.40) - adică robotul este sigur chiar și de la 40%, adăugând băutura direct!
  // Pentru mâncare (deserturi): acceptare directă de la un scor de 70% (0.70).
  if (bestDrinkScore >= 0.40 && (bestDrinkScore >= bestFoodScore || bestFoodScore < 0.70)) {
    return {
      product: bestDrinkMatch,
      suggestedProduct: null,
      score: bestDrinkScore,
      quantity,
      customization
    };
  }

  if (bestFoodScore >= 0.70) {
    return {
      product: bestFoodMatch,
      suggestedProduct: null,
      score: bestFoodScore,
      quantity,
      customization
    };
  }

  // Sugestii când scorul este parțial
  if (bestDrinkScore >= 0.25 && bestDrinkMatch) {
    return {
      product: null,
      suggestedProduct: bestDrinkMatch,
      score: bestDrinkScore,
      quantity,
      customization
    };
  }

  if (bestFoodScore >= 0.50 && bestFoodMatch) {
    return {
      product: null,
      suggestedProduct: bestFoodMatch,
      score: bestFoodScore,
      quantity,
      customization
    };
  }

  return {
    product: null,
    suggestedProduct: null,
    score: Math.max(bestFoodScore, bestDrinkScore),
    quantity,
    customization
  };
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

export async function processMessage(
  senderId: string, 
  messageText: string, 
  channel: 'instagram' | 'messenger' = 'instagram'
) {
  try {
    const lang = detectLanguage(messageText);
    const lowerMsg = messageText.toLowerCase().trim();

    let session = await getSession(senderId);

    if (session.isHumanAssistedUntil && session.isHumanAssistedUntil > Date.now()) {
      console.log(`Conversația cu ${senderId} [${channel}] este preluată de un operator uman. Botul rămâne în pauză.`);
      return { success: true, status: 'human_assisted_pause_active' };
    }

    const isOperatorRequested = lowerMsg.includes('operator') || lowerMsg.includes('om real') || lowerMsg.includes('persoana') || lowerMsg.includes('persoană') || lowerMsg.includes('человек') || lowerMsg.includes('оператор') || lowerMsg.includes('human') || lowerMsg.includes('angajat');
    const isComplaintOrIssue = /(\b(reclamatie|reclamație|nemultumit|nemulțumit|lipseste|lipsește|gresit|greșit|comanda mea|unde e comanda|intarzie|întârzie|problema|problemă|bani|retur|banii inapoi|banii înapoi|curierul|jaloba|жалоба|претензия|где заказ|ошибка|опоздал)\b)/i.test(messageText);

    if (isOperatorRequested || isComplaintOrIssue) {
      session.isHumanAssistedUntil = Date.now() + 30 * 60 * 1000;
      await saveSession(senderId, session);

      // Trimitere alertă instantă în grupul de Telegram al angajaților
      await notifyStaffViaTelegram({
        channel,
        senderId,
        messageText,
        reason: isComplaintOrIssue ? 'complaint_or_issue' : 'operator_requested'
      });

      const handoffReply = lang === 'ru'
        ? (isComplaintOrIssue 
            ? "Приносим извинения за неудобства! 🤝 Я передал ваш запрос администратору, сотрудник свяжется с вами здесь в самое ближайшее время!"
            : "Конечно! 🤝 Я передал диалог нашему сотруднику. Оператор ответит вам здесь в ближайшее время!")
        : (isComplaintOrIssue
            ? "Ne cerem scuze pentru neplăceri! 🤝 Am trimis imediat o alertă echipei noastre și un coleg verifică situația pentru a vă răspunde aici în câteva momente!"
            : "Desigur! 🤝 V-am pus în legătură cu un coleg din echipa Munchotella. Un operator vă va răspunde aici în câteva momente!");

      await sendDispatchResponse(senderId, channel, handoffReply, "https://www.munchotella.md/ro/menu", "🧇 Meniu Munchotella");
      return { success: true, status: 'human_handoff_triggered', replyText: handoffReply };
    }

    if (lowerMsg.includes('anuleaza comanda') || lowerMsg.includes('anulează comanda') || lowerMsg.includes('reset') || lowerMsg.includes('goleste cosul') || lowerMsg.includes('golește coșul') || lowerMsg.includes('отмена заказа') || lowerMsg.includes('cancel order')) {
      session.cart = [];
      session.state = 'IDLE';
      await saveSession(senderId, session);

      const cancelReply = lang === 'ru'
        ? "Заказ отменен, а корзина очищена! 🧇 Обращайтесь, когда будете готовы сделать заказ!"
        : "Am anulat comanda și am golit coșul! 🧇 Vă stau la dispoziție oricând doriți să reluăm!";

      await sendDispatchResponse(senderId, channel, cancelReply, `https://www.munchotella.md/${lang}/menu`, "🧇 Deschide Meniul");
      return { success: true, status: 'order_cancelled', replyText: cancelReply };
    }

    let replyText = "";

    const isFaqQuestion = /(\b(unde|cat costa|cât costă|cat timp|cât timp|in cat|în cât|cand ajunge|când ajunge|cat dureaza|cât durează|mese|masa|masă|locuri|terasa|terasă|pe loc|cafenea|local|rezervare|rezervari|rezervări|interior|program|orar|deschis|închis|inchis|adresa|adresă|livrati|livrați|livrare|preturi|prețuri|plata|plată|achita|achitare|cum pot|cum platesc|cum plătesc|metode de plata|pana la|până la|valuta|valută|euro|dolari|до скольки|где находитесь|доставка|сколько стоит|посидеть|столик|время|как оплатить)\b)/i.test(messageText);

    const isOrderIntent = !isFaqQuestion && (
      lowerMsg.includes('vreau sa comand') || lowerMsg.includes('vreau să comand') || 
      lowerMsg.includes('as dori sa comand') || lowerMsg.includes('aș dori să comand') || 
      lowerMsg.includes('fac o comanda') || lowerMsg.includes('fac o comandă') || 
      lowerMsg.startsWith('comanda') || lowerMsg.startsWith('comandă') || 
      lowerMsg.includes('хочу заказать') || lowerMsg.includes('сделать заказ') || 
      lowerMsg.includes('i want to order')
    );

    const getCartUrlAndButton = (currentSession: any, currentLang: string) => {
      const currentCart = currentSession.cart || [];
      if (!currentCart || currentCart.length === 0) {
        return {
          url: `https://www.munchotella.md/${currentLang}/menu`,
          buttonTitle: currentLang === 'ru' ? "🧇 Меню" : currentLang === 'en' ? "🧇 Menu" : "🧇 Meniu",
          totalSum: 0
        };
      }

      const totalSum = currentCart.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
      const cartJsonString = JSON.stringify(currentCart);
      const encodedCart = Buffer.from(unescape(encodeURIComponent(cartJsonString))).toString('base64');
      
      const cartNotes = currentCart.filter((i: any) => i.customization).map((i: any) => `${i.name}: ${i.customization}`).join(', ');
      const notesParam = cartNotes ? `&notes=${encodeURIComponent(cartNotes)}` : '';

      const url = `https://www.munchotella.md/${currentLang}/menu?preloadedCart=${encodeURIComponent(encodedCart)}&openCart=true${notesParam}`;
      const buttonTitle = currentLang === 'ru' 
        ? `🛍️ Корзина (${totalSum} MDL)` 
        : currentLang === 'en' 
        ? `🛍️ Cart (${totalSum} MDL)` 
        : `🛍️ Coș (${totalSum} MDL)`;

      return { url, buttonTitle, totalSum };
    };

    const generateCheckoutReply = async () => {
      const { url: finalCartUrl, buttonTitle: finalButtonTitle, totalSum } = getCartUrlAndButton(session, lang);

      if (lang === 'ru') {
        replyText = `Ваш заказ готов (${totalSum} MDL)! 🧇 Нажмите ниже, чтобы заполнить адрес доставки! ✨`;
      } else {
        replyText = `Am pus în coș produsele dvs. (Total: ${totalSum} MDL)! 🧇 Completați adresa și finalizați comanda mai jos! ✨`;
      }

      session.state = 'IDLE';
      await saveSession(senderId, session);

      await sendDispatchResponse(senderId, channel, replyText, finalCartUrl, finalButtonTitle);
      return { success: true, status: 'order_completed_link_generated', cart: session.cart, totalSum, replyText };
    };

    const isCheckoutIntent = lowerMsg.includes('gata') || lowerMsg.includes('final') || lowerMsg.includes('trimite') || lowerMsg.includes('checkout') || lowerMsg.includes('link') || lowerMsg.includes('vreau doar') || lowerMsg.includes('doar atat') || lowerMsg.includes('doar atât') || lowerMsg.includes('готово') || lowerMsg.includes('отправь');

    const matched = matchProductInText(messageText);

    if (session.state === 'IDLE' && isOrderIntent && !matched.product && !matched.suggestedProduct) {
      session.state = 'AWAITING_PRODUCT';
      await saveSession(senderId, session);

      replyText = lang === 'ru'
        ? "С удовольствием! 🧇 Что бы вы хотели заказать сегодня из меню Munchotella?"
        : "Cu mare drag! 🧇 Ce bunătăți ați dori să comandați astăzi din meniul Munchotella?";

      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      await sendDispatchResponse(senderId, channel, replyText, cartUrl, cartButtonTitle);
      return { success: true, status: 'awaiting_product', replyText };
    }

    if ((session.cart && session.cart.length > 0) && isCheckoutIntent && !matched.product) {
      return await generateCheckoutReply();
    }

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
      session.state = isDrink ? 'AWAITING_DRINKS' : 'AWAITING_MORE_DESSERTS';
      await saveSession(senderId, session);

      if (lang === 'ru') {
        replyText = `С удовольствием добавил ${itemToAdd.quantity > 1 ? itemToAdd.quantity + 'x ' : ''}${matched.product.name}${customNoteText} (${matched.product.price * itemToAdd.quantity} MDL) в ваш заказ! 🧇 ${isDrink ? 'Хотите оформить заказ или добавить еще что-нибудь?' : 'Хотите добавить еще что-нибудь сладкое?'}`;
      } else {
        replyText = `Am adăugat cu drag ${itemToAdd.quantity > 1 ? itemToAdd.quantity + 'x ' : ''}${matched.product.name}${customNoteText} (${matched.product.price * itemToAdd.quantity} MDL) în coșul dvs.! 🧇 ${isDrink ? 'Doriți să finalizăm comanda sau mai adăugăm ceva?' : 'Mai doriți încă ceva dulce sau un alt preparat?'}`;
      }

      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      const menuUrl = `https://www.munchotella.md/${lang}/menu`;
      await sendDispatchGenericCard(senderId, channel, matched.product, replyText, cartUrl, cartButtonTitle, menuUrl);
      return { success: true, status: 'product_added', cart: session.cart, replyText, cartUrl, cartButtonTitle, score: matched.score };
    }

    if (!matched.product && matched.suggestedProduct) {
      const suggested = matched.suggestedProduct;
      let clarifyReply = "";
      if (lang === 'ru') {
        clarifyReply = `Вы имели в виду ${suggested.name} (${suggested.price} MDL)? 🧇 Нажмите ниже, чтобы открыть и оформить заказ! ✨`;
      } else {
        clarifyReply = `Ați dorit să spuneți ${suggested.name} (${suggested.price} MDL)? 🧇 Puteți continua mai jos cu coșul sau accesați meniul complet! ✨`;
      }

      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      const menuUrl = `https://www.munchotella.md/${lang}/menu`;
      await sendDispatchGenericCard(senderId, channel, suggested, clarifyReply, cartUrl, cartButtonTitle, menuUrl);
      return { success: true, status: 'product_clarification_sent', suggestedProduct: suggested.name, replyText: clarifyReply, score: matched.score };
    }

    const isNegative = lowerMsg === 'nu' || lowerMsg.startsWith('nu ') || lowerMsg.includes('nu mai vreau') || lowerMsg.includes('atat') || lowerMsg.includes('atât') || lowerMsg.includes('nimic') || lowerMsg.includes('mersi') || lowerMsg === 'нет' || lowerMsg.startsWith('нет ') || lowerMsg.includes('больше ничего') || lowerMsg.includes('спасибо') || lowerMsg === 'no';

    if (session.state === 'AWAITING_MORE_DESSERTS' && isNegative) {
      session.state = 'AWAITING_DRINKS';
      await saveSession(senderId, session);

      replyText = lang === 'ru'
        ? "Хотите добавить освежающий напиток? У нас есть Ice Lemonade (90 MDL) или густой Milkshake (Oreo, Kinder, Nutella, Клубника — 135 MDL)? 🥤"
        : "Doriți să adăugăm și o băutură răcoritoare? Avem Ice Lemonade naturală (90 MDL) sau Milkshake cremos (Oreo, Kinder, Nutella, Căpșuni — 135 MDL)? 🥤";

      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      await sendDispatchResponse(senderId, channel, replyText, cartUrl, cartButtonTitle);
      return { success: true, status: 'awaiting_drinks', replyText, cartUrl, cartButtonTitle };
    }

    if (session.state === 'AWAITING_DRINKS' && (isNegative || isCheckoutIntent || lowerMsg.includes('da') || lowerMsg.includes('da finalizam') || lowerMsg.includes('da finalizăm') || lowerMsg.includes('da trimite'))) {
      return await generateCheckoutReply();
    }

    const baseMenuPrompt = `Ești asistentul virtual oficial al cafenelei artizanale Munchotella Waffle Boutique din Chișinău (Str. Nicolae Testemițeanu 21/1). Website: www.munchotella.md.

REGULI STRICTE DE AUR:
1. NU folosi NICIODATĂ cuvântul 'laborator' (suntem cafenea / Waffle Boutique artizanal).
2. NU folosi NICIODATĂ cuvântul 'nuci' (în rețetele noastre nu există nuci). Singurele ingrediente din această categorie sunt FISTIC și ARAHIDE (prezente doar la Crepe Dubai, Delux crepe și Delux mini waffle).
3. NU folosi NICIODATĂ cuvântul 'americane' sau 'waffles americane'. Spune doar 'waffle', 'waffles' sau denumirea exactă din meniu.
4. Răspunde SCURT, CALD și DIRECT (maxim 1-3 propoziții).
5. Dacă clientul cere un preparat fără fistic sau fără arahide (ex: Delux mini waffle fără fistic): confirmă că bucătarul va pregăti desertul fără fistic și enumeră exact ingredientele reale care rămân pe produs (Nutella®, ciocolată albă Belgiană, biscuiți Oreo, biscuiți Lotus, arahide).

LISTA PRODUSELOR OFICIALE (PREȚURI COMPLETE ÎN MDL):
- Waffles: Waffle sticks (145 MDL), Delux mini waffle (160 MDL), Nutella Mini waffles (145 MDL), Lotus Mini waffles (200 MDL), Fruits waffle (150 MDL), Nutella waffle (145 MDL), Lotus waffle (200 MDL), Delux waffle (160 MDL), Biscoff waffle (200 MDL).
- Crepes & Specialități: Delux crepe (165 MDL), Biscoff crepe (205 MDL), Fruits crepe (145 MDL), Oreo crepe (145 MDL), Kinder crepe (145 MDL), Crepe Dubai (265 MDL), Chocolate bites (165 MDL), Royal sushi (155 MDL), Sushi banana (140 MDL).
- Pancakes: Biskoff pancakes (190 MDL), Fruits pancakes (170 MDL), Royal pancakes (165 MDL).
- Băuturi: Ice Lemonade (90 MDL), Milkshake Oreo / Kinder / Nutella / Strawberry (135 MDL), Black/Green Tea (50 MDL), Coca-Cola (20 MDL), Fanta (20 MDL), Sprite (20 MDL), Apă Dorna (15 MDL), Cafea / Espresso (40 MDL).
- Program oficial: 16:00 - 00:00 (Miercuri: Închis).
- Locație: Chișinău, Str. Nicolae Testemițeanu 21/1.
- Mese / Cafenea / Terasă: Avem cafenea, local special amenajat pentru a petrece timp frumos și pentru a servi deserturile noastre speciale. De asemenea efectuăm și livrare în zona Chișinăului.
- Timp preparare & Livrare: Prepararea desertului durează în medie 20-30 minute, iar livrarea prin curier ajunge de regulă în 30-45 minute.
- Valută / Schimb (Euro, Dolari etc.): Răspunde strict: "Bună, precizăm și revenim cu un răspuns."
- Metode de plată: Online cu cardul pe site sau numerar la curier la livrare (NU menționa POS la curier).
- Livrare & Reguli:
  * Livrăm în tot orașul Chișinău (toate sectoarele). Prețul livrării se calculează pe site la checkout (în medie 50-70 lei).
  * NU facem livrare în suburbii (Trușeni, Colonița, Cricova, Ialoveni, Durlești, Stăuceni etc.).
  * Preluare gratuită din boutique (Takeaway).
- Tonul răspunsurilor: SCURT, CALD, NATURAL și PRIETENOS (maxim 1-2 propoziții, exact ca un om pe chat). Fără detalii tehnice inutile sau formule matematice.`;

    let tone = "elegant";
    let adminCustomPrompt = "";

    try {
      const { db: mongoDb } = await connectToDatabase();
      const settingsDoc = await mongoDb.collection('settings').findOne({ _id: 'ai' as any });
      if (settingsDoc) {
        if (settingsDoc.systemPrompt) adminCustomPrompt = settingsDoc.systemPrompt;
        if (settingsDoc.tone) tone = settingsDoc.tone;
      }
    } catch (dbErr) {
      console.warn("Nu s-au putut încărca setările AI din Admin:", dbErr);
    }

    const finalPrompt = `${baseMenuPrompt}\n\n${adminCustomPrompt ? `[Instrucțiuni Admin: ${adminCustomPrompt}]\n` : ""}\n[Limbă: ${lang.toUpperCase()}]\n[Mesaj client: "${messageText}"]\n[Răspuns scurt, cald, uman (1-2 propoziții)]:`;

    // 1. Verificare deterministă pentru întrebările frecvente esențiale (FAQ oficiale)
    const isCurrencyQ = /(euro|eur|\$|dolari|dolar|valuta|valută|schimb|обмен|евро|доллар|валют)/i.test(messageText);
    const isTimeQ = /(in cat timp|în cât timp|cat dureaza|cât durează|cat timp|cât timp|peste cat|peste cât|timp de preparare|gata in|gata în|cand ajunge|când ajunge|сколько ждать|время доставки|через сколько)/i.test(messageText);
    const isSeatingQ = /(mese|masă|locuri|terasa|terasă|pe loc|cafenea|local|rezervare|rezervari|rezervări|interior|столик|места|посидеть|терраса|бронь)/i.test(messageText);
    const isPaymentQ = /(plata|plată|achitare|achita|achit|plătesc|platesc|plati|plăti|card|cash|numerar|transfer|cum platesc|cum plătesc|cum achit|cum pot achita|tichete|оплата|как оплатить)/i.test(messageText);
    const isDeliveryQ = /(\b(livrare|livrati|livrați|suburbii|suburbie|ciocana|botanica|durlesti|durlești|ialoveni|truseni|trușeni|colonita|colonița|cricova|stauceni|stăuceni|bubuieci|posta|poșta|curier|taxa|taxă|cat costa livrarea|cât costă livrarea|доставка|доставляете|пригород)\b)/i.test(messageText);
    const isHoursQ = /(\b(program|orar|deschis|inchis|închis|pana la|până la|la cat|la cât|lucrati|lucrați|до скольки|график|часы работы|открыты)\b)/i.test(messageText);
    const isAddressQ = /(\b(unde|adresa|adresă|locatie|locație|unde sunteti|unde sunteți|unde va aflati|unde vă aflați|strada|где находитесь|адрес)\b)/i.test(messageText);
    const isCostQ = /(cat costa|cât costă|cat cost|cât cost|cat e livrarea|cât e livrarea|ce pret|ce preț|costă|costa|tarife|tarif|preț|pret|сколько стоит)/i.test(messageText);

    if (isCurrencyQ) {
      if (lang === 'ru') {
        replyText = "Здравствуйте! Уточняем и вернемся с ответом.";
      } else {
        replyText = "Bună, precizăm și revenim cu un răspuns.";
      }
    } else if (isTimeQ) {
      if (lang === 'ru') {
        replyText = "Приготовление десерта занимает в среднем 20-30 минут, а доставка курьером обычно занимает 30-45 минут! 🛵";
      } else {
        replyText = "Prepararea desertului durează în medie 20-30 minute, iar livrarea prin curier ajunge de regulă în 30-45 minute! 🛵";
      }
    } else if (isSeatingQ) {
      if (lang === 'ru') {
        replyText = "У нас есть уютное кафе, специально обустроенное для приятного отдыха и наслаждения нашими десертами. Также мы осуществляем доставку по Кишиневу! 🧇";
      } else {
        replyText = "Avem cafenea, local special amenajat pentru a petrece timp frumos și pentru a servi deserturile noastre speciale. De asemenea efectuăm și livrare în zona Chișinăului! 🧇";
      }
    } else if (isPaymentQ) {
      if (lang === 'ru') {
        replyText = "Можно оплатить онлайн картой на сайте или наличными курьеру при доставке! 💳";
      } else {
        replyText = "Puteți achita online cu cardul pe site sau numerar la curier la livrare! 💳";
      }
    } else if (isDeliveryQ) {
      const isSuburbMention = /(\b(suburbii|suburbie|truseni|trușeni|colonita|colonița|cricova|ialoveni|stauceni|stăuceni|bubuieci|durlesti|durlești|пригород|колоница|трушены|крикова|яловены)\b)/i.test(messageText);
      if (isSuburbMention) {
        if (lang === 'ru') {
          replyText = "Здравствуйте! 🥰 К сожалению, доставляем только по Кишиневу, в пригороды доставки нет.";
        } else {
          replyText = "Bună! 🥰 Nu, din păcate facem livrare doar în Chișinău.";
        }
      } else if (isCostQ) {
        if (lang === 'ru') {
          replyText = "Доставка по Кишиневу в среднем 50-70 лей (рассчитывается на сайте при вводе адреса)! 🛵";
        } else {
          replyText = "Livrarea în Chișinău este în medie 50-70 lei (se calculează exact pe site la introducerea adresei)! 🛵";
        }
      } else {
        if (lang === 'ru') {
          replyText = "Здравствуйте! 🥰 Да, доставляем по всему Кишиневу! Меню и заказ доступны по кнопке ниже! 🧇";
        } else {
          replyText = "Bună! 🥰 Da, facem livrare în tot Chișinăul! Puteți vedea meniul și comanda pe butonul de mai jos! 🧇";
        }
      }
    } else if (isHoursQ) {
      if (lang === 'ru') {
        replyText = "Мы открыты с 16:00 до 00:00 (Среда: выходной)! Ждем вас с радостью! ✨";
      } else {
        replyText = "Suntem deschiși de la 16:00 până la 00:00 (Miercuri: Închis)! Vă așteptăm cu drag! ✨";
      }
    } else if (isAddressQ) {
      if (lang === 'ru') {
        replyText = "Мы находимся в Кишиневе, по адресу ул. Nicolae Testemițeanu 21/1! 🧇";
      } else {
        replyText = "Ne găsiți în Chișinău, pe Str. Nicolae Testemițeanu 21/1! 🧇";
      }
    }

    // 2. Procesare conversațională inteligentă cu Gemini (Gemini 3.7-flash principal)
    if (!replyText) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const candidateModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'];
        for (const modelName of candidateModels) {
          try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
              model: modelName,
              contents: finalPrompt,
            });
            if (response.text) {
              replyText = response.text;
              break;
            }
          } catch (genAiErr: any) {
            console.warn(`SDK warning pe ${modelName}, încercăm REST...`);
            try {
              const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
              });
              const restData = await restRes.json();
              if (restData?.candidates?.[0]?.content?.parts?.[0]?.text) {
                replyText = restData.candidates[0].content.parts[0].text;
                break;
              }
            } catch (_) {}
          }
        }
      }
    }

    // 3. Fallback generic prietenos dacă nu s-a generat niciun răspuns
    if (!replyText) {
      if (lang === 'ru') {
        replyText = "Здравствуйте! 🥰 С удовольствием поможем вам выбрать десерт! Откройте меню по кнопке ниже! 🧇";
      } else {
        replyText = "Bună! 🥰 Vă ajutăm cu cel mai mare drag să alegeți ceva delicios! Puteți deschide meniul mai jos! 🧇";
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

    const menuUrl = `https://www.munchotella.md/${lang}/menu`;
    const buttonTitle = lang === 'ru' ? "🧇 Открыть Меню" : lang === 'en' ? "🧇 Open Menu" : "🧇 Deschide Meniul";

    const sendResult = await sendDispatchResponse(senderId, channel, replyText, menuUrl, buttonTitle);
    return { success: true, sendResult, replyText, menuUrl, buttonTitle, status: 'gemini_response' };

  } catch (err: any) {
    console.error("Eroare la procesarea mesajului cu Gemini/Meta:", err);
    return { error: err?.message || String(err), stack: err?.stack };
  }
}

async function sendDispatchResponse(
  senderId: string,
  channel: 'instagram' | 'messenger',
  text: string,
  url: string,
  buttonTitle: string
) {
  return await sendMetaResponse(senderId, text, url, buttonTitle);
}

async function sendDispatchGenericCard(
  senderId: string,
  channel: 'instagram' | 'messenger',
  product: typeof MENU_CATALOG[0],
  text: string,
  cartUrl: string,
  cartButtonTitle: string,
  menuUrl: string
) {
  return await sendMetaGenericCard(senderId, product, text, cartUrl, cartButtonTitle, menuUrl);
}

async function sendMetaGenericCard(
  senderId: string,
  product: typeof MENU_CATALOG[0],
  text: string,
  cartUrl: string,
  cartButtonTitle: string,
  menuUrl: string
) {
  const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || PERMANENT_META_PAGE_ACCESS_TOKEN;
  if (!metaAccessToken) {
    console.error("META_PAGE_ACCESS_TOKEN lipsă în variabilele de mediu.");
    return { error: "Missing META_PAGE_ACCESS_TOKEN" };
  }
  const cleanText = text.replace(/https?:\/\/(www\.)?munchotella\.md\/[a-z]{2}\/menu\S*/gi, '').trim();

  try {
    const genericPayload = {
      recipient: { id: senderId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: `${product.name} (${product.price} MDL)`,
                subtitle: cleanText || product.ingredients || "Munchotella Waffle Boutique",
                image_url: product.image,
                buttons: [
                  {
                    type: "web_url",
                    url: cartUrl,
                    title: cartButtonTitle
                  },
                  {
                    type: "web_url",
                    url: menuUrl,
                    title: "🧇 Meniu"
                  }
                ]
              }
            ]
          }
        }
      }
    };

    const metaRes = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${metaAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genericPayload)
    });
    let sendResult = await metaRes.json();

    if (sendResult?.error) {
      console.warn("Meta generic card template warning, fallback to button template:", sendResult.error);
      return await sendMetaResponse(senderId, text, cartUrl, cartButtonTitle);
    }

    return sendResult;
  } catch (err) {
    console.error("Eroare trimitere Meta generic card:", err);
    return await sendMetaResponse(senderId, text, cartUrl, cartButtonTitle);
  }
}

async function sendMetaResponse(senderId: string, text: string, url: string, buttonTitle: string) {
  const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || PERMANENT_META_PAGE_ACCESS_TOKEN;
  if (!metaAccessToken) {
    console.error("META_PAGE_ACCESS_TOKEN lipsă în variabilele de mediu.");
    return { error: "Missing META_PAGE_ACCESS_TOKEN" };
  }
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

async function notifyStaffViaTelegram(options: {
  channel: 'instagram' | 'messenger';
  senderId: string;
  messageText: string;
  reason: 'operator_requested' | 'complaint_or_issue' | 'uncertain_query' | 'order_placed';
  additionalInfo?: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_STAFF_CHAT_ID;
  
  if (!token || !chatId) return;

  const channelName = options.channel === 'instagram' 
    ? '📸 Instagram Direct (@munchotella.md)' 
    : '🔵 Facebook Messenger';
  
  let title = '🚨 ASISTENȚĂ UMANĂ SOLICITATĂ';
  if (options.reason === 'complaint_or_issue') title = '⚠️ RECLAMAȚIE / PROBLEMĂ CLIENT';
  else if (options.reason === 'uncertain_query') title = '❓ ÎNTREBARE SPECIALĂ CLIENT';
  else if (options.reason === 'order_placed') title = '🎉 COMANDĂ NOUĂ';

  const cleanMsg = options.messageText.substring(0, 300);

  const telegramMsg = `*${title}*\n\n` +
    `📍 *Canal:* ${channelName}\n` +
    `👤 *ID Client:* \`${options.senderId}\`\n` +
    `💬 *Mesaj Client:* "${cleanMsg}"\n` +
    (options.additionalInfo ? `ℹ️ *Detalii:* ${options.additionalInfo}\n` : '') +
    `⏰ *Ora:* ${new Date().toLocaleTimeString('ro-RO', { timeZone: 'Europe/Chisinau' })}\n\n` +
    `👉 *Acțiune:* Robotul AI a intrat în pauză 30 min pentru acest client. Vă rugăm să preluați conversația direct din aplicația ${channelName}! 🧇🍫`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMsg,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error("Eroare trimitere alertă Telegram staff:", err);
  }
}

