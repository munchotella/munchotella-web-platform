import React from "react";
import { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { 
  Truck, 
  Footprints, 
  Car, 
  MapPin, 
  Clock, 
  Box, 
  CreditCard, 
  CalendarCheck, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DeliveryPage" });

  const url = locale === "ro" ? "https://www.munchotella.md/livrare" : `https://www.munchotella.md/${locale}/livrare`;

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      languages: {
        ro: "https://www.munchotella.md/livrare",
        ru: "https://www.munchotella.md/ru/livrare",
        en: "https://www.munchotella.md/en/livrare",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url,
      siteName: "Munchotella",
      locale: locale === "ro" ? "ro_MD" : locale === "ru" ? "ru_MD" : "en_US",
      type: "website",
    },
  };
}

export default async function DeliveryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DeliveryPage" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DeliveryService",
    "name": "Munchotella Delivery Chișinău",
    "provider": {
      "@type": "Restaurant",
      "name": "Munchotella",
      "telephone": "+37379006499",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Strada Nicolae Testemițanu 21/1",
        "addressLocality": "Chișinău",
        "addressCountry": "MD"
      }
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
        "@type": "DeliveryMethod",
        "name": "Livrare Pietonală (< 1km)",
        "description": "20 MDL tarif fix"
      },
      {
        "@type": "DeliveryMethod",
        "name": "Livrare prin Taxi / Curier Auto (până la 10km)",
        "description": "30 MDL pornire + 6.45 MDL / km"
      }
    ]
  };

  return (
    <main className="min-h-screen bg-[#FFFCF6] text-[#1A120B] pt-28 pb-32 selection:bg-[#D4A853] selection:text-white">
      {/* Schema.org Injection for AI & Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header Hero */}
        <AnimateIn direction="up">
          <header className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A120B] text-[#D4A853] text-[12px] font-bold tracking-widest uppercase mb-6 shadow-sm">
              <Truck className="w-3.5 h-3.5" />
              {t("badge")}
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-[#1A120B] mb-6 leading-[1.15]">
              {t("heroTitle")}
            </h1>
            <p className="text-[#736A60] text-lg md:text-xl leading-relaxed mb-8">
              {t("heroDesc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A120B] text-[#D4A853] hover:bg-[#2A1E14] px-8 py-4 rounded-full font-bold text-[15px] transition-all shadow-md active:scale-95 group"
              >
                <span>{t("orderNowBtn")}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="tel:+37379006499"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#1A120B] border border-[#E8E2D9] hover:border-[#D4A853] px-8 py-4 rounded-full font-bold text-[15px] transition-all shadow-sm active:scale-95"
              >
                <PhoneCall className="w-4 h-4 text-[#D4A853]" />
                <span>{t("callBtn")}</span>
              </a>
            </div>
          </header>
        </AnimateIn>

        {/* Pricing Cards */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A120B] mb-2">
              {t("ratesTitle")}
            </h2>
            <p className="text-[#736A60] text-base md:text-lg">
              {t("ratesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card 1: Pietonal */}
            <article className="bg-white rounded-3xl p-8 border border-[#E8E2D9] shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFFCF6] border border-[#E8E2D9] flex items-center justify-center text-[#D4A853]">
                    <Footprints className="w-7 h-7" />
                  </div>
                  <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#1A120B]/5 text-[#736A60]">
                    {t("pedestrianDist")}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1A120B] mb-2">
                  {t("pedestrianTitle")}
                </h3>
                <div className="text-3xl font-extrabold text-[#D4A853] mb-4">
                  {t("pedestrianPrice")}
                </div>
                <p className="text-[#736A60] text-[15px] leading-relaxed mb-6">
                  {t("pedestrianDesc")}
                </p>
              </div>
              <ul className="space-y-2.5 text-sm text-[#4A4238] border-t border-[#E8E2D9] pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00B497] shrink-0" />
                  <span>Str. Nicolae Testemițanu & MallDova</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00B497] shrink-0" />
                  <span>Livrat fierbinte direct pe jos în 20-30 min</span>
                </li>
              </ul>
            </article>

            {/* Card 2: Taxi / Curier Auto */}
            <article className="bg-white rounded-3xl p-8 border-2 border-[#D4A853]/40 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#1A120B] flex items-center justify-center text-[#D4A853]">
                    <Car className="w-7 h-7" />
                  </div>
                  <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#D4A853]/20 text-[#1A120B]">
                    {t("taxiDist")}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1A120B] mb-2">
                  {t("taxiTitle")}
                </h3>
                <div className="text-3xl font-extrabold text-[#1A120B] mb-4">
                  {t("taxiPrice")}
                </div>
                <p className="text-[#736A60] text-[15px] leading-relaxed mb-6">
                  {t("taxiDesc")}
                </p>
              </div>
              <ul className="space-y-2.5 text-sm text-[#4A4238] border-t border-[#E8E2D9] pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00B497] shrink-0" />
                  <span>Calcul exact pe hartă cu Google Maps API</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00B497] shrink-0" />
                  <span>Livrare în siguranță cu mașină parteneră taxi</span>
                </li>
              </ul>
            </article>
          </div>
        </section>

        {/* Coverage Section */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-[#E8E2D9] shadow-sm mb-20 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#D4A853]/10 text-[#D4A853] flex items-center justify-center shrink-0">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="inline-block text-xs uppercase font-bold tracking-widest text-[#D4A853] mb-1">
                {t("maxRadius")}
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1A120B] mb-3">
                {t("coverageTitle")}
              </h2>
              <p className="text-[#736A60] text-[15px] mb-4 leading-relaxed">
                {t("coverageDesc")}
              </p>
              <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E8E2D9] font-medium text-[#1A120B] text-sm md:text-base">
                📍 {t("sectors")}
              </div>
            </div>
          </div>
        </section>

        {/* 3 Value Pillars */}
        <section className="mb-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-[#1A120B]">
              {t("featuresTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#1A120B] text-[#D4A853] flex items-center justify-center mb-6">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#1A120B] mb-3">
                {t("feature1Title")}
              </h3>
              <p className="text-[#736A60] text-sm leading-relaxed">
                {t("feature1Desc")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#1A120B] text-[#D4A853] flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#1A120B] mb-3">
                {t("feature2Title")}
              </h3>
              <p className="text-[#736A60] text-sm leading-relaxed">
                {t("feature2Desc")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#1A120B] text-[#D4A853] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#1A120B] mb-3">
                {t("feature3Title")}
              </h3>
              <p className="text-[#736A60] text-sm leading-relaxed">
                {t("feature3Desc")}
              </p>
            </div>
          </div>
        </section>

        {/* Operating Hours & Payments Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CalendarCheck className="w-6 h-6 text-[#D4A853]" />
              <h3 className="font-bold text-lg text-[#1A120B]">{t("scheduleTitle")}</h3>
            </div>
            <p className="text-[#736A60] text-[15px] leading-relaxed">
              {t("scheduleDesc")}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-[#D4A853]" />
              <h3 className="font-bold text-lg text-[#1A120B]">{t("paymentsTitle")}</h3>
            </div>
            <p className="text-[#736A60] text-[15px] leading-relaxed">
              {t("paymentsDesc")}
            </p>
          </div>
        </section>

        {/* Bottom Legal Crosslink & Final CTA */}
        <footer className="text-center max-w-2xl mx-auto border-t border-[#E8E2D9] pt-12">
          <p className="text-[#736A60] text-sm mb-6">
            {t("termsPrompt")}{" "}
            <Link href="/legal#delivery" className="text-[#D4A853] font-semibold underline hover:text-[#1A120B] transition-colors">
              {t("termsLink")}
            </Link>.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 bg-[#1A120B] text-[#D4A853] hover:bg-[#2A1E14] px-10 py-4 rounded-full font-bold text-base transition-all shadow-md active:scale-95"
          >
            <span>{t("orderNowBtn")}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
