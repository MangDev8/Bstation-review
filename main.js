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

// pastikan musik sudah bisa di-play
music.addEventListener('canplaythrough', () => console.log("Audio siap dimainkan"));

// fade in
function fadeIn(audio, targetVolume = 0.3, step = 0.01, interval = 200) {
    audio.volume = 0;
    const fade = setInterval(() => {
        if (audio.volume < targetVolume) audio.volume = Math.min(audio.volume + step, targetVolume);
        else clearInterval(fade);
    }, interval);
}

// fade out
function fadeOut(audio, step = 0.01, interval = 200, callback) {
    const fade = setInterval(() => {
        if (audio.volume > 0) audio.volume = Math.max(audio.volume - step, 0);
        else { clearInterval(fade); audio.pause(); if (callback) callback(); }
    }, interval);
}

function playMusic() {
    if (!music.src) return console.error("Audio source tidak ditemukan!");
    music.play().then(() => {
        bubble.textContent = "⏸";
        bubble.classList.add("playing");
        isPlaying = true;
        fadeIn(music);
    }).catch(err => console.log("Klik balon untuk nyalain musik.", err));
}

function pauseMusic() {
    fadeOut(music, 0.01, 200, () => {
        bubble.textContent = "🎧";
        bubble.classList.remove("playing");
        isPlaying = false;
    });
}

// event klik user
bubble.addEventListener("click", () => isPlaying ? pauseMusic() : playMusic());

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
const notifSound = document.getElementById("notifSound");
const badge = document.getElementById("notif-badge");
const listEl = document.getElementById("notif-list");
let lastNotifKeys = new Set();

async function loadNotif() {
    try {
        const res = await fetch("/notifications.json?_=" + Date.now());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = await res.json();
        const now = Date.now();

        data = data.filter(item => item.enabled && (!item.expire || (now - (localStorage.getItem("notif_" + btoa(item.text)) || now)) / 3600000 <= item.expire));

        badge.style.display = data.length > 0 ? 'inline-block' : 'none';
        badge.textContent = data.length || "";

        listEl.innerHTML = data.length ? data.map(item => `<li class="notif-item"><a href="${item.link || '#'}" target="_blank">${item.text}</a></li>`).join("") : "<li>Tidak ada notifikasi</li>";

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

function showNotification(message) {
    const notif = document.createElement("div");
    notif.className = "notif-toast";
    notif.textContent = message;
    document.body.appendChild(notif);
    if (notifSound) {
        notifSound.volume = 0.5;
        notifSound.play().catch(err => console.log("Gagal mainkan audio:", err));
    }
    setTimeout(() => notif.remove(), 0);
}

document.addEventListener("DOMContentLoaded", () => {
    loadNotif();
    setInterval(loadNotif, 0);
});

// buka/tutup modal
function openNotif() { document.getElementById("notifModal").style.display = "flex"; badge.style.display = "none"; badge.textContent = ""; }
function closeNotif() { document.getElementById("notifModal").style.display = "none"; }
window.addEventListener("click", e => { if (e.target === document.getElementById("notifModal")) closeNotif(); });

// ================== SERVICE WORKER ==================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => console.log('[SW] Registered', reg)).catch(err => console.error('[SW] Failed', err));
}

// request permission notif
if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => console.log('Notification permission:', permission));
}

