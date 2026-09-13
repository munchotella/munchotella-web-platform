import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AboutClient from './AboutClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });

  return {
    title: t('metaTitle', { default: 'Povestea Noastră & Filosofia Gustului Artizanal | Munchotella' }),
    description: t('metaDescription', { default: 'Descoperă universul Munchotella: waffles coapte pe loc, pastă pură de fistic sicilian 100%, Nutella® originală și deserturi fără compromisuri în Chișinău.' }),
    alternates: {
      canonical: locale === 'ro' ? 'https://www.munchotella.md/about' : `https://www.munchotella.md/${locale}/about`,
      languages: {
        ro: 'https://www.munchotella.md/about',
        ru: 'https://www.munchotella.md/ru/about',
        en: 'https://www.munchotella.md/en/about',
      },
    },
    openGraph: {
      title: t('metaTitle', { default: 'Povestea Munchotella Boutique Chișinău' }),
      description: t('metaDescription', { default: 'Deserturi artizanale autentice, fără premixuri industriale, preparate pe loc în Chișinău.' }),
      url: `https://www.munchotella.md/${locale}/about`,
      siteName: 'Munchotella Boutique',
      images: [
        {
          url: 'https://www.munchotella.md/dubai_pistachio_crepe_ref.png',
          width: 1200,
          height: 630,
          alt: 'Munchotella Artisan Waffle & Crepe Kitchen',
        },
      ],
    },
  };
}

export default async function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://www.munchotella.md/about/#page",
    "mainEntity": {
      "@type": "Bakery",
      "@id": "https://www.munchotella.md/#restaurant",
      "name": "Munchotella Waffle Boutique Chișinău",
      "description": "Boutique artizanal de deserturi specializat în waffles americane, mini waffles și clătite franțuzești coapte exclusiv pe loc cu aluat proaspăt zilnic și ingrediente pure.",
      "knowsAbout": [
        "Artisan Waffle Baking",
        "Pure Sicilian Pistachio 100%",
        "Authentic Nutella® Confectionery",
        "French Crepes"
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutClient />
    </>
  );
}
