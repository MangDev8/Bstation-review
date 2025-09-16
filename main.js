// ================= MUSIC BUBBLE =================
const bubble = document.getElementById("musicBubble");
const music = document.getElementById("bgMusic");
let isPlaying = false;

function playMusic() {
        music.play().then(() => {
                bubble.textContent = "⏸";
                bubble.classList.add("playing");
                isPlaying = true;
                
                let volume = 0.0;
                music.volume = volume;
                const fade = setInterval(() => {
                        if (volume < 0.3) {
                                volume += 0.01;
                                music.volume = volume;
                        } else {
                                clearInterval(fade);
                        }
                }, 200);
        }).catch(() => console.log("Autoplay diblokir, klik balon untuk nyalain musik."));
}

function pauseMusic() {
        music.pause();
        bubble.textContent = "🎵";
        bubble.classList.remove("playing");
        isPlaying = false;
}

bubble.addEventListener("click", () => isPlaying ? pauseMusic() : playMusic());
document.addEventListener("DOMContentLoaded", playMusic);

// ================= DROPDOWN =================
document.querySelectorAll('.dropdown').forEach(drop => {
        const btn = drop.querySelector('.dropbtn');
        const content = drop.querySelector('.dropcontent');
        const arrow = drop.querySelector('.arrow');
        
        btn.addEventListener('click', () => {
                const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
                content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
                arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });
});

// ================= AUTO UPDATE VERSION =================
setInterval(async () => {
        try {
                const res = await fetch("/version.json?_=" + Date.now());
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const { version } = await res.json();
                if (localStorage.getItem("version") !== version) {
                        localStorage.setItem("version", version);
                        console.log("Versi baru ditemukan, reload halaman...");
                        window.location.reload();
                }
        } catch (e) {
                console.error("Gagal cek versi", e);
        }
}, 10000);

// ================= NOTIFIKASI =================
const notifSound = document.getElementById("notifSound"); // jangan lupa tambahkan di HTML
const badge = document.getElementById("notif-badge");
const listEl = document.getElementById("notif-list");
let lastNotifKeys = new Set();

async function loadNotif() {
        try {
                const res = await fetch("/notifications.json?_=" + Date.now());
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                let data = await res.json();
                const now = Date.now();
                
                // filter notif aktif & belum expired
                data = data.filter(item => {
                        if (!item.enabled) return false;
                        
                        if (item.expire && item.expire > 0) {
                                const key = "notif_" + btoa(item.text);
                                let createdAt = localStorage.getItem(key);
                                if (!createdAt) {
                                        createdAt = now;
                                        localStorage.setItem(key, createdAt);
                                }
                                const ageHours = (now - createdAt) / (1000 * 60 * 60);
                                if (ageHours > item.expire) return false;
                        }
                        return true;
                });
                
                // update badge
                if (data.length > 0) {
                        badge.textContent = data.length;
                        badge.style.display = "inline-block";
                } else {
                        badge.style.display = "none";
                }
                
                // render list
                listEl.innerHTML = data.length ?
                        data.map(item => `<li class="notif-item"><a href="${item.link}" target="_blank">${item.text}</a></li>`).join("") :
                        "<li>Tidak ada notifikasi</li>";
                
                // cek notif baru untuk suara / toast
                data.forEach(item => {
                        const key = "notif_" + btoa(item.text);
                        if (!lastNotifKeys.has(key)) {
                                showNotification(item.text);
                                lastNotifKeys.add(key);
                        }
                });
                
        } catch (e) {
                console.error("Gagal load notifikasi", e);
                listEl.innerHTML = "<li>Error load</li>";
        }
}

// load pertama
document.addEventListener("DOMContentLoaded", loadNotif);
// refresh tiap 30 detik
setInterval(loadNotif, 1000);

// buka / tutup modal
function openNotif() {
        document.getElementById("notifModal").style.display = "flex";
        badge.style.display = "none";
        badge.textContent = "";
}

function closeNotif() {
        document.getElementById("notifModal").style.display = "none";
}

window.addEventListener("click", e => {
        const modal = document.getElementById("notifModal");
        if (modal && e.target === modal) closeNotif();
});

// ================= TOAST NOTIF =================
function showNotification(message) {
        const notif = document.createElement("div");
        notif.className = "notif-toast";
        notif.textContent = message;
        document.body.appendChild(notif);
        
        if (notifSound) {
                notifSound.volume = 0.5;
                notifSound.play().catch(err => console.log("Gagal mainkan audio:", err));
        }
        
        setTimeout(() => notif.remove(), 5000);
}


if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('[SW] Registered', reg))
                .catch(err => console.error('[SW] Failed', err));
}

// request permission notif
if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
        });
}