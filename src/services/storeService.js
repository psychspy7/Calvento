/**
 * CALVENTO DUAL-MODE STORE SERVICE
 * Seamlessly bridges Cloud Firestore / Storage and resilient Local / Demo mode.
 * Zero unhandled exceptions in any environment.
 */

import { firebaseConfigured, app } from '../firebase.js';
import { wardrobeProducts } from '../wardrobeProducts.js';

const STORAGE_KEY_PRODUCTS = 'calvento_products_v4';
const STORAGE_KEY_ORDERS = 'calvento_orders_v4';
const STORAGE_KEY_NEWSLETTER = 'calvento_newsletter_v4';
const STORAGE_KEY_INQUIRIES = 'calvento_inquiries_v4';

let dbInstance = null;
let storageInstance = null;

async function getDb() {
  if (!firebaseConfigured || !app) return null;
  if (!dbInstance) {
    try {
      const { getFirestore } = await import('firebase/firestore');
      dbInstance = getFirestore(app);
    } catch (err) {
      console.warn('CALVENTO: Cloud Firestore unavailable, falling back to local store.', err);
      return null;
    }
  }
  return dbInstance;
}

async function getStorage() {
  if (!firebaseConfigured || !app) return null;
  if (!storageInstance) {
    try {
      const { getStorage } = await import('firebase/storage');
      storageInstance = getStorage(app);
    } catch (err) {
      console.warn('CALVENTO: Cloud Storage unavailable, falling back to local assets.', err);
      return null;
    }
  }
  return storageInstance;
}

/**
 * Returns default initial products seeded from authentic wardrobe
 */
export function getDefaultProducts() {
  return wardrobeProducts.map(p => ({
    ...p,
    sku: p.sku || `CV-${String(p.id).toUpperCase()}`,
    stock: p.stock ?? 12,
    status: p.status || 'active'
  }));
}

/**
 * LocalStorage product reader with schema migration
 */
function getLocalProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      const defaults = getDefaultProducts();
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure any newly added wardrobe pieces exist in cache
      const defaults = getDefaultProducts();
      const existingIds = new Set(parsed.map(p => String(p.id)));
      const missing = defaults.filter(d => !existingIds.has(String(d.id)));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('CALVENTO: LocalStorage read failed, using defaults.', e);
  }
  return getDefaultProducts();
}

function saveLocalProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('calvento-products-updated', { detail: products }));
  } catch (e) {
    console.warn('CALVENTO: LocalStorage save error.', e);
  }
}

/**
 * Query products from Cloud Firestore or LocalStorage fallback
 */
