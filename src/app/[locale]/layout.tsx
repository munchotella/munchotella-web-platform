import type { Metadata } from "next";
import { Playfair_Display, Outfit, Great_Vibes } from "next/font/google";
import "../globals.css";
import ClientProviders from "@/components/ClientProviders";
import LayoutWrapper from "@/components/LayoutWrapper";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const playfairFont = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const outfitFont = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const greatVibesFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.munchotella.md"),
  title: "Munchotella | Ceva Dulce în Chișinău — Waffles & Crepes Premium",
  description: "Vrei ceva dulce în Chișinău? Munchotella îți aduce cele mai delicioase waffles americane, mini waffles, clătite franțuzești cu Nutella®, fructe proaspete și livrare rapidă la ușa ta!",
  keywords: [
    "ceva dulce",
    "ceva dulce chisinau",
    "vreau ceva dulce",
    "waffles chisinau",
    "crepes chisinau",
    "clatite chisinau",
    "clatite cu nutella",
    "pancakes chisinau",
    "deserturi chisinau",
    "livrare deserturi chisinau",
    "desert la domiciliu chisinau",
    "desert noaptea chisinau",
    "pistachio crepe chisinau",
    "crepe dubai chisinau",
    "munchotella",
    "munchotella chisinau",
    "munchotella md",
    "munchotella testemitanu",
    "сладкое кишинев",
    "доставка десертов кишинев",
    "вафли кишинев"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://www.munchotella.md",
    languages: {
      ro: "https://www.munchotella.md",
      ru: "https://www.munchotella.md/ru",
      en: "https://www.munchotella.md/en",
      "x-default": "https://www.munchotella.md",
    },
  },
  openGraph: {
    title: "Munchotella | Ceva Dulce în Chișinău",
    description: "Waffles & Crepes proaspete cu Nutella® originală și livrare rapidă în Chișinău.",
    url: "https://www.munchotella.md",
    siteName: "Munchotella",
    images: [
      {
        url: "https://www.munchotella.md/munchotella_favicon.png",
        width: 512,
        height: 512,
        alt: "Munchotella Emblem",
      },
    ],
    locale: "ro_MD",
    type: "website",
  },
  verification: {
    google: "4ob3hpQuVAUL7TEPPFPkKPOjFTfINdz2VuH9Grelz6c",
  },
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/favicon-48x48.png",
    apple: "/apple-touch-icon.png",
  },
};

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`h-full ${outfitFont.variable} ${playfairFont.variable} ${greatVibesFont.variable}`}>
      <head>
        <meta name="facebook-domain-verification" content="c0wy1grogfjtxwqyorc6ekk49r1k0n" />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N6ZPHD8N');`,
          }}
        />
        {/* End Google Tag Manager */}
        
        {/* Resource Hints for High Performance Web Vitals */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://munchotella-api.onrender.com" />
        
        {/* Favicon & Web App Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="shortcut icon" href="/favicon-48x48.png" />
        {/* Critical LCP Hero Poster Preload */}
        <link rel="preload" as="image" href="/delux_mini_waffle_official.png" fetchPriority="high" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "@id": "https://www.munchotella.md/#restaurant",
              "name": "Munchotella",
              "alternateName": "Munchotella Waffle Boutique Chișinău",
              "url": "https://www.munchotella.md",
              "logo": "https://www.munchotella.md/icon-512.png",
              "image": "https://www.munchotella.md/Mini_Waffle_platter_with_toppings_202607181714.jpeg",
              "description": "Boutique artizanal de deserturi premium în Chișinău: Waffles americane, mini waffles, clătite franțuzești (crepes) cu Nutella® originală și fistic sicilian 100%.",
              "servesCuisine": ["Dessert", "Waffles", "Crepes", "Artisan Bakery"],
              "priceRange": "$$",
              "currenciesAccepted": "MDL",
              "paymentAccepted": "Cash, Credit Card",
              "hasMenu": "https://www.munchotella.md/menu",
              "telephone": "+37379006499",
              "email": "munchotella@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Str. Nicolae Testemițanu 21/1",
                "addressLocality": "Chișinău",
                "addressRegion": "Chișinău",
                "postalCode": "MD-2025",
                "addressCountry": "MD"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 46.9986,
                "longitude": 28.8354
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                  ],
                  "opens": "16:00",
                  "closes": "00:00"
                }
              ],
              "sameAs": [
                "https://www.instagram.com/munchotella.md/",
                "https://www.tiktok.com/@munchotella",
                "https://www.facebook.com/munchotella"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#1A120B] text-foreground selection:bg-accent-gold selection:text-white">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N6ZPHD8N"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ClientProviders>
        </NextIntlClientProvider>
        {/* Google Analytics (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-PG9HXCGDR6"}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-PG9HXCGDR6"}');
          `}
        </Script>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
