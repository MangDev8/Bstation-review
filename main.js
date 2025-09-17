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

// ====== Foreground notifications ======
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

music.addEventListener('canplaythrough', () => console.log("Audio musik siap dimainkan"));

function fadeIn(audio, targetVolume = 0.3, step = 0.01, interval = 200) {
    audio.volume = 0;
    audio.play().catch(() => console.log("Audio play diblokir browser"));
    const fade = setInterval(() => {
        if (audio.volume < targetVolume) audio.volume = Math.min(audio.volume + step, targetVolume);
        else clearInterval(fade);
    }, interval);
}

function fadeOut(audio, step = 0.01, interval = 200, callback) {
    const fade = setInterval(() => {
        if (audio.volume > 0) audio.volume = Math.max(audio.volume - step, 0);
        else { clearInterval(fade); audio.pause(); if (callback) callback(); }
    }, interval);
}

function playMusic() { fadeIn(music); bubble.textContent = "⏸"; bubble.classList.add("playing"); isPlaying = true; }
function pauseMusic() { fadeOut(music, 0.01, 200, () => { bubble.textContent = "🎧"; bubble.classList.remove("playing"); isPlaying = false; }); }

bubble.addEventListener("click", () => { isPlaying ? pauseMusic() : playMusic(); });

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
let pendingNotifs = [];
const notifSound = document.getElementById("notifSound");
const badge = document.getElementById("notif-badge");
const listEl = document.getElementById("notif-list");

// User gesture pertama
document.addEventListener('click', () => {
    userInteracted = true;
    pendingNotifs.forEach(() => playNotifSound());
    pendingNotifs = [];
}, { once: true });

function playNotifSound() {
    if (!notifSound) return;
    notifSound.volume = 0.5;
    notifSound.currentTime = 0;
    notifSound.play().catch(() => console.log("Audio notif diblokir oleh browser"));
}

function showNotification(message) {
    const div = document.createElement("div");
    div.className = "notif-toast";
    div.textContent = message;
    document.body.appendChild(div);

    if (userInteracted) {
        playNotifSound();
    } else {
        pendingNotifs.push(message);
    }

    setTimeout(() => div.remove(), 5000);
}

async function loadNotif() {
    try {
        const res = await fetch("/notifications.json?_=" + Date.now());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = await res.json();
        const now = Date.now();

        data = data.filter(item => item.enabled &&
            (!item.expire || 
            (now - parseInt(localStorage.getItem("notif_" + btoa(item.text)) || now)) / 3600000 <= item.expire)
        );

        badge.style.display = data.length ? 'inline-block' : 'none';
        badge.textContent = data.length || "";

        listEl.innerHTML = data.length 
            ? data.map(item => `<li class="notif-item"><a href="${item.link || '#'}" target="_blank">${item.text}</a></li>`).join("") 
            : "<li>Tidak ada notifikasi</li>";

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
    setInterval(loadNotif, 5000);
});

// buka/tutup modal
window.openNotif = function() {
    document.getElementById("notifModal").style.display = "flex";
    badge.style.display = "none"; badge.textContent = "";
};
window.closeNotif = function() { document.getElementById("notifModal").style.display = "none"; };
window.addEventListener("click", e => { if (e.target === document.getElementById("notifModal")) closeNotif(); });

// ================== SERVICE WORKER ==================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[SW] Registered', reg))
        .catch(err => console.error('[SW] Failed', err));
}

// request permission notif
if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => console.log('Notification permission:', permission));
}