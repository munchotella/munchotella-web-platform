---
name: master-design-process
description: Comprehensive 7-stage professional design workflow (Grill Me, Brief, IA, Tokens, Tasks, Spec-Grounded Build, Visual QA) tailored for premium web platforms, combining Julian Oczkowski's design process with Munchotella's Editorial & Warm Luxury aesthetics. Use whenever creating a new website or redesigning major UI components.
---

# Master Design Process & Architectural Design System (Munchotella Standard)

Această resursă reprezintă cadrul metodologic suprem de design web și UI/UX. Combină **procesul în 7 etape definit de Julian Oczkowski** cu **standardele estetice și funcționale validate în proiectul Munchotella** (Warm Luxury, Editorial Layouts, Scrollytelling, High Touch Targets, Zero-Slop UI).

Niciun proiect web nou sau modul UI complex nu va fi scris "la întâmplare" sau prin "vibe-coding". Fiecare linie de cod vizual trebuie să treacă prin această matrice de verificare.

---

## RĂDĂCINA FILOZOFICĂ: CE ESTE "ZERO-SLOP DESIGN"?
Design-ul generic ("AI Slop") folosește culori implicite (alb pur, albastru pur), fonturi de sistem neajustate, colțuri rotunjite la întâmplare și lipsă de micro-interacțiuni.
**Design-ul Master Munchotella** folosește:
1. **Palete curate, Tailored HSL:** Culori primare bogate, fundaluri calde (Warm White, Dark Chocolate).
2. **Ierarhie Tipografică Intenționată:** Combinarea stilurilor Serife (Editorial/Storytelling) cu Sans-Serif moderne (Inter/Outfit).
3. **Stări de Interacțiune Explicite:** Orice element interactiv (buton, card, link, toggle) ARE obligatoriu stare de `hover`, `active` (scale-95 sau glow), și `focus`.
4. **Responsivitate Nativă Mobile-First:** Proiectat de la ecrane înguste (390px) la ultrawide (1400px+).

---

## CELE 7 ETAPE ALE PROCESULUI DE DESIGN (THE 7-STAGE DESIGN PROCESS)

### ETAPA 1: INTEROGAREA ȘI CLARIFICAREA (`Grill Me`)
*Înainte de a scrie o singură linie de cod sau Tailwind, agentul chestionează și validează cerințele.*
- **Scop:** Eliminarea ambiguității și evitarea presupunerilor leneșe.
- **Întrebări Cheie de Adresat:**
  1. Care este publicul țintă și ce stare emoțională trebuie să transmită site-ul (ex: poftă, lux, încredere, viteză)?
  2. Care este "Hero Action" (Conversia principală): Comandă online, Apel telefonic, Vizită fizică?
  3. Ce restricții de culoare sau elemente de brand obligatorii există (logo-uri, paletă)?
  4. Ce funcționalități complexe sunt necesare (coș lateral, modal de personalizare, animații la scroll)?

### ETAPA 2: BRIEF-UL FORMAL DE DESIGN (`Design Brief`)
*Definirea identității vizuale și a regulilor inviolabile.*
- **Mood & Direcție Vizuală:** Editorial / Warm Luxury / Minimalist / Swiss.
- **Ghidul de Culori (Munchotella Tokens):**
  - **Fundal Închis (Dark Chocolate):** `#1A120B` sau `#1A1A1A`
  - **Fundal Deschis (Warm Off-White):** `#FFFCF6` sau `#FAF7F2`
  - **Accente de Lux (Champagne Gold):** `#D4A853` (Principal), `#C09640` (Hover), `#D4A373` (Secundar)
  - **Text Secundar Muted:** `#736A60` sau `rgba(255,255,255,0.7)`
- **Reguli de Tipografie:**
  - Headings / Titluri: Serif rafinat sau Sans-Serif Bold cu `tracking-widest` (pentru majuscule).
  - Body Text: Sans-serif curat, 15px - 17px, linie de înălțime aerisită (`leading-relaxed`).

### ETAPA 3: ARHITECTURA INFORMAȚIONALĂ (`Information Architecture - IA`)
*Maparea tuturor paginilor, rutelor și structurii vizuale.*
- **Sitemap & Routing:**
  - `/` (Home): Cinematic Hero, Info Ribbon, Scrollytelling, Meniu Rapid, Testimoniale.
  - `/menu`: Grilă de produse pe categorii, Modal de personalizare.
  - `/about`: Povestea brandului, procesul artizanal.
  - `/contact`: Hartă interactivă, program, contact direct.
