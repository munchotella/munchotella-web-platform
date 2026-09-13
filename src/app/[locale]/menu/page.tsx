import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MenuClient from './MenuClient';
import rawMenuItems from '@/data/menu.json';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Menu' });

  return {
    title: t('metaTitle', { default: 'Meniu Artizanal & Prețuri Waffles, Crepes | Munchotella' }),
    description: t('metaDescription', { default: 'Descoperă meniul complet Munchotella: Crepe Dubai, Delux Mini Waffles, clătite franțuzești și milkshake-uri preparate cu Nutella® și fistic 100% pur.' }),
    alternates: {
      canonical: locale === 'ro' ? 'https://www.munchotella.md/menu' : `https://www.munchotella.md/${locale}/menu`,
      languages: {
        ro: 'https://www.munchotella.md/menu',
        ru: 'https://www.munchotella.md/ru/menu',
        en: 'https://www.munchotella.md/en/menu',
      },
    },
  };
}

export default async function MenuPage() {
  // Generare Schema Menu completa cu date nutritionale si dietetice
  const menuSchema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": "https://www.munchotella.md/menu/#menu",
    "name": "Meniul Artizanal Munchotella Chișinău",
    "inLanguage": ["ro", "ru", "en"],
    "hasMenuSection": [
      {
        "@type": "MenuSection",
        "name": "Waffles Americane & Belgiene",
        "hasMenuItem": rawMenuItems
          .filter((item: any) => item.category === 'waffles')
          .map((item: any) => ({
            "@type": "MenuItem",
            "name": item.name,
            "description": item.description,
            "image": item.image,
            "offers": {
              "@type": "Offer",
              "price": item.price.toString(),
              "priceCurrency": "MDL",
              "availability": "https://schema.org/InStock"
            },
            "suitableForDiet": "https://schema.org/VegetarianDiet",
            "nutrition": {
              "@type": "NutritionInformation",
              "allergens": "Gluten, Lactate, Ouă, Nuci/Alune/Fistic"
            }
          }))
      },
      {
        "@type": "MenuSection",
        "name": "Clătite Franțuzești (Crepes) & Specialități Dubai",
        "hasMenuItem": rawMenuItems
          .filter((item: any) => item.category === 'crepes')
          .map((item: any) => ({
            "@type": "MenuItem",
            "name": item.name,
            "description": item.description,
            "image": item.image,
            "offers": {
              "@type": "Offer",
              "price": item.price.toString(),
              "priceCurrency": "MDL",
              "availability": "https://schema.org/InStock"
            },
            "suitableForDiet": "https://schema.org/VegetarianDiet",
            "nutrition": {
              "@type": "NutritionInformation",
              "allergens": "Gluten, Lactate, Ouă, Fistic 100%, Alune de pădure"
            }
          }))
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />
      <MenuClient />
    </>
  );
}
