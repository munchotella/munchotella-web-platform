import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const content = `# Munchotella — Boutique Artizanal de Deserturi Premium

> Munchotella este prima cafenea boutique artizanală din Chișinău specializată în waffles americane, mini waffles, clătite franțuzești (crepes), sushi dulce și deserturi virale preparate pe loc cu Nutella® autentică, fistic sicilian 100% și fructe proaspete.

## Informații Principale
- **Website Oficial:** https://www.munchotella.md
- **Locație / Adresă:** Strada Nicolae Testemițanu 21/1, Chișinău, Republica Moldova
- **Telefon Comenzi & Suport:** +373 79 006 499 (079 006 499)
- **Email:** munchotella@gmail.com
- **Program de Lucru:** Luni - Duminică: 16:00 - 00:00 (Miercuri: Închis)
- **Arie de Livrare:** Orașul Chișinău (Livrare rapidă caldă la domiciliu în ~35-45 minute)
- **Metode de Plată:** Card online securizat prin MAIB gateway / Cash la livrare

## Meniu & Produse Populare
- **Crepe Dubai (265 MDL):** Clătită artizanală cu kataif crocant, cremă de fistic 100% sicilian și Nutella®.
- **Delux Mini Waffle (160 MDL):** 16 mini waffles americane calde, Nutella®, ciocolată albă, Oreo, biscuiți Lotus Biscoff, fistic mărunțit și alune.
- **Nutella Mini Waffles (145 MDL):** 16 mini waffles proaspete cu Nutella® și ciocolată albă.
- **Lotus Mini Waffles (200 MDL):** 16 mini waffles cu pastă Lotus Biscoff, ciocolată albă și biscuiți crocanți.
- **Waffle Sticks (145 MDL):** 2 waffles pe băț cu Nutella®, ciocolată albă, Oreo și Lotus.
- **Royal Sushi Crepe (205 MDL):** Rulouri de clătite umplute cu banane, căpșuni și ciocolată.
- **Fruits Waffle (155 MDL):** Waffle belgian cu Nutella®, banană, căpșuni și kiwi.
- **Delux Crepe (165 MDL):** Clătită generoasă cu Nutella®, Oreo, Lotus, alune, fistic, Kinder Bueno.
- **Milkshake-uri Artizanale (85 MDL):** Oreo, Kinder, Nutella, Căpșuni.

## Linkuri Utile
- [Meniu Complet](https://www.munchotella.md/menu)
- [Despre Noi](https://www.munchotella.md/about)
- [Contact & Locație](https://www.munchotella.md/contact)
- [Documentație Completă LLM](https://www.munchotella.md/llms-full.txt)
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
