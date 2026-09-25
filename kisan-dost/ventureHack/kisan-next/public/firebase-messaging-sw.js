importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Using hardcoded config inside the SW because process.env is not available here in Next.js public directory.
// This is completely safe and standard for Firebase (all these values are public identifiers anyway).
const firebaseConfig = {
  apiKey: "AIzaSyDWXQ4IgWZq5_i6PL11p4AZfhR-rukTb4",
  authDomain: "kisan-dost-bd105.firebaseapp.com",
  projectId: "kisan-dost-bd105",
  storageBucket: "kisan-dost-bd105.firebasestorage.app",
  messagingSenderId: "941983720623",
  appId: "1:941983720623:web:4a074f0bdf8256278ba05a",
  measurementId: "G-WRQ2469FD8"
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
