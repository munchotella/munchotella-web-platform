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
  { nameRo: "Moldova", nameEn: "Moldova", nameRu: "Молдова", dialCode: "+373", code: "MD", flag: "🇲🇩" },
  { nameRo: "România", nameEn: "Romania", nameRu: "Румыния", dialCode: "+40", code: "RO", flag: "🇷🇴" },
  { nameRo: "Germania", nameEn: "Germany", nameRu: "Германия", dialCode: "+49", code: "DE", flag: "🇩🇪" },
  { nameRo: "Italia", nameEn: "Italy", nameRu: "Италия", dialCode: "+39", code: "IT", flag: "🇮🇹" },
  { nameRo: "Franța", nameEn: "France", nameRu: "Франция", dialCode: "+33", code: "FR", flag: "🇫🇷" },
  { nameRo: "Marea Britanie", nameEn: "United Kingdom", nameRu: "Великобритания", dialCode: "+44", code: "GB", flag: "🇬🇧" },
  { nameRo: "Spania", nameEn: "Spain", nameRu: "Испания", dialCode: "+34", code: "ES", flag: "🇪🇸" },
  { nameRo: "Ucraina", nameEn: "Ukraine", nameRu: "Украина", dialCode: "+380", code: "UA", flag: "🇺🇦" },
  { nameRo: "Statele Unite / Canada", nameEn: "USA / Canada", nameRu: "США / Канада", dialCode: "+1", code: "US", flag: "🇺🇸" },
  { nameRo: "Austria", nameEn: "Austria", nameRu: "Австрия", dialCode: "+43", code: "AT", flag: "🇦🇹" },
  { nameRo: "Belgia", nameEn: "Belgium", nameRu: "Бельгия", dialCode: "+32", code: "BE", flag: "🇧🇪" },
  { nameRo: "Bulgaria", nameEn: "Bulgaria", nameRu: "Болгария", dialCode: "+359", code: "BG", flag: "🇧🇬" },
  { nameRo: "Elveția", nameEn: "Switzerland", nameRu: "Швейцария", dialCode: "+41", code: "CH", flag: "🇨🇭" },
  { nameRo: "Cipru", nameEn: "Cyprus", nameRu: "Кипр", dialCode: "+357", code: "CY", flag: "🇨🇾" },
  { nameRo: "Cehia", nameEn: "Czech Republic", nameRu: "Чехия", dialCode: "+420", code: "CZ", flag: "🇨🇿" },
  { nameRo: "Danemarca", nameEn: "Denmark", nameRu: "Дания", dialCode: "+45", code: "DK", flag: "🇩🇰" },
  { nameRo: "Estonia", nameEn: "Estonia", nameRu: "Эстония", dialCode: "+372", code: "EE", flag: "🇪🇪" },
  { nameRo: "Finlanda", nameEn: "Finland", nameRu: "Финляндия", dialCode: "+358", code: "FI", flag: "🇫🇮" },
  { nameRo: "Grecia", nameEn: "Greece", nameRu: "Греция", dialCode: "+30", code: "GR", flag: "🇬🇷" },
  { nameRo: "Croația", nameEn: "Croatia", nameRu: "Хорватия", dialCode: "+385", code: "HR", flag: "🇭🇷" },
  { nameRo: "Ungaria", nameEn: "Hungary", nameRu: "Венгрия", dialCode: "+36", code: "HU", flag: "🇭🇺" },
  { nameRo: "Irlanda", nameEn: "Ireland", nameRu: "Ирландия", dialCode: "+353", code: "IE", flag: "🇮🇪" },
  { nameRo: "Israel", nameEn: "Israel", nameRu: "Израиль", dialCode: "+972", code: "IL", flag: "🇮🇱" },
  { nameRo: "Islanda", nameEn: "Iceland", nameRu: "Исландия", dialCode: "+354", code: "IS", flag: "🇮🇸" },
  { nameRo: "Lituania", nameEn: "Lithuania", nameRu: "Литва", dialCode: "+370", code: "LT", flag: "🇱🇹" },
  { nameRo: "Luxemburg", nameEn: "Luxembourg", nameRu: "Люксембург", dialCode: "+352", code: "LU", flag: "🇱🇺" },
  { nameRo: "Letonia", nameEn: "Latvia", nameRu: "Латвия", dialCode: "+371", code: "LV", flag: "🇱🇻" },
  { nameRo: "Monaco", nameEn: "Monaco", nameRu: "Монако", dialCode: "+377", code: "MC", flag: "🇲🇨" },
  { nameRo: "Muntenegru", nameEn: "Montenegro", nameRu: "Черногория", dialCode: "+382", code: "ME", flag: "🇲🇪" },
  { nameRo: "Olanda", nameEn: "Netherlands", nameRu: "Нидерланды", dialCode: "+31", code: "NL", flag: "🇳🇱" },
  { nameRo: "Norvegia", nameEn: "Norway", nameRu: "Норвегия", dialCode: "+47", code: "NO", flag: "🇳🇴" },
  { nameRo: "Polonia", nameEn: "Poland", nameRu: "Польша", dialCode: "+48", code: "PL", flag: "🇵🇱" },
  { nameRo: "Portugalia", nameEn: "Portugal", nameRu: "Португалия", dialCode: "+351", code: "PT", flag: "🇵🇹" },
  { nameRo: "Suedia", nameEn: "Sweden", nameRu: "Швеция", dialCode: "+46", code: "SE", flag: "🇸🇪" },
  { nameRo: "Slovenia", nameEn: "Slovenia", nameRu: "Словения", dialCode: "+386", code: "SI", flag: "🇸🇮" },
  { nameRo: "Slovacia", nameEn: "Slovakia", nameRu: "Словакия", dialCode: "+421", code: "SK", flag: "🇸🇰" },
  { nameRo: "Turcia", nameEn: "Turkey", nameRu: "Турция", dialCode: "+90", code: "TR", flag: "🇹🇷" },
  { nameRo: "Georgia", nameEn: "Georgia", nameRu: "Грузия", dialCode: "+995", code: "GE", flag: "🇬🇪" },
  { nameRo: "Armenia", nameEn: "Armenia", nameRu: "Армения", dialCode: "+374", code: "AM", flag: "🇦🇲" },
  { nameRo: "Azerbaidjan", nameEn: "Azerbaijan", nameRu: "Азербайджан", dialCode: "+994", code: "AZ", flag: "🇦🇿" },
  { nameRo: "Emiratele Arabe Unite", nameEn: "United Arab Emirates", nameRu: "ОАЭ", dialCode: "+971", code: "AE", flag: "🇦🇪" },
  { nameRo: "Arabia Saudită", nameEn: "Saudi Arabia", nameRu: "Саудовская Аравия", dialCode: "+966", code: "SA", flag: "🇸🇦" },
  { nameRo: "Egipt", nameEn: "Egypt", nameRu: "Египет", dialCode: "+20", code: "EG", flag: "🇪🇬" },
  { nameRo: "Maroc", nameEn: "Morocco", nameRu: "Марокко", dialCode: "+212", code: "MA", flag: "🇲🇦" },
  { nameRo: "Japonia", nameEn: "Japan", nameRu: "Япония", dialCode: "+81", code: "JP", flag: "🇯🇵" },
  { nameRo: "Coreea de Sud", nameEn: "South Korea", nameRu: "Южная Корея", dialCode: "+82", code: "KR", flag: "🇰🇷" },
  { nameRo: "China", nameEn: "China", nameRu: "Китай", dialCode: "+86", code: "CN", flag: "🇨🇳" },
  { nameRo: "India", nameEn: "India", nameRu: "Индия", dialCode: "+91", code: "IN", flag: "🇮🇳" },
  { nameRo: "Australia", nameEn: "Australia", nameRu: "Австралия", dialCode: "+61", code: "AU", flag: "🇦🇺" },
  { nameRo: "Noua Zeelandă", nameEn: "New Zealand", nameRu: "Новая Зеландия", dialCode: "+64", code: "NZ", flag: "🇳🇿" },
  { nameRo: "Brazilia", nameEn: "Brazil", nameRu: "Бразилия", dialCode: "+55", code: "BR", flag: "🇧🇷" },
  { nameRo: "Argentina", nameEn: "Argentina", nameRu: "Аргентина", dialCode: "+54", code: "AR", flag: "🇦🇷" },
  { nameRo: "Mexic", nameEn: "Mexico", nameRu: "Мексика", dialCode: "+52", code: "MX", flag: "🇲🇽" },
  { nameRo: "Africa de Sud", nameEn: "South Africa", nameRu: "ЮАР", dialCode: "+27", code: "ZA", flag: "🇿🇦" },
  { nameRo: "Kazahstan", nameEn: "Kazakhstan", nameRu: "Казахстан", dialCode: "+7", code: "KZ", flag: "🇰🇿" },
];

export const defaultCountry: Country = ALL_COUNTRIES[0];
