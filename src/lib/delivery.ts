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
