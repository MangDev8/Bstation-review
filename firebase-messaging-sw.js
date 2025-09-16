// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js');

// ===== Inisialisasi Firebase di SW =====
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

// ===== Tangani notifikasi saat web background =====
messaging.onBackgroundMessage((payload) => {
        console.log('[SW] Received background message ', payload);
        
        const notificationTitle = payload.notification.title || 'Notifikasi';
        const notificationOptions = {
                body: payload.notification.body || '',
                icon: '/icon.png'
        };
        
        self.registration.showNotification(notificationTitle, notificationOptions);
});