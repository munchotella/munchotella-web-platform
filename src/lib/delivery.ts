/**
 * Munchotella Delivery Calculation and Localization Engine
 * Centralized business logic for delivery pricing, distance calculations, and multi-language strings.
 */

export const RESTAURANT_LOCATION = {
  lat: 46.996452,
  lng: 28.834809,
  address: "Strada Nicolae Testemițanu 21/1, Chișinău",
} as const;

export const MAX_DELIVERY_RADIUS_KM = 14.0;
export const PEDESTRIAN_MAX_DISTANCE_KM = 1.0;
export const TAXI_BASE_START_MDL = 30;
export const TAXI_PER_KM_MDL = 6.45;
export const DOOR_DELIVERY_SURCHARGE_MDL = 20;
export const ROAD_DISTANCE_FACTOR = 1.35;

export type DeliveryType = "delivery" | "pickup";

export type DeliveryMethodType =
  | "pickup"
  | "pedestrian_door"
  | "pedestrian_entrance"
  | "taxi"
  | "out_of_range"
  | "pending";

export interface DeliveryCalculationParams {
  deliveryType: DeliveryType;
  estimatedKm: number;
  doorDelivery?: boolean;
  isGeocoded?: boolean;
  hasStreet?: boolean;
  lat?: number | null;
  locale?: string;
  translator?: (key: string) => string;
}

export interface DeliveryCalculationResult {
  fee: number;
  isDeliverable: boolean;
  isPedestrian: boolean;
  distanceKm: number;
  hasAddress: boolean;
  methodType: DeliveryMethodType;
  typeLabelKey: string;
  typeLabel: string;
}

/**
 * Standard Haversine distance formula between two GPS coordinates in kilometers.
 */
export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts straight-line GPS distance to road driving distance using the empirical factor 1.35.
 */
export function calculateRoadDistanceKm(straightDistanceKm: number): number {
  return Math.round(straightDistanceKm * ROAD_DISTANCE_FACTOR * 10) / 10;
}

/**
 * Calculates road distance from Munchotella boutique to a target coordinate.
 */
export function getRoadDistanceFromRestaurant(lat: number, lng: number): number {
  const straight = getDistanceFromLatLonInKm(
    RESTAURANT_LOCATION.lat,
    RESTAURANT_LOCATION.lng,
    lat,
    lng
  );
  return calculateRoadDistanceKm(straight);
}

const FALLBACK_LABELS: Record<string, Record<string, string>> = {
  deliveryByTaxi: {
    ro: "Livrare prin taxi",
    ru: "Доставка на такси",
    en: "Delivery by taxi",
  },
  walkingDeliveryEntrance: {
    ro: "Livrare pietonală la scară",
    ru: "Пешая доставка до подъезда",
    en: "Walking delivery to entrance",
  },
  walkingDeliveryDoor: {
    ro: "Livrare pietonală la ușă",
    ru: "Пешая доставка до двери",
    en: "Walking delivery to door",
  },
  pickupFree: {
    ro: "Preluare gratuită din boutique",
    ru: "Бесплатный самовывоз из бутика",
    en: "Free pickup from boutique",
  },
  outOfRange: {
    ro: "În afara ariei de livrare (max 14 km)",
    ru: "Вне зоны доставки (макс. 14 км)",
    en: "Outside delivery zone (max 14 km)",
  },
  calculatingDistance: {
    ro: "Se determină distanța...",
    ru: "Определяется расстояние...",
    en: "Calculating distance...",
  },
  enterAddress: {
    ro: "Introduceți adresa de livrare",
    ru: "Введите адрес доставки",
    en: "Enter delivery address",
  },
};

/**
 * Retrieves the localized label for a delivery calculation type key.
 */
export function getLocalizedDeliveryLabel(
  key: string,
  locale: string = "ro",
  translator?: (key: string) => string
): string {
  if (translator) {
    try {
      const translated = translator(key);
      if (translated && translated !== key) {
        return translated;
      }
    } catch (_) {}
  }

  const lang = locale.startsWith("ru") ? "ru" : locale.startsWith("en") ? "en" : "ro";
  return FALLBACK_LABELS[key]?.[lang] || FALLBACK_LABELS[key]?.ro || key;
}

/**
 * Pure calculation function for Munchotella delivery tiers and pricing.
 */
