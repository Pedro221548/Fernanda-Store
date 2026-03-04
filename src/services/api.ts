import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { firestore, auth } from "./firebase";

const STORE_ID = 'main_store';

// Helper to ensure user is authenticated (anonymously if not logged in)
const ensureAuth = async () => {
  if (auth.currentUser) return auth.currentUser;
  
  try {
    // Try to wait for existing auth state first
    return await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          // If no user, try to sign in anonymously
          signInAnonymously(auth)
            .then(cred => resolve(cred.user))
            .catch(err => {
              console.warn("Anonymous auth failed (check if enabled in Firebase Console):", err);
              resolve(null);
            });
        }
      });
      // Timeout after 3 seconds to not block the app forever
      setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 3000);
    });
  } catch (e) {
    return null;
  }
};

// Helper to compress images if they are too large for Firestore (limit ~1MB)
const compressImage = (base64Str: string, maxWidth = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    if (base64Str.length < 500000) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export const api = {
  async getPublicData() {
    try {
      await ensureAuth();
      const productsRef = collection(firestore, 'stores', STORE_ID, 'products');
      const bannersRef = collection(firestore, 'stores', STORE_ID, 'banners');
      const settingsRef = doc(firestore, 'stores', STORE_ID);

      const [productsSnap, bannersSnap, settingsSnap] = await Promise.all([
        getDocs(productsRef),
        getDocs(bannersRef),
        getDoc(settingsRef)
      ]);

      const products: any[] = [];
      productsSnap.forEach((doc) => {
        const p = doc.data();
        if (p.active === 0) return;
        products.push({ id: doc.id, ...p });
      });

      const settings = settingsSnap.exists() ? settingsSnap.data() : {};
      
      const banners: any[] = [];
      bannersSnap.forEach((doc) => {
        const b = doc.data();
        if (b.active !== 0) {
          banners.push({ id: doc.id, ...b });
        }
      });

      return { products, settings, banners };
    } catch (error) {
      console.error("Firestore getPublicData error:", error);
      return { products: [], settings: {}, banners: [] };
    }
  },

  async login(email, password) {
    try {
      // If the user enters 'adm', we might need to map it to an email if Firebase requires email
      // But usually Firebase Auth uses email. Let's try to use the input directly.
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      return { token, user: userCredential.user };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error('Credenciais inválidas');
    }
  },

  // Admin methods
  async getAdminProducts(_token: string) {
    const productsRef = collection(firestore, 'stores', STORE_ID, 'products');
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async saveProduct(_token, product) {
    const { id, ...data } = product;
    const productsRef = collection(firestore, 'stores', STORE_ID, 'products');
    
    if (data.images && Array.isArray(data.images)) {
      data.images = await Promise.all(data.images.map(async (img: any) => {
        if (img.image_data) {
          const compressed = await compressImage(img.image_data);
          return { ...img, image_data: compressed };
        }
        return img;
      }));
    }

    if (id) {
      const docRef = doc(productsRef, id);
      await updateDoc(docRef, data);
      return { success: true };
    } else {
      const docRef = await addDoc(productsRef, data);
      return { id: docRef.id };
    }
  },

  async deleteProduct(_token, id) {
    const docRef = doc(firestore, 'stores', STORE_ID, 'products', String(id));
    await deleteDoc(docRef);
    return { success: true };
  },

  async getAdminSettings(_token: string) {
    const docRef = doc(firestore, 'stores', STORE_ID);
    const docSnap = await getDoc(docRef);
    const settings = docSnap.exists() ? docSnap.data() : {};
    return Object.entries(settings).map(([key, value]) => ({ key, value }));
  },

  async saveSettings(_token, settingsList) {
    const settingsObj: any = {};
    for (const item of settingsList) {
      if (item.key === 'store_logo' && item.value) {
        settingsObj[item.key] = await compressImage(item.value);
      } else {
        settingsObj[item.key] = item.value;
      }
    }
    const docRef = doc(firestore, 'stores', STORE_ID);
    await setDoc(docRef, settingsObj, { merge: true });
    return { success: true };
  },

  async getAdminBanners(_token: string) {
    const bannersRef = collection(firestore, 'stores', STORE_ID, 'banners');
    const snapshot = await getDocs(bannersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async saveBanner(_token, banner) {
    const { id, ...data } = banner;
    const bannersRef = collection(firestore, 'stores', STORE_ID, 'banners');

    if (data.image_data) {
      data.image_data = await compressImage(data.image_data);
    }

    if (id) {
      const docRef = doc(bannersRef, id);
      await updateDoc(docRef, data);
      return { success: true };
    } else {
      const docRef = await addDoc(bannersRef, data);
      return { id: docRef.id };
    }
  },

  async deleteBanner(_token, id) {
    const docRef = doc(firestore, 'stores', STORE_ID, 'banners', String(id));
    await deleteDoc(docRef);
    return { success: true };
  },

  async getStrategyData(_token) {
    try {
      const eventsRef = collection(firestore, 'stores', STORE_ID, 'analytics_events');
      const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      // Return empty or aggregated data
      return {
        topSearchTerms: [],
        topClickedProducts: [],
        trafficSource: [],
        trafficByCity: [],
        whatsappConversion: [],
        totalEvents: snapshot.size
      };
    } catch (error) {
      return {
        topSearchTerms: [],
        topClickedProducts: [],
        trafficSource: [],
        trafficByCity: [],
        whatsappConversion: [],
        totalEvents: 0
      };
    }
  }
};
