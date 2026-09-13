import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DeleteAccountClient from "./DeleteAccountClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DeleteAccount" });

  const title = t("metaTitle");
  const description = t("metaDesc");

  const canonicalUrl = 
    locale === "ro" 
      ? "https://www.munchotella.md/delete-account" 
      : `https://www.munchotella.md/${locale}/delete-account`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ro: "https://www.munchotella.md/delete-account",
        ru: "https://www.munchotella.md/ru/delete-account",
        en: "https://www.munchotella.md/en/delete-account",
        "x-default": "https://www.munchotella.md/delete-account",
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Munchotella",
      locale: locale === "ru" ? "ru_MD" : locale === "en" ? "en_US" : "ro_MD",
      type: "website",
    },
  };
}

export default async function DeleteAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DeleteAccount" });

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t("metaTitle"),
    "description": t("metaDesc"),
    "url": locale === "ro" ? "https://www.munchotella.md/delete-account" : `https://www.munchotella.md/${locale}/delete-account`,
    "inLanguage": locale,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Munchotella",
      "url": "https://www.munchotella.md"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Munchotella",
      "url": "https://www.munchotella.md",
      "logo": "https://www.munchotella.md/icon-512.png"
    },
    "mainEntity": {
      "@type": "Action",
      "name": "User Account and Data Deletion Request",
      "description": "Public self-service and administrative account deletion request mechanism per Google Play and GDPR standards.",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": locale === "ro" ? "https://www.munchotella.md/delete-account" : `https://www.munchotella.md/${locale}/delete-account`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t("breadcrumbHome"),
          "item": "https://www.munchotella.md"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": t("breadcrumbCurrent"),
          "item": locale === "ro" ? "https://www.munchotella.md/delete-account" : `https://www.munchotella.md/${locale}/delete-account`
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DeleteAccountClient locale={locale} />
    </>
  );
}
