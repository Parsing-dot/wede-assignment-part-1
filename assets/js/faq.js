(function() {
    'use strict';

    // ============================================================================
    // 🍔 1. NAVBAR ENHANCEMENTS
    // ============================================================================
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.navbar-item');
    const mainNav = document.querySelector('.main-nav');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle && navToggle.checked) navToggle.checked = false;
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainNav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            mainNav.style.backdropFilter = 'blur(10px)';
        } else {
            mainNav.style.boxShadow = '0 2px 10px rgba(189, 55, 69, 0.3)';
            mainNav.style.backdropFilter = 'none';
        }
    });

    // ============================================================================
    // 🧵 2. DIGITAL LOOM BACKGROUND (Hero Canvas)
    // ============================================================================
    class DigitalLoom {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
            this.threads = [];
            this.animId = null;
            this.threadColors = [
                'rgba(239, 205, 209, 0.6)',
                'rgba(206, 105, 116, 0.5)',
                'rgba(255, 255, 255, 0.4)'
            ];
            if (this.canvas) this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        }

        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.threads = Array.from({ length: 60 }, () => new Thread(this));
        }

        animate() {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
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
        }
        update(parent) {
            this.x += this.speed;
            if (this.x > parent.width + 300) {
                this.x = -300;
                this.y = Math.random() * parent.height;
            }
        }
        draw(parent) {
            const ctx = parent.ctx;
            const startX = Math.max(this.x - 300, 0);
            ctx.beginPath();
            ctx.moveTo(startX, this.y + Math.sin(startX * this.frequency + this.phase) * this.amplitude);
            for (let i = startX; i < this.x; i++) {
                ctx.lineTo(i, this.y + Math.sin(i * this.frequency + this.phase) * this.amplitude);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
    }

    const hero = document.querySelector('.about-hero');
    if (hero) {
        const canvas = document.createElement('canvas');
        canvas.id = 'loom-canvas';
        hero.insertBefore(canvas, hero.firstChild);
        new DigitalLoom('loom-canvas');
    }

    // ============================================================================
    // 📅 3. EXPANDABLE TIMELINE (Spring Animation)
    // ============================================================================
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('is-expanded');
        });
    });

    // ============================================================================
    // ✨ 4. SCROLL REVEAL
    // ============================================================================
    const revealElements = document.querySelectorAll('.info-card, .value-item, .info-block');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => observer.observe(el));

    // ============================================================================
    // 🔍 5. GLOSSARY PEEK (Hover Preview + Google Search + Lens)
    // ============================================================================
    // A Vanilla JS translation of the React HoverPeek component.
    class GlossaryPeek {
        constructor() {
            this.triggers = document.querySelectorAll('.glossary-peek');
            if (this.triggers.length === 0) return;
            
            this.card = null;
            this.isVisible = false;
            this.hideTimeout = null;
            this.targetX = 0;
            this.currentX = 0;
            
            this.createCard();
            this.bindEvents();
            this.animate();
        }

        createCard() {
            this.card = document.createElement('div');
            this.card.className = 'glossary-peek-card';
            document.body.appendChild(this.card);

            // Prevent closing when moving mouse from trigger to card
            this.card.addEventListener('mouseenter', () => clearTimeout(this.hideTimeout));
            this.card.addEventListener('mouseleave', () => this.hide());
        }

        bindEvents() {
            this.triggers.forEach(trigger => {
                trigger.addEventListener('mouseenter', (e) => this.show(e, trigger));
                trigger.addEventListener('mouseleave', () => {
                    this.hideTimeout = setTimeout(() => this.hide(), 150);
                });
                trigger.addEventListener('mousemove', (e) => this.updatePosition(e, trigger));
            });
        }

        show(e, trigger) {
            clearTimeout(this.hideTimeout);
            
            const word = trigger.dataset.word || trigger.textContent;
            const desc = trigger.dataset.desc || `Learn more about ${word}`;
            const img = trigger.dataset.img;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(word)}`;

            this.card.innerHTML = `
                <div class="peek-inner">
                    ${img ? `
                        <div class="peek-img-wrap">
                            <img src="${img}" class="peek-img" alt="${word}">
                            <div class="peek-lens"></div>
                        </div>
                    ` : ''}
                    <div class="peek-content">
                        <h4>${word}</h4>
                        <p>${desc}</p>
                        <a href="${searchUrl}" target="_blank" class="peek-search-btn">
                            <i class="fas fa-search"></i> Search on Google
                        </a>
                    </div>
                </div>
            `;

            // Bind lens events if image exists
            const imgWrap = this.card.querySelector('.peek-img-wrap');
            if (imgWrap) {
                imgWrap.addEventListener('mousemove', (ev) => this.handleLens(ev, imgWrap));
                imgWrap.addEventListener('mouseleave', () => {
                    const lens = this.card.querySelector('.peek-lens');
                    if (lens) lens.style.opacity = '0';
                });
            }

            this.updatePosition(e, trigger);
            
            // Reset rotation for entry animation
            this.card.dataset.rotate = -90;
            this.targetX = 0;
            this.currentX = 0;
            
            void this.card.offsetWidth; // Trigger reflow
            this.card.classList.add('is-visible');
            this.isVisible = true;
        }

        hide() {
            this.card.classList.remove('is-visible');
            this.isVisible = false;
        }

        updatePosition(e, trigger) {
            const rect = trigger.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetFromCenter = (offsetX - rect.width / 2) * 0.3;
            this.targetX = offsetFromCenter;
            
            this.card.style.left = `${rect.left + rect.width / 2}px`;
            this.card.style.top = `${rect.top - 12}px`;
        }

        handleLens(e, imgWrap) {
            const rect = imgWrap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const lens = this.card.querySelector('.peek-lens');
            const imgSrc = this.card.querySelector('.peek-img').src;
            
            const lensSize = 80;
            const zoomFactor = 1.75;
            
            // Create circular mask
            lens.style.maskImage = `radial-gradient(circle ${lensSize/2}px at ${x}px ${y}px, black ${lensSize/2}px, transparent ${lensSize/2}px)`;
            lens.style.webkitMaskImage = lens.style.maskImage;
            
            // Scale up background image
            lens.style.backgroundImage = `url(${imgSrc})`;
            lens.style.backgroundSize = `${rect.width * zoomFactor}px ${rect.height * zoomFactor}px`;
            
            // Position background to center zoom on mouse
            const bgX = -(x * zoomFactor - x);
            const bgY = -(y * zoomFactor - y);
            lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
            
            lens.style.opacity = '1';
        }

        animate() {
            // Spring physics for mouse follow
            this.currentX += (this.targetX - this.currentX) * 0.15;
            
            if (this.isVisible) {
                this.card.style.transform = `perspective(800px) rotateY(0deg) translateX(calc(-50% + ${this.currentX}px)) translateY(-100%)`;
            } else {
                // Animate rotation out when hidden
                const currentRotate = parseFloat(this.card.dataset.rotate || -90);
                const targetRotate = 90;
                const newRotate = currentRotate + (targetRotate - currentRotate) * 0.15;
                this.card.dataset.rotate = newRotate;
                this.card.style.transform = `perspective(800px) rotateY(${newRotate}deg) translateX(calc(-50% + ${this.currentX}px)) translateY(-100%)`;
            }
            
            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize the Glossary Peek
    new GlossaryPeek();

    console.log('✨ Mdukazi Projects — About page fully loaded!');
    console.log('🔍 Hover over the bold terms in the FAQ section to see the preview card.');

})();