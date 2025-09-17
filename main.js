// ================== MAIN.JS ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";

// ====== Firebase ======
const firebaseConfig = {
    apiKey: "AIzaSyDccx7ieL1Y_J1Pobhc9SIenATpbt80Iw0",
    authDomain: "web-bstation.firebaseapp.com",
    projectId: "web-bstation",
    storageBucket: "web-bstation.firebasestorage.app",
    messagingSenderId: "22194142604",
    appId: "1:22194142604:web:1bb3e3d01c67d9ffb2aaa9",
    measurementId: "G-5N97JFZYWB"
};
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ====== FCM INIT ======
async function initFCM() {
    if (!('Notification' in window)) return console.warn("Browser tidak mendukung notifikasi");
    if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
        if (permission !== 'granted') return;
    }
    try {
        const token = await getToken(messaging, { vapidKey: "sOAvSVK2fNEcE3v0muOVBs9T983TwImm9V1TaARxrsk" });
        console.log("FCM Token:", token);
    } catch (err) {
        console.error("FCM init error:", err);
    }
}
initFCM();

// ====== Foreground Notifications ======
onMessage(messaging, payload => {
    console.log("Foreground message received:", payload);
    const message = payload.notification?.body || "Notifikasi baru";
    showNotification(message);
});

// ================== MUSIC BUBBLE ==================
const bubble = document.getElementById("musicBubble");
const music = document.getElementById("bgMusic");
let isPlaying = false;
let userInteracted = false;

// Periksa keberadaan elemen audio musik
if (!music) {
    console.error("Elemen audio dengan ID 'bgMusic' tidak ditemukan!");
} else {
    console.log("Elemen audio musik ditemukan, src:", music.src);
}

music.addEventListener('canplaythrough', () => console.log("Audio musik siap dimainkan"));
music.addEventListener('error', (e) => console.error("Gagal memuat audio musik:", e));

// Fade in / fade out musik
function fadeIn(audio, targetVolume = 0.3, step = 0.01, interval = 200) {
    if (!audio) return;
    audio.volume = 0;
    audio.play().catch(err => console.error("Audio musik diblokir browser:", err));
    const fade = setInterval(() => {
        if (audio.volume < targetVolume) audio.volume = Math.min(audio.volume + step, targetVolume);
        else clearInterval(fade);
    }, interval);
}

function fadeOut(audio, step = 0.01, interval = 200, callback) {
    if (!audio) return;
    const fade = setInterval(() => {
        if (audio.volume > 0) audio.volume = Math.max(audio.volume - step, 0);
        else {
            clearInterval(fade);
            audio.pause();
            if (callback) callback();
        }
    }, interval);
}

function playMusic() {
    if (!music || !music.src) {
        console.error("Audio musik atau source tidak ditemukan!");
        return;
    }
    fadeIn(music);
    bubble.textContent = "⏸";
    bubble.classList.add("playing");
    isPlaying = true;
}

function pauseMusic() {
    if (!music) return;
    fadeOut(music, 0.01, 200, () => {
        bubble.textContent = "🎧";
        bubble.classList.remove("playing");
        isPlaying = false;
    });
}

if (bubble) {
    ['click', 'touchstart'].forEach(evt => {
        bubble.addEventListener(evt, () => {
            console.log("Tombol musik diklik, isPlaying:", isPlaying);
            isPlaying ? pauseMusic() : playMusic();
        });
    });
} else {
    console.error("Elemen musicBubble tidak ditemukan!");
}

// ================== DROPDOWN ==================
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

// ================== NOTIFIKASI ==================
let lastNotifKeys = new Set(JSON.parse(localStorage.getItem("lastNotifKeys") || "[]"));
const notifQueue = [];
let isPlayingNotif = false;

const notifSound = document.getElementById("notifSound");
const badge = document.getElementById("notif-badge");
const listEl = document.getElementById("notif-list");

