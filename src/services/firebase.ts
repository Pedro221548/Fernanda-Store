import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqkKI_rgsHIQM1PlGKHYJhzsEMbGbjVzM",
  authDomain: "fernadastore-a5649.firebaseapp.com",
  projectId: "fernadastore-a5649",
  storageBucket: "fernadastore-a5649.firebasestorage.app",
  messagingSenderId: "163273304336",
  appId: "1:163273304336:web:ad4fac2e6e9dd8aacd5d95",
  measurementId: "G-D7K2671Z1M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export default app;
