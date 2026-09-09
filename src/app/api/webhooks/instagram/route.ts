import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { connectToDatabase } from '@/lib/mongodb';

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
    'cart_quantity_adjusted': 'Ajustare Coș / Scoatere Produs',
    'preorder_inquiry_answered': 'Precomandă / Programare Înregistrată',
    'ingredients_inquiry_answered': 'Informații Ingrediente & Alergeni',
    'clarification_sent': 'Clarificare Contextuală',
    'order_completed_link_generated': 'Link Finalizare Trimis',
    'awaiting_product': 'Întrebare Generală / Start',
    'product_added': 'Comandă Preluată Automat de AI',
    'compound_products_added': 'Comandă Multiplă Preluată de AI',
    'product_clarification_sent': 'Clarificare Produs',
    'customer_inquiry_answered': 'Întrebare FAQ Răspunsă',
    'gemini_response': 'Răspuns AI Concierge Generat'
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
  } catch (_) {}
}

async function notifyAgencyDashboard(payload: {
  platform: 'instagram' | 'messenger';
  asset_id: string;
  sender_id: string;
  customer_name: string;
  customer_handle: string;
  message_text: string;
  reply_text: string;
  status: string;
}) {
  const endpoints = [
    'https://munchotella-ai-agency.onrender.com/api/meta/webhook-event',
    'http://127.0.0.1:10000/api/meta/webhook-event'
  ];

  const tasks = endpoints.map(async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.status;
    } catch (_) {
      return null;
    }
  });

  await Promise.allSettled(tasks);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENȚĂ SESIUNI CONVERSAȚIONALE: DUAL STORAGE (FIRESTORE + MONGODB)
// ═══════════════════════════════════════════════════════════════════════════════
const inMemorySessions = new Map<string, any>();

async function getSession(senderId: string) {
  const cached = inMemorySessions.get(senderId);
  if (cached && (Date.now() - (cached.lastUpdated || 0) < 4 * 60 * 60 * 1000)) {
    if (!cached.history) cached.history = [];
    if (!cached.cart) cached.cart = [];
    return cached;
  }

  // 1. Firebase Firestore (Persistent pe Vercel Serverless)
  try {
    const sessionRef = doc(db, 'instagram_order_sessions', senderId);
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && (Date.now() - (data.lastUpdated || 0) < 4 * 60 * 60 * 1000)) {
        if (!data.history) data.history = [];
        if (!data.cart) data.cart = [];
        inMemorySessions.set(senderId, data);
        return data;
      }
    }
  } catch (firestoreErr) {
    console.warn("Atenționare citire sesiune Firestore:", firestoreErr);
  }

  // 2. MongoDB Fallback
  try {
    const { db: mongoDb } = await connectToDatabase();
    const mongoDoc = await mongoDb.collection('instagram_order_sessions').findOne({ senderId });
    if (mongoDoc && mongoDoc.lastUpdated && (Date.now() - mongoDoc.lastUpdated < 4 * 60 * 60 * 1000)) {
      if (!mongoDoc.history) mongoDoc.history = [];
      if (!mongoDoc.cart) mongoDoc.cart = [];
      inMemorySessions.set(senderId, mongoDoc);
      return mongoDoc;
    }
  } catch (_) {}

  const initial = {
    senderId,
    state: 'IDLE',
    cart: [],
    history: [],
    scheduledTime: null,
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

  // 1. Salvare în Firebase Firestore
  try {
    const sessionRef = doc(db, 'instagram_order_sessions', senderId);
    await setDoc(sessionRef, updatedData, { merge: true });
  } catch (firestoreErr) {
    console.warn("Atenționare salvare sesiune Firestore:", firestoreErr);
  }

  // 2. Salvare în MongoDB (Atlas)
  try {
    const { db: mongoDb } = await connectToDatabase();
    await mongoDb.collection('instagram_order_sessions').updateOne(
      { senderId },
      { $set: updatedData },
      { upsert: true }
    );
  } catch (_) {}
}