- **Ancore și Navigație:**
  - Header fix cu efect de blur (`backdrop-blur-md`).
  - Meniu Hamburger dedicat pentru mobil.
  - Sticky Bottom Bar (Vezi Comanda) pe mobil.

### ETAPA 4: TOKENII DE DESIGN & SISTEMUL DE SPASIERE (`Design Tokens`)
*Sistemul matematic de constrângere a dimensiunilor.*
- **Grila de 8pt (8-point Grid System):** Spacing-ul (padding/margin) trebuie să fie multiplu de 4 sau 8: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-12` (48px).
- **Colțuri Rotunjite (Border Radius Scale):**
  - Carduri mici / Butoane: `rounded-full` (pentru pastile/pills) sau `rounded-2xl` (16px).
  - Modale & Containere: `rounded-[24px]` sau `rounded-[32px]`.
- **Umbre & Adâncime (Elevation):**
  - Carduri pe fundal deschis: `shadow-[0_4px_20px_rgba(26,26,26,0.04)]`
  - Butoane Flotante (CTAs): `shadow-[0_8px_30px_rgba(212,168,83,0.35)]`

### ETAPA 5: DECOMPUNEREA ÎN TASK-URI (`Brief to Tasks`)
*Transformarea design-ului în etape modulare de execuție.*
- Task 1: Foundation (Tailwind config, culori, fonturi, layout principal).
- Task 2: Core Components (Navbar, Footer, Buttons, Modals).
- Task 3: Page Assembly (Home, Menu, About, Contact).
- Task 4: Responsive & Mobile Polishing.

### ETAPA 6: CONSTRUCȚIA BAZATĂ PE SPECIFICAȚII (`Spec-Grounded Frontend Build`)
*Codarea propriu-zisă fără placeholdere, cu funcționalitate completă.*

#### Regulile de Aur ale Componentelor UI:

##### 1. Butoanele și Elementele Interactive:
- **State Hover Explicite:** Schimbare clară de culoare sau background.
- **Feedback la Click (Active State):** `active:scale-95` sau `active:scale-[0.98]` este OBLIGATORIU pe toate butoanele.
- **Dimensiuni Atingere pe Mobil (Touch Targets):** Orice buton sau link de pe mobil trebuie să aibă minimum **44x44px** spațiu interactiv (se folosește `py-2` sau `min-h-[44px]` chiar dacă textul este mic).

##### 2. Fereastra de Personalizare (Product Customization Modal):
- Titlul și Prețul topping-urilor stau pe **ACELAȘI RÂND** (Inline flex), cu text lizibil (16-17px).
- Indicatorul de selecție (Radio/Checkbox): Cerculeț vizibil (minimum 28x28px) cu border contrastant (`border-[#C5BCB1]`) și stare de hover auriu.
- Butonul de "Adaugă în Coș" stă lipit la bază (Sticky Footer inside Modal).

##### 3. Pop-up-ul Mobil "Vezi Comanda" (Sticky Bottom Bar):
- Fundal auriu vibrant (`bg-[#D4A853]`) pe mobil pentru contrast maxim ca principala acțiune de conversie.
- Text negru (`#1A120B`) pentru lizibilitate WCAG.
- Badge cu numărul de produse pe fundal închis și prețul total într-o pastilă semi-transparentă.

##### 4. Subsolul (Footer):
- Text lizibil (15px - 16px).
- Titlurile coloanelor scurte, majuscule (Uppercase), aurii (`#D4A853`) cu `tracking-widest`.
- Padding vertical adăugat pe link-uri pentru click facil de pe telefon.

---

### ETAPA 7: INSPECȚIA VIZUALĂ ȘI AUDITUL AUTOMAT (`Design Review`)
*Verificarea calității folosind capturi de ecran și sub-agenți.*
1. **Captură de Ecran Desktop & Mobile:** Rularea `browser_subagent` pentru a fotografia ecranul la 1400px și la 390px.
2. **Verificarea Contrastului (WCAG 2.2 AA):** Textul alb pe fundal închis trebuie să aibă opacitate minimă 70% (`text-white/70`), niciodată sub 40% pentru text de bază.
3. **Verificarea Alinierii:** Toate textele de pe o coloană trebuie să aibă aceeași linie verticală de start.
4. **Refacere Imediată:** Orice eroare găsită în auditul vizual este remediată direct în cod, urmată de o nouă verificare.
