import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// ═══ SECURITATE: Content-Security-Policy (SEC-MED-01b) ═══
// Definit ca funcție pentru a evita repetarea — aplicat atât pe '/(.*)'
// O CSP strictă este prima linie de apărare împotriva XSS.
const ContentSecurityPolicy = [
  "default-src 'self'",
  // script-src: 'unsafe-inline' necesar momentan pentru Next.js inline hydration
  // Migrare viitoare: nonce-based CSP pentru eliminarea 'unsafe-inline'
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://apis.google.com",
  // style-src: 'unsafe-inline' necesar pentru CSS-in-JS și styled-components
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // font-src: Google Fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // img-src: Cloudinary pentru imagini produse, Google pentru avatare sociale, Webflow CDN pentru imagini statice
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://graph.facebook.com https://maps.gstatic.com https://maps.googleapis.com https://cdn.prod.website-files.com",
  // connect-src: API Munchotella (Render) + Firebase + Sentry
  "connect-src 'self' https://munchotella-api.onrender.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://o0.ingest.sentry.io wss://munchotella-api.onrender.com",
  // frame-src: Firebase auth popup (Google, Facebook login) and Google Maps iframe
  "frame-src 'self' https://munchotella-d67f1.firebaseapp.com https://accounts.google.com https://www.google.com",
  // media-src: video/audio propriu
  "media-src 'self'",
  // object-src: blochează complet plugin-urile (Flash etc.)
  "object-src 'none'",
  // base-uri: previne atacurile de tip base tag injection
  "base-uri 'self'",
  // form-action: restricționează unde pot fi trimise formularele
  "form-action 'self'",
].join('; ');

const nextConfig: any = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://munchotella-api.onrender.com/api/:path*',
      },
      {
        source: '/__/auth/:path*',
        destination: 'https://munchotella-d67f1.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          // ─── SEC-MED-01b: CSP — Adăugat ──────────────────────────────────
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          // ─── SEC-MED-01b: HSTS — forțează HTTPS minim 2 ani ─────────────
          // max-age=63072000 = 2 ani. preload = permite includerea în lista HSTS preload browsers.
          // IMPORTANT: activați doar când site-ul rulează EXCLUSIV pe HTTPS.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

