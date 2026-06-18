document.addEventListener('DOMContentLoaded', () => {

const cards = Array.from(document.querySelectorAll('.card'));
let current = 0;

function updateStack() {
    cards.forEach(card => card.classList.remove('active', 'behind-1', 'behind-2'));
    const total = cards.length;
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
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        current = (current + 1) % cards.length; updateStack();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        current = (current - 1 + cards.length) % cards.length; updateStack();
    }
});

updateStack();


const canvas = document.getElementById('bg-rain');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const drops = Array.from({ length: 130 }, () => ({
        x:       Math.random() * window.innerWidth,
        y:       Math.random() * window.innerHeight,
        len:     Math.random() * 18 + 8,
        speed:   Math.random() * 3 + 2,
        opacity: Math.random() * 0.4 + 0.15,
    }));

    (function drawRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drops.forEach(d => {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - 1, d.y + d.len);
            ctx.strokeStyle = `rgba(255, 255, 255, ${d.opacity})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            d.y += d.speed;
            if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
        });
        requestAnimationFrame(drawRain);
    })();
}



if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {


    const PHOTOS = [
        'photo1.jpg',
        'photo2.jpg',
        'photo3.jpg',
        'photo4.jpg',
        'photo5.jpg',
        'photo6.jpg',
        'photo7.png',
        'photo8.png'
    ];

    const POOL_SIZE     = 5;
    const MIN_INTERVAL  = 1800;
    const MAX_INTERVAL  = 3400;
    const STAY_DURATION = 3200;
    const FADE_MS       = 700;

    const style = document.createElement('style');
    style.textContent = `
        .polaroid-floater {
            position: fixed;
            z-index: 2;
            pointer-events: none;
            user-select: none;
            background: #fff;
            padding: 10px 10px 32px 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10);
            border-radius: 3px;
            opacity: 0;
            transition: opacity ${FADE_MS}ms ease;
            will-change: transform, opacity;
            top: 0; left: 0;
        }
        .polaroid-floater img {
            display: block;
            width: 140px;
            height: 140px;
            object-fit: cover;
        }
        .polaroid-floater .pol-label {
            text-align: center;
            font-family: 'Quicksand', sans-serif;
            font-size: 11px;
            color: #bbb;
            margin-top: 6px;
            letter-spacing: 0.5px;
        }
        .polaroid-floater:hover{
            width: 170px;
            height: 170px;
        }
    `;
    document.head.appendChild(style);


    let queue = [];
    function nextPhoto() {
        if (!queue.length) queue = [...PHOTOS].sort(() => Math.random() - 0.5);
        return queue.pop();
    }


    function overlapsPanel(x, y, w, h) {
        const panel = document.querySelector('.panel');
        if (!panel) return false;
        const r = panel.getBoundingClientRect();
        const m = 40;
        return !(x + w < r.left - m || x > r.right + m || y + h < r.top - m || y > r.bottom + m);
    }

    function randomPos(w, h) {
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * (window.innerWidth  - w);
            const y = Math.random() * (window.innerHeight - h - 50) + 40;
            if (!overlapsPanel(x, y, w, h)) return { x, y };
        }

        const left = Math.random() < 0.5;
        return {
            x: left ? Math.random() * 100 : window.innerWidth - w - Math.random() * 100,
            y: Math.random() * (window.innerHeight - h - 60) + 40,
        };
    }


    const pool = Array.from({ length: POOL_SIZE }, () => {
        const el = document.createElement('div');
        el.className = 'polaroid-floater';
        el.innerHTML = `<img src="" alt=""><div class="pol-label">♡</div>`;
        document.body.appendChild(el);
        return { el, busy: false };
    });

    function spawn() {
        const slot = pool.find(p => !p.busy);
        if (!slot) return;

        const W = 160, H = 196;
        const { x, y } = randomPos(W, H);
        const tilt = (Math.random() * 14 - 7).toFixed(1);

        slot.el.querySelector('img').src = nextPhoto();
        slot.el.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg)`;
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