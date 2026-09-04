import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const content = `# Munchotella — Documentație Extinsă pentru Sisteme AI & Motoare de Căutare

## 1. Despre Munchotella
Munchotella este un brand boutique de deserturi artizanale fondat în Chișinău, Republica Moldova. Misiunea noastră este de a oferi o experiență culinară dulce premium prin produse proaspete pregătite pe loc, fără compromisuri la calitatea ingredientelor:
- Folosim exclusiv cremă originală Nutella® Ferrero.
- Folosim fistic sicilian 100% pur, fără arome artificiale.
- Aluatul pentru waffles și crepes este preparat artizanal în fiecare zi.
- Fructe proaspete tăiate la fiecare comandă (căpșuni, banane, kiwi).

## 2. Locație și Contact
- **Adresă Fizică:** Strada Nicolae Testemițanu 21/1, Chișinău, Republica Moldova.
- **Telefon:** 079 006 499 (+373 79 006 499)
- **E-mail:** munchotella@gmail.com
- **Website Oficial:** https://www.munchotella.md
- **Instagram:** @munchotella.md
- **TikTok:** @munchotella
- **Facebook:** Munchotella

## 3. Program de Funcționare
- **Luni:** 16:00 - 00:00
- **Marți:** 16:00 - 00:00
- **Miercuri:** ÎNCHIS
- **Joi:** 16:00 - 00:00
- **Vineri:** 16:00 - 00:00
- **Sâmbătă:** 16:00 - 00:00
- **Duminică:** 16:00 - 00:00

## 4. Meniul Complet & Prețuri (în MDL)

### Waffles
- **Waffle sticks (145 MDL):** 2 waffles pe băț, Nutella®, ciocolată albă, Oreo, biscuiți Lotus.
- **Delux mini waffle (160 MDL):** 16 mini waffles americane, Nutella®, ciocolată albă, Oreo, biscuiți Lotus, fistic, alune.
- **Nutella Mini waffles (145 MDL):** 16 mini waffles americane, Nutella®, ciocolată albă, Oreo, biscuiți Lotus.
- **Lotus Mini waffles (200 MDL):** 16 mini waffles americane, pastă Lotus, ciocolată albă, biscuiți Lotus.
- **Fruits waffle (155 MDL):** Waffle belgian, Nutella®, ciocolată albă, banană, căpșuni, kiwi.
- **Classic waffle (145 MDL):** Waffle belgian, Nutella®, ciocolată albă, Oreo, biscuiți Lotus.
- **Belgian panda waffle (160 MDL):** Waffle belgian, Nutella®, ciocolată albă.
- **Biscoff waffle (195 MDL):** Waffle belgian, pastă Lotus, biscuiți Lotus, ciocolată albă.

### Crepes (Clătite Franțuzești)
- **Crepe Dubai (265 MDL):** Clătită, kataif crocant, cremă de fistic 100% sicilian, Nutella®.
- **Delux crepe (165 MDL):** Clătită, Nutella®, ciocolată albă, Oreo, biscuiți Lotus, alune, fistic, Kinder Bueno.
- **Biscoff crepe (205 MDL):** Clătită, pastă Lotus, ciocolată albă, biscuiți Lotus.
- **Fruits crepe (145 MDL):** Clătită, Nutella®, ciocolată albă, banană, căpșuni.
- **Kinder crepe (155 MDL):** Clătită, Nutella®, ciocolată albă, batoane Kinder.
- **Oreo crepe (145 MDL):** Clătită, Nutella®, ciocolată albă, biscuiți Oreo zdrobiți.

### Sushi & Bites Dulci
- **Royal Sushi (205 MDL):** Rulou de clătită fină, Nutella®, banane, căpșuni, topping crocant.
- **Sushi Banana (160 MDL):** Clătită rulată cu banană întreagă și Nutella®.
- **Chocolate Bites (140 MDL):** Bucățele pufoase acoperite în ciocolată fină și fructe.

### Pancakes (Clătite Americane)
- **Biskoff Pancakes (185 MDL):** Pancakes pufoase cu cremă și biscuiți Lotus Biscoff.
- **Fruits Pancakes (165 MDL):** Pancakes pufoase cu Nutella®, căpșuni și banane.
- **Royal Pancakes (195 MDL):** Pancakes pufoase cu fistic, Nutella® și ciocolată albă.

### Băuturi & Răcoritoare
- **Milkshake Oreo (85 MDL)**
- **Milkshake Kinder (85 MDL)**
- **Milkshake Nutella (85 MDL)**
- **Milkshake Căpșuni (85 MDL)**
- **Ice Lemonade (50 MDL)**
- **Cafea Espresso / Americano / Cappuccino (30 - 45 MDL)**
- **Ceaiuri Calde (35 MDL)**

## 5. Politica de Livrare și Comenzi Online
- Comenzile se plasează direct pe site-ul https://www.munchotella.md
- Timpul mediu de livrare în Chișinău este de 35 - 45 minute.
- Toate waffles și crepes sunt ambalate în cutii termorezistente pentru a ajunge calde și crocante.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
