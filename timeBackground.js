(function() {

    /* ═══════════════════════════════════════════
       PERIOD CYCLING (every 3 min)
       ═══════════════════════════════════════════ */
    const periodOrder = ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'];
    let currentPeriodIndex = -1;
    const BG_INTERVAL = 3 * 60 * 1000;
    let nextBgChange = Date.now();

    const bgLayer = document.getElementById('bgLayer');
    const starsCanvas = document.getElementById('starsLayer');
    const particleCanvas = document.getElementById('particleCanvas');
    const weatherCanvas = document.getElementById('weatherCanvas');
    const celestialCanvas = document.getElementById('celestialCanvas');
    const gameClockEl = document.getElementById('gameClockTime');
    const realClockEl = document.getElementById('realClockTime');
    const periodLabel = document.getElementById('periodLabel');
    const weatherLabel = document.getElementById('weatherLabel');
    const dots = document.querySelectorAll('.time-dot');

    let currentPeriod = '';

    function applyGradient(period) {
        const gradients = {
            dawn: 'linear-gradient(180deg, #06040d 0%, #0d0b1f 25%, #1a0a2e 50%, #2d1205 80%, #3d2a0a 100%)',
            morning: 'linear-gradient(180deg, #0a1525 0%, #0f2040 40%, #1a3a5c 70%, #2a2510 100%)',
            noon: 'linear-gradient(180deg, #0a1830 0%, #0f2848 35%, #1a3a55 65%, #252515 100%)',
            afternoon: 'linear-gradient(180deg, #0a1525 0%, #1a1040 30%, #2d1508 65%, #302008 100%)',
            evening: 'linear-gradient(180deg, #050a12 0%, #0f0e25 30%, #1a0a35 55%, #251005 85%, #1a0a0a 100%)',
            night: 'linear-gradient(180deg, #020308 0%, #040610 40%, #08081a 70%, #0a0d15 100%)'
        };
        bgLayer.style.background = gradients[period];
    }

    function advancePeriod() {
        currentPeriodIndex = (currentPeriodIndex + 1) % periodOrder.length;
        currentPeriod = periodOrder[currentPeriodIndex];
        applyGradient(currentPeriod);

        const isNight = currentPeriod === 'night' || currentPeriod === 'evening' || currentPeriod === 'dawn';
        starsCanvas.style.opacity = isNight ? '1' : '0';

        periodLabel.textContent = currentPeriod;
        dots.forEach(d => {
            d.classList.toggle('active', d.dataset.period === currentPeriod);
        });
    }

    function updateBackground() {
        const now = Date.now();

        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        realClockEl.textContent = hh + ':' + mm + ':' + ss;

        if (now >= nextBgChange || currentPeriodIndex === -1) {
            advancePeriod();
            nextBgChange = now + BG_INTERVAL;
        }
    }

    /* ═══════════════════════════════════════════
       STARS
       ═══════════════════════════════════════════ */
    let stars = [];
    function initStars() {
        starsCanvas.width = window.innerWidth;
        starsCanvas.height = window.innerHeight;
        stars = [];
        const count = Math.floor((starsCanvas.width * starsCanvas.height) / 4000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * starsCanvas.width,
                y: Math.random() * starsCanvas.height,
                r: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 0.02 + 0.005,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function drawStars(time) {
        if (starsCanvas.style.opacity === '0') return;
        const ctx = starsCanvas.getContext('2d');
        ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
        for (const s of stars) {
            const flicker = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
            ctx.globalAlpha = flicker;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    /* ═══════════════════════════════════════════
       SUN / MOON / CLOUDS
       ═══════════════════════════════════════════ */
    let celestialBody = null; // sun or moon
    let clouds = [];

    function isDaytime() {
        return ['morning', 'noon', 'afternoon'].includes(currentPeriod);
    }

    function updateCelestial() {
        const w = celestialCanvas.width;
        const h = celestialCanvas.height;

        const isDay = isDaytime();

        if (isDay) {
            // Sun: arc from bottom-left to bottom-right across top
            const progress = getPeriodProgress();
            const sunX = w * 0.1 + w * 0.8 * progress;
            const sunY = h * 0.35 - Math.sin(progress * Math.PI) * h * 0.25;
            celestialBody = {
                type: 'sun',
                x: sunX,
                y: sunY,
                r: 35,
                glowR: 80
            };
        } else {
            // Moon: visible at night/evening/dawn, arc across sky
            if (currentPeriod === 'night') {
                const progress = getPeriodProgress();
                const moonX = w * 0.15 + w * 0.7 * progress;
                const moonY = h * 0.25 - Math.sin(progress * Math.PI) * h * 0.18;
                celestialBody = {
                    type: 'moon',
                    x: moonX,
                    y: moonY,
                    r: 25
                };
            } else if (currentPeriod === 'dawn') {
                const progress = getPeriodProgress();
                const moonX = w * 0.7 + w * 0.3 * progress;
                const moonY = h * 0.2 - Math.sin(progress * Math.PI) * h * 0.12;
                celestialBody = {
                    type: 'moon',
                    x: moonX,
                    y: moonY,
                    r: 22
                };
            } else if (currentPeriod === 'evening') {
                const progress = getPeriodProgress();
                const moonX = w * 0.05 + w * 0.4 * progress;
                const moonY = h * 0.3 - Math.sin(progress * Math.PI) * h * 0.15;
                celestialBody = {
                    type: 'moon',
                    x: moonX,
                    y: moonY,
                    r: 24
                };
            }
        }

        // Clouds: count and darkness depends on weather + period
        if (currentWeather === 'storm' || currentWeather === 'rain' || currentWeather === 'drizzle') {
            if (clouds.length === 0) {
                const cloudCount = currentWeather === 'storm' ? 15 : currentWeather === 'rain' ? 12 : 8;
                for (let i = 0; i < cloudCount; i++) {
                    clouds.push({
                        x: Math.random() * w,
                        y: Math.random() * h * 0.4 + h * 0.05,
                        w: Math.random() * 180 + 100,
                        h: Math.random() * 40 + 25,
                        speed: Math.random() * 0.5 + 0.3,
                        puffs: generateCloudPuffs(Math.random() * 180 + 100, Math.random() * 40 + 25),
                        alpha: currentWeather === 'storm' ? 0.18 : 0.1
                    });
                }
            }
        } else if (currentPeriod === 'night' || currentPeriod === 'evening') {
            clouds = [];
        } else {
            if (clouds.length === 0) {
                for (let i = 0; i < 5; i++) {
                    clouds.push({
                        x: Math.random() * w,
                        y: Math.random() * h * 0.35 + h * 0.05,
                        w: Math.random() * 120 + 80,
                        h: Math.random() * 30 + 20,
                        speed: Math.random() * 0.3 + 0.15,
                        puffs: generateCloudPuffs(Math.random() * 120 + 80, Math.random() * 30 + 20),
                        alpha: 0.06
                    });
                }
            }
        }
    }

    function generateCloudPuffs(w, h) {
        const puffs = [];
        const count = Math.floor(w / 25);
        for (let i = 0; i < count; i++) {
            puffs.push({
                ox: (i / count) * w + (Math.random() - 0.5) * 20,
                oy: (Math.random() - 0.5) * h * 0.5,
                r: Math.random() * 18 + 15
            });
        }
        return puffs;
    }

    function drawCelestial() {
        const ctx = celestialCanvas.getContext('2d');
        const w = celestialCanvas.width;
        const h = celestialCanvas.height;
        ctx.clearRect(0, 0, w, h);

        // Sun
        if (celestialBody && celestialBody.type === 'sun') {
            const sun = celestialBody;

            // Glow
            const glow = ctx.createRadialGradient(sun.x, sun.y, sun.r * 0.5, sun.x, sun.y, sun.glowR);
            glow.addColorStop(0, 'rgba(255, 200, 80, 0.25)');
            glow.addColorStop(0.5, 'rgba(255, 180, 50, 0.08)');
            glow.addColorStop(1, 'rgba(255, 150, 30, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, sun.glowR, 0, Math.PI * 2);
            ctx.fill();

            // Rays
            ctx.save();
            ctx.globalAlpha = 0.08;
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2 + Date.now() * 0.0003;
                ctx.beginPath();
                ctx.moveTo(sun.x, sun.y);
                ctx.lineTo(
                    sun.x + Math.cos(angle) * sun.glowR,
                    sun.y + Math.sin(angle) * sun.glowR
                );
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#fbbf24';
                ctx.stroke();
            }
            ctx.restore();

            // Sun body
            const bodyGrad = ctx.createRadialGradient(sun.x - 5, sun.y - 5, 0, sun.x, sun.y, sun.r);
            bodyGrad.addColorStop(0, '#fff5cc');
            bodyGrad.addColorStop(0.5, '#fbbf24');
            bodyGrad.addColorStop(1, '#d97706');
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
            ctx.fillStyle = bodyGrad;
            ctx.fill();
        }

        // Moon
        if (celestialBody && celestialBody.type === 'moon') {
            const moon = celestialBody;

            // Glow
            const glow = ctx.createRadialGradient(moon.x, moon.y, moon.r * 0.3, moon.x, moon.y, moon.r * 3);
            glow.addColorStop(0, 'rgba(180, 200, 255, 0.15)');
            glow.addColorStop(1, 'rgba(150, 170, 220, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(moon.x, moon.y, moon.r * 3, 0, Math.PI * 2);
            ctx.fill();

            // Moon body
            ctx.beginPath();
            ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);
            ctx.fillStyle = '#c8d8f0';
            ctx.fill();

            // Crescent shadow
            ctx.beginPath();
            ctx.arc(moon.x + 8, moon.y - 3, moon.r - 2, 0, Math.PI * 2);
            const bg = currentPeriod === 'night' ? '#020308' : '#050a12';
            ctx.fillStyle = bg;
            ctx.globalAlpha = 0.6;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Clouds
        if (clouds.length > 0) {
            for (const c of clouds) {
                c.x += c.speed;
                if (c.x > w + c.w) c.x = -c.w;

                for (const p of c.puffs) {
                    // Cloud color based on weather
                    let cr, cg, cb;
                    if (currentWeather === 'storm') {
                        cr = 45; cg = 45; cb = 55;
                    } else if (currentWeather === 'rain' || currentWeather === 'drizzle') {
                        cr = 80; cg = 85; cb = 95;
                    } else if (currentPeriod === 'night' || currentPeriod === 'evening') {
                        cr = 30; cg = 32; cb = 40;
                    } else {
                        cr = 160; cg = 155; cb = 145;
                    }

                    ctx.globalAlpha = c.alpha;
                    ctx.beginPath();
                    ctx.arc(c.x + p.ox, c.y + p.oy, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        }
    }

    let _periodStartTime = Date.now();
    function getPeriodProgress() {
        return Math.min(1, (Date.now() - _periodStartTime) / BG_INTERVAL);
    }

    /* ═══════════════════════════════════════════
       FLOATING PARTICLES
       ═══════════════════════════════════════════ */
    let particles = [];
    function initParticles() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 35; i++) {
            particles.push({
                x: Math.random() * particleCanvas.width,
                y: Math.random() * particleCanvas.height,
                r: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.5 - 0.1,
                alpha: Math.random() * 0.15 + 0.03,
                alphaDir: (Math.random() - 0.5) * 0.002
            });
        }
    }

    function drawParticles() {
        const ctx = particleCanvas.getContext('2d');
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha += p.alphaDir;
            if (p.alpha > 0.18 || p.alpha < 0.02) p.alphaDir *= -1;
            if (p.y < -10) { p.y = particleCanvas.height + 10; p.x = Math.random() * particleCanvas.width; }
            if (p.x < -10) p.x = particleCanvas.width + 10;
            if (p.x > particleCanvas.width + 10) p.x = -10;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    /* ═══════════════════════════════════════════
       WEATHER SYSTEM
       ═══════════════════════════════════════════ */
    const weatherTypes = ['none', 'none', 'none', 'drizzle', 'rain', 'rain', 'storm', 'fog', 'snow'];
    const weatherNames = {
        none: '',
        drizzle: 'drizzle',
        rain: 'rain',
        storm: 'storm',
        fog: 'fog',
        snow: 'snow'
    };
    let currentWeather = 'none';
    let weatherDrops = [];
    let weatherFog = [];
    let weatherSnow = [];
    let lightning = { active: false, alpha: 0, timer: 0 };

    function pickWeather() {
        currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        weatherLabel.textContent = weatherNames[currentWeather] || '';
        clouds = []; // Recalculate clouds with new weather
        initWeather();
    }

    function initWeather() {
        weatherCanvas.width = window.innerWidth;
        weatherCanvas.height = window.innerHeight;
        weatherDrops = [];
        weatherFog = [];
        weatherSnow = [];
        lightning = { active: false, alpha: 0, timer: 0 };

        const w = weatherCanvas.width;
        const h = weatherCanvas.height;

        if (currentWeather === 'rain' || currentWeather === 'drizzle') {
            const count = currentWeather === 'rain' ? 180 : 60;
            const speed = currentWeather === 'rain' ? 12 : 5;
            for (let i = 0; i < count; i++) {
                weatherDrops.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    len: Math.random() * 15 + 10,
                    speed: speed + Math.random() * 4,
                    alpha: Math.random() * 0.2 + 0.1
                });
            }
        }

        if (currentWeather === 'storm') {
            for (let i = 0; i < 280; i++) {
                weatherDrops.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    len: Math.random() * 20 + 12,
                    speed: 16 + Math.random() * 6,
                    alpha: Math.random() * 0.3 + 0.15
                });
            }
        }

        if (currentWeather === 'fog') {
            for (let i = 0; i < 8; i++) {
                weatherFog.push({
                    y: Math.random() * h,
                    h: Math.random() * 80 + 40,
                    speed: Math.random() * 0.3 + 0.1,
                    alpha: Math.random() * 0.08 + 0.04,
                    x: Math.random() * w
                });
            }
        }

        if (currentWeather === 'snow') {
            for (let i = 0; i < 100; i++) {
                weatherSnow.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 3 + 1,
                    speed: Math.random() * 1.5 + 0.5,
                    drift: Math.random() * Math.PI * 2,
                    driftSpeed: Math.random() * 0.02 + 0.01,
                    alpha: Math.random() * 0.5 + 0.3
                });
            }
        }
    }

    function drawWeather() {
        const ctx = weatherCanvas.getContext('2d');
        const w = weatherCanvas.width;
        const h = weatherCanvas.height;
        ctx.clearRect(0, 0, w, h);

        if (currentWeather === 'rain' || currentWeather === 'drizzle' || currentWeather === 'storm') {
            const wind = currentWeather === 'storm' ? 4 : 1;
            for (const d of weatherDrops) {
                d.y += d.speed;
                d.x += wind;
                if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
                if (d.x > w) d.x = 0;
                ctx.globalAlpha = d.alpha;
                ctx.strokeStyle = '#a0c4e8';
                ctx.lineWidth = currentWeather === 'storm' ? 1.5 : 1;
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + wind * 2, d.y + d.len);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        if (currentWeather === 'storm') {
            if (!lightning.active && Math.random() < 0.002) {
                lightning.active = true;
                lightning.alpha = 0.15 + Math.random() * 0.1;
                lightning.timer = 4;
            }
            if (lightning.active) {
                ctx.globalAlpha = lightning.alpha;
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, w, h);
                lightning.timer--;
                if (lightning.timer <= 0) {
                    lightning.active = false;
                    lightning.alpha = 0;
                }
            }
            ctx.globalAlpha = 1;
        }

        if (currentWeather === 'fog') {
            for (const f of weatherFog) {
                f.x += f.speed;
                if (f.x > w + 200) f.x = -200;
                const grad = ctx.createLinearGradient(0, f.y, 0, f.y + f.h);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(0.5, `rgba(160, 170, 180, ${f.alpha})`);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fillRect(0, f.y, w, f.h);
            }
        }

        if (currentWeather === 'snow') {
            for (const s of weatherSnow) {
                s.y += s.speed;
                s.drift += s.driftSpeed;
                s.x += Math.sin(s.drift) * 0.5;
                if (s.y > h + 10) { s.y = -5; s.x = Math.random() * w; }
                ctx.globalAlpha = s.alpha;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }

    /* ═══════════════════════════════════════════
       GAME CLOCK
       ═══════════════════════════════════════════ */
    function formatGameTime(secs) {
        const total = Math.floor(secs);
        if (total >= 31536000000) {
            const mill = Math.floor(total / 31536000000);
            const c = Math.floor((total % 31536000000) / 3153600000);
            return mill + 'M ' + c + 'C';
        }
        if (total >= 3153600000) {
            const c = Math.floor(total / 3153600000);
            const y = Math.floor((total % 3153600000) / 31536000);
            return c + 'C ' + y + 'Y';
        }
        if (total >= 31536000) {
            const y = Math.floor(total / 31536000);
            const d = Math.floor((total % 31536000) / 86400);
            return y + 'Y ' + d + 'D';
        }
        if (total >= 86400) {
            const d = Math.floor(total / 86400);
            const rem = total % 86400;
            const h = Math.floor(rem / 3600);
            const m = Math.floor((rem % 3600) / 60);
            const s = rem % 60;
            return d + 'd ' +
                String(h).padStart(2, '0') + ':' +
                String(m).padStart(2, '0') + ':' +
                String(s).padStart(2, '0');
        }
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');
    }

    /* ═══════════════════════════════════════════
       MAIN LOOP
       ═══════════════════════════════════════════ */
    function loop(time) {
        drawStars(time);
        drawCelestial();
        drawParticles();
        drawWeather();

        if (typeof playerClicks !== 'undefined') {
            gameClockEl.textContent = formatGameTime(playerClicks);
        }

        requestAnimationFrame(loop);
    }

    /* ═══════════════════════════════════════════
       INIT
       ═══════════════════════════════════════════ */
    updateBackground();
    _periodStartTime = Date.now();
    initStars();
    initParticles();
    pickWeather();

    setInterval(updateBackground, 500);

    // Periodic cloud refresh so they update when weather changes
    setInterval(() => {
        clouds = [];
        updateCelestial();
    }, 15000);

    function scheduleWeather() {
        const delay = (120 + Math.random() * 180) * 1000;
        setTimeout(() => {
            pickWeather();
            scheduleWeather();
        }, delay);
    }
    scheduleWeather();

    window.addEventListener('resize', () => {
        initStars();
        initParticles();
        celestialCanvas.width = window.innerWidth;
        celestialCanvas.height = window.innerHeight;
        clouds = [];
        updateCelestial();
    });

    // Init celestial canvas
    celestialCanvas.width = window.innerWidth;
    celestialCanvas.height = window.innerHeight;
    updateCelestial();

    requestAnimationFrame(loop);

})();
