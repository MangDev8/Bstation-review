// ================== sw.js ==================
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js');

firebase.initializeApp({
        apiKey: "AIzaSyDccx7ieL1Y_J1Pobhc9SIenATpbt80Iw0",
        authDomain: "web-bstation.firebaseapp.com",
        projectId: "web-bstation",
        storageBucket: "web-bstation.firebasestorage.app",
        messagingSenderId: "22194142604",
        appId: "1:22194142604:web:1bb3e3d01c67d9ffb2aaa9",
        measurementId: "G-5N97JFZYWB"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
        console.log('[SW] Background message received:', payload);
        const notificationTitle = payload.notification?.title || "Update Web";
        const notificationOptions = {
                body: payload.notification?.body || "Notifikasi baru",
                icon: payload.notification?.icon || "/icon.png",
                data: { link: payload.data?.link || "#" }
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
        event.notification.close();
        const link = event.notification.data?.link || '/';
        event.waitUntil(
                clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
                        for (const client of clientList) {
                                if (client.url === link && 'focus' in client) return client.focus();
                        }
                        if (clients.openWindow) return clients.openWindow(link);
                })
        );
});