import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// ═══ SECURITATE: Content-Security-Policy (SEC-MED-01b) ═══
// Definit ca funcție pentru a evita repetarea — aplicat atât pe '/(.*)'
// O CSP strictă este prima linie de apărare împotriva XSS.
const ContentSecurityPolicy = [
  "default-src 'self'",
  // script-src: 'unsafe-inline' și 'unsafe-eval' necesare pentru Next.js și Google Maps API
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://*.googleapis.com https://apis.google.com https://identitytoolkit.googleapis.com https://*.gstatic.com",
  // style-src: 'unsafe-inline' necesar pentru Tailwind/styled components și Google Maps styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
  // font-src: Google Fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // img-src: Cloudinary, Google avatars, Facebook, Maps tiles
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://graph.facebook.com https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googleusercontent.com https://cdn.prod.website-files.com",
  // connect-src: API Munchotella (Render) + Firebase + Sentry + Google Maps API/Tiles
  "connect-src 'self' https://munchotella-api.onrender.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://o0.ingest.sentry.io wss://munchotella-api.onrender.com https://maps.googleapis.com https://*.googleapis.com https://*.google.com https://*.gstatic.com data: blob:",
  // worker-src: necesar pentru web workers (vector tiles Google Maps)
  "worker-src 'self' blob:",
  // child-src: iframe / web workers
  "child-src 'self' blob: https://munchotella-d67f1.firebaseapp.com https://accounts.google.com https://www.google.com",
  // frame-src: Firebase auth popup and Google Maps iframe
  "frame-src 'self' https://munchotella-d67f1.firebaseapp.com https://accounts.google.com https://www.google.com https://www.munchotella.md https://munchotella.md",
  // media-src: audio/video propriu
  "media-src 'self'",
  // object-src: blochează complet plugin-urile (Flash etc.)
  "object-src 'none'",
  // base-uri: previne atacurile de tip base tag injection
  "base-uri 'self'",
  // form-action: restricționează unde pot fi trimise formularele
  "form-action 'self'",
  // upgrade-insecure-requests: forțează toate resursele pe HTTPS
  "upgrade-insecure-requests",
].join('; ');

const nextConfig: any = {
  serverExternalPackages: ['mongodb'],
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: 'https://munchotella-api.onrender.com/api/:path*',
        },
        {
          source: '/__/:path*',
          destination: 'https://munchotella-d67f1.firebaseapp.com/__/:path*',
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
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

