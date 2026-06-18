(function() {
  'use strict';

  //  HAMBURGER + RIGHT-SLIDING SIDE NAV

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

  // HERO GRID ANIMATION - Enhanced with Circular Movement & Pop Effects
  
  function initHeroGrid() {
    const heroGrid = document.querySelector('.hero-grid-bg');
    if (!heroGrid) return;

    const cells = heroGrid.querySelectorAll('.grid-cell');
    const companyColors = [
      'rgba(189, 55, 69, 0.25)',   // intense cherry
      'rgba(206, 105, 116, 0.20)', // lobster pink
      'rgba(222, 155, 162, 0.18)', // old rose
      'rgba(239, 205, 209, 0.15)', // cotton rose
      'rgba(53, 56, 57, 0.22)',    // onyx grey
      'rgba(74, 78, 80, 0.18)',    // onyx light
      'rgba(255, 255, 255, 0.12)', // white
    ];

    // Animation patterns
    const animationPatterns = ['hovered', 'orbit', 'pulse'];

    // Randomly animate cells on a loop
    setInterval(() => {
      // Remove previous animations
      cells.forEach(c => {
        c.classList.remove('hovered', 'orbit', 'pulse');
        c.style.fill = 'rgba(255,255,255,0.02)';
      });

      // Pick 5-12 random cells to animate
      const count = 5 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * cells.length);
        const cell = cells[idx];
        if (cell) {
          // Pick random animation pattern
          const pattern = animationPatterns[Math.floor(Math.random() * animationPatterns.length)];
          cell.classList.add(pattern);

          // Pick random color
          const color = companyColors[Math.floor(Math.random() * companyColors.length)];
          cell.style.fill = color;

          // Reset after animation completes
          setTimeout(() => {
            cell.classList.remove(pattern);
            cell.style.fill = 'rgba(255,255,255,0.02)';
          }, 1200 + Math.random() * 800);
        }
      }
    }, 1500);

    // Add wave effect on mouse move
    let lastWaveTime = 0;
    heroGrid.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastWaveTime < 100) return; // Throttle
      lastWaveTime = now;

      const rect = heroGrid.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      cells.forEach((cell, idx) => {
        const cellRect = cell.getBoundingClientRect();
        const cellX = cellRect.left - rect.left + cellRect.width / 2;
        const cellY = cellRect.top - rect.top + cellRect.height / 2;

        const dx = cellX - mouseX;
        const dy = cellY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          setTimeout(() => {
            cell.classList.add('pulse');
            cell.style.fill = 'rgba(239, 205, 209, 0.25)';
            setTimeout(() => {
              cell.classList.remove('pulse');
              cell.style.fill = 'rgba(255,255,255,0.02)';
            }, 800);
          }, dist * 2);
        }
      });
    });
  }

  // PRICE TOOLTIP on hover (South African Rands)

  const tip = document.getElementById('priceTip');
  const priceElements = document.querySelectorAll('[data-price]');

  function showTip(e, text) {
    tip.textContent = text;
    tip.style.display = 'block';
    const x = e.clientX + 16;
    const y = e.clientY - 10;
    const tipRect = tip.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - tipRect.width - 20);
    const top = Math.max(10, Math.min(y, window.innerHeight - tipRect.height - 20));
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function hideTip() {
    tip.style.display = 'none';
  }

  priceElements.forEach(el => {
    const price = el.getAttribute('data-price');
    if (!price) return;
    el.addEventListener('mouseenter', function(e) {
      showTip(e, price);
    });
    el.addEventListener('mousemove', function(e) {
      const x = e.clientX + 16;
      const y = e.clientY - 10;
      const tipRect = tip.getBoundingClientRect();
      const left = Math.min(x, window.innerWidth - tipRect.width - 20);
      const top = Math.max(10, Math.min(y, window.innerHeight - tipRect.height - 20));
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    });
    el.addEventListener('mouseleave', hideTip);
  });

  // ORBIT ANIMATION for Residential section
  
  const orbitContainer = document.getElementById('orbitContainer');
  if (orbitContainer) {
    const items = orbitContainer.querySelectorAll('.orbit-item');
    const center = orbitContainer.querySelector('.radial-center');
    if (items.length && center) {
      const containerWidth = orbitContainer.offsetWidth || 400;
      const containerHeight = orbitContainer.offsetHeight || 400;
      const radius = Math.min(containerWidth, containerHeight) * 0.38;

      const angles = [];
      items.forEach((item, idx) => {
        const angleDeg = parseFloat(item.getAttribute('data-angle')) || (idx * 72);
        angles.push(angleDeg);
      });

      let animationId = null;
      let startTime = null;
      const duration = 20000;

      function animateOrbit(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) % duration;
        const progress = elapsed / duration;

        items.forEach((item, idx) => {
          const baseAngle = angles[idx] || (idx * 72);
          const angleDeg = baseAngle + (progress * 360);
          const rad = (angleDeg * Math.PI) / 180;
          const x = containerWidth / 2 + radius * Math.cos(rad) - (item.offsetWidth / 2 || 50);
          const y = containerHeight / 2 + radius * Math.sin(rad) - (item.offsetHeight / 2 || 50);
          item.style.left = x + 'px';
          item.style.top = y + 'px';
          const scale = 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(rad));
          item.style.transform = `scale(${scale})`;
          const zIndex = Math.floor(10 + 10 * (0.5 + 0.5 * Math.sin(rad)));
          item.style.zIndex = zIndex;
        });

        animationId = requestAnimationFrame(animateOrbit);
      }

      animationId = requestAnimationFrame(animateOrbit);

      window.addEventListener('beforeunload', function() {
        if (animationId) cancelAnimationFrame(animationId);
      });

      let resizeTimeout;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const newWidth = orbitContainer.offsetWidth || 400;
          const newHeight = orbitContainer.offsetHeight || 400;
          if (animationId) cancelAnimationFrame(animationId);
          startTime = null;
          const newRadius = Math.min(newWidth, newHeight) * 0.38;
          items.forEach((item, idx) => {
            const baseAngle = angles[idx] || (idx * 72);
            const progress = ((performance.now() - startTime) % duration) / duration;
            const angleDeg = baseAngle + (progress * 360);
            const rad = (angleDeg * Math.PI) / 180;
            const x = newWidth / 2 + newRadius * Math.cos(rad) - (item.offsetWidth / 2 || 50);
            const y = newHeight / 2 + newRadius * Math.sin(rad) - (item.offsetHeight / 2 || 50);
            item.style.left = x + 'px';
            item.style.top = y + 'px';
          });
          animationId = requestAnimationFrame(animateOrbit);
        }, 300);
      });
    }
  }

  // SCROLL INDICATOR: smooth scroll to solutions
  
  const scrollBtn = document.querySelector('.scroll-btn');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById('solutions');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  //   INITIALIZATION

  document.addEventListener('DOMContentLoaded', () => {
    new SideNav();
    initHeroGrid();

    console.log(' Mdukazi Projects — Solutions page fully loaded!');
    console.log(' Right-sliding sidenav ready');
    console.log(' Hero grid animation active with circular movement');
    console.log(' Hover over services to see pricing in ZAR');
    console.log(' Residential icons orbit around the Home Hub');
  });

})();