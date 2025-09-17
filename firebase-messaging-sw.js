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

// Background notification
messaging.onBackgroundMessage(payload => {
        const notificationTitle = payload.notification?.title || 'Notifikasi Baru';
        const notificationOptions = {
                body: payload.notification?.body || '',
                icon: 'img/rin.png',
                data: payload.notification?.click_action || '/'
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
});

// klik notif
self.addEventListener('notificationclick', event => {
        event.notification.close();
        event.waitUntil(clients.openWindow(event.notification.data || '/'));
});