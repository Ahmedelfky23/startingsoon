/**
 * ==========================================================================
 * PITTY OFFICIAL — STARTING SOON STREAMING SCENE
 * Scene Controller, Wind Physics, Strong Desert Dust & Tumbleweed Simulation
 * ==========================================================================
 */

window.SCENE_CONFIG = {
  channelName: 'PITTY OFFICIAL',
  tagline: 'PLAY ⚙ STREAM ⚙ CONQUER',
  subtitle: 'THE BROADCAST WILL BEGIN SHORTLY',
  socialHandle: '@pittyOfficial',
  socials: {
    twitch: '@pittyOfficial',
    youtube: '@pittyOfficial',
    tiktok: '@pittyOfficial',
    instagram: '@pittyOfficial'
  },
  statusText: 'TRANSMISSION STANDBY • STARTING SOON',
  countdownEnabled: false,
  countdownMinutes: 5,
  particleCount: 140,      // Strong dense dust motes
  dustPuffCount: 8,        // Large billowing sand clouds
  windGustCount: 10,       // Fast sand streaks
  tumbleweedIntervalMin: 7, // Faster spawn
  tumbleweedIntervalMax: 15
};

(function () {
  'use strict';

  const stage = document.getElementById('stream-stage');
  const canvas = document.getElementById('atmosphereCanvas');
  const ctx = canvas.getContext('2d');
  const statusTimeEl = document.getElementById('statusTime');
  const lanternGlow = document.getElementById('lanternLightCast');

  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  /* ==========================================================================
     1. RESPONSIVE OBS VIEWPORT SCALING
     ========================================================================== */
  function autoScaleStage() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scale = Math.min(windowWidth / CANVAS_WIDTH, windowHeight / CANVAS_HEIGHT);
    stage.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', autoScaleStage);
  autoScaleStage();

  /* ==========================================================================
     2. STREAM TIME CONTROLLER
     ========================================================================== */
  let elapsedSeconds = 0;
  let remainingSeconds = window.SCENE_CONFIG.countdownMinutes * 60;

  function updateStatusTimer() {
    if (!statusTimeEl) return;
    if (window.SCENE_CONFIG.countdownEnabled) {
      if (remainingSeconds > 0) remainingSeconds--;
      const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
      const secs = String(remainingSeconds % 60).padStart(2, '0');
      statusTimeEl.textContent = `${mins}:${secs}`;
    } else {
      elapsedSeconds++;
      const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(elapsedSeconds % 60).padStart(2, '0');
      statusTimeEl.textContent = `${mins}:${secs}`;
    }
  }

  setInterval(updateStatusTimer, 1000);
  updateStatusTimer();

  /* ==========================================================================
     3. STRONG DESERT DUST & WIND SIMULATION
     ========================================================================== */
  let windPower = 2.4;
  let gustCycleTimer = 0;

  // Tiny flying sand particles & glowing embers
  class DustParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * CANVAS_WIDTH : -40;
      this.y = Math.random() * CANVAS_HEIGHT;
      this.size = Math.random() * 3.5 + 0.8;
      this.vx = Math.random() * 2.8 + 1.6;
      this.vy = (Math.random() - 0.42) * 1.1;
      this.opacity = Math.random() * 0.65 + 0.25;
      this.baseOpacity = this.opacity;
      this.pulseSpeed = Math.random() * 0.04 + 0.02;
      this.pulseOffset = Math.random() * Math.PI * 2;

      const colors = [
        'rgba(255, 244, 212, ', // Cream
        'rgba(229, 168, 66, ',  // Brass Gold
        'rgba(213, 169, 93, ',  // Aged parchment
        'rgba(169, 84, 32, ',   // Burnt orange
        'rgba(140, 63, 28, '    // Rust
      ];
      this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
    }

    update(time, currentWind) {
      this.x += this.vx * currentWind;
      this.y += this.vy + Math.sin(time * 0.003 + this.pulseOffset) * 0.6;
      this.opacity = this.baseOpacity * (0.8 + 0.2 * Math.sin(time * this.pulseSpeed + this.pulseOffset));

      if (this.x > CANVAS_WIDTH + 40 || this.y < -40 || this.y > CANVAS_HEIGHT + 40) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.colorPrefix + this.opacity + ')';
      ctx.fill();
    }
  }

  // Large Billowing Sand & Dust Clouds (Atmospheric Depth)
  class DustPuff {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * CANVAS_WIDTH : -350;
      this.y = Math.random() * 450 + 550; // Lower half & ground dunes
      this.radius = Math.random() * 180 + 120;
      this.vx = (Math.random() * 1.2 + 0.8) * 1.2;
      this.alpha = Math.random() * 0.14 + 0.05;
    }

    update(currentWind) {
      this.x += this.vx * currentWind;
      if (this.x - this.radius > CANVAS_WIDTH + 100) {
        this.reset();
      }
    }

    draw(ctx) {
      const grad = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      grad.addColorStop(0, `rgba(213, 169, 93, ${this.alpha})`);
      grad.addColorStop(0.5, `rgba(169, 84, 32, ${this.alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(36, 21, 13, 0)');

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fast Desert Wind Streaks
  class WindGust {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * CANVAS_WIDTH : -250;
      this.y = Math.random() * (CANVAS_HEIGHT - 250) + 150;
      this.length = Math.random() * 200 + 120;
      this.vx = Math.random() * 6.5 + 4.5;
      this.alpha = Math.random() * 0.22 + 0.08;
      this.thickness = Math.random() * 2.8 + 1.2;
    }

    update(currentWind) {
      this.x += this.vx * (currentWind * 0.8);
      if (this.x > CANVAS_WIDTH + 350) {
        this.reset();
      }
    }

    draw(ctx) {
      const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.length, this.y);
      grad.addColorStop(0, 'rgba(213, 169, 93, 0)');
      grad.addColorStop(0.3, `rgba(255, 244, 212, ${this.alpha})`);
      grad.addColorStop(0.7, `rgba(213, 169, 93, ${this.alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(213, 169, 93, 0)');

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = this.thickness;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.length, this.y + 4);
      ctx.stroke();
    }
  }

  /* ==========================================================================
     4. REALISTIC BOUNCING TUMBLEWEED
     ========================================================================== */
  class Tumbleweed {
    constructor() {
      this.active = false;
      this.radius = 38;
      this.x = -120;
      this.y = 960;
      this.groundY = 970;
      this.vx = 0;
      this.vy = 0;
      this.rotation = 0;
      this.angularVelocity = 0;
      this.bounceDamping = 0.68;
      this.gravity = 0.24;
      this.branches = this.generateBranches();
    }

    generateBranches() {
      const branches = [];
      const branchCount = 32;
      for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const length = this.radius * (0.65 + Math.random() * 0.5);
        const subAngle = angle + (Math.random() - 0.5) * 0.9;
        const subLength = length * (0.4 + Math.random() * 0.45);
        branches.push({ angle, length, subAngle, subLength });
      }
      return branches;
    }

    spawn() {
      this.active = true;
      this.radius = Math.random() * 16 + 30;
      this.x = -80;
      this.groundY = 965 + Math.random() * 30;
      this.y = this.groundY - 120;
      this.vx = Math.random() * 2.4 + 3.2; // Faster tumble
      this.vy = -Math.random() * 3.0;
      this.angularVelocity = this.vx / this.radius;
      this.rotation = 0;
    }

    update(currentWind) {
      if (!this.active) return;

      this.x += this.vx * (currentWind * 0.75);
      this.vy += this.gravity;
      this.y += this.vy;

      // Bounce on desert ground
      if (this.y + this.radius >= this.groundY) {
        this.y = this.groundY - this.radius;
        this.vy = -Math.abs(this.vy) * this.bounceDamping;

        if (Math.abs(this.vy) < 1.4 && Math.random() < 0.25) {
          this.vy = -(Math.random() * 2.8 + 1.5);
        }
      }

      this.rotation += this.angularVelocity * currentWind;

      if (this.x - this.radius > CANVAS_WIDTH + 120) {
        this.active = false;
        scheduleNextTumbleweed();
      }
    }

    draw(ctx) {
      if (!this.active) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // Contact shadow
      ctx.save();
      ctx.rotate(-this.rotation);
      ctx.beginPath();
      const shadowDist = this.groundY - this.y;
      const shadowScale = Math.max(0.25, 1 - (shadowDist - this.radius) / 140);
      ctx.ellipse(4, shadowDist + 3, this.radius * 0.95 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20, 10, 5, ${0.5 * shadowScale})`;
      ctx.fill();
      ctx.restore();

      // Thorny branches
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#5E381A';

      for (let b of this.branches) {
        const x1 = Math.cos(b.angle) * b.length;
        const y1 = Math.sin(b.angle) * b.length;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x1, y1);

        const x2 = x1 + Math.cos(b.subAngle) * b.subLength;
        const y2 = y1 + Math.sin(b.subAngle) * b.subLength;
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Thorns
        const tx = x1 * 0.65;
        const ty = y1 * 0.65;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + Math.sin(b.angle) * 5, ty - Math.cos(b.angle) * 5);
        ctx.stroke();
      }

      // Dense tangle core
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 42, 18, 0.45)';
      ctx.fill();

      ctx.restore();
    }
  }

  // Uncanny Desert Dust Devil / Whirlwind (Jordan Peele "NOPE" Mystery Element)
  class DustDevil {
    constructor() {
      this.active = false;
      this.x = 0;
      this.baseY = 920;
      this.height = 300;
      this.vx = 1.4;
      this.particles = [];
      for (let i = 0; i < 48; i++) {
        this.particles.push({
          yRatio: Math.random(),
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.09 + 0.05,
          radiusScale: Math.random() * 0.35 + 0.8,
          size: Math.random() * 2.8 + 1.2,
          alpha: Math.random() * 0.35 + 0.12
        });
      }
    }

    spawn() {
      this.active = true;
      this.x = Math.random() < 0.5 ? -100 : 250 + Math.random() * 500;
      this.baseY = 920 + Math.random() * 40;
      this.height = 280 + Math.random() * 100;
      this.vx = (Math.random() * 1.1 + 0.8) * 1.4;
      this.life = 0;
      this.maxLife = 850; // ~14s
    }

    update(currentWind) {
      if (!this.active) return;
      this.life++;
      this.x += this.vx * (currentWind * 0.6);
      for (let p of this.particles) {
        p.angle += p.speed;
        p.yRatio -= 0.003;
        if (p.yRatio < 0) p.yRatio = 1;
      }
      if (this.life > this.maxLife || this.x > CANVAS_WIDTH + 180) {
        this.active = false;
        scheduleNextDustDevil();
      }
    }

    draw(ctx) {
      if (!this.active) return;
      const fadeIn = Math.min(this.life / 60, 1);
      const fadeOut = Math.min((this.maxLife - this.life) / 60, 1);
      const alphaMul = Math.min(fadeIn, fadeOut);

      for (let p of this.particles) {
        // Funnel shape: wider at top, narrower at ground
        const currentRadius = (16 + p.yRatio * 52) * p.radiusScale;
        const px = this.x + Math.cos(p.angle) * currentRadius;
        const py = this.baseY - (p.yRatio * this.height);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(213, 169, 93, ${p.alpha * alphaMul * 0.5})`;
        ctx.fill();
      }
    }
  }

  // Populate Simulation
  const dustParticles = [];
  for (let i = 0; i < window.SCENE_CONFIG.particleCount; i++) {
    dustParticles.push(new DustParticle());
  }

  const dustPuffs = [];
  for (let i = 0; i < window.SCENE_CONFIG.dustPuffCount; i++) {
    dustPuffs.push(new DustPuff());
  }

  const windGusts = [];
  for (let i = 0; i < window.SCENE_CONFIG.windGustCount; i++) {
    windGusts.push(new WindGust());
  }

  const tumbleweed = new Tumbleweed();
  const dustDevil = new DustDevil();

  function scheduleNextTumbleweed() {
    const minSec = window.SCENE_CONFIG.tumbleweedIntervalMin;
    const maxSec = window.SCENE_CONFIG.tumbleweedIntervalMax;
    const delay = (Math.random() * (maxSec - minSec) + minSec) * 1000;
    setTimeout(() => {
      tumbleweed.spawn();
    }, delay);
  }

  function scheduleNextDustDevil() {
    const delay = (Math.random() * 20 + 15) * 1000; // Every 15-35s
    setTimeout(() => {
      dustDevil.spawn();
    }, delay);
  }

  setTimeout(() => {
    tumbleweed.spawn();
  }, 2500);

  setTimeout(() => {
    dustDevil.spawn();
  }, 8000);

  /* ==========================================================================
     5. DYNAMIC GUSTS & LANTERN FLICKER
     ========================================================================= */
  let lastLanternUpdate = 0;
  function updateLanternGlow(time) {
    if (!lanternGlow) return;
    if (time - lastLanternUpdate > 90) {
      lastLanternUpdate = time;
      const rnd = Math.random();
      const opacity = 0.75 + rnd * 0.25;
      const scale = 0.98 + rnd * 0.06;
      lanternGlow.style.opacity = opacity.toFixed(2);
      lanternGlow.style.transform = `translate(50%, -50%) scale(${scale.toFixed(3)})`;
    }
  }

  /* ==========================================================================
     6. MAIN ANIMATION LOOP (60 FPS)
     ========================================================================== */
  function animate(timestamp) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Wind gust cycle (rises and falls naturally)
    gustCycleTimer += 0.015;
    const currentWind = windPower + Math.sin(gustCycleTimer) * 0.8 + (Math.random() - 0.5) * 0.3;

    // 1. Billowing Sand Puffs (Back layer of atmosphere)
    for (let puff of dustPuffs) {
      puff.update(currentWind);
      puff.draw(ctx);
    }

    // 2. High-speed Wind Streaks
    for (let g of windGusts) {
      g.update(currentWind);
      g.draw(ctx);
    }

    // 3. Desert Dust Devil (Whirlwind vortex)
    dustDevil.update(currentWind);
    dustDevil.draw(ctx);

    // 4. Dense Sand & Dust Motes
    for (let p of dustParticles) {
      p.update(timestamp, currentWind);
      p.draw(ctx);
    }

    // 5. Tumbleweed
    tumbleweed.update(currentWind);
    tumbleweed.draw(ctx);

    // 6. Dynamic Lantern Cast Light
    updateLanternGlow(timestamp);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

})();

