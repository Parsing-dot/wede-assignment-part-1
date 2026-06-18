// ================= HAMBURGER & SIDE NAV TOGGLE =================
class SideNav {
constructor() {
this.hamburger = document.getElementById('hamburger');
this.sidenav = document.getElementById('sidenav');
this.overlay = document.getElementById('sidenavOverlay');
this.isOpen = false;
if (!this.hamburger || !this.sidenav) return;

this._bindEvents();
}
_bindEvents() {
// Hamburger click
this.hamburger.addEventListener('click', () => this.toggle());
// Keyboard accessibility
this.hamburger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    this.toggle();
  }
});

// Overlay click closes
if (this.overlay) {
  this.overlay.addEventListener('click', () => this.close());
}

// Close when clicking any sidenav link
this.sidenav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => this.close());
});

// ESC key closes
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && this.isOpen) this.close();
});

// Close on resize to desktop (optional safety)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Keep consistent behavior — no auto-close
  }, 150);
});
}
toggle() {
this.isOpen ? this.close() : this.open();
}
open() {
this.hamburger.classList.add('change');
this.sidenav.classList.add('open');
if (this.overlay) this.overlay.classList.add('active');
this.sidenav.setAttribute('aria-hidden', 'false');
this.hamburger.setAttribute('aria-expanded', 'true');
document.body.classList.add('nav-open');
this.isOpen = true;
// Focus first link for accessibility
setTimeout(() => {
  const firstLink = this.sidenav.querySelector('.sidenav-link');
  if (firstLink) firstLink.focus();
}, 400);
}
close() {
this.hamburger.classList.remove('change');
this.sidenav.classList.remove('open');
if (this.overlay) this.overlay.classList.remove('active');
this.sidenav.setAttribute('aria-hidden', 'true');
this.hamburger.setAttribute('aria-expanded', 'false');
document.body.classList.remove('nav-open');
this.isOpen = false;
this.hamburger.focus();
}
}
// ================= PIXEL CANVAS ANIMATION =================
class PixelCanvasAnimation {
constructor(canvasId) {
this.canvas = document.getElementById(canvasId);
if (!this.canvas) return;
this.ctx = this.canvas.getContext('2d');
this.pixels = [];
this.animFrame = null;
this.lastFrame = performance.now();
this.mouseX = -9999;
this.mouseY = -9999;
this.rippleWave = null;

// Mdukazi palette — now includes onyx grey tones
this.colors = [
  'rgba(255, 255, 255, 0.18)',
  'rgba(239, 205, 209, 0.28)',
  'rgba(222, 155, 162, 0.22)',
  'rgba(206, 105, 116, 0.16)',
  'rgba(189, 55, 69,  0.12)',
  'rgba(53, 56, 57,  0.22)',   // onyx grey
  'rgba(74, 78, 80,  0.18)',   // onyx light
  'rgba(255, 255, 255, 0.10)',
];

this.init();

const hero = this.canvas.parentElement;
hero.addEventListener('pointermove', (e) => {
  const rect = hero.getBoundingClientRect();
  this.mouseX = e.clientX - rect.left;
  this.mouseY = e.clientY - rect.top;
  const pctX = ((this.mouseX / this.w) * 100).toFixed(1);
  const pctY = ((this.mouseY / this.h) * 100).toFixed(1);
  hero.style.setProperty('--mouse-x', `${pctX}%`);
  hero.style.setProperty('--mouse-y', `${pctY}%`);
});
hero.addEventListener('pointerleave', () => {
  this.mouseX = -9999;
  this.mouseY = -9999;
  hero.style.setProperty('--mouse-x', '50%');
  hero.style.setProperty('--mouse-y', '50%');
});
hero.addEventListener('pointerdown', (e) => {
  const rect = hero.getBoundingClientRect();
  this.triggerRipple(e.clientX - rect.left, e.clientY - rect.top);
});

window.addEventListener('resize', () => this.init());
this.animFrame = requestAnimationFrame((t) => this.loop(t));
}
rand(min, max) { return Math.random() * (max - min) + min; }
triggerRipple(x, y) {
this.rippleWave = { x, y, startTime: performance.now() };
const now = performance.now();
for (const p of this.pixels) {
const dx = p.x - x;
const dy = p.y - y;
const dist = Math.sqrt(dx * dx + dy * dy);
p.rippleDelay = dist * 0.55;
p.rippleStart = now;
p.phase = 'ripple-out';
}
}
createPixel(x, y, delay) {
const r = this.rand.bind(this);
return {
x, y,
color: this.colors[Math.floor(Math.random() * this.colors.length)],
size: 0,
sizeStep: r(0.10, 0.24),
minSize: 0.3,
maxSize: r(0.6, 2.2),
maxSizeInt: 2,
delay,
elapsed: 0,
phase: 'appear',
shimmerDir: 1,
shimmerSpeed: r(0.008, 0.028),
rippleDelay: 0,
rippleStart: 0,
};
}
init() {
const parent = this.canvas.parentElement;
const rect = parent.getBoundingClientRect();
const dpr = window.devicePixelRatio || 1;
this.w = rect.width;
this.h = rect.height;
this.gap = this.w < 768 ? 11 : 7;

this.canvas.width = Math.round(this.w * dpr);
this.canvas.height = Math.round(this.h * dpr);
this.canvas.style.width = `${this.w}px`;
this.canvas.style.height = `${this.h}px`;

this.ctx.setTransform(1, 0, 0, 1, 0, 0);
this.ctx.scale(dpr, dpr);

this.pixels = [];
const cx = this.w / 2, cy = this.h / 2;

for (let x = 0; x < this.w; x += this.gap) {
  for (let y = 0; y < this.h; y += this.gap) {
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const delay = dist * 0.72 + (this.w + this.h) * 0.004;
    this.pixels.push(this.createPixel(x, y, delay));
  }
}
}
loop(now) {
const frameInterval = 1000 / 60;
this.animFrame = requestAnimationFrame((t) => this.loop(t));
const elapsed = now - this.lastFrame;
if (elapsed < frameInterval) return;
this.lastFrame = now - (elapsed % frameInterval);

const ctx = this.ctx;
ctx.clearRect(0, 0, this.w, this.h);

const dt = Math.min(elapsed, 32);

for (const p of this.pixels) {
  if (p.phase === 'ripple-out') {
    const age = now - p.rippleStart;
    if (age < p.rippleDelay) continue;
    p.size += p.sizeStep * 1.8;
    if (p.size >= p.maxSize) {
      p.size = p.maxSize;
      p.phase = 'shimmer';
    }
    this._draw(p);
    continue;
  }

  p.elapsed += dt;
  if (p.elapsed < p.delay) continue;

  if (p.phase === 'appear') {
    p.size += p.sizeStep;
    if (p.size >= p.maxSize) {
      p.size = p.maxSize;
      p.phase = 'shimmer';
    }
  } else if (p.phase === 'shimmer') {
    const mdx = p.x - this.mouseX;
    const mdy = p.y - this.mouseY;
    const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
    const proximity = Math.max(0, 1 - mDist / 90);
    const boost = 1 + proximity * 1.4;

    p.size += p.shimmerSpeed * p.shimmerDir * boost;
    const maxS = p.maxSize * (1 + proximity * 0.5);
    if (p.size >= maxS) { p.size = maxS; p.shimmerDir = -1; }
    else if (p.size <= p.minSize) { p.size = p.minSize; p.shimmerDir = 1; }
  }

  this._draw(p);
}
}
_draw(p) {
const offset = (p.maxSizeInt - p.size) * 0.5;
this.ctx.fillStyle = p.color;
this.ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
}
}
// ================= ORIGIN BUTTON =================
class OriginButton {
constructor(el) {
this.el = el;
this.circle = document.createElement('span');
this.circle.className = 'origin-circle';
this.el.appendChild(this.circle);
this.magnet = { x: 0, y: 0, tx: 0, ty: 0, active: false };
this._raf = null;
this.el.addEventListener('pointerenter', this._onEnter.bind(this));
this.el.addEventListener('pointermove', this._onMove.bind(this));
this.el.addEventListener('pointerleave', this._onLeave.bind(this));
this.el.addEventListener('pointerdown', this._onDown.bind(this));
this.el.addEventListener('pointerup', this._onUp.bind(this));
}
_getXY(e) {
const rect = this.el.getBoundingClientRect();
return { x: e.clientX - rect.left, y: e.clientY - rect.top, rect };
}
_setCircle(x, y, rect) {
const d = Math.ceil(2 * Math.max(
Math.hypot(x, y),
Math.hypot(rect.width - x, y),
Math.hypot(x, rect.height - y),
Math.hypot(rect.width - x, rect.height - y)
));
this.circle.style.left = `${x}px`;
this.circle.style.top = `${y}px`;
this.circle.style.width = `${d}px`;
this.circle.style.height = `${d}px`;
}
_magnetLoop() {
if (!this.magnet.active) return;
this.magnet.x += (this.magnet.tx - this.magnet.x) * 0.18;
this.magnet.y += (this.magnet.ty - this.magnet.y) * 0.18;
this.el.style.transform = `translate(${this.magnet.x}px, ${this.magnet.y}px)`;
this._raf = requestAnimationFrame(() => this._magnetLoop());
}
_onEnter(e) {
const { x, y, rect } = this._getXY(e);
this._setCircle(x, y, rect);
this.circle.classList.add('active');
this.el.classList.add('origin-active');
this.magnet.active = true;
cancelAnimationFrame(this._raf);
this._magnetLoop();
}
_onMove(e) {
const { x, y, rect } = this._getXY(e);
this._setCircle(x, y, rect);
const mx = (x / rect.width - 0.5) * 12;
const my = (y / rect.height - 0.5) * 8;
this.magnet.tx = mx;
this.magnet.ty = my;
}
_onLeave() {
this.circle.classList.remove('active');
this.el.classList.remove('origin-active');
this.el.classList.remove('origin-pressed');
this.magnet.tx = 0;
this.magnet.ty = 0;
const easeBack = () => {
this.magnet.x += (0 - this.magnet.x) * 0.14;
this.magnet.y += (0 - this.magnet.y) * 0.14;
this.el.style.transform = `translate(${this.magnet.x}px, ${this.magnet.y}px)`;
if (Math.abs(this.magnet.x) > 0.05 || Math.abs(this.magnet.y) > 0.05) {
this._raf = requestAnimationFrame(easeBack);
} else {
this.magnet.x = 0;
this.magnet.y = 0;
this.el.style.transform = '';
this.magnet.active = false;
}
};
cancelAnimationFrame(this._raf);
this.magnet.active = false;
this._raf = requestAnimationFrame(easeBack);
}
_onDown() { this.el.classList.add('origin-pressed'); }
_onUp() { this.el.classList.remove('origin-pressed'); }
}
// ================= SCROLL-TRIGGERED REVEAL =================
function initScrollReveal() {
const targets = document.querySelectorAll(
'.feature-card, .benefit-item, .stat-item, .section-title'
);
if (!('IntersectionObserver' in window)) {
targets.forEach(el => { el.style.opacity = '1'; });
return;
}
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('revealed');
observer.unobserve(entry.target);
}
});
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
targets.forEach(el => observer.observe(el));
}
//sTAT NUMBER COUNTER 
function animateCounters() {
document.querySelectorAll('.stat-number').forEach(el => {
const raw = el.textContent.trim();
const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
if (isNaN(num)) return;
const suffix = raw.replace(/[0-9.,]/g, '');
const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
const duration = 1400;
const start = performance.now();
const tick = (now) => {
  const t = Math.min((now - start) / duration, 1);
  const ease = 1 - Math.pow(1 - t, 3);
  const current = Math.round(ease * num * 10) / 10;
  el.textContent = prefix + current + suffix;
  if (t < 1) requestAnimationFrame(tick);
};

const obs = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    requestAnimationFrame(tick);
    obs.disconnect();
  }
}, { threshold: 0.5 });
obs.observe(el);
});
}
//  INITIALIZATION 
document.addEventListener('DOMContentLoaded', () => {
// Initialize Side Navigation (hamburger + sidenav)
new SideNav();
// Initialize pixel canvas
new PixelCanvasAnimation('pixel-canvas');
// Initialize origin buttons
document.querySelectorAll('.origin-btn').forEach(btn => {
new OriginButton(btn);
});
initScrollReveal();
animateCounters();
});