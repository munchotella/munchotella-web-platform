const envUrl = process.env.NEXT_PUBLIC_API_URL;
export const API_URL = (envUrl && envUrl.startsWith('http')) 
  ? envUrl.replace(/\/$/, '') 
  : "https://munchotella-api.onrender.com/api";

export async function adminFetch(endpoint: string, options: RequestInit = {}) {
  // Retrieve the token from localStorage
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("munchotella_token");
  }

  const headers = new Headers(options.headers || {});
  
  // Set auth header
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Set default content type if not provided and body exists
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
