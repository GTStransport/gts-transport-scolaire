import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);
const app = hasFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;
const functions = app ? getFunctions(app, "europe-west1") : null;
const messagingPromise = app && typeof window !== "undefined"
  ? isMessagingSupported().then((supported) => supported ? getMessaging(app) : null).catch(() => null)
  : Promise.resolve(null);

if (db && typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((error) => {
    console.warn("Persistance Firestore hors ligne indisponible.", error?.code || error);
  });
}

export { app, auth, db, storage, functions, firebaseConfig, messagingPromise };
