(function() {
  'use strict';

  // ============================================================================
  // 🍔 1. HAMBURGER + RIGHT-SLIDING SIDE NAV
  // ============================================================================
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
      this.hamburger.addEventListener('click', () => this.toggle());

      this.hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });

      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }

      this.sidenav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });
    }

    toggle() { this.isOpen ? this.close() : this.open(); }

    open() {
      this.hamburger.classList.add('change');
      this.sidenav.classList.add('open');
      if (this.overlay) this.overlay.classList.add('active');
      this.sidenav.setAttribute('aria-hidden', 'false');
      this.hamburger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
      this.isOpen = true;

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

  // ============================================================================
  // ✨ 2. SPARKLES TEXT EFFECT (Vanilla JS port of React SparklesText)
  // ============================================================================
  class SparklesText {
    constructor(element) {
      this.el = element;
      this.colors = ['#BD3745', '#CE6974', '#EFCDD1', '#FFFFFF', '#353839']; // brand + onyx
      this.sparklesCount = 14;
      this.sparkles = [];
      this.container = null;
      this.intervalId = null;
      this.init();
    }

    init() {
      // Wrap the title content
      this.el.style.position = 'relative';
      this.el.style.display = 'inline-block';

      this.container = document.createElement('div');
      this.container.className = 'sparkles-container';
      this.el.appendChild(this.container);

      // Initial sparkles
      for (let i = 0; i < this.sparklesCount; i++) {
        this.sparkles.push(this._generateSparkle());
      }
      this._render();

      // Update sparkles every 100ms (like the React version)
      this.intervalId = setInterval(() => this._update(), 100);

      // Pause when tab hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          clearInterval(this.intervalId);
        } else {
          this.intervalId = setInterval(() => this._update(), 100);
        }
      });
    }

    _generateSparkle() {
      return {
        id: `${Date.now()}-${Math.random()}`,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        delay: Math.random() * 2,
        scale: Math.random() * 1 + 0.3,
        lifespan: Math.random() * 10 + 5
      };
    }

    _update() {
      this.sparkles = this.sparkles.map(star => {
        if (star.lifespan <= 0) {
          return this._generateSparkle();
        }
        return { ...star, lifespan: star.lifespan - 0.1 };
      });
      this._render();
    }

    _render() {
      // Clear old SVGs
      this.container.innerHTML = '';

      this.sparkles.forEach(sparkle => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'sparkle-svg');
        svg.setAttribute('width', '21');
        svg.setAttribute('height', '21');
        svg.setAttribute('viewBox', '0 0 21 21');
        svg.style.left = sparkle.x;
        svg.style.top = sparkle.y;
        svg.style.color = sparkle.color;
        svg.style.animationDelay = `${sparkle.delay}s`;
        svg.style.transform = `translate(-50%, -50%) scale(${sparkle.scale})`;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z');
        path.setAttribute('fill', 'currentColor');

        svg.appendChild(path);
        this.container.appendChild(svg);
      });
    }
  }

  // ============================================================================
  // 🎨 3. PIXEL CANVAS (same as index, with onyx palette)
  // ============================================================================
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

      this.colors = [
        'rgba(255, 255, 255, 0.18)',
        'rgba(239, 205, 209, 0.28)',
        'rgba(222, 155, 162, 0.22)',
        'rgba(206, 105, 116, 0.16)',
        'rgba(189, 55, 69,  0.12)',
        'rgba(53, 56, 57,  0.22)',
        'rgba(74, 78, 80,  0.18)',
        'rgba(255, 255, 255, 0.10)',
      ];

      this.init();

      const hero = this.canvas.parentElement;
      hero.addEventListener('pointermove', (e) => {
        const rect = hero.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        hero.style.setProperty('--mouse-x', `${((this.mouseX / this.w) * 100).toFixed(1)}%`);
        hero.style.setProperty('--mouse-y', `${((this.mouseY / this.h) * 100).toFixed(1)}%`);
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

  // ============================================================================
  // 🔍 4. SMART SERVICE SEARCH
  // ============================================================================
  const searchInput = document.getElementById('serviceSearch');
  const suggestionsBox = document.getElementById('searchSuggestions');

  if (searchInput && suggestionsBox) {
    function getAllServiceTexts() {
      const serviceSections = document.querySelectorAll('.split-section, .diagonal-section, .monitoring-section, .telco-lan-fibre, .wireless-it-section');
      const texts = [];

      serviceSections.forEach(section => {
        section.querySelectorAll('h2, h3, .section-title').forEach(h => {
          const txt = h.textContent.trim();
          if (txt.length > 2) texts.push(txt);
        });
        section.querySelectorAll('p').forEach(p => {
          const txt = p.textContent.trim();
          if (txt.length > 5) texts.push(txt);
        });
        section.querySelectorAll('li, .strip-item, .grid-item h3, .school-grid span').forEach(el => {
          const txt = el.textContent.trim();
          if (txt.length > 2) texts.push(txt);
        });
      });

      return [...new Set(texts)];
    }

    const serviceTexts = getAllServiceTexts();

    function scrollToService(text) {
      const allElements = document.querySelectorAll('h2, h3, p, li, .strip-item, .grid-item');
      for (let el of allElements) {
        if (el.textContent.trim().toLowerCase().includes(text.toLowerCase())) {
          const section = el.closest('section') || el.closest('.split-section') || el.closest('.diagonal-section');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.style.transition = 'background 0.4s ease';
            section.style.background = 'rgba(53, 56, 57, 0.08)'; // onyx tint
            setTimeout(() => { section.style.background = ''; }, 1500);
            return;
          }
        }
      }
    }

    function renderSuggestions(results, query) {
      suggestionsBox.innerHTML = '';

      if (results.length === 0 && query.length > 1) {
        const noResult = document.createElement('div');
        noResult.className = 'no-result';
        noResult.innerHTML = `<i class="fas fa-exclamation-circle" style="color:#BD3745;margin-right:8px;"></i> Service not found. Try: CCTV, Fibre, LAN, or Monitoring.`;
        suggestionsBox.appendChild(noResult);

        ['CCTV Installation', 'Dedicated Internet', 'Fibre Solutions', 'Network Monitoring', 'IT Support'].forEach(s => {
          const item = document.createElement('div');
          item.className = 'suggestion-item';
          item.textContent = `💡 ${s}`;
          item.addEventListener('click', () => {
            searchInput.value = s;
            suggestionsBox.classList.remove('show');
            scrollToService(s);
          });
          suggestionsBox.appendChild(item);
        });
      } else if (results.length > 0) {
        results.slice(0, 6).forEach(text => {
          const item = document.createElement('div');
          item.className = 'suggestion-item';
          item.textContent = text.length > 60 ? text.substring(0, 60) + '...' : text;
          item.addEventListener('click', () => {
            searchInput.value = text;
            suggestionsBox.classList.remove('show');
            scrollToService(text);
          });
          suggestionsBox.appendChild(item);
        });
      } else {
        suggestionsBox.classList.remove('show');
        return;
      }

      if (query.length > 1) suggestionsBox.classList.add('show');
      else suggestionsBox.classList.remove('show');
    }

    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      const query = this.value.trim();

      searchTimeout = setTimeout(() => {
        if (query.length === 0) {
          suggestionsBox.classList.remove('show');
          return;
        }
        const lower = query.toLowerCase();
        const results = serviceTexts.filter(text => text.toLowerCase().includes(lower));
        renderSuggestions(results, query);
      }, 150);
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-box-wrapper')) {
        suggestionsBox.classList.remove('show');
      }
    });
  }

  //  BEFORE & AFTER IMPACT SLIDER

  let comparisonContainer = document.getElementById('imageComparison');

  if (comparisonContainer && !comparisonContainer.querySelector('.comparison-slider-wrapper')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'comparison-slider-wrapper';
    wrapper.style.cssText = `
      position: relative; width: 100%; max-width: 800px; margin: 0 auto;
      aspect-ratio: 16/9; background: #f0f0f0; border-radius: 16px;
      overflow: hidden; user-select: none; box-shadow: 0 20px 50px rgba(53,56,57,0.2);
    `;

    const beforeDiv = document.createElement('div');
    beforeDiv.style.cssText = `
      width: 100%; height: 100%;
      background: url('assets/images/services3.jpeg') center/cover no-repeat;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 1rem; color: white;
    `;
    beforeDiv.innerHTML = `
      <i class="fas fa-network-wired" style="font-size: 4rem; opacity: 0.6;"></i>
      <span style="font-size: 1.2rem; font-weight: 600; letter-spacing: 1px;">Legacy Infrastructure</span>
    `;
    wrapper.appendChild(beforeDiv);

    const afterDiv = document.createElement('div');
    afterDiv.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: url('assets/images/services4.jpeg') center/cover no-repeat,
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 1rem; color: white;
      clip-path: inset(0 50% 0 0);
    `;
    afterDiv.innerHTML = `
      <i class="fas fa-cloud-upload-alt" style="font-size: 4rem; opacity: 0.9;"></i>
      <span style="font-size: 1.2rem; font-weight: 600; letter-spacing: 1px;">Modern ICT Solutions</span>
    `;
    wrapper.appendChild(afterDiv);

    const handle = document.createElement('div');
    handle.style.cssText = `
      position: absolute; top: 0; bottom: 0; width: 4px;
      background: rgba(255,255,255,0.9); cursor: ew-resize;
      display: flex; align-items: center; justify-content: center;
      left: calc(50% - 2px); z-index: 10;
    `;

    const knob = document.createElement('div');
    knob.style.cssText = `
      background: white; border-radius: 50%; width: 50px; height: 50px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    knob.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BD3745" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="15" y1="18" x2="9" y2="12"></line>
        <line x1="9" y1="6" x2="15" y2="12"></line>
      </svg>
    `;
    handle.appendChild(knob);
    wrapper.appendChild(handle);

    const labelBefore = document.createElement('div');
    labelBefore.className = 'before-after-label before';
    labelBefore.textContent = '🔴 Before';
    wrapper.appendChild(labelBefore);

    const labelAfter = document.createElement('div');
    labelAfter.className = 'before-after-label after';
    labelAfter.textContent = '✨ After';
    wrapper.appendChild(labelAfter);

    comparisonContainer.appendChild(wrapper);

    let isDragging = false;

    function setPosition(clientX) {
      const rect = wrapper.getBoundingClientRect();
      let x = ((clientX - rect.left) / rect.width) * 100;
      x = Math.max(0, Math.min(100, x));
      afterDiv.style.clipPath = `inset(0 ${100 - x}% 0 0)`;
      handle.style.left = `calc(${x}% - 2px)`;
    }

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      knob.style.transform = 'scale(1.2)';
      e.preventDefault();
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      knob.style.transform = 'scale(1)';
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) setPosition(e.clientX);
    });

    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
      knob.style.transform = 'scale(1.2)';
      e.preventDefault();
    });
    window.addEventListener('touchend', () => {
      isDragging = false;
      knob.style.transform = 'scale(1)';
    });
    window.addEventListener('touchmove', (e) => {
      if (isDragging) setPosition(e.touches[0].clientX);
    }, { passive: true });

    setPosition(window.innerWidth / 2);
  }

  // ============================================================================
  // ✨ 6. SCROLL REVEAL (Intersection Observer)
  // ============================================================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.split-content, .split-visual, .grid-item, .monitor-panel, .col-card, ' +
      '.wireless-panel, .it-panel, .school-panel, .icon-strip, .info-panel, .visual-block'
    );

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ============================================================================
  // 🎯 7. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    });
  });

  // ============================================================================
  // 🚀 INITIALIZATION
  // ============================================================================
  document.addEventListener('DOMContentLoaded', () => {
    new SideNav();
    new PixelCanvasAnimation('pixel-canvas');

    // Initialize sparkles on the hero title
    const sparklesTitle = document.querySelector('[data-sparkles]');
    if (sparklesTitle) {
      new SparklesText(sparklesTitle);
    }

    initScrollReveal();

    console.log('✨ Mdukazi Projects — Services page fully loaded!');
    console.log('✨ Sparkles text animation active on hero title');
    console.log('🍔 Right-sliding sidenav ready');
  });

})();