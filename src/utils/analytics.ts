"use client";

/**
 * Universal E-Commerce Analytics Helper (Meta Pixel + Google Analytics 4 + Google Tag Manager)
 * All events are safe-wrapped with try-catch so network or ad-blocker issues never disrupt user checkout.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface AnalyticsProduct {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}

export interface CustomerData {
  email?: string;
  phone?: string;
  name?: string;
  currency?: string;
}

/**
 * 1. Track Page View (Meta Pixel + GA4)
 */
export function trackPageView(pageUrl?: string) {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_location: pageUrl || window.location.href,
        page_path: window.location.pathname,
      });
    }

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "page_view",
        page: pageUrl || window.location.pathname,
      });
    }
  } catch (err) {
    console.warn("[Analytics] PageView tracking failed silently:", err);
  }
}

/**
 * 2. Track ViewContent (Product Impression / Details / Modal Opened)
 */
export function trackViewContent(product: AnalyticsProduct) {
  if (typeof window === "undefined" || !product) return;

  try {
    const numericPrice = typeof product.price === "number" ? product.price : parseFloat(String(product.price)) || 0;
    const prodId = String(product.id || product.name);

    // Meta Pixel: ViewContent
    if (typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {
        content_name: product.name,
        content_category: product.category || "Desserts",
        content_ids: [prodId],
        content_type: "product",
        value: numericPrice,
        currency: "MDL",
      });
    }

    // GA4: view_item
    if (typeof window.gtag === "function") {
      window.gtag("event", "view_item", {
        currency: "MDL",
        value: numericPrice,
        items: [
          {
            item_id: prodId,
            item_name: product.name,
            item_category: product.category || "Desserts",
            price: numericPrice,
            quantity: 1,
          },
        ],
      });
    }

    // Google Tag Manager dataLayer
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: "MDL",
          value: numericPrice,
          items: [
            {
              item_id: prodId,
              item_name: product.name,
              item_category: product.category || "Desserts",
              price: numericPrice,
            },
          ],
        },
      });
    }
  } catch (err) {
    console.warn("[Analytics] ViewContent tracking failed silently:", err);
  }
}

/**
 * 3. Track AddToCart (User adds a customized dessert to cart)
 */
export function trackAddToCart(
  product: AnalyticsProduct,
  quantity: number = 1,
  totalValue?: number
) {
  if (typeof window === "undefined" || !product) return;

  try {
    const unitPrice = typeof product.price === "number" ? product.price : parseFloat(String(product.price)) || 0;
    const qty = quantity > 0 ? quantity : 1;
    const value = typeof totalValue === "number" ? totalValue : unitPrice * qty;
    const prodId = String(product.id || product.name);

    // Meta Pixel: AddToCart
    if (typeof window.fbq === "function") {
      window.fbq("track", "AddToCart", {
        content_name: product.name,
        content_category: product.category || "Desserts",
        content_ids: [prodId],
        content_type: "product",
        value: value,
        currency: "MDL",
      });
    }

    // GA4: add_to_cart
    if (typeof window.gtag === "function") {
      window.gtag("event", "add_to_cart", {
        currency: "MDL",
        value: value,
        items: [
          {
            item_id: prodId,
            item_name: product.name,
            item_category: product.category || "Desserts",
            price: unitPrice,
            quantity: qty,
          },
        ],
      });
    }

    // Google Tag Manager dataLayer
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "MDL",
          value: value,
          items: [
            {
              item_id: prodId,
              item_name: product.name,
              item_category: product.category || "Desserts",
              price: unitPrice,
              quantity: qty,
            },
          ],
        },
      });
    }
  } catch (err) {
    console.warn("[Analytics] AddToCart tracking failed silently:", err);
  }
}

/**
 * 4. Track InitiateCheckout (User moves forward to checkout page or clicks checkout in drawer)
 */
export function trackInitiateCheckout(
  items: Array<AnalyticsProduct>,
  totalValue: number
) {
  if (typeof window === "undefined" || !items || items.length === 0) return;

  try {
    const val = typeof totalValue === "number" ? totalValue : 0;
    const numItems = items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
    const contentIds = items.map((i) => String(i.id || i.name));

    // Meta Pixel: InitiateCheckout
    if (typeof window.fbq === "function") {
      window.fbq("track", "InitiateCheckout", {
        content_ids: contentIds,
        contents: items.map((i) => ({
          id: String(i.id || i.name),
          quantity: i.quantity || 1,
          item_price: typeof i.price === "number" ? i.price : 0,
        })),
        content_type: "product",
        num_items: numItems,
        value: val,
        currency: "MDL",
      });
    }

    // GA4: begin_checkout
    if (typeof window.gtag === "function") {
      window.gtag("event", "begin_checkout", {
        currency: "MDL",
        value: val,
        items: items.map((i) => ({
          item_id: String(i.id || i.name),
          item_name: i.name,
          price: typeof i.price === "number" ? i.price : 0,
          quantity: i.quantity || 1,
        })),
      });
    }

    // Google Tag Manager dataLayer
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "MDL",
          value: val,
          items: items.map((i) => ({
            item_id: String(i.id || i.name),
            item_name: i.name,
            price: typeof i.price === "number" ? i.price : 0,
            quantity: i.quantity || 1,
          })),
        },
      });
    }
  } catch (err) {
    console.warn("[Analytics] InitiateCheckout tracking failed silently:", err);
  }
}

/**
 * 5. Track Purchase (Order successfully submitted & confirmed)
 */
export function trackPurchase(
  orderId: string,
  items: Array<AnalyticsProduct>,
  totalValue: number,
  customer?: CustomerData
) {
  if (typeof window === "undefined" || !items || items.length === 0) return;

  try {
    const val = typeof totalValue === "number" ? totalValue : 0;
    const numItems = items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
    const contentIds = items.map((i) => String(i.id || i.name));

    // Meta Pixel: Purchase (with { eventID: orderId } for exact Server CAPI deduplication)
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        content_ids: contentIds,
        contents: items.map((i) => ({
          id: String(i.id || i.name),
          quantity: i.quantity || 1,
          item_price: typeof i.price === "number" ? i.price : 0,
        })),
        content_type: "product",
        num_items: numItems,
        value: val,
        currency: customer?.currency || "MDL",
      }, { eventID: orderId });
    }

    // GA4: purchase
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: orderId,
        currency: customer?.currency || "MDL",
        value: val,
        items: items.map((i) => ({
          item_id: String(i.id || i.name),
          item_name: i.name,
          price: typeof i.price === "number" ? i.price : 0,
          quantity: i.quantity || 1,
        })),
      });
    }

    // Google Tag Manager dataLayer
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: orderId,
          currency: customer?.currency || "MDL",
          value: val,
          items: items.map((i) => ({
            item_id: String(i.id || i.name),
            item_name: i.name,
            price: typeof i.price === "number" ? i.price : 0,
            quantity: i.quantity || 1,
          })),
        },
      });
    }
  } catch (err) {
    console.warn("[Analytics] Purchase tracking failed silently:", err);
  }
}
