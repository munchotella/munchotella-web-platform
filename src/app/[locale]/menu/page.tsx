import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MenuClient from './MenuClient';
import rawMenuItems from '@/data/menu.json';
import { getOptimizedProductImage } from '@/utils/productImages';

interface MenuPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: MenuPageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const productParam = resolvedSearchParams.product || resolvedSearchParams.item;
  const rawQuery = Array.isArray(productParam) ? productParam[0] : productParam;

  // 1. Dynamic Open Graph & Metadata when ?product= or ?item= is present
  if (rawQuery && typeof rawQuery === 'string' && rawQuery.trim()) {
    const targetQuery = rawQuery.trim();
    const normalizedTarget = targetQuery.toLowerCase().replace(/[-_]/g, ' ').trim();

    const found = (rawMenuItems as any[]).find((item: any, index: number) => {
      const idStr = String(item._id || item.id || index + 1).toLowerCase();
      const nameStr = (item.name || '').toLowerCase();
      const slugStr = (item.name || '').toLowerCase().replace(/\s+/g, '_');
      const hyphenSlugStr = (item.name || '').toLowerCase().replace(/\s+/g, '-');

      return (
        idStr === normalizedTarget ||
        nameStr === normalizedTarget ||
        slugStr === targetQuery.toLowerCase() ||
        hyphenSlugStr === targetQuery.toLowerCase() ||
        nameStr.includes(normalizedTarget)
      );
    });

    if (found) {
      // Resolve high resolution absolute image URL (critical for WhatsApp & Telegram previews)
      const rawImage = getOptimizedProductImage(found.name, found.image);
      let absoluteImage = rawImage;
      if (absoluteImage.startsWith('/')) {
        absoluteImage = `https://www.munchotella.md${absoluteImage}`;
      } else if (!absoluteImage.startsWith('http')) {
        absoluteImage = `https://www.munchotella.md/images/products/${absoluteImage}`;
      }
      // Encode URI safely for CDN URLs with spaces/parentheses
      absoluteImage = encodeURI(decodeURI(absoluteImage));

      const priceStr = `${found.price} MDL`;

      // Multilingual localized Titles & Descriptions
      let pageTitle = `${found.name} (${priceStr}) — Munchotella Chișinău`;
      let pageDesc = '';

      if (locale === 'ru') {
        pageTitle = `${found.name} (${priceStr}) — Меню Munchotella Кишинёв`;
        if (found.name.toLowerCase().includes('dubai')) {
          pageDesc = `Попробуйте вирусный ${found.name} (${priceStr}) в Кишинёве: нежный блинчик, 100% сицилийская фисташковая паста, хрустящий катаиф и Nutella®. Быстрая доставка!`;
        } else if (found.description && found.description.trim()) {
          pageDesc = `${found.name} (${priceStr}) в Munchotella Кишинёв: ${found.description}. Свежее приготовление и быстрая доставка.`;
        } else {
          pageDesc = `Закажите ${found.name} (${priceStr}) с быстрой доставкой по Кишинёву. Премиальные десерты с оригинальной Nutella® от Munchotella.`;
        }
      } else if (locale === 'en') {
        pageTitle = `${found.name} (${priceStr}) — Munchotella Menu Chisinau`;
        if (found.name.toLowerCase().includes('dubai')) {
          pageDesc = `Taste the viral ${found.name} (${priceStr}) in Chisinau: delicate French crepe, 100% pure Sicilian pistachio cream, crispy kataifi, and Nutella®. Fast warm delivery!`;
        } else if (found.description && found.description.trim()) {
          pageDesc = `${found.name} (${priceStr}) at Munchotella Chisinau: ${found.description}. Freshly prepared with artisan ingredients and fast delivery.`;
        } else {
          pageDesc = `Order fresh ${found.name} (${priceStr}) with fast delivery in Chisinau. Premium artisan desserts made with real Nutella® by Munchotella.`;
        }
      } else {
        // Romanian default
        pageTitle = `${found.name} (${priceStr}) — Meniu Munchotella Chișinău`;
        if (found.name.toLowerCase().includes('dubai')) {
          pageDesc = `Savurează viralul ${found.name} (${priceStr}) în Chișinău: clătită fină, pastă pură de fistic sicilian 100%, cataif crocant tras în unt și Nutella®. Livrare caldă la ușă!`;
        } else if (found.description && found.description.trim()) {
          pageDesc = `${found.name} (${priceStr}) la Munchotella Chișinău: ${found.description}. Preparat proaspăt pe loc cu ingrediente premium și livrare rapidă.`;
        } else {
          pageDesc = `Comandă ${found.name} (${priceStr}) cu livrare rapidă în Chișinău. Deserturi artizanale calde cu Nutella® originală și fructe proaspete de la Munchotella.`;
        }
      }

      // Preserve query in canonical and og:url so social scrapers don't revert to base menu
      const queryParamEncoded = encodeURIComponent(targetQuery);
      const currentCanonical =
        locale === 'ro'
          ? `https://www.munchotella.md/menu?product=${queryParamEncoded}`
          : `https://www.munchotella.md/${locale}/menu?product=${queryParamEncoded}`;

      return {
        title: pageTitle,
        description: pageDesc,
        alternates: {
          canonical: currentCanonical,
          languages: {
            ro: `https://www.munchotella.md/menu?product=${queryParamEncoded}`,
            ru: `https://www.munchotella.md/ru/menu?product=${queryParamEncoded}`,
            en: `https://www.munchotella.md/en/menu?product=${queryParamEncoded}`,
          },
        },
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          url: currentCanonical,
          siteName: 'Munchotella',
          locale: locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_US' : 'ro_MD',
          type: 'website',
          images: [
            {
              url: absoluteImage,
              width: 1200,
              height: 630,
              alt: `${found.name} — Munchotella Chișinău`,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: pageTitle,
          description: pageDesc,
          images: [absoluteImage],
        },
      };
    }
  }

  // 2. Standard Menu Fallback Metadata
  const t = await getTranslations({ locale, namespace: 'Menu' });
  const baseCanonical =
    locale === 'ro'
      ? 'https://www.munchotella.md/menu'
      : `https://www.munchotella.md/${locale}/menu`;
  const defaultTitle = t('metaTitle');
  const defaultDesc = t('metaDescription');
  const defaultBanner = 'https://www.munchotella.md/images/posters/hero_waffle_poster.webp';

  return {
    title: defaultTitle,
    description: defaultDesc,
    alternates: {
      canonical: baseCanonical,
      languages: {
        ro: 'https://www.munchotella.md/menu',
        ru: 'https://www.munchotella.md/ru/menu',
        en: 'https://www.munchotella.md/en/menu',
      },
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: baseCanonical,
      siteName: 'Munchotella',
      locale: locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_US' : 'ro_MD',
      type: 'website',
      images: [
        {
          url: defaultBanner,
          width: 1200,
          height: 630,
          alt: 'Meniul Munchotella Chișinău — Waffles și Crepes Premium',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDesc,
      images: [defaultBanner],
    },
  };
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const productParam = resolvedSearchParams.product || resolvedSearchParams.item;
  const rawQuery = Array.isArray(productParam) ? productParam[0] : productParam;

  let productSchema: any = null;

  if (rawQuery && typeof rawQuery === 'string' && rawQuery.trim()) {
    const targetQuery = rawQuery.trim();
    const normalizedTarget = targetQuery.toLowerCase().replace(/[-_]/g, ' ').trim();

    const found = (rawMenuItems as any[]).find((item: any, index: number) => {
      const idStr = String(item._id || item.id || index + 1).toLowerCase();
      const nameStr = (item.name || '').toLowerCase();
      const slugStr = (item.name || '').toLowerCase().replace(/\s+/g, '_');
      const hyphenSlugStr = (item.name || '').toLowerCase().replace(/\s+/g, '-');

      return (
        idStr === normalizedTarget ||
        nameStr === normalizedTarget ||
        slugStr === targetQuery.toLowerCase() ||
        hyphenSlugStr === targetQuery.toLowerCase() ||
        nameStr.includes(normalizedTarget)
      );
    });

    if (found) {
      const rawImage = getOptimizedProductImage(found.name, found.image);
      const absoluteImage = rawImage.startsWith('/')
        ? `https://www.munchotella.md${rawImage}`
        : rawImage;

      productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': found.name,
        'image': absoluteImage,
        'description': found.description || `${found.name} de la Munchotella Chișinău`,
        'offers': {
          '@type': 'Offer',
          'price': found.price.toString(),
          'priceCurrency': 'MDL',
          'availability': 'https://schema.org/InStock',
          'url': `https://www.munchotella.md/menu?product=${encodeURIComponent(targetQuery)}`,
          'seller': {
            '@type': 'Restaurant',
            'name': 'Munchotella',
          },
        },
      };
    }
  }

  // Generare Schema Menu completa cu date nutritionale si dietetice
  const menuSchema = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': 'https://www.munchotella.md/menu/#menu',
    'name': 'Meniul Artizanal Munchotella Chișinău',
    'inLanguage': ['ro', 'ru', 'en'],
    'hasMenuSection': [
      {
        '@type': 'MenuSection',
        'name': 'Waffles Americane & Belgiene',
        'hasMenuItem': (rawMenuItems as any[])
          .filter((item: any) => item.category === 'waffles')
          .map((item: any) => ({
            '@type': 'MenuItem',
            'name': item.name,
            'description': item.description,
            'image': item.image,
            'offers': {
              '@type': 'Offer',
              'price': item.price.toString(),
              'priceCurrency': 'MDL',
              'availability': 'https://schema.org/InStock',
            },
            'suitableForDiet': 'https://schema.org/VegetarianDiet',
            'nutrition': {
              '@type': 'NutritionInformation',
              'allergens': 'Gluten, Lactate, Ouă, Nuci/Alune/Fistic',
            },
          })),
      },
      {
        '@type': 'MenuSection',
        'name': 'Clătite Franțuzești (Crepes) & Specialități Dubai',
        'hasMenuItem': (rawMenuItems as any[])
          .filter((item: any) => item.category === 'crepes')
          .map((item: any) => ({
            '@type': 'MenuItem',
            'name': item.name,
            'description': item.description,
            'image': item.image,
            'offers': {
              '@type': 'Offer',
              'price': item.price.toString(),
              'priceCurrency': 'MDL',
              'availability': 'https://schema.org/InStock',
            },
            'suitableForDiet': 'https://schema.org/VegetarianDiet',
            'nutrition': {
              '@type': 'NutritionInformation',
              'allergens': 'Gluten, Lactate, Ouă, Fistic 100%, Alune de pădure',
            },
          })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <MenuClient />
    </>
  );
}
