import { logEvent } from "firebase/analytics";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { analytics, firestore } from "./firebase";

const STORE_ID = 'main_store';

export const trackEvent = async (eventName: string, params: Record<string, any> = {}) => {
  try {
    // 1. Log to Google Analytics (GA4)
    if (analytics) {
      logEvent(analytics, eventName, params);
    }

    // 2. Log to Firestore for Real-Time Dashboard
    // We store events in a subcollection of the store to keep it organized
    const eventsRef = collection(firestore, 'stores', STORE_ID, 'analytics_events');
    
    // Add metadata
    const urlParams = new URLSearchParams(window.location.search);
    const eventData = {
      event_name: eventName,
      ...params,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      utm_source: urlParams.get('utm_source') || 'none'
    };

    await addDoc(eventsRef, eventData);
    
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      console.warn("Analytics tracking failed due to permissions. To fix, allow public 'create' access to 'analytics_events' in Firestore Rules.");
    } else {
      console.error("Error tracking event:", error);
    }
    // Don't block the UI if tracking fails
  }
};

// Pre-defined event helpers for consistency
export const trackSearch = (term: string) => {
  if (!term) return;
  trackEvent('search', { search_term: term });
};

export const trackViewItem = (product: { id: string; name: string; price: number; category?: string }) => {
  trackEvent('view_item', {
    currency: 'BRL',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price
    }]
  });
};

export const trackContact = (method: 'whatsapp' | 'instagram' | 'facebook', product?: { name: string }) => {
  trackEvent('contact', {
    method,
    product_name: product?.name || 'general'
  });
};
