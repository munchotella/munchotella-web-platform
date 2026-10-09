"use client";

/**
 * Meta First-Party Tracking & Identity Resolution Engine for Munchotella
 *
 * Responsibilities:
 * 1. Capture `fbclid` and UTM parameters on user landing and persist for 30 days in first-party storage & cookies.
 * 2. Ensure `_fbc` first-party cookie is created/preserved for Meta Click ID attribution.
 * 3. Read native `_fbp` (Browser ID) and `_fbc` for enriched CAPI transmission.
 * 4. Provide `getMetaTrackingPayload()` for Checkout and Abandoned Cart Drafts.
 */

const STORAGE_KEY_FBCLID = "_munch_fbclid";
const STORAGE_KEY_FBCLID_TS = "_munch_fbclid_ts";
const STORAGE_KEY_UTM = "_munch_utm";
const COOKIE_EXPIRY_DAYS = 30;

function setCookie(name: string, value: string, days: number = COOKIE_EXPIRY_DAYS) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax${isSecure ? ";Secure" : ""}`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      } catch {
        return c.substring(nameEQ.length, c.length);
      }
    }
  }
  return null;
}

/**
 * Initializes first-party tracking on landing/route changes
 */
export function initMetaTracking(): void {
  if (typeof window === "undefined") return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get("fbclid");

    // 1. Capture & Persist fbclid along with its original capture timestamp
    if (fbclid && fbclid.trim().length > 0) {
      const cleanFbclid = fbclid.trim();
      const clickTime = Date.now();
      localStorage.setItem(STORAGE_KEY_FBCLID, cleanFbclid);
      localStorage.setItem(STORAGE_KEY_FBCLID_TS, String(clickTime));
      setCookie(STORAGE_KEY_FBCLID, cleanFbclid);
      setCookie(STORAGE_KEY_FBCLID_TS, String(clickTime));

      // Construct official Meta _fbc format: fb.1.<creation_time>.<fbclid>
      const existingFbc = getCookie("_fbc");
      if (!existingFbc) {
        const fbcValue = `fb.1.${clickTime}.${cleanFbclid}`;
        setCookie("_fbc", fbcValue);
      }
    }

    // 2. Capture & Persist UTMs
    const utmParams: Record<string, string> = {};
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "campaign_id", "ad_id", "adset_id"];
    let hasUtm = false;

    utmKeys.forEach((key) => {
      const val = urlParams.get(key);
      if (val) {
        utmParams[key] = val;
        hasUtm = true;
      }
    });

    if (hasUtm) {
      localStorage.setItem(STORAGE_KEY_UTM, JSON.stringify({
        params: utmParams,
        capturedAt: Date.now()
      }));
    }
  } catch (err) {
    console.warn("[MetaTracking] Init failed silently:", err);
  }
}

export interface MetaTrackingPayload {
  fbp: string | null;
  fbc: string | null;
  fbclid: string | null;
  eventSourceUrl: string;
  utm?: Record<string, string> | null;
}

/**
 * Retrieves tracking parameters to send to backend API
 */
export function getMetaTrackingPayload(): MetaTrackingPayload {
  if (typeof window === "undefined") {
    return {
      fbp: null,
      fbc: null,
      fbclid: null,
      eventSourceUrl: "https://www.munchotella.md/ro/checkout"
    };
  }

  try {
    // 1. First-Party / Meta Pixel Cookies
    let fbp = getCookie("_fbp");
    let fbc = getCookie("_fbc");

    // 2. Recover fbclid from storage if cookie was wiped
    let fbclid = localStorage.getItem(STORAGE_KEY_FBCLID) || getCookie(STORAGE_KEY_FBCLID);

    // If _fbc is missing but fbclid is known, synthesize official _fbc using original click timestamp
    if (!fbc && fbclid) {
      const clickTime = localStorage.getItem(STORAGE_KEY_FBCLID_TS) || getCookie(STORAGE_KEY_FBCLID_TS) || Date.now();
      fbc = `fb.1.${clickTime}.${fbclid}`;
    }

    // 3. Recover UTMs
    let utm: Record<string, string> | null = null;
    const storedUtm = localStorage.getItem(STORAGE_KEY_UTM);
    if (storedUtm) {
      try {
        const parsed = JSON.parse(storedUtm);
        // Valid for 30 days
        if (parsed.capturedAt && (Date.now() - parsed.capturedAt < COOKIE_EXPIRY_DAYS * 86400000)) {
          utm = parsed.params;
        }
      } catch {
        // ignore JSON parse error
      }
    }

    return {
      fbp: fbp || null,
      fbc: fbc || null,
      fbclid: fbclid || null,
      eventSourceUrl: window.location.href,
      utm
    };
  } catch (err) {
    console.warn("[MetaTracking] Failed to get payload:", err);
    return {
      fbp: null,
      fbc: null,
      fbclid: null,
      eventSourceUrl: window.location.href
    };
  }
}