function appendToHistory(session: any, role: 'user' | 'assistant', text: string) {
  if (!session.history) session.history = [];
  session.history.push({
    role,
    text: text.trim(),
    timestamp: Date.now()
  });
  if (session.history.length > 20) {
    session.history = session.history.slice(-20);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINGVISTICĂ & FUZZY MATCHING (LEVENSHTEIN + DICE)
// ═══════════════════════════════════════════════════════════════════════════════
function detectLanguage(text: string): 'ro' | 'ru' | 'en' {
  const cyrillicPattern = /[Ѐ-ӿ]/;
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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  if (minLen >= 3 && (s1.includes(s2) || s2.includes(s1))) {
    if ((s1.includes('ciocolat') || s2.includes('ciocolat')) && (s1 === 'cola' || s2 === 'cola' || s1 === 'coca-cola' || s2 === 'coca-cola')) {
      // Excludere cola din ciocolata
    } else if (lenRatio >= 0.70 || new RegExp(`\b${escapeRegex(s2)}\b`).test(s1) || new RegExp(`\b${escapeRegex(s1)}\b`).test(s2)) {
      return Math.max(0.85, lenRatio);
    }
  }

  const levDist = levenshtein(s1, s2);
  const levScore = 1 - (levDist / maxLen);
  const diceScore = diceCoefficient(s1, s2);
  
  if (minLen <= 4) {
    if (levDist <= 1 && levScore >= 0.80) {
      return levScore;
    }
    return 0;
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

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER 1: AJUSTARE CANTITĂȚI ȘI SCOATERE DIN COȘ (ROBUST ALIAS EXPANSION)
// ═══════════════════════════════════════════════════════════════════════════════
function handleCartAdjustment(text: string, session: any, lang: string): { handled: boolean, replyText?: string, status?: string } {
  const lower = text.toLowerCase().trim();
  const currentCart = session.cart || [];
  if (currentCart.length === 0) return { handled: false };

  const isAdjustmentVerb = /(\b(scoate|scoateti|scoateți|sterge|șterge|elimina|elimină|scade|lasa|lasă|pune doar|sa fie doar|să fie doar|doar unu|doar una|doar 1|doar 2|fara|fără|nu mai vreau|nu vreau|убери|уберите|удали|удалите|не хочу|не надо|без)\b)/i.test(lower);
  if (!isAdjustmentVerb) return { handled: false };

  const matchedCartIndices: number[] = [];

  for (let i = 0; i < currentCart.length; i++) {
    const cartItem = currentCart[i];
    const catalogItem = MENU_CATALOG.find(c => c.id === cartItem.id);

    const rawNames = [
      cartItem.name.toLowerCase(),
      ...(catalogItem?.aliases || [])
    ];

    const expandedTerms = new Set<string>();
    for (const term of rawNames) {
      expandedTerms.add(term);
      if (term.includes('-')) {
        expandedTerms.add(term.replace(/-/g, ' '));
        term.split('-').forEach(part => {
          if (part.length >= 3) expandedTerms.add(part);
        });
      }
      term.split(' ').forEach(w => {
        if (w.length >= 3) expandedTerms.add(w);
      });
    }

    let isItemMatched = false;
    for (const term of expandedTerms) {
      if (new RegExp(`\b${escapeRegex(term)}\b`, 'i').test(lower) || lower.includes(term)) {
        isItemMatched = true;
        break;
      }
    }
    if (!isItemMatched) {
      const cleaned = cleanTextForMatching(lower);
      for (const term of expandedTerms) {
        if (calculateSimilarity(cleaned, term) >= 0.75) {
          isItemMatched = true;
          break;
        }
      }
    }

    if (isItemMatched) {
      matchedCartIndices.push(i);
    }
  }

  // Dacă utilizatorul are 1 singur produs în coș și zice „scoate” / „șterge” fără să specifice numele exact
  if (matchedCartIndices.length === 0 && currentCart.length === 1 && (lower.includes('scoate') || lower.includes('șterge') || lower.includes('sterge') || lower.includes('nu mai vreau') || lower.includes('убери'))) {
    matchedCartIndices.push(0);
  }

  if (matchedCartIndices.length === 0) {
    return { handled: false };
  }

  const removedNames: string[] = [];
  matchedCartIndices.sort((a, b) => b - a);

  for (const idx of matchedCartIndices) {
    const targetItem = currentCart[idx];
    
    let desiredExactQty: number | null = null;
    const exactMatch = lower.match(/\b(lasa|lasă|sa fie|să fie|pune)?\s*doar\s*(\d+|unu|una|un|doua|două|trei)\b/i);
    if (exactMatch) {
      const rawVal = exactMatch[2].toLowerCase();
      if (rawVal === 'unu' || rawVal === 'una' || rawVal === 'un') desiredExactQty = 1;
      else if (rawVal === 'doua' || rawVal === 'două') desiredExactQty = 2;
      else if (rawVal === 'trei') desiredExactQty = 3;
      else desiredExactQty = parseInt(rawVal, 10);
    }

    let subtractQty: number | null = null;
    const subtractMatch = lower.match(/\b(scoate|scoateti|scoateți|scade|elimina|elimină|șterge|sterge|убери)\s*(\d+|unu|una|un|doua|două|trei)?\b/i);
    if (subtractMatch && subtractMatch[2]) {
      const rawVal = subtractMatch[2].toLowerCase();
      if (rawVal === 'unu' || rawVal === 'una' || rawVal === 'un') subtractQty = 1;
      else if (rawVal === 'doua' || rawVal === 'două') subtractQty = 2;
      else if (rawVal === 'trei') subtractQty = 3;
      else subtractQty = parseInt(rawVal, 10);
    }

    if (desiredExactQty !== null && desiredExactQty >= 0) {
      if (desiredExactQty === 0) {
        removedNames.push(targetItem.name);
        currentCart.splice(idx, 1);
      } else {
        targetItem.quantity = desiredExactQty;
      }
    } else if (subtractQty !== null && subtractQty > 0) {
      targetItem.quantity -= subtractQty;
      if (targetItem.quantity <= 0) {
        removedNames.push(targetItem.name);
        currentCart.splice(idx, 1);
      }
    } else {
      // Comandă directă de scoatere (ex: „scoate cola”, „șterge clătita”, „nu mai vreau pancake”)
      removedNames.push(targetItem.name);
      currentCart.splice(idx, 1);
    }
  }

  session.cart = [...currentCart];
  const totalSum = session.cart.reduce((s: number, it: any) => s + (it.price * (it.quantity || 1)), 0);

  let replyText = "";
  if (session.cart.length === 0) {
    replyText = lang === 'ru'
      ? `Убрал ${removedNames.join(', ')} из заказа. Сейчас ваша корзина пуста! 🧇 Что бы вы хотели заказать? ✨`
      : `Am scos ${removedNames.join(', ')} din coș. Acum coșul dvs. este gol! 🧇 Ce bunătăți ați dori să adăugăm? ✨`;
  } else {
    const remainingSummary = session.cart.map((it: any) => `${it.quantity > 1 ? it.quantity + 'x ' : ''}${it.name}`).join(' + ');
    replyText = lang === 'ru'
      ? `Готово! Обновил заказ: сейчас в корзине ${remainingSummary} (Итого: ${totalSum} MDL). 🧇 Хотите добавить напиток или оформляем доставку? ✨`
      : `Am actualizat imediat! În coș a rămas: ${remainingSummary} (Total: ${totalSum} MDL). 🧇 Mai doriți ceva delicios sau finalizăm comanda? ✨`;
  }

  return { handled: true, replyText, status: 'cart_quantity_adjusted' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER 2: ANULARE TOTALĂ COMANDĂ (GOLIRE COMPLETĂ COȘ)
// ═══════════════════════════════════════════════════════════════════════════════
function isGlobalOrderCancellation(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const cancelKeywords = [
    'anuleaza comanda', 'anulează comanda', 'anulati comanda', 'anulați comanda',
    'anulez comanda', 'anulez tot', 'anuleaza tot', 'anulează tot',
    'goleste cosul', 'golește coșul', 'goleste cos', 'golește coș',
    'sterge tot cosul', 'șterge tot coșul', 'sterge tot din cos', 'șterge tot din coș',
    'nu mai vreau nimic', 'nu mai doresc nimic', 'anulare comanda', 'anulare comandă',
    'reset', 'cancel order', 'cancel', 'отмена заказа', 'отмените заказ', 'очистить корзину'
  ];
  return cancelKeywords.some(kw => lower.includes(kw));
}

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER 3: PRECOMENZI, PROGRAMĂRI ORĂ ȘI DINE-IN INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════
function handlePreorderAndScheduling(text: string, session: any, lang: string): { handled: boolean, replyText?: string } {
  const lower = text.toLowerCase().trim();

  const isDineIn = /(\b(pe loc|la mese|la masa|la masă|in cafenea|în cafenea|in local|în local|venim la voi|servim acolo|mancam acolo|mâncăm acolo|посидеть|в кафе|на месте)\b)/i.test(lower);
  const isWednesday = lower.includes('miercuri') || lower.includes('среда') || lower.includes('среду');
  
  const hasPreorderKeyword = /(\b(precomanda|precomandă|precomenzi|pe mai tarziu|pe mai târziu|mai tarziu|mai târziu|[iî]n avans|programat[aă]?|pe cand|pe când|pe diseara|pe diseară|diseara|diseară|pe maine|pe mâine|pe mîine|pe miine|pentru maine|pentru mâine|pentru mîine|pentru miine|предзаказ|на потом|попозже|на вечер|на завтра)\b)/i.test(lower);
  const timeMatch = lower.match(/\b(?:la\s*ora|pentru\s*ora|ora|la)\s*(\d{1,2}(?::\d{2})?)\b/i);
  const dayMatch = lower.match(/\b(m[aâîi]{1,2}ne|disear[aă]|azi|ast[aă]zi|miercuri|joi|vineri|s[aă]mb[aă]t[aă]|duminic[aă]|luni|mar[tț]i|завтра|сегодня|вечером)\b/i);

  // Dacă utilizatorul răspunde la întrebarea anterioară a robotului precizând doar ora
  const lastBotMsg = (session.history || []).filter((m: any) => m.role === 'assistant').slice(-1)[0];
  const botJustAskedTime = lastBotMsg && (lastBotMsg.text.includes('ce oră') || lastBotMsg.text.includes('ce ora') || lastBotMsg.text.includes('какое время'));

  if (!hasPreorderKeyword && !timeMatch && !isDineIn && !botJustAskedTime) {
    return { handled: false };
  }

  // Avertisment explicit: Miercuri este închis
  if (isWednesday) {
    const wedReply = lang === 'ru'
      ? "Обратите внимание: по средам у нас выходной день! 🧇 Будем очень рады приготовить ваш заказ в любой другой день недели с 16:00 до 00:00!"
      : "Vă informăm cu drag că Miercuri este singura noastră zi liberă săptămânală (închis)! 🧇 Vă putem pregăti cu mare drag comanda pentru oricare altă zi din săptămână, între 16:00 și 00:00!";
    return { handled: true, replyText: wedReply };
  }

  const detectedHour = timeMatch ? timeMatch[1] : null;
  const targetDay = dayMatch ? (dayMatch[1].toLowerCase().includes('m') ? 'mâine' : dayMatch[1]) : (lower.includes('disear') ? 'diseară' : 'mâine');

  if (detectedHour) {
    session.scheduledTime = `${targetDay === 'diseară' ? 'Diseară' : 'Mâine'} la ora ${detectedHour}`;
    
    if (session.cart && session.cart.length > 0) {
      const summary = session.cart.map((it: any) => `${it.quantity > 1 ? it.quantity + 'x ' : ''}${it.name}`).join(' + ');
      const total = session.cart.reduce((s: number, it: any) => s + (it.price * (it.quantity || 1)), 0);
      
      const reply = lang === 'ru'
        ? `Отлично! 🥰 Зафиксировал ${isDineIn ? 'визит в кафе' : 'предзаказ'} на ${targetDay} к ${detectedHour}! В вашем заказе: ${summary} (Итого: ${total} MDL). Оформляем или добавим что-нибудь еще? 🧇✨`
        : `Excelent! 🥰 Am notat cu mare drag ${isDineIn ? 'că vă așteptăm pe loc la cafenea' : 'comanda programată'} pentru ${targetDay} la ora ${detectedHour}! În coș aveți: ${summary} (Total: ${total} MDL). Doriți să finalizăm comanda sau mai adăugăm ceva delicios? 🧇✨`;
      return { handled: true, replyText: reply };
    } else {
      const reply = lang === 'ru'
        ? `Отлично! 🥰 С удовольствием записал ${isDineIn ? 'бронь на месте' : 'предзаказ'} на ${targetDay} к ${detectedHour}! Какие десерты из меню Munchotella приготовить для вас к этому времени? 🧇✨`
        : `Excelent! 🥰 Am notat cu drag ${isDineIn ? 'că vă așteptăm pe loc în cafenea' : 'programarea'} pentru ${targetDay} la ora ${detectedHour}! Ce bunătăți din meniul Munchotella ați dori să vă pregătim pentru această oră? 🧇✨`;
      return { handled: true, replyText: reply };
    }
  }

  // Dacă a cerut precomandă pentru mâine sau mai târziu, dar FĂRĂ să specifice ora exactă
  if (hasPreorderKeyword || isDineIn) {
    const reply = lang === 'ru'
      ? `С огромным удовольствием! 🥰 Принимаем предзаказы на ${targetDay} ${isDineIn ? 'на месте в кафе' : 'с доставкой'} в часы нашей работы (16:00 - 00:00). Подскажите, пожалуйста, к какому точно времени приготовить заказ и какие десерты вы выбрали? 🧇✨`
      : `Cu cel mai mare drag! 🥰 Preluăm cu bucurie comenzi programate pentru ${targetDay} ${isDineIn ? 'pe loc în cafenea' : 'cu livrare rapidă'} (intervalul nostru de lucru este 16:00 - 00:00). La ce oră ați dori să fie gata comanda și ce bunătăți doriți să vă pregătim? 🧇✨`;
    return { handled: true, replyText: reply };
  }

  return { handled: false };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER 4: COMPOUND PRODUCT PARSER (COMENZI MULTIPLE ÎNTR-UN SINGUR MESAJ)
// ═══════════════════════════════════════════════════════════════════════════════
interface ExtractedProductMatch {
  product: typeof MENU_CATALOG[0];
  quantity: number;
  customization?: string;
  score: number;
}

function matchSingleProductInSegment(segment: string): ExtractedProductMatch | null {
  const lower = segment.toLowerCase().trim();
  if (!lower || lower.length < 2) return null;

  const isFAQ = /(\b(cat costa|cât costă|program|orar|deschis|adresa|locatie|unde|livrare|mese|terasa)\b)/i.test(lower);
  const isExplicit = /(\b(vreau|adaug[aă]|pune|da-mi|comand[aă]|хочу|добавь)\b)/i.test(lower);
  if (isFAQ && !isExplicit) return null;

  let quantity = 1;
  const qtyMatch = lower.match(/\b(\d+)\s*(porți[ie]?|buc[aă]ți?|doze?|sticle?|pahare?|x)?\b/);
  if (qtyMatch && parseInt(qtyMatch[1]) > 0 && parseInt(qtyMatch[1]) <= 20) {
    quantity = parseInt(qtyMatch[1]);
  } else if (lower.includes('doua') || lower.includes('două') || lower.includes('два') || lower.includes('две')) {
    quantity = 2;
  } else if (lower.includes('trei') || lower.includes('три')) {
    quantity = 3;
  }

  let customization: string | undefined = undefined;
  if (lower.includes('fără fistic') || lower.includes('fara fistic') || lower.includes('без фисташек')) {
    customization = "Fără fistic";
  } else if (lower.includes('fără arahide') || lower.includes('fara arahide') || lower.includes('fără alune') || lower.includes('без арахиса')) {
    customization = "Fără arahide";
  } else if (lower.includes('fără zahăr') || lower.includes('fara zahar')) {
    customization = "Fără zahăr adăugat";
  }

  const cleaned = cleanTextForMatching(segment);
  let bestMatch: typeof MENU_CATALOG[0] | null = null;
  let bestScore = 0;

  for (const item of MENU_CATALOG) {
    const isDrink = item.category === 'drinks';
    const aliases = [item.name.toLowerCase(), ...(item.aliases || [])];

    for (const alias of aliases) {
      if (cleaned === alias) {
        return { product: item, quantity, customization, score: 1.0 };
      }

      const score = calculateSimilarity(cleaned, alias);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }

      const tokens = cleaned.split(' ').filter(w => w.length >= 3);
      for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j <= tokens.length; j++) {
          const phrase = tokens.slice(i, j).join(' ');
          if (phrase.length >= 3) {
            const pScore = calculateSimilarity(phrase, alias);
            if (pScore > bestScore) {
              bestScore = pScore;
              bestMatch = item;
            }
          }
        }
      }
    }
  }

  const threshold = bestMatch?.category === 'drinks' ? 0.76 : 0.72;
  if (bestMatch && bestScore >= threshold) {
    return { product: bestMatch, quantity, customization, score: bestScore };
  }

  return null;
}

function matchCompoundProductsInText(text: string): ExtractedProductMatch[] {
  const lower = text.toLowerCase().trim();

  // Protecție: dacă mesajul conține verbe de scoatere / ștergere, NU adăugăm produse!
  const hasNegativeIntent = /(\b(scoate|scoateti|scoateți|sterge|șterge|elimina|elimină|nu mai vreau|nu vreau|fara|fără|убери|удали|не хочу|не надо|без)\b)/i.test(lower);
  if (hasNegativeIntent) {
    return [];
  }

  // Împărțire în segmente după conjuncții: „și”, „si”, „+”, „,”, „iar”, „plus”, „и”, „а также”
  const delimiterRegex = /(?:\b(?:[sș]i\s+o|[sș]i\s+un|si\s+o|si\s+un|[sș]i|plus|iar|и|а\s+также)\b|[,+&])/gi;
  const segments = lower.split(delimiterRegex).map(s => s.trim()).filter(s => s.length >= 3);

  const matchedItems: ExtractedProductMatch[] = [];
  const seenProductIds = new Set<string>();

  if (segments.length > 1) {
    for (const seg of segments) {
      const match = matchSingleProductInSegment(seg);
      if (match && !seenProductIds.has(match.product.id)) {
        seenProductIds.add(match.product.id);
        matchedItems.push(match);
      }
    }
  }

  if (matchedItems.length === 0) {
    const singleMatch = matchSingleProductInSegment(text);
    if (singleMatch) {
      matchedItems.push(singleMatch);
    }
  }

  return matchedItems;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER 5: ÎNTREBĂRI DESPRE INGREDIENTE & ALERGENI
// ═══════════════════════════════════════════════════════════════════════════════
function handleIngredientsInquiry(text: string, lang: string): { handled: boolean, replyText?: string, product?: any } {
  const lower = text.toLowerCase().trim();
  const isIngQ = /(\b(ingrediente|ce ingrediente|ce contine|ce conține|din ce e|din ce este|compozitie|compoziție|reteta|rețeta|ce puneti|ce puneți|ce e pus|ce are|alergeni|alergie|alun[eă]|fistic|arahide|zahar|zahăr|состав|что входит|из чего|аллерген)\b)/i.test(lower);
  if (!isIngQ) return { handled: false };

  let matchedProduct: typeof MENU_CATALOG[0] | null = null;
  for (const item of MENU_CATALOG) {
    const aliases = [item.name.toLowerCase(), ...(item.aliases || [])];
    for (const al of aliases) {
      if (lower.includes(al) || calculateSimilarity(cleanTextForMatching(lower), al) >= 0.72) {
        matchedProduct = item;
        break;
      }
    }
    if (matchedProduct) break;
  }

  if (!matchedProduct) return { handled: false };

  const ing = matchedProduct.ingredients;
  const allergenNote = matchedProduct.hasFistic 
    ? (lang === 'ru' ? " (содержит фисташку)" : " (conține fistic)")
    : matchedProduct.hasArahide 
    ? (lang === 'ru' ? " (содержит арахис)" : " (conține arahide)")
    : (lang === 'ru' ? " (без фисташек и без арахиса)" : " (nu conține fistic sau arahide)");

  let replyText = "";
  if (lang === 'ru') {
    replyText = `${matchedProduct.name} (${matchedProduct.price} MDL) содержит: ${ing}${allergenNote}. 🧇 Если у вас есть аллергия или особые пожелания, мы с радостью приготовим индивидуально! Добавить в заказ? ✨`;
  } else {
    replyText = `${matchedProduct.name} (${matchedProduct.price} MDL) conține: ${ing}${allergenNote}. 🧇 Dacă aveți vreo preferință sau alergie, bucătarul nostru o poate personaliza cu drag! Doriți să adăugăm o porție în coș? ✨`;
  }

  return { handled: true, replyText, product: matchedProduct };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER 6: CLARIFICARE ȘI CONFORT CONVERSAȚIONAL ('?', 'cum adică?')
// ═══════════════════════════════════════════════════════════════════════════════
function handleClarificationOrConfusion(text: string, session: any, lang: string): { handled: boolean, replyText?: string } {
  const t = text.trim();
  const isConfusion = /^([?？!！.,\s]+|cum adica\??|cum adică\??|nu inteleg|nu înțeleg|de ce\??|adica\??|adică\??|что\??|почему\??|в смысле\??)$/i.test(t);
  if (!isConfusion) return { handled: false };

  const lastBotMsg = (session.history || []).filter((m: any) => m.role === 'assistant').slice(-1)[0];
  let replyText = "";
  if (lastBotMsg && lastBotMsg.text) {
    if (lang === 'ru') {
      replyText = "Прошу прощения, если выразился непонятно! 🥰 Я готов ответить на любые ваши вопросы по меню или заказу. Подскажите, пожалуйста, чем я могу вам помочь прямо сейчас? 🧇";
    } else {
      replyText = "Mă scuzați dacă am fost neclar mai devreme! 🥰 Vă stau la dispoziție cu orice detalii despre meniul nostru, prețuri sau comenzi. Spuneți-mi vă rog, cu ce vă pot ajuta mai exact? 🧇";
    }
  } else {
    if (lang === 'ru') {
      replyText = "Здравствуйте! 🥰 С удовольствием помогу вам с любым вопросом о меню или заказе. Подскажите, что вас интересует? 🧇";
    } else {
      replyText = "Bună! 🥰 Vă ajut cu cel mai mare drag cu orice detaliu despre meniu sau comenzi. Spuneți-mi vă rog, ce ați dori să aflați sau să comandați? 🧇";
    }
  }

  return { handled: true, replyText };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER 7: FAQ COMPLET (LOCAȚIE, ORAR, LIVRARE, PLATĂ, DIETAR)
// ═══════════════════════════════════════════════════════════════════════════════
function handleCustomerInquiries(text: string, lang: string): { handled: boolean, replyText?: string } {
  const lower = text.toLowerCase().trim();

  const isGreetingOnly = /^(\s*(salut|buna|bună|buna ziua|bună ziua|buna seara|bună seara|hey|hei|hello|hi|servus|привет|здравствуйте|добрый день|добрый вечер)\s*[!.,?]*\s*)$/i.test(lower);
  const isHoursQ = /(\b(program|programul|orar|orarul|deschis|deschiși|deschisi|deschisa|deschisă|inchis|închis|inchisi|închiși|pana la|până la|la cat|la cât|la ce ora|la ce oră|lucrati|lucrați|lucra-ti|lucrati azi|lucrați azi|lucrați astăzi|lucrati astazi|deschis azi|deschis acum|до скольки|график|часы работы|открыты|открыто|работаете|работаете сегодня)\b)/i.test(lower);
  const isAddressQ = /(\b(unde|adresa|adresă|locatie|locație|unde sunteti|unde sunteți|unde va aflati|unde vă aflați|strada|testemiteanu|testemițeanu|где находитесь|адрес)\b)/i.test(lower);
  const isDeliveryQ = /(\b(livrare|livrati|livrați|suburbii|suburbie|ciocana|botanica|durlesti|durlești|ialoveni|truseni|trușeni|colonita|colonița|cricova|stauceni|stăuceni|bubuieci|posta|poșta|curier|taxa|taxă|cat costa livrarea|cât costă livrarea|доставка|доставляете|пригород)\b)/i.test(lower);
  const isPaymentQ = /(\b(plata|plată|achita|achitare|cum platesc|cum plătesc|metode de plata|card|cardul|cash|bani|terminal|pos|valuta|valută|euro|dolari|оплата|как оплатить|картой|наличными)\b)/i.test(lower);
  const isDietaryQ = /(\b(halal|vegetarian|vegan|carne|porc|gelatina|gelatină|de post|халяль|вегетарианское|свинина)\b)/i.test(lower);
  const isFreshnessQ = /(\b(ajung calde|calde|reci|crocante|cum ajung|ambalate|ambalaj|термобокс|горячие|теплые)\b)/i.test(lower);
  const isSeatingSimpleQ = /(mese|masă|locuri|terasa|terasă|pe loc|cafenea|local|interior|столик|места|посидеть|терраса)/i.test(lower);

  if (isGreetingOnly) {
    return {
      handled: true,
      replyText: lang === 'ru'
        ? "Здравствуйте! 🥰 Добро пожаловать в Munchotella Waffle Boutique! Чем мы можем вас порадовать сегодня? Меню доступно по кнопке ниже! 🧇"
        : "Bună! 🥰 Bine ați venit la Munchotella Waffle Boutique! Cu ce bunătăți vă putem îndulci astăzi? Puteți descoperi meniul mai jos! 🧇"
    };
  }

  if (isHoursQ) {
    const mentionsWednesday = lower.includes('miercuri') || lower.includes('среда');
    if (mentionsWednesday) {
      return {
        handled: true,
        replyText: lang === 'ru'
          ? "Внимание: по средам у нас выходной день! 🧇 В остальные дни мы открыты ежедневно с 16:00 до 00:00!"
          : "Atenție: Miercuri este singura noastră zi liberă săptămânală (închis)! 🧇 În restul săptămânii suntem deschiși zilnic de la 16:00 până la 00:00! ✨"
      };
    }
    return {
      handled: true,
      replyText: lang === 'ru'
        ? "Мы открыты ежедневно с 16:00 до 00:00 (Среда: выходной)! Ждем вас с радостью в кафе или оформим быструю доставку! 🧇✨"
        : "Suntem deschiși zilnic de la 16:00 până la 00:00 (Miercuri: Închis)! Vă așteptăm cu mult drag în boutique sau cu livrare la domiciliu! 🧇✨"
    };
  }

  if (isAddressQ) {
    return {
      handled: true,
      replyText: lang === 'ru'
        ? "Мы находимся в Кишиневе, по адресу ул. Nicolae Testemițeanu 21/1! Ждем вас в гости в уютном кафе! 🧇✨"
        : "Ne găsiți în Chișinău, pe Str. Nicolae Testemițeanu 21/1! Vă așteptăm cu mult drag în cafeneaua noastră primitoare! 🧇✨"
    };
  }

  if (isDeliveryQ) {
    const isSuburb = lower.includes('durlesti') || lower.includes('durlești') || lower.includes('ialoveni') || lower.includes('truseni') || lower.includes('trușeni') || lower.includes('colonita') || lower.includes('colonița') || lower.includes('cricova') || lower.includes('stauceni') || lower.includes('stăuceni') || lower.includes('suburbi');
    if (isSuburb) {
      return {
        handled: true,
        replyText: lang === 'ru'
          ? "К сожалению, в пригороды доставки сейчас нет, но мы с радостью ждем вас в кафе на ул. Testemițeanu 21/1 или оформим заказ на вынос! 🧇"
          : "Din păcate, momentan nu livrăm în suburbii, dar vă așteptăm cu drag direct la cafenea pe Str. Nicolae Testemițeanu 21/1 sau puteți comanda cu ridicare la pachet! 🧇"
      };
    }
    return {
      handled: true,
      replyText: lang === 'ru'
        ? "Да, доставляем по всему Кишиневу в термобоксах! Стоимость доставки 50-70 MDL (рассчитывается точно при оформлении). Доставка занимает 35-45 минут! 🛵✨"
        : "Bună! 🥰 Livrăm rapid și ambalat termic în tot Chișinăul! Costul livrării este de 50-70 lei (calculat la checkout), iar deserturile ajung calde în 35-45 min! 🛵✨"
    };
  }

  if (isPaymentQ) {
    return {
      handled: true,
      replyText: lang === 'ru'
        ? "Оплатить заказ можно картой онлайн на сайте, картой курьеру при получении (терминал POS), или наличными в MDL! 💳💵"
        : "Puteți achita comod: online cu cardul direct pe site la plasarea comenzii, cu cardul la livrare (curierul are POS), sau cash (MDL) la primire! 💳💵"
    };
  }

  if (isDietaryQ) {
    return {
      handled: true,
      replyText: lang === 'ru'
        ? "Все наши десерты 100% вегетарианские, готовятся только из отборных ингредиентов (бельгийский шоколад, Nutella, свежие ягоды) и не содержат животного желатина! 🍓✨"
        : "Toate deserturile noastre sunt 100% vegetariene, preparate din ingrediente dulci premium (ciocolată belgiană, Nutella originală, fructe proaspete) și nu conțin gelatină animală sau grăsimi! 🍓✨"
    };
  }

  if (isFreshnessQ) {
    return {
      handled: true,
      replyText: lang === 'ru'
        ? "Десерты выпекаются индивидуально прямо под ваш заказ и упаковываются в специальные термобоксы, чтобы приехать хрустящими и теплыми! 🧇🔥"
        : "Deserturile noastre sunt preparate pe loc la primirea comenzii și sunt ambalate în cutii termice speciale pentru ca waffles-urile și clătitele să ajungă crocante și fierbinți la dvs.! 🧇🔥"
    };
  }

  if (isSeatingSimpleQ) {
    return {
      handled: true,
      replyText: lang === 'ru'
        ? "Да, у нас уютное кафе на ул. Testemițeanu 21/1, где можно приятно провести время и насладиться теплыми десертами прямо на месте! Ждем вас в гости! 🧇✨"
        : "Da, vă așteptăm cu mult drag în cafeneaua noastră din Chișinău, pe Str. Nicolae Testemițeanu 21/1! Avem sală primitoare unde deserturile se servesc calde și proaspete! 🧇✨"
    };
  }

  return { handled: false };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOTORUL PRINCIPAL COGNITIV: processMessage
// ═══════════════════════════════════════════════════════════════════════════════
export async function processMessage(
  senderId: string, 
  messageText: string, 
  channel: 'instagram' | 'messenger' = 'instagram'
) {
  try {
    const lang = detectLanguage(messageText);
    const lowerMsg = messageText.toLowerCase().trim();

    let session = await getSession(senderId);
    appendToHistory(session, 'user', messageText);

    if (session.isHumanAssistedUntil && session.isHumanAssistedUntil > Date.now()) {
      console.log(`Conversația cu ${senderId} [${channel}] este preluată de un operator uman. Botul rămâne în pauză.`);
      return { success: true, status: 'human_assisted_pause_active' };
    }

    // ─── PAS 0: ASISTENȚĂ UMANĂ / RECLAMAȚIE ───
    const isOperatorRequested = lowerMsg.includes('operator') || lowerMsg.includes('om real') || lowerMsg.includes('persoana') || lowerMsg.includes('persoană') || lowerMsg.includes('человек') || lowerMsg.includes('оператор') || lowerMsg.includes('human') || lowerMsg.includes('angajat');
    const isComplaintOrIssue = /(\b(reclamatie|reclamație|nemultumit|nemulțumit|lipseste|lipsește|gresit|greșit|comanda mea|unde e comanda|intarzie|întârzie|problema|problemă|bani|retur|banii inapoi|banii înapoi|curierul|jaloba|жалоба|претензия|где заказ|ошибка|опоздал)\b)/i.test(messageText);

    if (isOperatorRequested || isComplaintOrIssue) {
      session.isHumanAssistedUntil = Date.now() + 30 * 60 * 1000;
      await saveSession(senderId, session);

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

      appendToHistory(session, 'assistant', handoffReply);
      await saveSession(senderId, session);
      await sendDispatchResponse(senderId, channel, handoffReply, "https://www.munchotella.md/ro/menu", "🧇 Meniu Munchotella");
      return { success: true, status: 'human_handoff_triggered', replyText: handoffReply };
    }

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
      const schedParam = currentSession.scheduledTime ? `&scheduled=${encodeURIComponent(currentSession.scheduledTime)}` : '';
      const notesParam = cartNotes ? `&notes=${encodeURIComponent(cartNotes)}` : '';

      const url = `https://www.munchotella.md/${currentLang}/menu?preloadedCart=${encodeURIComponent(encodedCart)}&openCart=true${notesParam}${schedParam}`;
      const buttonTitle = currentLang === 'ru' 
        ? `🛍️ Корзина (${totalSum} MDL)` 
        : currentLang === 'en' 
        ? `🛍️ Cart (${totalSum} MDL)` 
        : `🛍️ Coș (${totalSum} MDL)`;

      return { url, buttonTitle, totalSum };
    };

    // ─── PAS 1: AJUSTARE CANTITĂȚI ȘI SCOATERE DIN COȘ (RULAT ÎNAINTE DE CANCEL!) ───
    const cartAdjustResult = handleCartAdjustment(messageText, session, lang);
    if (cartAdjustResult.handled && cartAdjustResult.replyText) {
      appendToHistory(session, 'assistant', cartAdjustResult.replyText);
      await saveSession(senderId, session);
      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      await sendDispatchResponse(senderId, channel, cartAdjustResult.replyText, cartUrl, cartButtonTitle);
      return { success: true, status: 'cart_quantity_adjusted', replyText: cartAdjustResult.replyText, cart: session.cart };
    }

    // ─── PAS 2: ANULARE TOTALĂ COMANDĂ & GOLIRE COȘ ───
    if (isGlobalOrderCancellation(messageText)) {
      session.cart = [];
      session.state = 'IDLE';
      session.scheduledTime = null;
      const cancelReply = lang === 'ru'
        ? "Заказ отменен, а корзина очищена! 🧇 Обращайтесь, когда будете готовы сделать заказ!"
        : "Am anulat comanda și am golit coșul! 🧇 Vă stau la dispoziție oricând doriți să reluăm!";

      appendToHistory(session, 'assistant', cancelReply);
      await saveSession(senderId, session);
      await sendDispatchResponse(senderId, channel, cancelReply, `https://www.munchotella.md/${lang}/menu`, "🧇 Deschide Meniul");
      return { success: true, status: 'order_cancelled', replyText: cancelReply };
    }

    // ─── PAS 3: PRECOMENZI, PROGRAMĂRI ORĂ ȘI DINE-IN (RULAT ÎNAINTE DE FAQ!) ───
    const preorderResult = handlePreorderAndScheduling(messageText, session, lang);
    if (preorderResult.handled && preorderResult.replyText) {
      appendToHistory(session, 'assistant', preorderResult.replyText);
      await saveSession(senderId, session);
      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      await sendDispatchResponse(senderId, channel, preorderResult.replyText, cartUrl, cartButtonTitle);
      return { success: true, status: 'preorder_inquiry_answered', replyText: preorderResult.replyText };
    }

    // ─── PAS 4: ÎNTREBĂRI DESPRE INGREDIENTE & ALERGENI ───
    const ingResult = handleIngredientsInquiry(messageText, lang);
    if (ingResult.handled && ingResult.replyText) {
      appendToHistory(session, 'assistant', ingResult.replyText);
      await saveSession(senderId, session);
      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      if (ingResult.product) {
        await sendDispatchGenericCard(senderId, channel, ingResult.product, ingResult.replyText, cartUrl, cartButtonTitle, `https://www.munchotella.md/${lang}/menu`, lang);
      } else {
        await sendDispatchResponse(senderId, channel, ingResult.replyText, cartUrl, cartButtonTitle);
      }
      return { success: true, status: 'ingredients_inquiry_answered', replyText: ingResult.replyText, product: ingResult.product };
    }

    // ─── PAS 5: CLARIFICARE PENTRU '?' SAU MESAJ AMBIGUU ───
    const clarifyResult = handleClarificationOrConfusion(messageText, session, lang);
    if (clarifyResult.handled && clarifyResult.replyText) {
      appendToHistory(session, 'assistant', clarifyResult.replyText);
      await saveSession(senderId, session);
      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      await sendDispatchResponse(senderId, channel, clarifyResult.replyText, cartUrl, cartButtonTitle);
      return { success: true, status: 'clarification_sent', replyText: clarifyResult.replyText };
    }

    // ─── PAS 5: FAQ STANDARDIZAT COMPLET (LOCAȚIE, ORAR, LIVRARE, PLATĂ) ───
    const faqResult = handleCustomerInquiries(messageText, lang);
    if (faqResult.handled && faqResult.replyText) {
      appendToHistory(session, 'assistant', faqResult.replyText);
      await saveSession(senderId, session);
      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      await sendDispatchResponse(senderId, channel, faqResult.replyText, cartUrl, cartButtonTitle);
      return { success: true, status: 'customer_inquiry_answered', replyText: faqResult.replyText };
    }

    // ─── PAS 6: CHECKOUT INTENT ───
    const isCheckoutIntent = lowerMsg.includes('gata') || lowerMsg.includes('final') || lowerMsg.includes('trimite') || lowerMsg.includes('checkout') || lowerMsg.includes('link') || lowerMsg.includes('vreau doar') || lowerMsg.includes('doar atat') || lowerMsg.includes('doar atât') || lowerMsg.includes('готово') || lowerMsg.includes('отправь');
    if ((session.cart && session.cart.length > 0) && isCheckoutIntent) {
      const { url: finalCartUrl, buttonTitle: finalButtonTitle, totalSum } = getCartUrlAndButton(session, lang);
      let checkoutText = lang === 'ru'
        ? `Ваш заказ готов (${totalSum} MDL)! 🧇 Нажмите ниже, чтобы заполнить адрес доставки! ✨`
        : `Am pus în coș produsele dvs. (Total: ${totalSum} MDL)! 🧇 Completați adresa și finalizați comanda mai jos! ✨`;

      session.state = 'IDLE';
      appendToHistory(session, 'assistant', checkoutText);
      await saveSession(senderId, session);
      await sendDispatchResponse(senderId, channel, checkoutText, finalCartUrl, finalButtonTitle);
      return { success: true, status: 'order_completed_link_generated', cart: session.cart, totalSum, replyText: checkoutText };
    }

    // ─── PAS 7: DETECTARE COMANDĂ (PRODUSE MULTIPLE SAU INDIVIDUALE) ───
    const compoundMatches = matchCompoundProductsInText(messageText);

    if (compoundMatches.length > 0) {
      for (const m of compoundMatches) {
        const itemToAdd = {
          id: m.product.id,
          name: m.product.name,
          price: m.product.price,
          image: m.product.image,
          quantity: m.quantity,
          customization: m.customization
        };

        const existingIndex = (session.cart || []).findIndex((i: any) => i.id === itemToAdd.id && i.customization === itemToAdd.customization);
        if (existingIndex > -1) {
          session.cart[existingIndex].quantity += itemToAdd.quantity;
        } else {
          session.cart = [...(session.cart || []), itemToAdd];
        }
      }

      const hasDrinks = compoundMatches.some(m => m.product.category === 'drinks');
      session.state = hasDrinks ? 'AWAITING_DRINKS' : 'AWAITING_MORE_DESSERTS';

      const totalSum = session.cart.reduce((s: number, it: any) => s + (it.price * (it.quantity || 1)), 0);
      const addedItemsSummary = compoundMatches.map(m => `${m.quantity > 1 ? m.quantity + 'x ' : ''}${m.product.name}${m.customization ? ` (${m.customization})` : ''}`).join(' + ');

      let addReply = "";
      if (lang === 'ru') {
        addReply = compoundMatches.length > 1
          ? `С удовольствием добавил в заказ: ${addedItemsSummary}! 🧇 Итого в корзине: ${totalSum} MDL. ${hasDrinks ? 'Оформляем заказ или добавить еще что-нибудь сладкое?' : 'Хотите добавить прохладительный напиток или оформляем? ✨'}`
          : `С удовольствием добавил ${addedItemsSummary} (${compoundMatches[0].product.price * compoundMatches[0].quantity} MDL) в ваш заказ! 🧇 ${hasDrinks ? 'Хотите оформить заказ или добавить еще что-нибудь?' : 'Хотите добавить еще что-нибудь сладкое или напиток?'}`;
      } else {
        addReply = compoundMatches.length > 1
          ? `Am adăugat cu drag în coș: ${addedItemsSummary}! 🧇 Total coș: ${totalSum} MDL. ${hasDrinks ? 'Doriți să finalizăm comanda sau mai adăugăm ceva dulce?' : 'Doriți să adăugăm și o băutură răcoritoare sau finalizăm comanda? ✨'}`
          : `Am adăugat cu drag ${addedItemsSummary} (${compoundMatches[0].product.price * compoundMatches[0].quantity} MDL) în coșul dvs.! 🧇 ${hasDrinks ? 'Doriți să finalizăm comanda sau mai adăugăm ceva?' : 'Mai doriți încă ceva dulce sau o băutură răcoritoare?'}`;
      }

      appendToHistory(session, 'assistant', addReply);
      await saveSession(senderId, session);

      const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
      const menuUrl = `https://www.munchotella.md/${lang}/menu`;
      
      await sendDispatchGenericCard(senderId, channel, compoundMatches[0].product, addReply, cartUrl, cartButtonTitle, menuUrl, lang);
      return { 
        success: true, 
        status: compoundMatches.length > 1 ? 'compound_products_added' : 'product_added', 
        cart: session.cart, 
        replyText: addReply, 
        cartUrl, 
        cartButtonTitle 
      };
    }


    // ─── PAS 9: MOTOR COGNITIV GEMINI FLASH (CU CONTEXT CONVERSAȚIONAL COMPLET) ───
    let replyText = "";
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const historySnippets = (session.history || []).slice(-12).map((m: any) => 
        `${m.role === 'user' ? 'Client' : 'Munchotella AI'}: "${m.text}"`
      ).join('\n');

      const currentCartSummary = (session.cart && session.cart.length > 0)
        ? session.cart.map((it: any) => `${it.quantity}x ${it.name} (${it.price * it.quantity} MDL)`).join(', ')
        : 'Coș gol';

      const schedInfo = session.scheduledTime ? `Programare/Oră menționată: ${session.scheduledTime}` : 'Comandă imediată';

      const dynamicPrompt = `Ești asistentul virtual oficial al cafenelei artizanale Munchotella Waffle Boutique din Chișinău (Str. Nicolae Testemițeanu 21/1).
Program: 16:00 - 00:00 (Miercuri: Închis).
Produse principale: Crepe Dubai cu fistic și cataif (265 MDL), Royal Pancakes (165 MDL), Waffle sticks (145 MDL), Delux mini waffle (160 MDL), băuturi răcoritoare.
Reguli esențiale:
1. Răspunde cald, politicos, concis și natural (maxim 1-2 propoziții, stil uman de concierge primitor).
2. Dacă mesajul clientului este o întrebare, răspunde clar și la obiect.
3. Dacă clientul vrea să facă o precomandă pe mâine sau pe mai târziu, confirmă cu mult drag și întreabă la ce oră dorește să fie gata/livrată comanda (interval 16:00 - 00:00).
4. Dacă clientul întreabă despre ingrediente sau alergeni, explică clar și prietenos.
5. NU inventa produse. NU folosi cuvintele 'americane' sau 'nuci'. Folosește exclusiv denumirile oficiale.

[Istoric recent conversație]:
${historySnippets}

[Coșul curent al clientului]: ${currentCartSummary}
[${schedInfo}]
[Limbă: ${lang.toUpperCase()}]
[Mesaj primit acum]: "${messageText}"
[Răspunsul tău scurt și profesionist]:`;

      const candidateModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'];
      for (const modelName of candidateModels) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: modelName,
            contents: dynamicPrompt,
          });
          if (response.text) {
            replyText = response.text;
            break;
          }
        } catch (genAiErr: any) {
          try {
            const restRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: dynamicPrompt }] }] })
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

    // ─── PAS 10: FALLBACK FINAL PRIETENOS ───
    if (!replyText) {
      replyText = lang === 'ru'
        ? "Здравствуйте! 🥰 С удовольствием помогу вам с любым вопросом о меню или заказе. Что бы вы хотели заказать сегодня? 🧇"
        : "Bună! 🥰 Vă ajut cu cel mai mare drag cu orice detaliu despre meniu sau comenzi. Cu ce bunătăți vă putem încânta astăzi? 🧇";
    }

    replyText = replyText
      .replace(/waffles?\s+americane?/gi, 'waffles')
      .replace(/waffle\s+american[aăe]?/gi, 'waffle')
      .replace(/americane?/gi, '')
      .replace(/laborator(ul)?/gi, 'bucătăria')
      .replace(/nuci(le)?/gi, 'fistic')
      .replace(/\s+/g, ' ')
      .trim();

    appendToHistory(session, 'assistant', replyText);
    await saveSession(senderId, session);

    const { url: cartUrl, buttonTitle: cartButtonTitle } = getCartUrlAndButton(session, lang);
    const sendResult = await sendDispatchResponse(senderId, channel, replyText, cartUrl, cartButtonTitle);
    return { success: true, sendResult, replyText, cartUrl, cartButtonTitle, status: 'gemini_response' };

  } catch (err: any) {
    console.error("Eroare la procesarea mesajului cu Gemini/Meta:", err);
    return { error: err?.message || String(err), stack: err?.stack };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPATCH & META GRAPH API TRANSPORT (ROBUST INSTAGRAM DIRECT & MESSENGER)
// ═══════════════════════════════════════════════════════════════════════════════

async function sendMetaTextMessage(senderId: string, text: string) {
  const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || PERMANENT_META_PAGE_ACCESS_TOKEN;
  if (!metaAccessToken) {
    console.error("META_PAGE_ACCESS_TOKEN lipsă în variabilele de mediu.");
    return { error: "Missing META_PAGE_ACCESS_TOKEN" };
  }

  // Meta Graph API text limit: 1000 caractere per mesaj
  const safeText = text.length > 1000 ? text.substring(0, 997) + "..." : text;

  try {
    const payload = {
      recipient: { id: senderId },
      message: { text: safeText }
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${metaAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data?.error) {
      console.warn("Meta sendMetaTextMessage warning:", data.error);
    }
    return data;
  } catch (err) {
    console.error("Eroare trimitere Meta text message:", err);
    return { error: String(err) };
  }
}

async function sendMetaGenericCard(
  senderId: string,
  product: typeof MENU_CATALOG[0],
  cartUrl: string,
  cartButtonTitle: string,
  menuUrl: string,
  channel: 'instagram' | 'messenger' = 'instagram',
  lang: string = 'ro'
) {
  const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || PERMANENT_META_PAGE_ACCESS_TOKEN;
  if (!metaAccessToken) {
    console.error("META_PAGE_ACCESS_TOKEN lipsă în variabilele de mediu.");
    return { error: "Missing META_PAGE_ACCESS_TOKEN" };
  }

  // 1. Titlu element: strict <= 80 caractere (cerință strictă Meta Graph API)
  const rawTitle = `${product.name} (${product.price} MDL)`;
  const safeTitle = rawTitle.length > 80 ? rawTitle.substring(0, 77) + "..." : rawTitle;

  // 2. Subtitlu element: rezumat compact ingrediente (strict <= 80 caractere, garantat să nu fie respins cu cod 100)
  const rawSubtitle = product.ingredients || "Munchotella Waffle Boutique Chișinău";
  let safeSubtitle = rawSubtitle.trim();
  if (safeSubtitle.length > 80) {
    safeSubtitle = safeSubtitle.substring(0, 77) + "...";
  }

  // 3. Link direct către produsul din meniu (cu deschidere modală și scroll la poziție)
  const productDirectUrl = `https://www.munchotella.md/${lang}/menu?product=${encodeURIComponent(product.id)}`;

  // 4. Configurare Butoane (Meta permite maxim 3 butoane pe generic card, strict <= 20 caractere per titlu):
  // Buton 1: Deschide direct fișa produsului (toppings & detalii)
  const detailsTitle = lang === 'ru' ? "🧇 О товаре" : lang === 'en' ? "🧇 View item" : "🧇 Vezi produsul";
  
  // Buton 2: Comandă / Adaugă în coș
  let actionTitle = "";
  let actionUrl = "";

  if (cartUrl && cartButtonTitle && !cartButtonTitle.toLowerCase().includes("meniu") && !cartButtonTitle.toLowerCase().includes("меню")) {
    actionTitle = cartButtonTitle.length > 20 ? cartButtonTitle.substring(0, 20) : cartButtonTitle;
    actionUrl = cartUrl;
  } else {
    // Dacă coșul era gol, generăm un link cu produsul direct preîncărcat în coș cu 1-click!
    const singleProductCart = [{
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    }];
    const encodedSingleCart = Buffer.from(unescape(encodeURIComponent(JSON.stringify(singleProductCart)))).toString('base64');
    actionUrl = `https://www.munchotella.md/${lang}/menu?preloadedCart=${encodeURIComponent(encodedSingleCart)}&openCart=true`;
    actionTitle = lang === 'ru' 
      ? `🛒 Заказать (${product.price}L)` 
      : lang === 'en' 
      ? `🛒 Order (${product.price}L)` 
      : `🛒 Comandă (${product.price}L)`;
    if (actionTitle.length > 20) actionTitle = actionTitle.substring(0, 20);
  }

  const buttons: any[] = [
    {
      type: "web_url",
      url: productDirectUrl,
      title: detailsTitle.substring(0, 20)
    },
    {
      type: "web_url",
      url: actionUrl,
      title: actionTitle.substring(0, 20)
    }
  ];

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
                title: safeTitle,
                subtitle: safeSubtitle,
                image_url: product.image,
                default_action: {
                  type: "web_url",
                  url: productDirectUrl
                },
                buttons
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
    const sendResult = await metaRes.json();

    if (sendResult?.error) {
      console.warn("Meta generic card failed, falling back to text:", sendResult.error);
      return await sendMetaTextMessage(
        senderId, 
        `🥞 ${safeTitle}\n${safeSubtitle}\n\n🔗 ${detailsTitle}: ${productDirectUrl}\n📲 ${actionTitle}: ${actionUrl}`
      );
    }

    return sendResult;
  } catch (err) {
    console.error("Eroare trimitere Meta generic card:", err);
    return { error: String(err) };
  }
}

async function sendDispatchGenericCard(
  senderId: string,
  channel: 'instagram' | 'messenger',
  product: typeof MENU_CATALOG[0],
  text: string,
  cartUrl: string,
  cartButtonTitle: string,
  menuUrl: string,
  lang: string = 'ro'
) {
  // Pasul 1: Trimite mesajul conversațional cald și complet (răspunsul la întrebare / ingrediente / confirmare coș)
  if (text && text.trim().length > 0) {
    await sendMetaTextMessage(senderId, text.trim());
  }

  // Pasul 2: Trimite cardul vizual cu imaginea de produs, preț și butoane optimizate fără duplicate
  return await sendMetaGenericCard(senderId, product, cartUrl, cartButtonTitle, menuUrl, channel, lang);
}

async function sendDispatchResponse(
  senderId: string,
  channel: 'instagram' | 'messenger',
  text: string,
  url: string,
  buttonTitle: string
) {
  // Pe Instagram Direct, template_type "button" nu este suportat de Meta.
  // Trimitem mesaj de text nativ, elegant structurat cu linkul aferent.
  if (channel === 'messenger' && url && buttonTitle) {
    return await sendMetaButtonResponse(senderId, text, url, buttonTitle);
  } else {
    const fullText = (url && buttonTitle)
      ? `${text.trim()}\n\n📲 ${buttonTitle}: ${url}`
      : text.trim();
    return await sendMetaTextMessage(senderId, fullText);
  }
}

async function sendMetaButtonResponse(senderId: string, text: string, url: string, buttonTitle: string) {
  const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || PERMANENT_META_PAGE_ACCESS_TOKEN;
  if (!metaAccessToken) {
    console.error("META_PAGE_ACCESS_TOKEN lipsă în variabilele de mediu.");
    return { error: "Missing META_PAGE_ACCESS_TOKEN" };
  }

  const cleanText = text.replace(/https?:\/\/(www\.)?munchotella\.md\/[a-z]{2}\/menu\S*/gi, '').trim();
  const safeButtonTitle = buttonTitle.length > 20 ? buttonTitle.substring(0, 20) : buttonTitle;

  try {
    const buttonPayload = {
      recipient: { id: senderId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: (cleanText || text).substring(0, 640),
            buttons: [
              {
                type: "web_url",
                url: url,
                title: safeButtonTitle
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
      return await sendMetaTextMessage(senderId, `${text.trim()}\n\n📲 ${safeButtonTitle}: ${url}`);
    }

    return sendResult;
  } catch (err) {
    console.error("Eroare trimitere Meta button response:", err);
    return await sendMetaTextMessage(senderId, `${text.trim()}\n\n📲 ${safeButtonTitle}: ${url}`);
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

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRY POINT POST WEBHOOK META
// ═══════════════════════════════════════════════════════════════════════════════
export async function POST(request: Request) {
  try {
    const rawText = await request.text();

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
    } catch (_) {}

    let senderId: string | null = null;
    let messageText: string | null = null;
    let isEcho = false;
    let channel: 'instagram' | 'messenger' = 'instagram';

    if (body && typeof body === 'object') {
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
      
      const isCrupa = String(senderId) === '1003637612636530' || String(senderId) === '27899196186417959' || String(senderId).toLowerCase().includes('crupa');
      await notifyAgencyDashboard({
        platform: channel,
        asset_id: channel === 'instagram' ? INSTAGRAM_ACCOUNT_ID : FACEBOOK_PAGE_ID,
        sender_id: senderId,
        customer_name: isCrupa ? 'Crupa Grigore' : 'Client Munchotella',
        customer_handle: isCrupa ? '@crupa_grigore' : `@user_${senderId.slice(-4)}`,
        message_text: messageText,
        reply_text: debugResult.replyText || 'Răspuns trimis automat pe chat',
        status: debugResult.status || 'gemini_response'
      });

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
