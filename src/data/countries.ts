export interface Country {
  nameRo: string;
  nameEn: string;
  nameRu: string;
  dialCode: string;
  code: string;
  flag: string;
}

export function getCountryName(country: Country, locale: string): string {
  if (locale === 'en') return country.nameEn;
  if (locale === 'ru') return country.nameRu;
  return country.nameRo;
}

export const ALL_COUNTRIES: Country[] = [
  { nameRo: "Moldova", nameEn: "Moldova", nameRu: "Молдова", dialCode: "+373", code: "MD", flag: "🇲🇩" }
];

export const defaultCountry: Country = ALL_COUNTRIES[0];

