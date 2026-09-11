importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Using hardcoded config inside the SW because process.env is not available here in Next.js public directory.
// This is completely safe and standard for Firebase (all these values are public identifiers anyway).
const firebaseConfig = {
  apiKey: "AIzaSyD1wkZErb9JQpBZRG93nYGsJoxPoJKnsM8",
  authDomain: "kisandost-29975.firebaseapp.com",
  projectId: "kisandost-29975",
  storageBucket: "kisandost-29975.firebasestorage.app",
  messagingSenderId: "91129459714",
  appId: "1:91129459714:web:e2611e0f3fb548c9bd231b",
  measurementId: "G-C6FG8R3RF5"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);
    
    const notificationTitle = payload.notification?.title || "KisanDost Notice";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new update.",
      icon: "/favicon.ico"
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (err) {
  console.error("Failed to initialize Firebase Messaging SW:", err);
}
