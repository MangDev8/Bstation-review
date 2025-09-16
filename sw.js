// sw.js
self.addEventListener('install', event => {
        console.log('[SW] Installed');
        self.skipWaiting();
});

self.addEventListener('activate', event => {
        console.log('[SW] Activated');
        return self.clients.claim();
});

// listen push event
self.addEventListener('push', event => {
        let data = {};
        if (event.data) {
                data = event.data.json();
        }
        
        const options = {
                body: data.body || 'Ada notifikasi baru!',
                icon: '/icon.png', // ganti sesuai icon
                badge: '/badge.png', // ganti sesuai badge
                data: data.url || '/'
        };
        
        event.waitUntil(
                self.registration.showNotification(data.title || 'INST2-RMX', options)
        );
});

// klik notifikasi
self.addEventListener('notificationclick', event => {
        event.notification.close();
        event.waitUntil(
                clients.openWindow(event.notification.data)
        );
});