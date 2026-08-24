import { API_URL } from '@/lib/adminApi';

export interface AdminUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  [key: string]: any;
}

/**
 * Validează cererea API primită pe rutele Next.js împotriva backend-ului Render.
 * Extrage header-ul Authorization sau cookie-ul access_token și verifică rolul de admin.
 * Returnează obiectul utilizatorului admin dacă sesiunea este validă și rolul este 'admin', sau null.
 */
export async function verifyAdminRequest(request: Request): Promise<AdminUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    if (!authHeader && !cookieHeader) {
      return null;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    if (data?.success && data?.data?.role === 'admin') {
      return data.data as AdminUser;
    }

    return null;
  } catch (error) {
    console.error('Eroare la verificarea sesiunii de admin server-side:', error);
    return null;
  }
}
