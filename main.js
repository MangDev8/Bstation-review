const bubble = document.getElementById("musicBubble");
const music = document.getElementById("bgMusic");

let isPlaying = false;

// klik balon musik
bubble.addEventListener("click", () => {
        if (!isPlaying) {
                music.play();
                bubble.textContent = "⏸"; // ganti ikon jadi pause
                bubble.classList.add("playing"); // tambahin animasi
                isPlaying = true;
        } else {
                music.pause();
                bubble.textContent = "🎵"; // ganti ikon jadi musik lagi
                bubble.classList.remove("playing"); // stop animasi
                isPlaying = false;
        }
});

// auto play waktu web dibuka
document.addEventListener("DOMContentLoaded", () => {
        music.play().then(() => {
                bubble.textContent = "⏸";
                bubble.classList.add("playing");
                isPlaying = true;
        }).catch(() => {
                console.log("Autoplay diblokir, klik balon untuk nyalain musik.");
        });
});


let volume = 0.0;
music.volume = volume;
music.play();

let fade = setInterval(() => {
        if (volume < 0.3) { // naik sampai 30%
                volume += 0.01;
                music.volume = volume;
        } else {
                clearInterval(fade);
        }
}, 200); // naik perlahan tiap 200ms


// adrop down list anime
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
