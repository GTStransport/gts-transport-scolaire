const firebaseConfig = {
  apiKey: "AIzaSyBpTKktOvFh9xj-Rn00Na8RTDzUZDFfQpU",
  authDomain: "gestion-transport-scolaire.firebaseapp.com",
  projectId: "gestion-transport-scolaire",
  storageBucket: "gestion-transport-scolaire.firebasestorage.app",
  messagingSenderId: "831152192064",
  appId: "1:831152192064:web:148c6ccf30ad2652ba7da5"
};

const shownNotifications = new Map();

function notificationKey(title, options = {}) {
  const data = options.data || {};
  return data.notificationId || data.messageId || data.conversationId || `${title}|${options.body || ""}`;
}

function showNotificationOnce(title, options) {
  const key = notificationKey(title, options);
  const now = Date.now();
  [...shownNotifications.entries()].forEach(([entryKey, timestamp]) => {
    if (now - timestamp > 30000) shownNotifications.delete(entryKey);
  });
  if (shownNotifications.has(key)) return Promise.resolve();
  shownNotifications.set(key, now);
  return self.registration.showNotification(title, options);
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { body: event.data.text() };
  }
  const title = payload.title || payload.notification?.title || "Gestion Transport Scolaire";
  const options = {
    body: payload.body || payload.message || payload.notification?.body || "",
    icon: "/assets/icon-192.png",
    badge: "/assets/icon-192.png",
    data: {
      ...(payload.data || {}),
      url: payload.url || payload.data?.url || "/app"
    }
  };
  event.waitUntil(showNotificationOnce(title, options));
});

try {
  importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || "Gestion Transport Scolaire";
    const options = {
      body: payload.notification?.body || payload.data?.body || "",
      icon: "/assets/icon-192.png",
      badge: "/assets/icon-192.png",
      data: {
        url: payload.data?.url || payload.data?.link || "/",
        type: payload.data?.type || payload.data?.fcmType || "general",
        notificationId: payload.data?.notificationId || "",
        messageId: payload.data?.messageId || "",
        conversationId: payload.data?.conversationId || ""
      }
    };
    return showNotificationOnce(title, options);
  });
} catch (error) {
  console.warn("Firebase Messaging service worker indisponible, Web Push standard actif.", error);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const sameOriginUrl = new URL(targetUrl, self.location.origin).href;
      const existing = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existing) {
        existing.focus();
        existing.navigate?.(sameOriginUrl);
        return;
      }
      return self.clients.openWindow(sameOriginUrl);
    })
  );
});
