// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js');

const firebaseConfig = {
        apiKey: "AIzaSyDccx7ieL1Y_J1Pobhc9SIenATpbt80Iw0",
        authDomain: "web-bstation.firebaseapp.com",
        projectId: "web-bstation",
        storageBucket: "web-bstation.firebasestorage.app",
        messagingSenderId: "22194142604",
        appId: "1:22194142604:web:1bb3e3d01c67d9ffb2aaa9",
        measurementId: "G-5N97JFZYWB"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Notifikasi background
messaging.onBackgroundMessage(payload => {
        console.log('[FCM SW] Background message', payload);
        const notificationTitle = payload.notification?.title || 'Notifikasi Baru';
        const notificationOptions = {
                body: payload.notification?.body || '',
                icon: 'img/rin.png', // ganti sesuai icon projectmu
                data: payload.notification?.click_action || '/'
        };
        
        self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: klik notifikasi
self.addEventListener('notificationclick', function(event) {
        event.notification.close();
        const clickUrl = event.notification.data || '/';
        event.waitUntil(clients.openWindow(clickUrl));
});

if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then(reg => console.log('[SW-FCM] Registered', reg))
                .catch(err => console.error('[SW-FCM] Failed', err));
}


const token = await getToken(messaging, { vapidKey: "sOAvSVK2fNEcE3v0muOVBs9T983TwImm9V1TaARxrsk" });
console.log("FCM Token:", token);