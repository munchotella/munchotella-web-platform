# Munchotella - Documentație Integrare Meta & Firebase

> Acest fișier conține toate configurațiile, token-urile, ID-urile de aplicație și webhook-urile pentru Munchotella.
> Este salvat permanent în proiect pentru ca orice sesiune viitoare de asistență AI sau dezvoltare să aibă acces instantaneu la date.

---

## 1. Aplicația Meta (Facebook & Instagram API)

* **App ID (Aplicația Nouă de Producție/Business)**: `1532710748068229`
* **App Secret**: `1c44f944380c0b8816cbf275323920fd`
* **Status Aplicație**: `Published` / `Live`
* **Portofoliu Business ID**: `164048124717139`
* **Cont Instagram Conectat**: `@munchotella.md` (ID: `17841407196466279`)
* **Pagina Facebook Conectată**: `Munchotella` (ID: `2033309050260259`)

### Meta System User Token (Permanent - Fără Expirare):
```text
EAAVxZCgeumYUBSCIdviX1bYuubsuZCp3TWPXSPZCE9TfaJKTHu7fTv542LYbiOFC2ZB16SZAAprVec1Dvx8db6ydyU4shHOb8ZAI6wxLsF9mep5cKYjQivMxLbRp21qoOsdwZBZCe2yc5vZBTwA4noZArn3edbYSs8b9ZA8IDHP4H5l73BuM7xQvhYfXe1TF3Gj8zWVi8kL
```

---

## 2. Webhook Meta (Instagram & Facebook Messaging)

* **Callback URL**: `https://munchotella-web-platform.vercel.app/api/webhooks/instagram`
* **Verify Token**: `munchotella_secret_token`
* **Evenimente Abonate (`Subscribed`)**:
  - `messages` (Primire/Procesare mesaje clienți în timp real cu Gemini AI + Engine Munchotella)
  - `messaging_postbacks`
  - `message_reactions`
* **Mecanism de Siguranță**:
  - Webhook-ul include un fallback permanent cu token-ul de mai sus în codul din `src/app/api/webhooks/instagram/route.ts`, astfel încât chiar dacă variabilele de mediu din Vercel sunt lipsă sau incomplete, serverul poate procesa și trimite răspunsul instant pe Instagram fără nicio întrerupere.

---

## 3. Autentificare Firebase & Facebook Login

* **Firebase Project ID**: `munchotella-d67f1`
* **Auth Domain**: `munchotella-d67f1.firebaseapp.com`
* **Facebook Provider Status în Firebase**: `Enabled`
  - App ID: `1532710748068229`
  - App Secret: `1c44f944380c0b8816cbf275323920fd`
* **Domenii Autorizate (OAuth Redirect URIs)**:
  - `https://munchotella-d67f1.firebaseapp.com/__/auth/handler`
  - `https://munchotella-web-platform.vercel.app/api/auth/callback/facebook`
  - `https://munchotella.md/`
  - `https://www.munchotella.md/__/auth/handler`

---

## 4. Variabile de Mediu (`.env.local`)

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC3ZUWbXA6OAjpYwwLLhmEj0yqsxLqOcCE
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC3ZUWbXA6OAjpYwwLLhmEj0yqsxLqOcCE
NEXT_PUBLIC_FIREBASE_PROJECT_ID=munchotella-d67f1
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=munchotella-d67f1.firebaseapp.com
NEXT_PUBLIC_API_URL=http://localhost:5000/api
META_USER_ACCESS_TOKEN=EAAVxZCgeumYUBSPLzuXiRg7mr043FvntoYjsKLRzb2CZCjjDJOheZAWqW0LNxe2ry8H1PWxTQYG72Tr90zjmpyiFIxEti6T3RS76BEe9VhN8N51cQCJsFaBx5ILW2u5w7yJ2lTwZA5LSc7VgriuIBZAiSKuX0mn9nDUInhGAg7xa7m78Hz8kk08coAUnZCEwZDZD
META_PAGE_ACCESS_TOKEN=EAAVxZCgeumYUBSCIdviX1bYuubsuZCp3TWPXSPZCE9TfaJKTHu7fTv542LYbiOFC2ZB16SZAAprVec1Dvx8db6ydyU4shHOb8ZAI6wxLsF9mep5cKYjQivMxLbRp21qoOsdwZBZCe2yc5vZBTwA4noZArn3edbYSs8b9ZA8IDHP4H5l73BuM7xQvhYfXe1TF3Gj8zWVi8kL
INSTAGRAM_ACCOUNT_ID=17841407196466279
FACEBOOK_PAGE_ID=2033309050260259
WHATSAPP_BUSINESS_ACCOUNT_ID=1612700380636594
WHATSAPP_PHONE_NUMBER_ID=1292226057301284
```