export function calculateDelivery(
  params: DeliveryCalculationParams
): DeliveryCalculationResult {
  const {
    deliveryType,
    estimatedKm,
    doorDelivery = false,
    isGeocoded = false,
    hasStreet = false,
    lat = null,
    locale = "ro",
    translator,
  } = params;

  if (deliveryType === "pickup") {
    const typeLabelKey = "pickupFree";
    return {
      fee: 0,
      isDeliverable: true,
      isPedestrian: false,
      distanceKm: 0,
      hasAddress: true,
      methodType: "pickup",
      typeLabelKey,
      typeLabel: getLocalizedDeliveryLabel(typeLabelKey, locale, translator),
    };
  }

  if (!hasStreet || !isGeocoded || lat === null) {
    const typeLabelKey = hasStreet ? "calculatingDistance" : "enterAddress";
    return {
      fee: 0,
      isDeliverable: true,
      isPedestrian: false,
      distanceKm: 0,
      hasAddress: false,
      methodType: "pending",
      typeLabelKey,
      typeLabel: getLocalizedDeliveryLabel(typeLabelKey, locale, translator),
    };
  }

  const roadDistance = Math.round(estimatedKm * 10) / 10;

  if (estimatedKm > MAX_DELIVERY_RADIUS_KM) {
    const typeLabelKey = "outOfRange";
    return {
      fee: 0,
      isDeliverable: false,
      isPedestrian: false,
      distanceKm: roadDistance,
      hasAddress: true,
      methodType: "out_of_range",
      typeLabelKey,
      typeLabel: getLocalizedDeliveryLabel(typeLabelKey, locale, translator),
    };
  }

  if (estimatedKm < PEDESTRIAN_MAX_DISTANCE_KM) {
    let fee = 20;
    if (estimatedKm >= 0.2 && estimatedKm < 0.55) {
      fee = 30;
    } else if (estimatedKm >= 0.55) {
      fee = 40;
    }
    if (doorDelivery) {
      fee += DOOR_DELIVERY_SURCHARGE_MDL;
    }

    const methodType: DeliveryMethodType = doorDelivery
      ? "pedestrian_door"
      : "pedestrian_entrance";
    const typeLabelKey = doorDelivery
      ? "walkingDeliveryDoor"
      : "walkingDeliveryEntrance";

    return {
      fee,
      isDeliverable: true,
      isPedestrian: true,
      distanceKm: roadDistance,
      hasAddress: true,
      methodType,
      typeLabelKey,
      typeLabel: getLocalizedDeliveryLabel(typeLabelKey, locale, translator),
    };
  }

  // Letz Taxi Formula: 30 MDL pornire + 6.45 MDL/km
  const fee = Math.round(TAXI_BASE_START_MDL + roadDistance * TAXI_PER_KM_MDL);
  const typeLabelKey = "deliveryByTaxi";

  return {
    fee,
    isDeliverable: true,
    isPedestrian: false,
    distanceKm: roadDistance,
    hasAddress: true,
    methodType: "taxi",
    typeLabelKey,
    typeLabel: getLocalizedDeliveryLabel(typeLabelKey, locale, translator),
  };
}

/**
 * Format distance with unit: "11.1 km" in RO/EN, "11.1 км" in RU.
 */
export function formatDistance(distanceKm: number, locale: string = "ro"): string {
  const unit = locale === "ru" ? "км" : "km";
  return `${distanceKm} ${unit}`;
}

/**
 * Format delivery fee badge string: "Livrare: 102 MDL" / "Доставка: 102 MDL" / "Delivery: 102 MDL".
 */
export function formatDeliveryFee(fee: number, locale: string = "ro"): string {
  const prefix = locale === "ru" ? "Доставка" : locale === "en" ? "Delivery" : "Livrare";
  return `${prefix}: ${fee} MDL`;
}

/**
 * Munchotella operating hours 30-minute time slots (16:00 – 23:30, 16 slots).
 */
export const AVAILABLE_TIME_SLOTS = [
  "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00", "23:30",
] as const;

export const CHECKOUT_OPERATING_TIME_SLOTS = AVAILABLE_TIME_SLOTS;

