import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FAQClient from "./FAQClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FAQ" });

  const title = locale === "ru"
    ? "Munchotella | Часто задаваемые вопросы (FAQ) — Вафли, Блинчики и Доставка Кишинёв"
    : locale === "en"
    ? "Munchotella | Frequently Asked Questions (FAQ) — Waffles, Crepes & Delivery Chisinau"
    : "Munchotella | Întrebări Frecvente (FAQ) — Waffles, Crepes & Livrare Chișinău";

  const description = locale === "ru"
    ? "Узнайте всё о десертах Munchotella в Кишинёве: лучшие вафли, Дубайский блинчик со 100% фисташкой, график горячей доставки до 00:00 и заказ онлайн."
    : locale === "en"
    ? "Find answers about Munchotella in Chisinau: best waffles, Dubai Crepe with 100% pistachio, late night hot delivery until 00:00, and online ordering."
    : "Află totul despre deserturile Munchotella din Chișinău: cele mai bune waffles, Crepe Dubai cu fistic 100%, program de livrare caldă până la 00:00 și comenzi online.";

  return {
    title,
    description,
    alternates: {
      canonical: locale === "ro" ? "https://www.munchotella.md/faq" : `https://www.munchotella.md/${locale}/faq`,
      languages: {
        ro: "https://www.munchotella.md/faq",
        ru: "https://www.munchotella.md/ru/faq",
        en: "https://www.munchotella.md/en/faq",
      },
    },
    openGraph: {
      title,
      description,
      url: locale === "ro" ? "https://www.munchotella.md/faq" : `https://www.munchotella.md/${locale}/faq`,
      siteName: "Munchotella",
      locale: locale === "ru" ? "ru_MD" : locale === "en" ? "en_US" : "ro_MD",
      type: "website",
    },
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FAQ" });

  const faqItems = [
    {
      id: "q1",
      question: t("q1"),
      answer: t("a1"),
      tag: t("tagFresh"),
    },
    {
      id: "q2",
      question: t("q2"),
      answer: t("a2"),
      tag: t("tagIngredients"),
    },
    {
      id: "q3",
      question: t("q3"),
      answer: t("a3"),
      tag: t("tagLocation"),
    },
    {
      id: "q4",
      question: t("q4"),
      answer: t("a4"),
      tag: t("tagDelivery"),
    },
    {
      id: "q5",
      question: t("q5"),
      answer: t("a5"),
      tag: t("tagFresh"),
    },
    {
      id: "q6",
      question: t("q6"),
      answer: t("a6"),
      tag: t("tagIngredients"),
    },
    {
      id: "q7",
      question: t("q7"),
      answer: t("a7"),
      tag: t("tagDelivery"),
    },
    {
      id: "q8",
      question: t("q8"),
      answer: t("a8"),
      tag: t("tagGifts"),
    },
    {
      id: "q9",
      question: t("q9"),
      answer: t("a9"),
      tag: t("tagPreorder"),
    },
    {
      id: "q10",
      question: t("q10"),
      answer: t("a10"),
      tag: t("tagCustom"),
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `https://www.munchotella.md/${locale === "ro" ? "" : locale + "/"}faq#faqpage`,
    "name": t("title"),
    "description": t("subtitle"),
    "mainEntity": faqItems.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQClient faqItems={faqItems} />
    </>
  );
}
