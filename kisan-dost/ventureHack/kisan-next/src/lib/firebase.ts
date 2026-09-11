import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once to prevent Next.js hot-reload errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Messaging is only supported in browser contexts
let messaging: Messaging | null = null;
if (typeof window !== "undefined" && firebaseConfig.projectId) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging failed to initialize: Missing config or environment.", error);
  }
}

export { app, messaging };
