// ================= MUSIC BUBBLE =================
const bubble = document.getElementById("musicBubble");
const music = document.getElementById("bgMusic");
let isPlaying = false;

function playMusic() {
        music.play().then(() => {
                bubble.textContent = "⏸";
                bubble.classList.add("playing");
                isPlaying = true;
                
                // fade in volume
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
        }).catch(() => {
                console.log("Autoplay diblokir, klik balon untuk nyalain musik.");
        });
}

function pauseMusic() {
        music.pause();
        bubble.textContent = "🎵";
        bubble.classList.remove("playing");
        isPlaying = false;
}

bubble.addEventListener("click", () => {
        if (!isPlaying) {
                playMusic();
        } else {
                pauseMusic();
        }
});

document.addEventListener("DOMContentLoaded", playMusic);


// ================= DROPDOWN LIST ANIME =================
const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(drop => {
        const btn = drop.querySelector('.dropbtn');
        const content = drop.querySelector('.dropcontent');
        const arrow = drop.querySelector('.arrow');
        
        btn.addEventListener('click', () => {
                const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
                if (isOpen) {
                        content.style.maxHeight = '0';
                        arrow.style.transform = 'rotate(0deg)';
                } else {
                        content.style.maxHeight = content.scrollHeight + 'px';
                        arrow.style.transform = 'rotate(180deg)';
                }
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
async function loadNotif() {
        try {
                const res = await fetch("/notifications.json?_=" + Date.now());
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                let data = await res.json();
                const now = Date.now();
                
                console.log("Notif JSON asli:", data);
                
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
                
                console.log("Notif setelah filter:", data);
                
                // update badge
                const badge = document.getElementById("notif-badge");
                if (data.length > 0) {
                        badge.textContent = data.length;
                        badge.style.display = "inline-block";
                } else {
                        badge.style.display = "none";
                }
                
                // render list
                const listHTML = data.length ?
                        data.map(item => `<li class="notif-item"><a href="${item.link}" target="_blank">${item.text}</a></li>`).join("") :
                        "<li>Tidak ada notifikasi</li>";
                const listEl = document.getElementById("notif-list");
                if (listEl) {
                        listEl.innerHTML = listHTML;
                } else {
                        console.warn("Element #notif-list tidak ditemukan di DOM!");
                }
                
        } catch (e) {
                console.error("Gagal load notifikasi", e);
                const listEl = document.getElementById("notif-list");
                if (listEl) listEl.innerHTML = "<li>Error load</li>";
        }
}

// load pertama kali setelah DOM siap
document.addEventListener("DOMContentLoaded", loadNotif);

// refresh tiap 30 detik
setInterval(loadNotif, 30000);

function openNotif() {
        const modal = document.getElementById("notifModal");
        if (modal) modal.style.display = "flex";
}

function closeNotif() {
        const modal = document.getElementById("notifModal");
        if (modal) modal.style.display = "none";
}

// tutup modal kalau klik luar card
window.addEventListener("click", e => {
        const modal = document.getElementById("notifModal");
        if (modal && e.target === modal) {
                modal.style.display = "none";
        }
});


// buka modal notif
function openNotif() {
        const modal = document.getElementById("notifModal");
        const badge = document.getElementById("notif-badge");
        
        if (modal) modal.style.display = "flex";
        
        // reset badge saat dibuka
        if (badge) {
                badge.style.display = "none";
                badge.textContent = "";
        }
}

// update badge
const badge = document.getElementById("notif-badge");
if (data.length > 0) {
        badge.textContent = data.length;
        badge.style.display = "inline-block";
} else {
        badge.style.display = "none";
}

//suara notifikasi
const notifSound = document.getElementById("notifSound");

function showNotification(message) {
        // Contoh notifikasi visual
        const notif = document.createElement("div");
        notif.className = "notif-container";
        notif.textContent = message;
        document.body.appendChild(notif);
        
        // Set volume sebelum mainkan
        notifSound.volume = 0.5; // 50% volume
        notifSound.play().catch(err => {
                console.log("Gagal mainkan audio:", err);
        });
        
        // Hapus notifikasi setelah 5 detik
        setTimeout(() => {
                notif.remove();
        }, 5000);
}

// Contoh panggilan
showNotification("Pesan baru masuk!");