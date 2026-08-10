export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://munchotella-api.onrender.com/api";

export async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  // Nu setăm Content-Type pentru FormData (browser-ul se ocupă de boundary)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  const res = await fetch(url, config);

  if (res.status === 401) {
    throw new Error("Sesiune expirată. Te rugăm să te autentifici din nou.");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "A apărut o eroare la apelul API.");
  }

  return data;
}