/* ==========================================================================
   TITLE SPARKS CANVAS — Forge Ember Shower from "STARTING SOON"
   ========================================================================== */
(function () {
  'use strict';

  const canvas = document.getElementById('titleSparksCanvas');
  if (!canvas) return;

  // Size the canvas to match its CSS-rendered element
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  || 900;
    canvas.height = rect.height || 250;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const ctx = canvas.getContext('2d');

  // Spark colors — brass, ember, gold, white-hot
  const SPARK_COLORS = [
    [255, 220, 80],   // bright gold
    [255, 160, 40],   // orange ember
    [255, 80,  20],   // red ember
    [255, 255, 200],  // white hot
    [200, 120, 30],   // dark brass
  ];

  class Spark {
    constructor() { this.reset(); }

    reset() {
      // Launch from a random spot along the title text area
      this.x = Math.random() * canvas.width * 0.7 + canvas.width * 0.15;
      this.y = canvas.height * 0.72 + (Math.random() - 0.5) * 20;
      this.vx = (Math.random() - 0.5) * 4.5;
      this.vy = -(Math.random() * 5 + 2);
      this.gravity = 0.14 + Math.random() * 0.1;
      this.life = 1;
      this.decay = Math.random() * 0.022 + 0.012;
      this.size = Math.random() * 2.8 + 0.8;
      this.trail = [];
      const col = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
      this.r = col[0]; this.g = col[1]; this.b = col[2];
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 5) this.trail.shift();
      this.x  += this.vx;
      this.y  += this.vy;
      this.vy += this.gravity;
      this.vx *= 0.98;
      this.life -= this.decay;
      if (this.life <= 0) this.reset();
    }

    draw(ctx) {
      // Draw trail
      for (let i = 0; i < this.trail.length; i++) {
        const alpha = (i / this.trail.length) * this.life * 0.5;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${alpha})`;
        ctx.fill();
      }
      // Draw main spark dot with glow
      const alpha = this.life;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${alpha})`;
      ctx.shadowColor = `rgba(${this.r},${this.g},${this.b},0.8)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  const sparks = Array.from({ length: 18 }, () => new Spark());

  function animateSparks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of sparks) {
      s.update();
      s.draw(ctx);
    }
    requestAnimationFrame(animateSparks);
  }

  requestAnimationFrame(animateSparks);
})();

/* ==========================================================================
   JORDAN PEELE ("NOPE") IMPOSING DESERT UFO CONTROLLER
   Bigger, commanding presence, rapid 20–25s mysterious desert flights
   ========================================================================== */
(function () {
  'use strict';

  const ufoEl = document.getElementById('desertUfoContainer');
  const horizonLightEl = document.getElementById('desertHorizonPhenomenon');
  if (!ufoEl) return;

  const STAGE_WIDTH = 1920;
  // First appearance after 5s so user sees it quickly
  const FIRST_APPEARANCE_DELAY = 5000;
  // Repeat exactly every 20 seconds
  const REPEAT_MIN_DELAY = 20000;
  const REPEAT_MAX_DELAY = 20000;
  // Flight traverse duration across 1920px canvas
  const FLIGHT_DURATION = 15000;

  let isFlying = false;
  let flightStartTime = 0;
  let flightStartX = -260;
  let flightEndX = STAGE_WIDTH + 260;
  let baseAltitude = 55;
  let direction = 1; // 1 = left-to-right, -1 = right-to-left

  function startUfoFlight() {
    isFlying = true;
    flightStartTime = performance.now();

    // Randomize direction between appearances: 50% left-to-right, 50% right-to-left
    direction = Math.random() < 0.5 ? 1 : -1;
    if (direction === 1) {
      flightStartX = -260;
      flightEndX = STAGE_WIDTH + 260;
    } else {
      flightStartX = STAGE_WIDTH + 260;
      flightEndX = -260;
    }

    // Fly a bit lower — visible in the mid-upper sky, not tucked at the very top
    baseAltitude = 150 + Math.random() * 40;

    requestAnimationFrame(updateUfoFlight);
  }

  function updateUfoFlight(timestamp) {
    if (!isFlying) return;

    const elapsed = timestamp - flightStartTime;
    const progress = Math.min(elapsed / FLIGHT_DURATION, 1);

    // Horizontal translation
    const currentX = flightStartX + (flightEndX - flightStartX) * progress;

    // Gentle curved flight path across the sky with subtle atmospheric undulation
    const arcOffset = Math.sin(progress * Math.PI) * -14;
    const waveOffset = Math.sin(progress * Math.PI * 3) * 6;
    const currentY = baseAltitude + arcOffset + waveOffset;

    // Subtle banking tilt based on direction and flight arc
    const tilt = (direction === 1 ? 1 : -1) * (Math.sin(progress * Math.PI * 3.5) * 2.4);

    // Calculate atmospheric opacity (smooth entry, subtle cloud dips, smooth exit)
    let opacity = 1;
    if (progress < 0.08) {
      opacity = progress / 0.08;
    } else if (progress > 0.92) {
      opacity = (1 - progress) / 0.08;
    } else {
      // Atmospheric haze dips as it passes through distant cloud tracks
      const cloudNear1 = Math.exp(-Math.pow((progress - 0.28) / 0.12, 2));
      const cloudNear2 = Math.exp(-Math.pow((progress - 0.72) / 0.14, 2));
      const hazeOcclusion = Math.max(cloudNear1 * 0.35, cloudNear2 * 0.3);
      opacity = 0.94 - hazeOcclusion;
    }

    ufoEl.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    ufoEl.style.opacity = Math.max(0, Math.min(1, opacity)).toFixed(3);

    if (progress < 1) {
      requestAnimationFrame(updateUfoFlight);
    } else {
      // Flight finished, hide and schedule next appearance
      isFlying = false;
      ufoEl.style.opacity = '0';
      scheduleNextFlight();
    }
  }

  function scheduleNextFlight() {
    const nextInterval = REPEAT_MIN_DELAY + Math.random() * (REPEAT_MAX_DELAY - REPEAT_MIN_DELAY);
    setTimeout(startUfoFlight, nextInterval);
  }

  // Schedule first flight after ~10s
  setTimeout(startUfoFlight, FIRST_APPEARANCE_DELAY);

  // Optional subtle distant desert phenomenon: tiny faint glimmer on far horizon
  function triggerHorizonGlimmer() {
    if (!horizonLightEl) return;
    horizonLightEl.style.opacity = '0.7';
    setTimeout(() => {
      horizonLightEl.style.opacity = '0.25';
      setTimeout(() => {
        horizonLightEl.style.opacity = '0.85';
        setTimeout(() => {
          horizonLightEl.style.opacity = '0';
          scheduleNextHorizonGlimmer();
        }, 1400);
      }, 450);
    }, 1500);
  }

  function scheduleNextHorizonGlimmer() {
    const delay = 22000 + Math.random() * 18000;
    setTimeout(triggerHorizonGlimmer, delay);
  }

  setTimeout(triggerHorizonGlimmer, 12000);
})();

/* ==========================================================================
   ALIEN DEEP-SKY SHINING STARS SIMULATION
   Extraterrestrial twinkling starfield in the upper desert twilight sky
   ========================================================================== */
(function () {
  'use strict';

  const starsCanvas = document.getElementById('alienStarsCanvas');
  if (!starsCanvas) return;
  const ctx = starsCanvas.getContext('2d');

  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 480;
  starsCanvas.width = CANVAS_WIDTH;
  starsCanvas.height = CANVAS_HEIGHT;

  // Alien Palette colors [R, G, B]
  const ALIEN_PALETTES = [
    { r: 78, g: 230, b: 182, name: 'emerald' },    // Ethereal emerald
    { r: 94, g: 226, b: 255, name: 'cyan' },       // Cosmic cyan
    { r: 192, g: 132, b: 252, name: 'violet' },    // Amethyst violet
    { r: 240, g: 253, b: 255, name: 'diamond' },   // Ice diamond white
    { r: 253, g: 224, b: 71, name: 'gold' }        // Alien golden amber
  ];

  const STAR_COUNT = 175;
  const stars = [];

  class AlienStar {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * CANVAS_WIDTH;
      // Exponential distribution favoring the deep upper sky (y: 10 to 220)
      const pow = Math.pow(Math.random(), 1.6);
      this.y = 12 + pow * (CANVAS_HEIGHT - 40);

      // Distance depth: 70% micro distant, 20% medium, 10% pulsars
      const tier = Math.random();
      if (tier < 0.7) {
        // Micro distant stars: tiny pinpricks far away in space
        this.radius = 0.65 + Math.random() * 0.55;
        this.isPulsar = false;
        this.twinkleSpeed = 0.008 + Math.random() * 0.015;
        this.minAlpha = 0.15 + Math.random() * 0.2;
        this.maxAlpha = 0.55 + Math.random() * 0.25;
      } else if (tier < 0.9) {
        // Medium shining stars
        this.radius = 1.25 + Math.random() * 0.55;
        this.isPulsar = false;
        this.twinkleSpeed = 0.012 + Math.random() * 0.02;
        this.minAlpha = 0.3 + Math.random() * 0.2;
        this.maxAlpha = 0.75 + Math.random() * 0.22;
      } else {
        // Prominent alien pulsars / beacons with diffraction cross
        this.radius = 1.8 + Math.random() * 0.7;
        this.isPulsar = true;
        this.spikeLength = 5 + Math.random() * 5;
        this.twinkleSpeed = 0.01 + Math.random() * 0.018;
        this.minAlpha = 0.45 + Math.random() * 0.2;
        this.maxAlpha = 0.95 + Math.random() * 0.05;
      }

      this.color = ALIEN_PALETTES[Math.floor(Math.random() * ALIEN_PALETTES.length)];
      this.phase = Math.random() * Math.PI * 2;
      // Secondary harmonic for organic, non-mechanical shimmering
      this.secondaryPhase = Math.random() * Math.PI * 2;
      this.secondarySpeed = this.twinkleSpeed * (1.3 + Math.random() * 0.5);
    }

    update() {
      this.phase += this.twinkleSpeed;
      this.secondaryPhase += this.secondarySpeed;
    }

    draw(ctx) {
      // Atmospheric vertical fade near desert horizon
      const horizonFactor = Math.max(0, Math.min(1, 1 - (this.y - 240) / 220));
      if (horizonFactor <= 0.02) return;

      // Organic twinkling brightness using two sine harmonics
      const wave = (Math.sin(this.phase) * 0.65 + Math.sin(this.secondaryPhase) * 0.35 + 1) / 2;
      const alpha = (this.minAlpha + (this.maxAlpha - this.minAlpha) * wave) * horizonFactor;

      const { r, g, b } = this.color;

      if (this.isPulsar && alpha > 0.4) {
        // Subtle radiant halo
        const haloGrad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius * 3.8
        );
        haloGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`);
        haloGrad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${alpha * 0.25})`);
        haloGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Delicate 4-point cross diffraction spikes
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.65})`;
        ctx.lineWidth = 0.8;
        const currentSpike = this.spikeLength * (0.7 + wave * 0.3);

        ctx.beginPath();
        ctx.moveTo(this.x - currentSpike, this.y);
        ctx.lineTo(this.x + currentSpike, this.y);
        ctx.moveTo(this.x, this.y - currentSpike);
        ctx.lineTo(this.x, this.y + currentSpike);
        ctx.stroke();
      }

      // Star core
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Star colored shell
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Populate stars
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new AlienStar());
  }

  // Occasional subtle shooting star / alien cosmic streak
  let shootingStar = null;

  function spawnShootingStar() {
    const angle = (Math.random() * 20 + 15) * (Math.PI / 180);
    const speed = 14 + Math.random() * 8;
    const length = 110 + Math.random() * 80;
    const startX = Math.random() * (CANVAS_WIDTH * 0.8);
    const startY = Math.random() * 120 + 10;
    const color = ALIEN_PALETTES[Math.floor(Math.random() * ALIEN_PALETTES.length)];

    shootingStar = {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: length,
      alpha: 1,
      decay: 0.022 + Math.random() * 0.012,
      color: color
    };
  }

  function scheduleNextShootingStar() {
    const delay = 14000 + Math.random() * 16000;
    setTimeout(() => {
      spawnShootingStar();
      scheduleNextShootingStar();
    }, delay);
  }
  scheduleNextShootingStar();

  // Animation Loop
  function animateStars() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw(ctx);
    }

    // Draw shooting star if active
    if (shootingStar) {
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.alpha -= shootingStar.decay;

      if (shootingStar.alpha <= 0 || shootingStar.y > CANVAS_HEIGHT) {
        shootingStar = null;
      } else {
        const tailX = shootingStar.x - (shootingStar.vx / Math.hypot(shootingStar.vx, shootingStar.vy)) * shootingStar.length;
        const tailY = shootingStar.y - (shootingStar.vy / Math.hypot(shootingStar.vx, shootingStar.vy)) * shootingStar.length;

        const grad = ctx.createLinearGradient(
          shootingStar.x, shootingStar.y,
          tailX, tailY
        );
        const { r, g, b } = shootingStar.color;
        grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.alpha})`);
        grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${shootingStar.alpha * 0.8})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    }

    requestAnimationFrame(animateStars);
  }

  requestAnimationFrame(animateStars);
})();