// Periksa keberadaan elemen audio notifikasi
if (!notifSound) {
    console.error("Elemen audio dengan ID 'notifSound' tidak ditemukan!");
} else {
    console.log("Elemen audio notifikasi ditemukan, src:", notifSound.src);
}

// Tambahkan event listener untuk debugging audio notifikasi
notifSound.addEventListener('canplaythrough', () => console.log("Audio notifikasi siap dimainkan"));
notifSound.addEventListener('error', (e) => console.error("Gagal memuat audio notifikasi:", e));

// User gesture pertama untuk unlock audio
['click', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => {
        if (!userInteracted) {
            userInteracted = true;
            console.log("User interaksi terdeteksi, memproses antrian notifikasi");
            processNotifQueue();
        }
    }, { once: true });
});

function enqueueNotif(message) {
    console.log("Menambahkan notifikasi ke antrian:", message);
    notifQueue.push(message);
    processNotifQueue();
}

function processNotifQueue() {
    if (!userInteracted || isPlayingNotif || notifQueue.length === 0) {
        console.log("Antrian notifikasi ditunda: ", { userInteracted, isPlayingNotif, queueLength: notifQueue.length });
        return;
    }
    
    isPlayingNotif = true;
    const message = notifQueue.shift();
    console.log("Memproses notifikasi:", message);
    
    const div = document.createElement("div");
    div.className = "notif-toast";
    div.textContent = message;
    document.body.appendChild(div);
    
    if (notifSound && notifSound.src) {
        notifSound.volume = 0.5;
        notifSound.currentTime = 0;
        notifSound.play().then(() => {
            console.log("Audio notifikasi diputar");
        }).catch(err => {
            console.error("Gagal memutar audio notifikasi:", err);
        });
    } else {
        console.error("Audio notifikasi atau source tidak ditemukan!");
    }
    
    setTimeout(() => {
        div.remove();
        isPlayingNotif = false;
        console.log("Notifikasi selesai, memproses antrian berikutnya");
        processNotifQueue();
    }, 800);
}

function showNotification(message) {
    enqueueNotif(message);
}

// ================== LOAD NOTIF ==================
async function loadNotif() {
    try {
        const res = await fetch("/notifications.json?_=" + Date.now());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = await res.json();
        const now = Date.now();
        
        data = data.filter(item => item.enabled &&
            (!item.expire || (now - parseInt(localStorage.getItem("notif_" + btoa(item.text)) || now)) / 3600000 <= item.expire)
        );
        
        badge.style.display = data.length ? 'inline-block' : 'none';
        badge.textContent = data.length || "";
        
        listEl.innerHTML = data.length ?
            data.map(item => `<li class="notif-item"><a href="${item.link || '#'}" target="_blank">${item.text}</a></li>`).join("") :
            "<li>Tidak ada notifikasi</li>";
        
        data.forEach(item => {
            const key = "notif_" + btoa(item.text);
            if (!lastNotifKeys.has(key)) {
                showNotification(item.text);
                lastNotifKeys.add(key);
                localStorage.setItem("notif_" + btoa(item.text), now);
            }
        });
        
        localStorage.setItem("lastNotifKeys", JSON.stringify(Array.from(lastNotifKeys)));
        
    } catch (e) {
        console.error("Gagal load notifikasi", e);
        listEl.innerHTML = "<li>Error load</li>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadNotif();
    setInterval(loadNotif, 30000); // Diubah ke 30 detik untuk mengurangi beban server
});

// Buka/tutup modal notif
window.openNotif = function() {
    document.getElementById("notifModal").style.display = "flex";
    badge.style.display = "none";
    badge.textContent = "";
};
window.closeNotif = function() {
    document.getElementById("notifModal").style.display = "none";
};
window.addEventListener("click", e => {
    if (e.target === document.getElementById("notifModal")) closeNotif();
});

// ================== SERVICE WORKER ==================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[SW] Registered', reg))
        .catch(err => console.error('[SW] Failed', err));
}

// Request permission notif
if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => console.log('Notification permission:', permission));
}