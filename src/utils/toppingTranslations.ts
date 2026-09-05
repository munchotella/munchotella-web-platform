export type SupportedLocale = 'ro' | 'ru' | 'en';

export const TOPPING_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  // ── Group Titles ──
  'Toppings': {
    ro: 'Toppinguri',
    ru: 'Топпинги',
    en: 'Toppings',
  },
  'Topping': {
    ro: 'Toppinguri',
    ru: 'Топпинги',
    en: 'Toppings',
  },
  'Toppings Extra': {
    ro: 'Toppinguri',
    ru: 'Топпинги',
    en: 'Toppings',
  },
  'Personalizare': {
    ro: 'Personalizare',
    ru: 'Персонализация',
    en: 'Personalization',
  },
  'Dimensiune': {
    ro: 'Dimensiune',
    ru: 'Размер',
    en: 'Size',
  },

  // ── Translating Options ──
  'Ciocolată Albă': {
    ro: 'Ciocolată Albă',
    ru: 'Белый шоколад',
    en: 'White Chocolate',
  },
  'Pastă de fistic': {
    ro: 'Pastă de fistic',
    ru: 'Фисташковая паста',
    en: 'Pistachio Paste',
  },
  'Fistic': {
    ro: 'Fistic',
    ru: 'Фисташки',
    en: 'Pistachio',
  },
  // Aliases for Fistic (normalized to Fistic)
  'Fistic Mărunțit': {
    ro: 'Fistic',
    ru: 'Фисташки',
    en: 'Pistachio',
  },
  'Fistic mărunțit': {
    ro: 'Fistic',
    ru: 'Фисташки',
    en: 'Pistachio',
  },
  'Alune': {
    ro: 'Alune',
    ru: 'Фундук',
    en: 'Hazelnuts',
  },
  'Banană': {
    ro: 'Banană',
    ru: 'Банан',
    en: 'Banana',
  },
  'Căpșuni': {
    ro: 'Căpșuni',
    ru: 'Клубника',
    en: 'Strawberries',
  },
  'Căpșună': {
    ro: 'Căpșuni',
    ru: 'Клубника',
    en: 'Strawberries',
  },
  'Kiwi': {
    ro: 'Kiwi',
    ru: 'Киви',
    en: 'Kiwi',
  },
  'O bilă de înghețată': {
    ro: 'O bilă de înghețată',
    ru: 'Шарик мороженого',
    en: 'A scoop of ice cream',
  },
  'Fructe mix': {
    ro: 'Fructe mix',
    ru: 'Микс фруктов',
    en: 'Mixed fruits',
  },
  // Aliases for Fructe mix (normalized to Fructe mix)
  'Porție de fructe fresh': {
    ro: 'Fructe mix',
    ru: 'Микс фруктов',
    en: 'Mixed fruits',
  },
  'Porție de fructe': {
    ro: 'Fructe mix',
    ru: 'Микс фруктов',
    en: 'Mixed fruits',
  },

  // ── Brand Names (Same across languages) ──
  'Nutella': {
    ro: 'Nutella®',
    ru: 'Nutella®',
    en: 'Nutella®',
  },
  'Nutella®': {
    ro: 'Nutella®',
    ru: 'Nutella®',
    en: 'Nutella®',
  },
  'Oreo': {
    ro: 'Oreo',
    ru: 'Oreo',
    en: 'Oreo',
  },
  'Lotus': {
    ro: 'Lotus',
    ru: 'Lotus',
    en: 'Lotus',
  },
  'Kinder': {
    ro: 'Kinder',
    ru: 'Kinder',
    en: 'Kinder',
  },
  'Kinder Bueno': {
    ro: 'Kinder Bueno',
    ru: 'Kinder Bueno',
    en: 'Kinder Bueno',
  },
};

/**
 * Translates a topping, modifier group title, or personalization option into the given locale.
 * Automatically cleans any legacy 'Extra' or 'Доп.' prefixes.
 */
export function translateTopping(name: string, locale: string = 'ro'): string {
  if (!name || typeof name !== 'string') return '';
  const clean = name.replace(/^(Extra|Доп\.)\s+/i, '').trim();
  const lang: SupportedLocale = locale === 'ru' ? 'ru' : locale === 'en' ? 'en' : 'ro';

  if (TOPPING_TRANSLATIONS[clean]?.[lang]) {
    return TOPPING_TRANSLATIONS[clean][lang];
  }

  // Case-insensitive fallback
  const lower = clean.toLowerCase();
  for (const [key, trans] of Object.entries(TOPPING_TRANSLATIONS)) {
    if (key.toLowerCase() === lower) {
      return trans[lang];
    }
  }

  return clean;
}
