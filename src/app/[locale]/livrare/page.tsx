import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PackageCheck, Clock, Navigation, Flame, ArrowRight, HelpCircle, PhoneCall } from 'lucide-react';
import DeliveryCalculator from '@/components/delivery/DeliveryCalculator';
import { AnimateIn } from '@/components/ui/AnimateIn';

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

  // Schema structurata Schema.org sincronizata cu tariful orientativ de taxi
  const deliverySchema = {
    "@context": "https://schema.org",
    "@type": "DeliveryService",
    "@id": "https://www.munchotella.md/livrare/#service",
    "name": "Serviciul de Livrare Caldă Munchotella Chișinău",
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
        "name": "Livrare Curier Auto / Taxi Chișinău (1 - 10 km)",
        "price": "30",
        "priceCurrency": "MDL",
        "description": "Tarif orientativ: 30 MDL tarif de bază + 6.45 MDL per fiecare kilometru parcurs, calculat automat prin Google Maps API. În caz de condiții meteo nefavorabile sau ore de vârf pe rețeaua de taxi, clientul este contactat telefonic.",
        "eligibleTransactionVolume": {
          "@type": "PriceSpecification",
          "priceCurrency": "MDL"
        }
      }
    ],
    "deliveryLeadTime": {
      "@type": "QuantitativeValue",
      "minValue": 35,
      "maxValue": 50,
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
    autoBadge: t('calcAutoBadge'),
    estimatedCost: t('calcEstimatedCost'),
    disclaimer: t('calcDisclaimer'),
    orderCta: t('calcOrderCta'),
  };

  return (
    <main className="min-h-screen bg-[#FFFCF6] pt-28 pb-32 selection:bg-[#D4A853] selection:text-white">
      {/* Date Structurate Schema.org: DeliveryService + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(deliverySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section Editorial Warm Luxury */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-center pt-6 pb-16">
        <AnimateIn direction="up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A120B] text-[#D4A853] text-xs font-mono uppercase tracking-[0.25em] mb-6 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-[#D4A853]" />
            <span>{t('badge')}</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1A120B] font-bold leading-[1.15] mb-6 max-w-3xl mx-auto">
            {t('heroTitle')}
          </h1>
          <p className="text-[#736A60] font-sans text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </AnimateIn>
      </section>

      {/* 3 Piloni Senzoriali & Tehnologici */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
        <AnimateIn direction="up" delay={0.1}>
          <div className="bg-white border border-[#E8E2D9] hover:border-[#D4A853]/60 rounded-3xl p-8 flex flex-col items-start transition-all duration-300 shadow-sm hover:shadow-md h-full group">
            <div className="w-12 h-12 rounded-full bg-[#1A120B] flex items-center justify-center text-[#D4A853] mb-6 group-hover:scale-105 transition-transform shadow-sm">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A120B] mb-3">{t('feature1Title')}</h2>
            <p className="text-[#736A60] text-sm leading-relaxed font-sans">{t('feature1Desc')}</p>
          </div>
        </AnimateIn>

        <AnimateIn direction="up" delay={0.2}>
          <div className="bg-white border border-[#E8E2D9] hover:border-[#D4A853]/60 rounded-3xl p-8 flex flex-col items-start transition-all duration-300 shadow-sm hover:shadow-md h-full group">
            <div className="w-12 h-12 rounded-full bg-[#1A120B] flex items-center justify-center text-[#D4A853] mb-6 group-hover:scale-105 transition-transform shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A120B] mb-3">{t('feature2Title')}</h2>
            <p className="text-[#736A60] text-sm leading-relaxed font-sans">{t('feature2Desc')}</p>
          </div>
        </AnimateIn>

        <AnimateIn direction="up" delay={0.3}>
          <div className="bg-white border border-[#E8E2D9] hover:border-[#D4A853]/60 rounded-3xl p-8 flex flex-col items-start transition-all duration-300 shadow-sm hover:shadow-md h-full group">
            <div className="w-12 h-12 rounded-full bg-[#1A120B] flex items-center justify-center text-[#D4A853] mb-6 group-hover:scale-105 transition-transform shadow-sm">
              <Navigation className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A120B] mb-3">{t('feature3Title')}</h2>
            <p className="text-[#736A60] text-sm leading-relaxed font-sans">{t('feature3Desc')}</p>
          </div>
        </AnimateIn>
      </section>

      {/* Bento Grid: Tarifare Transparentă + Calculator Interactiv */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coloana Stanga: Detalierea Formulei Tarifare & Standardul Cald (7 col) */}
          <div className="lg:col-span-7">
            <AnimateIn direction="up" delay={0.2}>
              <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
                <div>
                  <span className="text-[#9E721D] font-mono text-xs uppercase tracking-widest block font-bold mb-2">
                    {t('policyLabel')}
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A120B] mb-4">
                    {t('pricingTitle')}
                  </h2>
                  <p className="text-[#736A60] text-sm leading-relaxed">
                    {t('pricingIntro')}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Card 1: Formula Tarifară Estimativă */}
                  <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[#9E721D] text-xs font-mono uppercase tracking-wider block mb-1 font-bold">
                        {t('fareLabel')}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1A120B]">{t('fareName')}</h3>
                      <p className="text-[#736A60] text-xs mt-1 max-w-sm leading-relaxed">{t('fareDesc')}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-lg sm:text-xl font-serif text-[#1A120B] font-bold block">
                        {t('fareRate')}
                      </span>
                      <span className="text-[#736A60] text-xs font-sans font-medium">
                        tarif estimativ de pornire
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Ambalaj & Confirmare Telefonică */}
                  <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[#9E721D] text-xs font-mono uppercase tracking-wider block mb-1 font-bold">
                        {t('qualityLabel')}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1A120B] flex items-center gap-2">
                        <span>{t('qualityName')}</span>
                        <PhoneCall className="w-4 h-4 text-[#9E721D]" />
                      </h3>
                      <p className="text-[#736A60] text-xs mt-1 max-w-sm leading-relaxed">{t('qualityDesc')}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xl sm:text-2xl font-serif text-[#9E721D] font-bold block">
                        {t('freeIncluded')}
                      </span>
                      <span className="text-[#736A60] text-xs font-sans font-medium">
                        {t('freeSubtext')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[#736A60] text-xs leading-relaxed max-w-md">
                    {t('pricingDisclaimer')}
                  </p>
                  <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 bg-[#1A120B] hover:bg-[#2A1E14] text-[#D4A853] px-7 py-3.5 rounded-full font-sans font-bold text-xs tracking-wider uppercase transition-colors shrink-0 shadow-md"
                  >
                    <span>{t('ctaButton')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </AnimateIn>
          </div>

          {/* Coloana Dreapta: Calculatorul Interactiv (5 col) */}
          <div className="lg:col-span-5">
            <AnimateIn direction="up" delay={0.3}>
              <DeliveryCalculator dict={calculatorDict} />
            </AnimateIn>
          </div>

        </div>
      </section>

      {/* Sectiune FAQ Dedicata Livrarii */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 mb-8">
        <AnimateIn direction="up" delay={0.2}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-[#9E721D] text-xs font-mono uppercase tracking-widest mb-3 font-semibold">
              <HelpCircle className="w-4 h-4" />
              <span>{t('faqBadge')}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A120B]">
              {t('faqTitle')}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 md:p-7 shadow-sm hover:border-[#D4A853]/50 transition-colors">
              <h3 className="font-serif text-lg font-bold text-[#1A120B] mb-2">{t('faq1Q')}</h3>
              <p className="text-[#736A60] text-sm leading-relaxed font-sans">{t('faq1A')}</p>
            </div>
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 md:p-7 shadow-sm hover:border-[#D4A853]/50 transition-colors">
              <h3 className="font-serif text-lg font-bold text-[#1A120B] mb-2">{t('faq2Q')}</h3>
              <p className="text-[#736A60] text-sm leading-relaxed font-sans">{t('faq2A')}</p>
            </div>
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 md:p-7 shadow-sm hover:border-[#D4A853]/50 transition-colors">
              <h3 className="font-serif text-lg font-bold text-[#1A120B] mb-2">{t('faq3Q')}</h3>
              <p className="text-[#736A60] text-sm leading-relaxed font-sans">{t('faq3A')}</p>
            </div>
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 md:p-7 shadow-sm hover:border-[#D4A853]/50 transition-colors">
              <h3 className="font-serif text-lg font-bold text-[#1A120B] mb-2">{t('faq4Q')}</h3>
              <p className="text-[#736A60] text-sm leading-relaxed font-sans">{t('faq4A')}</p>
            </div>
          </div>
        </AnimateIn>
      </section>
    </main>
  );
}
