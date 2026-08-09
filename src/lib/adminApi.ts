const envUrl = process.env.NEXT_PUBLIC_API_URL;
const rawUrl = (envUrl && envUrl.startsWith('http') && !envUrl.includes('vercel.app'))
  ? envUrl.replace(/\/$/, '')
  : "https://munchotella-api.onrender.com";

export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

/**
 * VUL-001 FIX: Curăță sesiunea locală și redirecționează la login.
 * Nu mai există munchotella_token în localStorage (a fost eliminat complet).
 * Ștergem doar datele de profil (non-sensibile) și facem reload.
 * Layout-ul admin va detecta că /api/auth/me returnează 401 și va afișa formularul de login.
 */
export function handleSessionExpired(): void {
  localStorage.removeItem("munchotella_user");
  // Forțăm un reload complet — layout-ul va apela /api/auth/me și va obține 401,
  // ceea ce va afișa automat formularul de login fără nici un token în localStorage.
  window.location.href = "/ro/admin";
}

export async function adminFetch(endpoint: string, options: RequestInit = {}) {
  // SEC-HIGH-03: Nu mai citim tokenul din localStorage
  // Autentificarea se face prin HttpOnly cookie trimis automat de browser

  const headers = new Headers(options.headers || {});

  // Set default content type if not provided and body exists
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // SEC-HIGH-03: Obligatoriu pentru a trimite HttpOnly cookie
    headers,
  });

  // Interceptare globală 401 — sesiunea a expirat sau cookie-ul lipsește
  if (response.status === 401) {
    handleSessionExpired();
    throw new Error("Sesiune expirată. Te rugăm să te autentifici din nou.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
