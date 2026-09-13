import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ContactClient from './ContactClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });

  return {
    title: t('metaTitle', { default: 'Contact & Locație Boutique Chișinău | Munchotella' }),
    description: t('metaDescription', { default: 'Contactează boutique-ul Munchotella din Str. Nicolae Testemițanu 21/1 Chișinău. Comenzi telefonice la +373 79 006 499, asistență comenzi și hartă acces.' }),
    alternates: {
      canonical: locale === 'ro' ? 'https://www.munchotella.md/contact' : `https://www.munchotella.md/${locale}/contact`,
      languages: {
        ro: 'https://www.munchotella.md/contact',
        ru: 'https://www.munchotella.md/ru/contact',
        en: 'https://www.munchotella.md/en/contact',
      },
    },
  };
}

export default async function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://www.munchotella.md/contact/#page",
    "mainEntity": {
      "@id": "https://www.munchotella.md/#restaurant"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <ContactClient />
    </>
  );
}
