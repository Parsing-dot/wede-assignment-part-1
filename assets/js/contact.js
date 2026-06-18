(function() {
'use strict';

// HAMBURGER + RIGHT-SLIDING SIDE NAV
class SideNav {
  constructor() {
    this.hamburger = document.getElementById('hamburger');
    this.sidenav   = document.getElementById('sidenav');
    this.overlay   = document.getElementById('sidenavOverlay');
    this.isOpen    = false;

    if (!this.hamburger || !this.sidenav || !this.overlay) return;

    this.hamburger.addEventListener('click', () => this.toggle());
    this.overlay.addEventListener('click',   () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  open() {
    this.isOpen = true;
    this.sidenav.classList.add('open');
    this.overlay.classList.add('active');
    this.hamburger.classList.add('change');
    this.hamburger.setAttribute('aria-expanded', 'true');
    this.sidenav.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }

  close() {
    this.isOpen = false;
    this.sidenav.classList.remove('open');
    this.overlay.classList.remove('active');
    this.hamburger.classList.remove('change');
    this.hamburger.setAttribute('aria-expanded', 'false');
    this.sidenav.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}

// GOOEY TEXT ANIMATION
const texts = ['Get In Touch', 'Contact Us', "We're Here", 'To Help You', 'Reach Out'];
const morphTime = 1.8;
const cooldownTime = 0.5;
const text1El = document.getElementById('gooeyText1');
const text2El = document.getElementById('gooeyText2');

if (text1El && text2El) {
  let textIndex = 0;
  let time = new Date();
  let morph = 0;
  let cooldown = cooldownTime;

  const setMorph = (fraction) => {
    const blur2 = Math.min(8 / (fraction + 0.01) - 8, 100);
    text2El.style.filter = `blur(${blur2}px)`;
    text2El.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    const fraction1 = 1 - fraction;
    const blur1 = Math.min(8 / (fraction1 + 0.01) - 8, 100);
    text1El.style.filter = `blur(${blur1}px)`;
    text1El.style.opacity = `${Math.pow(fraction1, 0.4) * 100}%`;
  };

  const doCooldown = () => {
    morph = 0;
    text2El.style.filter = '';
    text2El.style.opacity = '100%';
    text1El.style.filter = '';
    text1El.style.opacity = '0%';
  };

  const doMorph = () => {
    morph -= cooldown;
    cooldown = 0;
    let fraction = morph / morphTime;
    if (fraction > 1) {
      cooldown = cooldownTime;
      fraction = 1;
    }
    setMorph(fraction);
  };

  function animate() {
    requestAnimationFrame(animate);
    const newTime = new Date();
    const shouldIncrementIndex = cooldown > 0;
    const dt = (newTime.getTime() - time.getTime()) / 1000;
    time = newTime;
    cooldown -= dt;

    if (cooldown <= 0) {
      if (shouldIncrementIndex) {
        text1El.textContent = texts[textIndex % texts.length];
        text2El.textContent = texts[(textIndex + 1) % texts.length];
        textIndex++;
      }
      doMorph();
    } else {
      doCooldown();
    }
  }

  animate();
}

// CONTACT FORM HANDLER
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    setTimeout(() => {
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1500);
  });
}

// SCROLL REVEAL
const revealElements = document.querySelectorAll('.reveal-item');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealElements.forEach(el => observer.observe(el));

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  new SideNav();
  console.log(' Mdukazi Projects — Contact page fully loaded!');
  console.log(' Gooey text is morphing...');
  console.log(' Right-sliding sidenav ready');
});
})();