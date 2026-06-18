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

  //  DATA GRID HERO ANIMATION (Vanilla JS port of React component)
  class DataGridHero {
    constructor(containerId, config) {
      this.container = document.getElementById(containerId);
      this.gridContainer = document.getElementById('gridContainer');
      this.config = {
        rows: 24,
        cols: 40,
        spacing: 4,
        duration: 3,
        color: 'rgba(53, 56, 57, 0.4)', // onyx grey cells
        animationType: 'wave',
        pulseEffect: true,
        mouseGlow: true,
        opacityMin: 0.15,
        opacityMax: 0.65,
        background: 'linear-gradient(135deg, var(--intense-cherry) 0%, var(--onyx-grey) 100%)',
        ...config
      };

      if (this.container) {
        this.init();
        this.bindMouseEvents();
      }
    }

    init() {
      // Set container CSS variables
      this.container.style.setProperty('--background', this.config.background);
      this.container.style.setProperty('--cell-color', this.config.color);
      this.container.style.setProperty('--duration', `${this.config.duration}s`);
      this.container.style.setProperty('--opacity-min', this.config.opacityMin);
      this.container.style.setProperty('--opacity-max', this.config.opacityMax);
      this.container.style.setProperty('--mouse-glow-opacity', this.config.mouseGlow ? '1' : '0');

      // Clear and rebuild grid
      this.gridContainer.innerHTML = '';
      this.gridContainer.style.gridTemplateColumns = `repeat(${this.config.cols}, 1fr)`;
      this.gridContainer.style.gridTemplateRows = `repeat(${this.config.rows}, 1fr)`;
      this.gridContainer.style.gap = `${this.config.spacing}px`;

      const total = this.config.rows * this.config.cols;
      const centerRow = Math.floor(this.config.rows / 2);
      const centerCol = Math.floor(this.config.cols / 2);

      for (let i = 0; i < total; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        
        if (this.config.pulseEffect) {
          let delay;
          const r = Math.floor(i / this.config.cols);
          const c = i % this.config.cols;

          if (this.config.animationType === 'wave') {
            delay = (r + c) * 0.1;
          } else if (this.config.animationType === 'random') {
            delay = Math.random() * this.config.duration;
          } else {
            const dr = Math.abs(r - centerRow);
            const dc = Math.abs(c - centerCol);
            delay = Math.sqrt(dr * dr + dc * dc) * 0.2;
          }

          cell.style.animationDelay = `${delay.toFixed(3)}s`;
        }

        this.gridContainer.appendChild(cell);
      }
    }

    bindMouseEvents() {
      if (!this.config.mouseGlow) return;

      const handler = (e) => {
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.container.style.setProperty('--mouse-x', `${x}px`);
        this.container.style.setProperty('--mouse-y', `${y}px`);
      };

      window.addEventListener('mousemove', handler);
      this.cleanup = () => window.removeEventListener('mousemove', handler);
    }

    destroy() {
      if (this.cleanup) this.cleanup();
    }
  }

  //  GLOSSARY HOVER PEEK FEATURE

  const glossaryData = {
    'dia': {
      term: 'Dedicated Internet Access (DIA)',
      definition: 'A premium internet service providing exclusive, uncontended bandwidth reserved solely for your business, guaranteeing consistent speeds and 99.9% uptime.',
      link: '#'
    },
    'installation': {
      term: 'Installation',
      definition: 'The process of setting up and configuring your dedicated internet connection, including physical infrastructure and network configuration.',
      link: '#'
    },
    'sla': {
      term: 'Service Level Agreement (SLA)',
      definition: 'A formal contract guaranteeing specific performance metrics like uptime (99.9%), response times, and support availability.',
      link: '#'
    },
    'coverage': {
      term: 'Coverage',
      definition: 'The geographical areas where our network infrastructure is available for service deployment.',
      link: '#'
    },
    'uncapped': {
      term: 'Uncapped & Unshaped',
      definition: 'No data limits (uncapped) and no traffic throttling (unshaped) - you get full speed 24/7 regardless of usage.',
      link: '#'
    },
    'noc': {
      term: 'Network Operations Centre (NOC)',
      definition: 'Our 24/7 monitoring facility staffed by experts who proactively manage and maintain your network connection.',
      link: '#'
    },
    'upgrade': {
      term: 'Upgrade',
      definition: 'The ability to increase your bandwidth or add additional services as your business requirements evolve.',
      link: '#'
    },
    'hover-peek': {
      term: 'Hover Peek',
      definition: 'Interactive glossary feature that displays detailed definitions when you hover over technical terms.',
      link: '#'
    }
  };

  function initGlossaryPeek() {
    const peekWrapper = document.getElementById('peekWrapper');
    const peekCard = document.getElementById('peekCard');
    const peekTermName = document.getElementById('peekTermName');
    const peekDefinition = document.getElementById('peekDefinition');
    const peekLink = document.getElementById('peekLink');

    let currentTimeout = null;

    document.querySelectorAll('.glossary-term').forEach(termEl => {
      const termKey = termEl.getAttribute('data-term');
      const termData = glossaryData[termKey];

      if (!termData) return;

      termEl.addEventListener('mouseenter', (e) => {
        if (currentTimeout) clearTimeout(currentTimeout);
        
        peekTermName.textContent = termData.term;
        peekDefinition.textContent = termData.definition;
        peekLink.href = termData.link;
        
        peekWrapper.style.left = (e.pageX + 20) + 'px';
        peekWrapper.style.top = (e.pageY - 10) + 'px';
        peekCard.classList.add('is-visible');
      });

      termEl.addEventListener('mousemove', (e) => {
        peekWrapper.style.left = (e.pageX + 20) + 'px';
        peekWrapper.style.top = (e.pageY - 10) + 'px';
      });

      termEl.addEventListener('mouseleave', () => {
        currentTimeout = setTimeout(() => {
          peekCard.classList.remove('is-visible');
        }, 150);
      });
    });

    // Hide peek card when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.glossary-term') && !e.target.closest('.peek-card')) {
        peekCard.classList.remove('is-visible');
      }
    });
  }

  
  // MODAL LOGIN/SIGNUP

  function initModals() {
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const showSignup = document.getElementById('showSignup');

    if (closeLogin) {
      closeLogin.addEventListener('click', () => {
        loginModal.classList.remove('active');
      });
    }

    if (showSignup) {
      showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        // In a real app, this would switch to signup form
        console.log('Switch to signup form');
      });
    }

    // Close modal when clicking outside
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.classList.remove('active');
      }
    });
  }

  //  INITIALIZATION
  
  document.addEventListener('DOMContentLoaded', () => {
    new SideNav();
    new DataGridHero('dataGridHero', {
      rows: 28,
      cols: 45,
      spacing: 3,
      duration: 4,
      color: 'rgba(53, 56, 57, 0.35)', // onyx grey
      animationType: 'wave',
      pulseEffect: true,
      mouseGlow: true,
      opacityMin: 0.1,
      opacityMax: 0.7,
      background: 'linear-gradient(135deg, var(--intense-cherry) 0%, var(--onyx-grey) 100%)'
    });
    
    initGlossaryPeek();
    initModals();

    console.log(' Mdukazi Projects — FAQ page fully loaded!');
    console.log('Data Grid Hero with onyx grey cells active');
    console.log(' Glossary hover peek working');
    console.log(' Right-sliding sidenav ready');
  });

})();