export async function getProducts() {
  const db = await getDb();
  if (db) {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const q = query(collection(db, 'products'), where('status', '==', 'active'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn('CALVENTO: Error fetching products from Firestore. Using local fallback.', err);
    }
  }
  return getLocalProducts();
}

/**
 * Real-time product subscription with graceful offline fallback
 */
export function subscribeToProducts(callback) {
  let unsub = () => {};
  let isSubscribed = true;

  (async () => {
    const db = await getDb();
    if (db && isSubscribed) {
      try {
        const { collection, onSnapshot, query, where } = await import('firebase/firestore');
        const q = query(collection(db, 'products'), where('status', '==', 'active'));
        unsub = onSnapshot(
          q,
          snapshot => {
            if (isSubscribed) {
              const cloudItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              if (cloudItems.length > 0) {
                callback(cloudItems);
              } else {
                callback(getLocalProducts());
              }
            }
          },
          err => {
            console.warn('CALVENTO: Firestore listener error, reverting to local observer.', err);
            if (isSubscribed) callback(getLocalProducts());
          }
        );
        return;
      } catch (err) {
        console.warn('CALVENTO: Firestore import failed, using local observer.', err);
      }
    }

    // Local fallback observer
    if (isSubscribed) {
      callback(getLocalProducts());
      const onLocalUpdate = (e) => {
        if (isSubscribed && e.detail) callback(e.detail);
      };
      window.addEventListener('calvento-products-updated', onLocalUpdate);
      unsub = () => window.removeEventListener('calvento-products-updated', onLocalUpdate);
    }
  })();

  return () => {
    isSubscribed = false;
    unsub();
  };
}

/**
 * Record an order to Cloud Firestore or LocalStorage
 */
export async function createOrder(orderData) {
  const orderId = `CV-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const payload = {
    ...orderData,
    orderId,
    status: 'commissioned',
    createdAt: new Date().toISOString()
  };

  const db = await getDb();
  if (db) {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'orders'), payload);
      return { success: true, orderId };
    } catch (err) {
      console.warn('CALVENTO: Firestore order placement failed, saving locally.', err);
    }
  }

  // Local fallback
  try {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
    orders.unshift(payload);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.warn('CALVENTO: Local order save error', e);
  }
  return { success: true, orderId };
}

/**
 * Subscribe customer email to newsletter in Firestore or LocalStorage
 */
export async function subscribeToNewsletter(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  const payload = {
    email: cleanEmail,
    source: 'storefront_footer',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const db = await getDb();
  if (db) {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'newsletter'), payload);
      return { success: true, message: 'Thank you. You are on the private CALVENTO list.' };
    } catch (err) {
      console.warn('CALVENTO: Newsletter cloud signup failed, saving locally.', err);
    }
  }

  // Local fallback
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY_NEWSLETTER) || '[]');
    if (!list.some(item => item.email === cleanEmail)) {
      list.push(payload);
      localStorage.setItem(STORAGE_KEY_NEWSLETTER, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('CALVENTO: Local newsletter save error', e);
  }
  return { success: true, message: 'Thank you. You are on the private CALVENTO list.' };
}

/**
 * Submit client concierge inquiry to Firestore or LocalStorage
 */
export async function submitInquiry(inquiryData) {
  const payload = {
    ...inquiryData,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  const db = await getDb();
  if (db) {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'inquiries'), payload);
      return { success: true };
    } catch (err) {
      console.warn('CALVENTO: Inquiry cloud submission failed, saving locally.', err);
    }
  }

  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY_INQUIRIES) || '[]');
    list.unshift(payload);
    localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(list));
  } catch (e) {
    console.warn('CALVENTO: Local inquiry save error', e);
  }
  return { success: true };
}

/**
 * Save or update product (Admin functionality)
 */
export async function saveProduct(productData, imageFile = null) {
  let image = productData.image;

  if (imageFile) {
    const storage = await getStorage();
    if (storage) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const filename = `products/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const fileRef = ref(storage, filename);
        await uploadBytes(fileRef, imageFile);
        image = await getDownloadURL(fileRef);
      } catch (err) {
        console.warn('CALVENTO: Storage upload failed, keeping original image URL.', err);
      }
    }
  }

  const payload = {
    ...productData,
    image,
    price: Number(productData.price) || 0,
    stock: Number(productData.stock) || 0,
    updatedAt: new Date().toISOString()
  };

  const db = await getDb();
  if (db) {
    try {
      const { collection, doc, addDoc, updateDoc } = await import('firebase/firestore');
      if (productData.id && String(productData.id).length > 10) {
        await updateDoc(doc(db, 'products', productData.id), payload);
        return { ...payload, id: productData.id };
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        return { ...payload, id: docRef.id };
      }
    } catch (err) {
      console.warn('CALVENTO: Firestore product save failed, committing locally.', err);
    }
  }

  // Local fallback
  const items = getLocalProducts();
  const existingIdx = items.findIndex(p => String(p.id) === String(productData.id));
  let savedItem;

  if (existingIdx >= 0) {
    savedItem = { ...items[existingIdx], ...payload };
    items[existingIdx] = savedItem;
  } else {
    savedItem = { ...payload, id: productData.id || `cv-custom-${Date.now()}` };
    items.unshift(savedItem);
  }

  saveLocalProducts(items);
  return savedItem;
}

/**
 * Delete product from Firestore or LocalStorage
 */
export async function deleteProduct(productId) {
  const db = await getDb();
  if (db) {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'products', productId));
      return;
    } catch (err) {
      console.warn('CALVENTO: Firestore delete failed, removing locally.', err);
    }
  }

  const items = getLocalProducts().filter(p => String(p.id) !== String(productId));
  saveLocalProducts(items);
}

/**
 * Toggle product status (active/draft)
 */
export async function toggleProductStatus(productId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'draft' : 'active';
  const db = await getDb();
  if (db) {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'products', productId), { status: newStatus });
      return newStatus;
    } catch (err) {
      console.warn('CALVENTO: Firestore status toggle failed, toggling locally.', err);
    }
  }

  const items = getLocalProducts().map(p =>
    String(p.id) === String(productId) ? { ...p, status: newStatus } : p
  );
  saveLocalProducts(items);
  return newStatus;
}

/**
 * Seed all authentic wardrobe pieces to Firestore or LocalStorage
 */
export async function seedWardrobeProducts() {
  const defaults = getDefaultProducts();
  const db = await getDb();
  let count = 0;

  if (db) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      for (const piece of defaults) {
        await setDoc(doc(db, 'products', piece.id), {
          ...piece,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        count++;
      }
      return count;
    } catch (err) {
      console.warn('CALVENTO: Firestore seed error, saving locally.', err);
    }
  }

  saveLocalProducts(defaults);
  return defaults.length;
}

/**
 * Status indicator
 */
export function isCloudActive() {
  return Boolean(firebaseConfigured);
}
