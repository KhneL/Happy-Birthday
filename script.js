document.addEventListener('DOMContentLoaded', () => {

// ─── Card stack ───────────────────────────────────────────────────────────────
const cards = Array.from(document.querySelectorAll('.card'));
let current = 0;

function updateStack() {
    const total = cards.length;
    cards.forEach(card => card.classList.remove('active', 'behind-1', 'behind-2'));
    cards[current % total].classList.add('active');
    cards[(current + 1) % total].classList.add('behind-1');
    cards[(current + 2) % total].classList.add('behind-2');
}

document.getElementById('next').addEventListener('click', () => {
    current = (current + 1) % cards.length;
    updateStack();
});
document.getElementById('prev').addEventListener('click', () => {
    current = (current - 1 + cards.length) % cards.length;
    updateStack();
});
document.addEventListener('keydown', e => {
    if      (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        { current = (current + 1) % cards.length; updateStack(); }
    else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')
        { current = (current - 1 + cards.length) % cards.length; updateStack(); }
});

updateStack();

// ─── Rain ─────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('bg-rain');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drops = Array.from({ length: 130 }, () => ({
        x:       Math.random() * window.innerWidth,
        y:       Math.random() * window.innerHeight,
        len:     Math.random() * 18 + 8,
        speed:   Math.random() * 3 + 2,
        opacity: Math.random() * 0.4 + 0.15,
    }));

    (function drawRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const d of drops) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - 1, d.y + d.len);
            ctx.strokeStyle = `rgba(255,255,255,${d.opacity})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            d.y += d.speed;
            if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
        }
        requestAnimationFrame(drawRain);
    })();
}

// ─── Music — auto-plays on first tap anywhere, no controls ───────────────────
/*
  HOW TO USE:
  1. Put your audio file in the same folder as index.html.
  2. Edit SONG below: set src to your filename and title to the song name.
  3. That's it — music starts the moment the user first taps/clicks anything.
*/
(function () {
    const SONG = { src: 'Kita.mp3', title: 'Kita' };

    const audio = new Audio(SONG.src);
    audio.volume = 0.7;
    audio.loop   = true;    // plays forever, no stop button

    // ── Floating label (♪ + song name, no controls) ──────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #music-label {
            position: fixed;
            bottom: 18px;
            right: 18px;
            z-index: 500;
            display: flex;
            align-items: center;
            gap: 7px;
            background: rgba(255,255,255,0.22);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1.5px solid rgba(255,255,255,0.5);
            border-radius: 999px;
            padding: 7px 14px;
            box-shadow: 0 4px 18px rgba(180,80,180,0.18);
            pointer-events: none;
            user-select: none;
        }
        #mp-note {
            font-size: 14px;
            animation: mp-pulse 1.8s ease-in-out infinite;
        }
        @keyframes mp-pulse {
            0%, 100% { transform: scale(1);    opacity: 0.7; }
            50%       { transform: scale(1.22); opacity: 1;   }
        }
        #mp-title {
            font-family: 'Quicksand', sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: rgba(80,0,80,0.85);
            white-space: nowrap;
            max-width: 130px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(style);

    const label = document.createElement('div');
    label.id = 'music-label';
    label.innerHTML = `<span id="mp-note">♪</span><span id="mp-title">${SONG.title}</span>`;
    document.body.appendChild(label);

    // ── Start on first user interaction (browser autoplay policy) ────────────
    let started = false;
    function start() {
        if (started) return;
        started = true;
        audio.play().catch(() => {});
        // Remove listeners once triggered
        document.removeEventListener('click',      start);
        document.removeEventListener('touchstart', start);
        document.removeEventListener('keydown',    start);
    }

    document.addEventListener('click',      start, { once: true });
    document.addEventListener('touchstart', start, { once: true });
    document.addEventListener('keydown',    start, { once: true });

})();

// ─── Polaroid floaters ────────────────────────────────────────────────────────
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

    const PHOTOS = [
        'photo1.jpg','photo2.jpg','photo3.jpg','photo4.jpg',
        'photo5.jpg','photo6.jpg','photo7.png','photo8.png',
        'photo9.jpg','photo10.jpg','photo11.jpg'
    ];

    const POOL_SIZE     = 5;
    const MIN_INTERVAL  = 1800;
    const MAX_INTERVAL  = 3400;
    const STAY_DURATION = 3200;
    const FADE_MS       = 700;

    function polaroidSize() {
        const img = Math.min(150, Math.max(72, window.innerWidth * 0.17));
        return { img, W: img + 16, H: img + 40 };
    }

    const style = document.createElement('style');
    style.textContent = `
        .polaroid-floater {
            position: fixed;
            z-index: 2;
            pointer-events: none;
            user-select: none;
            background: #fff;
            padding: 8px 8px 36px 8px;
            box-shadow: 0 8px 28px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10);
            border-radius: 3px;
            opacity: 0;
            transition: opacity ${FADE_MS}ms ease;
            will-change: transform, opacity;
            top: 0; left: 0;
        }
        .polaroid-floater img {
            display: block;
            object-fit: cover;
            border-radius: 1px;
        }
        .polaroid-floater .pol-label {
            text-align: center;
            font-family: 'Quicksand', sans-serif;
            font-size: 13px;
            color: #ccc;
            margin-top: 7px;
            letter-spacing: 1px;
        }
    `;
    document.head.appendChild(style);

    let queue = [];
    function nextPhoto() {
        if (!queue.length) queue = [...PHOTOS].sort(() => Math.random() - 0.5);
        return queue.pop();
    }

    function overlapsUI(x, y, w, h) {
        const margin = 20;
        for (const sel of ['.panel', '.statsBar', '#music-player']) {
            const el = document.querySelector(sel);
            if (!el) continue;
            const r = el.getBoundingClientRect();
            if (!(x + w < r.left - margin || x > r.right  + margin ||
                  y + h < r.top  - margin || y > r.bottom + margin)) return true;
        }
        return false;
    }

    function randomPos(W, H) {
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * (window.innerWidth  - W);
            const y = Math.random() * (window.innerHeight - H - 50) + 40;
            if (!overlapsUI(x, y, W, H)) return { x, y };
        }
        const goLeft = Math.random() < 0.5;
        return {
            x: goLeft
                ? Math.max(0, Math.random() * (window.innerWidth * 0.12))
                : Math.min(window.innerWidth - W, window.innerWidth * 0.88 + Math.random() * (window.innerWidth * 0.12 - W)),
            y: Math.random() * (window.innerHeight - H - 60) + 40,
        };
    }

    const pool = Array.from({ length: POOL_SIZE }, () => {
        const el = document.createElement('div');
        el.className = 'polaroid-floater';
        el.innerHTML = `<img src="" alt="photo"><div class="pol-label">♡</div>`;
        document.body.appendChild(el);
        return { el, busy: false };
    });

    function spawn() {
        const slot = pool.find(p => !p.busy);
        if (!slot) return;

        const { img, W, H } = polaroidSize();
        const { x, y }      = randomPos(W, H);
        const tilt           = (Math.random() * 14 - 7).toFixed(1);

        const imgEl = slot.el.querySelector('img');
        imgEl.src          = nextPhoto();
        imgEl.style.width  = img + 'px';
        imgEl.style.height = img + 'px';

        slot.el.style.transform = `translate(${x}px,${y}px) rotate(${tilt}deg)`;
        slot.el.style.opacity   = '0';
        slot.busy = true;

        requestAnimationFrame(() => requestAnimationFrame(() => {
            slot.el.style.opacity = '1';
        }));

        setTimeout(() => {
            slot.el.style.opacity = '0';
            setTimeout(() => { slot.busy = false; }, FADE_MS);
        }, STAY_DURATION + FADE_MS);
    }

    function loop() {
        spawn();
        setTimeout(loop, MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL));
    }

    setTimeout(() => spawn(), 200);
    setTimeout(() => spawn(), 900);
    setTimeout(() => spawn(), 1600);
    setTimeout(() => loop(), 2400);
}

});
