import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { PackageCheck, Clock, Navigation, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import DeliveryCalculator from '@/components/delivery/DeliveryCalculator';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DeliveryPage' });

  const title = t('metaTitle');
  const description = t('metaDescription');

  return {
    title,
    description,
    alternates: {
      canonical: locale === 'ro' ? 'https://www.munchotella.md/livrare' : `https://www.munchotella.md/${locale}/livrare`,
      languages: {
        ro: 'https://www.munchotella.md/livrare',
        ru: 'https://www.munchotella.md/ru/livrare',
        en: 'https://www.munchotella.md/en/livrare',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://www.munchotella.md/${locale}/livrare`,
      siteName: 'Munchotella Boutique Chișinău',
      images: [
        {
          url: 'https://www.munchotella.md/delux_mini_waffle_official.png',
          width: 1200,
          height: 630,
          alt: 'Livrare Deserturi Calde Munchotella Chișinău',
        },
      ],
      locale: locale === 'ro' ? 'ro_MD' : locale === 'ru' ? 'ru_MD' : 'en_US',
      type: 'website',
    },
  };
}

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DeliveryPage' });

  // Schema structurata conform specificatiei W3C / Schema.org
  const deliverySchema = {
    "@context": "https://schema.org",
    "@type": "DeliveryService",
    "@id": "https://www.munchotella.md/livrare/#service",
    "name": "Serviciul de Livrare Caldă Nocturnă Munchotella Chișinău",
    "serviceType": "Artisan Dessert Delivery",
    "provider": {
      "@id": "https://www.munchotella.md/#restaurant"
    },
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 46.99643870,
        "longitude": 28.83484630
      },
      "geoRadius": "10000"
    },
    "hasDeliveryMethod": [
      {
        "@type": "DeliveryChargeSpecification",
        "name": "Livrare Pietonală Proximitate (< 1.000 metri)",
        "price": "20",
        "priceCurrency": "MDL",
        "description": "Tarif fix de 20 MDL pentru perimetrul adiacent boutique-ului: Str. Nicolae Testemițanu, Shopping MallDova, parcul Valea Trandafirilor",
        "appliesToDeliveryAddress": {
          "@type": "PostalAddress",
          "addressLocality": "Chișinău",
          "addressSublocality": "Centru / MallDova / Testemițanu"
        }
      },
      {
        "@type": "DeliveryChargeSpecification",
        "name": "Livrare Curier Auto / Taxi (1.000 m - 10.000 m)",
        "price": "30",
        "priceCurrency": "MDL",
        "description": "30 MDL tarif de bază + 6.45 MDL per fiecare kilometru parcurs, calculat automat prin Google Maps API",
        "eligibleTransactionVolume": {
          "@type": "PriceSpecification",
          "priceCurrency": "MDL"
        }
      }
    ],
    "deliveryLeadTime": {
      "@type": "QuantitativeValue",
      "minValue": 35,
      "maxValue": 45,
      "unitCode": "MIN"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t('faq1Q'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq1A')
        }
      },
      {
        "@type": "Question",
        "name": t('faq2Q'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq2A')
        }
      },
      {
        "@type": "Question",
        "name": t('faq3Q'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq3A')
        }
      },
      {
        "@type": "Question",
        "name": t('faq4Q'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq4A')
        }
      }
    ]
  };

  const calculatorDict = {
    title: t('calcTitle'),
    subtitle: t('calcSubtitle'),
    distanceLabel: t('calcDistanceLabel'),
    distancePlaceholder: t('calcDistancePlaceholder'),
    calculateBtn: t('calcBtn'),
    resultTitle: t('calcResultTitle'),
    pedestrianBadge: t('calcPedestrianBadge'),
    autoBadge: t('calcAutoBadge'),
    estimatedCost: t('calcEstimatedCost'),
    disclaimer: t('calcDisclaimer'),
    orderCta: t('calcOrderCta'),
    tier1Name: t('tier1Label'),
    tier2Name: t('tier2Label'),
  };

  return (
    <div className="bg-[#1A120B] text-[#FCF9F4] min-h-screen selection:bg-[#D4A853] selection:text-white pt-24 pb-24">
      {/* Injectare Date Structurate duble: DeliveryService + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(deliverySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section Editorial */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 text-center pt-8 pb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 text-[#D4A853] text-xs font-mono uppercase tracking-[0.25em] mb-6 animate-fadeIn">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('badge')}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white font-normal leading-[1.15] mb-6 max-w-3xl mx-auto">
          {t('heroTitle')}
        </h1>
        <p className="text-white/80 font-sans text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
          {t('heroSubtitle')}
        </p>
      </section>

      {/* Grid: 3 Piloni Tehnologici (Ambalaj Termic, Timp, Acoperire) */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
        <div className="bg-[#241B13] border border-[#3A2C20] hover:border-[#D4A853]/40 rounded-2xl p-8 flex flex-col items-start transition-colors duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center text-[#D4A853] mb-6">
            <PackageCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-white mb-3 font-normal">{t('feature1Title')}</h2>
          <p className="text-white/70 text-sm leading-relaxed font-sans">{t('feature1Desc')}</p>
        </div>

        <div className="bg-[#241B13] border border-[#3A2C20] hover:border-[#D4A853]/40 rounded-2xl p-8 flex flex-col items-start transition-colors duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center text-[#D4A853] mb-6">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-white mb-3 font-normal">{t('feature2Title')}</h2>
          <p className="text-white/70 text-sm leading-relaxed font-sans">{t('feature2Desc')}</p>
        </div>

        <div className="bg-[#241B13] border border-[#3A2C20] hover:border-[#D4A853]/40 rounded-2xl p-8 flex flex-col items-start transition-colors duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center text-[#D4A853] mb-6">
            <Navigation className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-white mb-3 font-normal">{t('feature3Title')}</h2>
          <p className="text-white/70 text-sm leading-relaxed font-sans">{t('feature3Desc')}</p>
        </div>
      </section>

      {/* Sectiune Mixta: Grila de Tarife + Calculator Interactiv Client */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coloana Stanga: Detalierea Pragurilor Tarifare (7 col) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#241B13] border border-[#3A2C20] rounded-2xl p-8 md:p-10">
              <span className="text-[#D4A853] font-mono text-xs uppercase tracking-widest block mb-2">
                {t('policyLabel')}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-white font-normal mb-6">
                {t('pricingTitle')}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                {t('pricingIntro')}
              </p>

              <div className="space-y-4">
                {/* Pragul 1 */}
                <div className="bg-[#1A120B] p-6 rounded-xl border border-[#3A2C20] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[#D4A853] text-xs font-mono uppercase tracking-wider block mb-1">
                      {t('tier1Label')}
                    </span>
                    <h3 className="font-serif text-xl text-white">{t('tier1Name')}</h3>
                    <p className="text-white/60 text-xs mt-1 max-w-sm">{t('tier1Desc')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-3xl font-serif text-white font-bold block">20 MDL</span>
                    <span className="text-white/40 text-xs font-sans">{t('tier1Fixed')}</span>
                  </div>
                </div>

                {/* Pragul 2 */}
                <div className="bg-[#1A120B] p-6 rounded-xl border border-[#3A2C20] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[#D4A853] text-xs font-mono uppercase tracking-wider block mb-1">
                      {t('tier2Label')}
                    </span>
                    <h3 className="font-serif text-xl text-white">{t('tier2Name')}</h3>
                    <p className="text-white/60 text-xs mt-1 max-w-sm">{t('tier2Desc')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-3xl font-serif text-[#D4A853] font-bold block">30 MDL</span>
                    <span className="text-white/40 text-xs font-sans">+ 6.45 MDL / km</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#3A2C20] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-white/50 text-xs">{t('pricingDisclaimer')}</p>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-[#D4A853] hover:bg-[#E5B963] text-[#1A120B] px-6 py-3 rounded-full font-sans font-semibold text-xs tracking-wider uppercase transition-colors shrink-0"
                >
                  {t('ctaButton')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Coloana Dreapta: Calculatorul Interactiv (5 col) */}
          <div className="lg:col-span-5">
            <DeliveryCalculator dict={calculatorDict} />
          </div>

        </div>
      </section>

      {/* Sectiune FAQ Dedicata Livrarii (SEO & Intent Conversational) */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 mb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[#D4A853] text-xs font-mono uppercase tracking-widest mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>{t('faqBadge')}</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-white font-normal">
            {t('faqTitle')}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-[#241B13] border border-[#3A2C20] rounded-xl p-6">
            <h3 className="font-serif text-lg text-white mb-2 font-medium">{t('faq1Q')}</h3>
            <p className="text-white/70 text-sm leading-relaxed font-sans">{t('faq1A')}</p>
          </div>
          <div className="bg-[#241B13] border border-[#3A2C20] rounded-xl p-6">
            <h3 className="font-serif text-lg text-white mb-2 font-medium">{t('faq2Q')}</h3>
            <p className="text-white/70 text-sm leading-relaxed font-sans">{t('faq2A')}</p>
          </div>
          <div className="bg-[#241B13] border border-[#3A2C20] rounded-xl p-6">
            <h3 className="font-serif text-lg text-white mb-2 font-medium">{t('faq3Q')}</h3>
            <p className="text-white/70 text-sm leading-relaxed font-sans">{t('faq3A')}</p>
          </div>
          <div className="bg-[#241B13] border border-[#3A2C20] rounded-xl p-6">
            <h3 className="font-serif text-lg text-white mb-2 font-medium">{t('faq4Q')}</h3>
            <p className="text-white/70 text-sm leading-relaxed font-sans">{t('faq4A')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