/**
 * Localizes backend Romanian next-opening labels across RO, RU, EN.
 * e.g. "Azi la 16:00" -> RO: "Azi la 16:00", RU: "Сегодня в 16:00", EN: "Today at 16:00"
 *      "Mâine la 16:00" -> RO: "Mâine la 16:00", RU: "Завтра в 16:00", EN: "Tomorrow at 16:00"
 */
export function localizeNextOpeningLabel(
  rawLabel?: string,
  locale: string = "ro"
): string {
  if (!rawLabel || typeof rawLabel !== "string") return "";

  const lang = locale.startsWith("ru") ? "ru" : locale.startsWith("en") ? "en" : "ro";
  const trimmed = rawLabel.trim();

  // Helper function to clean leading "ora " / "orele " from extracted time
  const cleanTimeStr = (t: string) => t.replace(/^(?:ora|orele|at|в)\s+/i, '').trim();

  // 1. Pattern: "Azi / Astăzi" with "la", "de la", ",", or whitespace
  const aziMatch = trimmed.match(/^(?:Azi|Ast[ăa]zi)(?:,?\s+(?:la|de\s+la|ora)?\s*|,\s*|\s+)(.*)$/i);
  if (aziMatch) {
    const time = cleanTimeStr(aziMatch[1]);
    if (lang === "ru") return `Сегодня в ${time}`;
    if (lang === "en") return `Today at ${time}`;
    return `Azi la ${time}`;
  }

  // 2. Pattern: "Mâine / Maine" with "la", "de la", ",", or whitespace
  const maineMatch = trimmed.match(/^M[âa]ine(?:,?\s+(?:la|de\s+la|ora)?\s*|,\s*|\s+)(.*)$/i);
  if (maineMatch) {
    const time = cleanTimeStr(maineMatch[1]);
    if (lang === "ru") return `Завтра в ${time}`;
    if (lang === "en") return `Tomorrow at ${time}`;
    return `Mâine la ${time}`;
  }

  // 3. Pattern: English/Russian inputs already localized from backend
  const todayEnMatch = trimmed.match(/^Today\s+(?:at\s+)?(.*)$/i);
  if (todayEnMatch) {
    const time = cleanTimeStr(todayEnMatch[1]);
    if (lang === "ru") return `Сегодня в ${time}`;
    if (lang === "en") return `Today at ${time}`;
    return `Azi la ${time}`;
  }
  const tomorrowEnMatch = trimmed.match(/^Tomorrow\s+(?:at\s+)?(.*)$/i);
  if (tomorrowEnMatch) {
    const time = cleanTimeStr(tomorrowEnMatch[1]);
    if (lang === "ru") return `Завтра в ${time}`;
    if (lang === "en") return `Tomorrow at ${time}`;
    return `Mâine la ${time}`;
  }
  const todayRuMatch = trimmed.match(/^Сегодня\s+(?:в\s+)?(.*)$/i);
  if (todayRuMatch) {
    const time = cleanTimeStr(todayRuMatch[1]);
    if (lang === "ru") return `Сегодня в ${time}`;
    if (lang === "en") return `Today at ${time}`;
    return `Azi la ${time}`;
  }
  const tomorrowRuMatch = trimmed.match(/^Завтра\s+(?:в\s+)?(.*)$/i);
  if (tomorrowRuMatch) {
    const time = cleanTimeStr(tomorrowRuMatch[1]);
    if (lang === "ru") return `Завтра в ${time}`;
    if (lang === "en") return `Tomorrow at ${time}`;
    return `Mâine la ${time}`;
  }

  // 4. Pattern: Days of the week (Luni, Marți, Miercuri, Joi, Vineri, Sâmbătă, Duminică)
  const days: Record<string, { ru: string; en: string; ro: string }> = {
    luni: { ro: "Luni", ru: "В понедельник", en: "Monday" },
    "marți": { ro: "Marți", ru: "Во вторник", en: "Tuesday" },
    marti: { ro: "Marți", ru: "Во вторник", en: "Tuesday" },
    miercuri: { ro: "Miercuri", ru: "В среду", en: "Wednesday" },
    joi: { ro: "Joi", ru: "В четверг", en: "Thursday" },
    vineri: { ro: "Vineri", ru: "В пятницу", en: "Friday" },
    "sâmbătă": { ro: "Sâmbătă", ru: "В субботу", en: "Saturday" },
    sambata: { ro: "Sâmbătă", ru: "В субботу", en: "Saturday" },
    "duminică": { ro: "Duminică", ru: "В воскресенье", en: "Sunday" },
    duminica: { ro: "Duminică", ru: "В воскресенье", en: "Sunday" },
  };

  const dayMatch = trimmed.match(/^([a-zăîâșț]+)(?:,?\s+(?:la|de\s+la|ora)?\s*|,\s*|\s+)(.*)$/i);
  if (dayMatch) {
    const dayKey = dayMatch[1].toLowerCase();
    const time = cleanTimeStr(dayMatch[2]);
    if (days[dayKey]) {
      if (lang === "ru") return `${days[dayKey].ru} в ${time}`;
      if (lang === "en") return `${days[dayKey].en} at ${time}`;
      return `${days[dayKey].ro} la ${time}`;
    }
  }

  // 5. Pattern: Numeric date or Date with month (e.g., "16.10 la 16:00", "16 octombrie la 16:00")
  const months: Record<string, { ro: string; ru: string; en: string }> = {
    ianuarie: { ro: "ianuarie", ru: "января", en: "January" },
    ian: { ro: "ian.", ru: "янв.", en: "Jan" },
    februarie: { ro: "februarie", ru: "февраля", en: "February" },
    feb: { ro: "feb.", ru: "февр.", en: "Feb" },
    martie: { ro: "martie", ru: "марта", en: "March" },
    mar: { ro: "mar.", ru: "мар.", en: "Mar" },
    aprilie: { ro: "aprilie", ru: "апреля", en: "April" },
    apr: { ro: "apr.", ru: "апр.", en: "Apr" },
    mai: { ro: "mai", ru: "мая", en: "May" },
    iunie: { ro: "iunie", ru: "июня", en: "June" },
    iun: { ro: "iun.", ru: "июн.", en: "Jun" },
    iulie: { ro: "iulie", ru: "июля", en: "July" },
    iul: { ro: "iul.", ru: "июл.", en: "Jul" },
    august: { ro: "august", ru: "августа", en: "August" },
    aug: { ro: "aug.", ru: "авг.", en: "Aug" },
    septembrie: { ro: "septembrie", ru: "сентября", en: "September" },
    sept: { ro: "sept.", ru: "сент.", en: "Sept" },
    octombrie: { ro: "octombrie", ru: "октября", en: "October" },
    oct: { ro: "oct.", ru: "окт.", en: "Oct" },
    noiembrie: { ro: "noiembrie", ru: "ноября", en: "November" },
    noi: { ro: "noi.", ru: "нояб.", en: "Nov" },
    decembrie: { ro: "decembrie", ru: "декабря", en: "December" },
    dec: { ro: "dec.", ru: "дек.", en: "Dec" },
  };

  const dateMatch = trimmed.match(/^(\d{1,2}(?:[./-]\d{1,2}(?:[./-]\d{2,4})?|\s+[a-zăîâșț.]+))(?:,?\s+(?:la|de\s+la|ora)?\s*|,\s*|\s+)(.*)$/i);
  if (dateMatch) {
    const rawDatePart = dateMatch[1].trim();
    const time = cleanTimeStr(dateMatch[2]);

    let dateRo = rawDatePart;
    let dateRu = rawDatePart;
    let dateEn = rawDatePart;

    for (const [mKey, mTrans] of Object.entries(months)) {
      const mRegex = new RegExp(`\\b${mKey}\\b`, 'i');
      if (mRegex.test(rawDatePart)) {
        dateRo = rawDatePart.replace(mRegex, mTrans.ro);
        dateRu = rawDatePart.replace(mRegex, mTrans.ru);
        dateEn = rawDatePart.replace(mRegex, mTrans.en);
        break;
      }
    }

    if (lang === "ru") return `${dateRu} в ${time}`;
    if (lang === "en") return `${dateEn} at ${time}`;
    return `${dateRo} la ${time}`;
  }

  // 6. Generic fallback: if it contains " la HH:mm"
  const genericLaMatch = trimmed.match(/^(.*)\s+la\s+(.*)$/i);
  if (genericLaMatch) {
    const prefix = genericLaMatch[1].trim();
    const time = cleanTimeStr(genericLaMatch[2]);
    if (lang === "ru") return `${prefix} в ${time}`;
    if (lang === "en") return `${prefix} at ${time}`;
    return `${prefix} la ${time}`;
  }

  return trimmed;
}

