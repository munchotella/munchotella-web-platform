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
    title: t('metaTitle'),
    description: t('metaDescription'),
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
