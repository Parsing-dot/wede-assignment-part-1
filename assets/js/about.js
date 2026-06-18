(function() {
  'use strict';

  // HAMBURGER + RIGHT-SLIDING SIDE NAV

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

  //  DIGITAL LOOM BACKGROUND (Enhanced with Onyx Grey Threads)
  
  class DigitalLoom {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.threads = [];
      this.animId = null;
      this.mouseX = -9999;
      this.mouseY = -9999;

      // Thread colors — DISTINCT from the white hero text
      // Uses onyx, cherry, lobster pink, and subtle white for contrast
      this.threadColors = [
        'rgba(53, 56, 57, 0.55)',   // Onyx Grey (dominant, contrasts with white text)
        'rgba(74, 78, 80, 0.45)',   // Onyx Light
        'rgba(189, 55, 69, 0.50)',  // Intense Cherry
        'rgba(206, 105, 116, 0.40)', // Lobster Pink
        'rgba(239, 205, 209, 0.35)', // Cotton Rose (subtle)
        'rgba(31, 33, 34, 0.60)',   // Onyx Deep
      ];
      this.threadCount = 70;

      if (this.canvas) this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Mouse interaction for threads
      const hero = this.canvas.parentElement;
      hero.addEventListener('pointermove', (e) => {
        const rect = hero.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
      });
      hero.addEventListener('pointerleave', () => {
        this.mouseX = -9999;
        this.mouseY = -9999;
      });

      this.animate();
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.threads = Array.from({ length: this.threadCount }, () => new Thread(this));
    }

    animate() {
      // Erase trails slowly
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw threads with 'lighter' for a glowing effect
      this.ctx.globalCompositeOperation = 'lighter';
      this.threads.forEach(thread => {
        thread.update(this);
        thread.draw(this);
      });

      this.animId = requestAnimationFrame(() => this.animate());
    }
  }

  class Thread {
    constructor(parent) {
      this.parent = parent;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.parent.width;
      this.y = Math.random() * this.parent.height;
      this.speed = Math.random() * 0.5 + 0.2;
      this.amplitude = Math.random() * 30 + 15;
      this.frequency = Math.random() * 0.02 + 0.005;
      this.phase = Math.random() * Math.PI * 2;
      this.color = this.parent.threadColors[Math.floor(Math.random() * this.parent.threadColors.length)];
      this.lineWidth = Math.random() * 1.5 + 0.5;
    }

    update(parent) {
      this.x += this.speed;

      // Mouse repulsion — threads bend away from cursor
      if (parent.mouseX !== -9999) {
        const dx = this.x - parent.mouseX;
        const dy = this.y - parent.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.y += (dy / dist) * force * 0.8;
        }
      }

      if (this.x > parent.width + 300) {
        this.x = -300;
        this.y = Math.random() * parent.height;
      }
    }

    draw(parent) {
      const ctx = parent.ctx;
      const startX = Math.max(this.x - 300, 0);

      ctx.beginPath();
      ctx.moveTo(
        startX,
        this.y + Math.sin(startX * this.frequency + this.phase) * this.amplitude
      );

      for (let i = startX; i < this.x; i++) {
        ctx.lineTo(
          i,
          this.y + Math.sin(i * this.frequency + this.phase) * this.amplitude
        );
      }

      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.lineWidth;
      ctx.stroke();
    }
  }

  // EXPANDABLE MVP CARDS (Mission/Vision/Promise Toggle)
  function initMVPCards() {
    const cards = document.querySelectorAll('.mvp-card');
    cards.forEach(card => {
      const toggle = card.querySelector('.mvp-toggle');
      if (!toggle) return;

      // Click the card or toggle button
      const handleToggle = (e) => {
        e.stopPropagation();
        card.classList.toggle('is-expanded');
      };

      toggle.addEventListener('click', handleToggle);
      card.addEventListener('click', handleToggle);
    });
  }

  //  EXPANDABLE TIMELINE
  function initTimeline() {
    document.querySelectorAll('.timeline-item').forEach(item => {
      const year = item.querySelector('.timeline-year');
      if (!year) return;

      item.addEventListener('click', () => {
        // Close other items (accordion behavior)
        document.querySelectorAll('.timeline-item.is-expanded').forEach(other => {
          if (other !== item) other.classList.remove('is-expanded');
        });
        item.classList.toggle('is-expanded');
      });
    });
  }

  // STAT NUMBER COUNTER
  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      if (isNaN(target)) return;

      const duration = 1800;
      const start = performance.now();
      const hasDecimal = target % 1 !== 0;

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const current = ease * target;
        el.textContent = hasDecimal ? current.toFixed(1) : Math.round(current);
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

  // SCROLL REVEAL
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

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

  //  SMOOTH SCROLL FOR ANCHOR LINKS
  function initSmoothScroll() {
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
  }

  //  INITIALIZATION
  
  document.addEventListener('DOMContentLoaded', () => {
    new SideNav();
    new DigitalLoom('loom-canvas');
    initMVPCards();
    initTimeline();
    animateCounters();
    initScrollReveal();
    initSmoothScroll();

    console.log(' Mdukazi Projects — About page fully loaded!');
    console.log(' Digital Loom weaving with onyx-enhanced threads');
    console.log(' Click Mission/Vision/Promise cards to expand');
    console.log(' Click timeline years to reveal milestones');
  });

})();