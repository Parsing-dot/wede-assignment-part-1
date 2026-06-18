/**
 * account.js — Login / Signup UI + Hamburger nav
 * Requires auth.js to be loaded first (window.auth must exist).
 */
(function () {
  'use strict';

  /*  Hamburger / SideNav  */
  class SideNav {
    constructor() {
      this.hamburger = document.getElementById('hamburger');
      this.sidenav   = document.getElementById('sidenav');
      this.overlay   = document.getElementById('sidenavOverlay');
      this.isOpen    = false;
      if (!this.hamburger || !this.sidenav) return;
      this.hamburger.addEventListener('click', () => this.toggle());
      this.hamburger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); }
      });
      if (this.overlay) this.overlay.addEventListener('click', () => this.close());
      this.sidenav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => this.close()));
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.isOpen) this.close(); });
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
    }
    close() {
      this.hamburger.classList.remove('change');
      this.sidenav.classList.remove('open');
      if (this.overlay) this.overlay.classList.remove('active');
      this.sidenav.setAttribute('aria-hidden', 'true');
      this.hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
      this.isOpen = false;
    }
  }

  /*  UI helpers*/
  const $ = id => document.getElementById(id);

  function showMessage(type, text) {
    const el = $('authMessage');
    if (!el) return;
    el.textContent = text;
    el.className = `auth-message show ${type}`;
    setTimeout(() => el.classList.remove('show'), 5000);
  }

  /*  Mode toggle (Login / Sign up)  */
  const modeToggle    = $('modeToggle');
  const loginForm     = $('loginForm');
  const signupForm    = $('signupForm');
  const animTitle     = $('animatedTitle');
  const animSubtitle  = $('animatedSubtitle');
  const underlinePath = document.querySelector('.underline-path');

  const modes = {
    login:  { title: 'Welcome Back',  subtitle: 'Sign in to access your enterprise portal',   path: 'M 0,10 Q 75,0 150,10 Q 225,20 300,10' },
    signup: { title: 'Join Us Today', subtitle: 'Create your account in just a few steps',     path: 'M 0,10 Q 75,20 150,10 Q 225,0 300,10' }
  };

  let currentMode = 'login';

  function switchMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;

    modeToggle && modeToggle.querySelectorAll('.toggle-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === mode)
    );
    if (modeToggle) modeToggle.dataset.active = mode;

    const c = modes[mode];
    if (animTitle) {
      animTitle.style.opacity = '0';
      animTitle.style.transform = 'translateY(-20px)';
      if (animSubtitle) animSubtitle.style.opacity = '0';
      if (underlinePath) {
        underlinePath.style.animation = 'none';
        underlinePath.offsetHeight;
        underlinePath.setAttribute('d', c.path);
        underlinePath.style.animation = 'drawUnderline 1.5s ease-in-out forwards';
      }
      setTimeout(() => {
        animTitle.textContent = c.title;
        if (animSubtitle) animSubtitle.textContent = c.subtitle;
        animTitle.style.opacity = '1';
        animTitle.style.transform = 'translateY(0)';
        if (animSubtitle) animSubtitle.style.opacity = '1';
      }, 200);
    }

    if (loginForm && signupForm) {
      loginForm.classList.toggle('active',  mode === 'login');
      signupForm.classList.toggle('active', mode === 'signup');
    }
  }

  if (modeToggle) {
    modeToggle.querySelectorAll('.toggle-btn').forEach(b =>
      b.addEventListener('click', () => switchMode(b.dataset.mode))
    );
  }

  /* Login form */
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email    = $('loginEmail').value.trim();
      const password = $('loginPassword').value;
      const result   = window.auth.login(email, password);
      if (result.success) {
        showMessage('success', '✅ ' + result.message + ' Redirecting…');
        setTimeout(() => {
          window.location.href = result.user.role === 'admin' ? 'admin.html' : 'portal.html';
        }, 1000);
      } else {
        showMessage('error', '❌ ' + result.message);
      }
    });
  }

  /* Signup form */
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const password = $('signupPassword').value;
      const confirm  = $('signupConfirmPassword').value;
      if (password !== confirm) { showMessage('error', '❌ Passwords do not match'); return; }
      const result = window.auth.register({
        name:     $('signupName').value.trim(),
        email:    $('signupEmail').value.trim(),
        phone:    $('signupPhone').value.trim(),
        password
      });
      if (result.success) {
        showMessage('success', '✅ ' + result.message);
        signupForm.reset();
        setTimeout(() => switchMode('login'), 1500);
      } else {
        showMessage('error', '❌ ' + result.message);
      }
    });
  }

  /* Auto-redirect if already logged in  */
  const existing = window.auth.getCurrentUser();
  if (existing) {
    showMessage('success', '✅ Already logged in as ' + existing.name + '. Redirecting…');
    setTimeout(() => {
      window.location.href = existing.role === 'admin' ? 'admin.html' : 'portal.html';
    }, 1200);
  }

  /* Init  */
  document.addEventListener('DOMContentLoaded', () => {
    new SideNav();
  });

})();