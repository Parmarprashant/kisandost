import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function requestNotificationPermission() {
  if (typeof window === "undefined") {
    return { success: false, message: "Server-side context" };
  }

  if (!("Notification" in window)) {
    return { success: false, message: "Browser does not support desktop notifications" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return { success: true, message: "Permission granted" };
    } else {
      return { success: false, message: "Permission denied" };
    }
  } catch (error: any) {
    console.error("Error requesting permission:", error);
    return { success: false, message: error.message || "Failed to request permission" };
  }
}

export async function getFCMToken() {
  if (typeof window === "undefined" || !messaging) {
    return { token: null, error: "Messaging not supported or not running in browser" };
  }

  try {
    // Explicitly register the service worker for Firebase at the root scope
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const currentToken = await getToken(messaging, { 
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration 
    });

    if (currentToken) {
      return { token: currentToken, error: null };
    } else {
      return { token: null, error: "No registration token available." };
    }
  } catch (err: any) {
    console.error("Error retrieving token:", err);
    return { token: null, error: err.message || "Error retrieving token" };
  }
}

export function setupForegroundMessageListener(callback?: (payload: any) => void) {
  if (typeof window !== "undefined" && messaging) {
    return onMessage(messaging, (payload) => {
      console.log("[FCM Foreground] Message received: ", payload);
      
      // Attempt to immediately display a native browser notification while app is open
      if (Notification.permission === 'granted') {
        const title = payload.notification?.title || "KisanDost Notice";
        const options = {
          body: payload.notification?.body || "You have a new update.",
          icon: "/favicon.ico"
        };
        new Notification(title, options);
      }
      
      if (callback) {
        callback(payload);
      }
    });
  }
  return () => {}; // return empty unsubscribe if not supported
}

// Interacts directly with the Next.js API to persist the token to MongoDB
export async function saveFCMTokenToBackend(token: string) {
  try {
    const response = await fetch("/api/notifications/register-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save token to backend");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error saving FCM token:", error);
    return { success: false, error: error.message };
  }
}
