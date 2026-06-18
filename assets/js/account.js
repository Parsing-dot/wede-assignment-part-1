(function () {
  'use strict';

  // =========================================================================
  // 1. HAMBURGER + RIGHT-SLIDING SIDE NAV
  // =========================================================================
  class SideNav {
    constructor() {
      this.hamburger = document.getElementById('hamburger');
      this.sidenav   = document.getElementById('sidenav');
      this.overlay   = document.getElementById('sidenavOverlay');
      this.isOpen    = false;
      if (!this.hamburger || !this.sidenav) return;
      this._bindEvents();
    }
    _bindEvents() {
      this.hamburger.addEventListener('click',   () => this.toggle());
      this.hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); }
      });
      if (this.overlay) this.overlay.addEventListener('click', () => this.close());
      this.sidenav.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', () => this.close())
      );
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

  // =========================================================================
  // 2. SHARED AUTH / LOCAL-STORAGE DATABASE
  //    Exposed on window.auth so portal.js and admin.js can use it.
  // =========================================================================
  const auth = {
    usersKey:       'mdukazi_users_db',
    currentUserKey: 'mdukazi_current_user',
    specialsKey:    'mdukazi_specials_db',

    // ── helpers ─────────────────────────────────────────────────────────────
    _read(key)       { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
    _write(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

    // ── seed default data ────────────────────────────────────────────────────
    init() {
      if (!localStorage.getItem(this.usersKey)) {
        const defaultUsers = [
          {
            id: 1,
            name: 'System Admin',
            email: 'admin@mdukazi.co.za',
            phone: '+27 11 123 4567',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString(),
            clientData: null
          },
          {
            id: 2,
            name: 'Demo Client',
            email: 'client@mdukazi.co.za',
            phone: '+27 11 987 6543',
            password: 'client123',
            role: 'client',
            createdAt: new Date().toISOString(),
            clientData: this._defaultClientData('Business Fibre + CCTV', '200 Mbps', 3499)
          }
        ];
        this._write(this.usersKey, defaultUsers);
      }
      if (!localStorage.getItem(this.specialsKey)) {
        this._write(this.specialsKey, [
          {
            id: 1,
            title: 'Summer Promotion',
            description: 'Get 2 months free when you sign up for a 12-month contract',
            badge: 'Limited Time',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            targetServices: 'All Services'
          },
          {
            id: 2,
            title: 'Business Bundle',
            description: 'DIA + CCTV + VPN at 15% off',
            badge: 'New',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            targetServices: 'DIA 100Mbps, Business Fibre'
          }
        ]);
      }
    },

    _defaultClientData(service, speed, price) {
      const due = new Date();
      due.setMonth(due.getMonth() + 1);
      return {
        service,
        speed,
        balance: price,
        dueDate: due.toISOString().split('T')[0],
        issues: [],
        paymentHistory: [],
        monthsPaid: []
      };
    },

    getNextBillingDate() {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    },

    // ── user CRUD ────────────────────────────────────────────────────────────
    getUsers()       { return this._read(this.usersKey); },
    saveUsers(users) { this._write(this.usersKey, users); },

    getAllClients() {
      return this.getUsers().filter(u => u.role === 'client');
    },

    register(userData) {
      const users = this.getUsers();
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, message: 'This email is already registered.' };
      }
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: 'client',
        createdAt: new Date().toISOString(),
        clientData: this._defaultClientData('Business Fibre + CCTV', '200 Mbps', 3499)
      };
      users.push(newUser);
      this.saveUsers(users);
      return { success: true, message: 'Account created successfully! Please login.' };
    },

    login(email, password) {
      const users = this.getUsers();
      const user  = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        return { success: true, message: 'Login successful!', user };
      }
      return { success: false, message: 'Invalid email or password.' };
    },

    getCurrentUser() {
      try { return JSON.parse(localStorage.getItem(this.currentUserKey)); } catch { return null; }
    },

    logout() { localStorage.removeItem(this.currentUserKey); },

    // Persist updated clientData back to the DB and current-user session
    updateUserClientData(clientData) {
      const current = this.getCurrentUser();
      if (!current) return false;
      const users = this.getUsers();
      const idx   = users.findIndex(u => u.id === current.id);
      if (idx === -1) return false;
      users[idx].clientData = clientData;
      this.saveUsers(users);
      current.clientData = clientData;
      localStorage.setItem(this.currentUserKey, JSON.stringify(current));
      return true;
    },

    // ── issues ───────────────────────────────────────────────────────────────
    getAllIssues() {
      return this.getAllClients().flatMap(u =>
        (u.clientData?.issues || []).map(issue => ({
          ...issue,
          clientId:    u.id,
          clientName:  u.name,
          clientEmail: u.email
        }))
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    updateIssueStatus(issueId, clientId, status, response) {
      const users = this.getUsers();
      const idx   = users.findIndex(u => u.id === clientId);
      if (idx === -1) return false;
      const issue = (users[idx].clientData?.issues || []).find(i => i.id === issueId);
      if (!issue) return false;
      issue.status     = status;
      issue.response   = response;
      issue.resolvedAt = new Date().toISOString();
      this.saveUsers(users);
      return true;
    },

    // ── payments ─────────────────────────────────────────────────────────────
    getAllPayments() {
      return this.getAllClients().flatMap(u =>
        (u.clientData?.paymentHistory || []).map(p => ({
          ...p,
          clientId:   u.id,
          clientName: u.name
        }))
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // ── outstanding ──────────────────────────────────────────────────────────
    getOutstandingAccounts() {
      return this.getAllClients().filter(u => u.clientData?.balance > 0);
    },

    // ── specials ─────────────────────────────────────────────────────────────
    getSpecials()         { return this._read(this.specialsKey); },

    createSpecial(data) {
      const specials = this.getSpecials();
      specials.push({ id: Date.now(), ...data });
      this._write(this.specialsKey, specials);
    },

    deleteSpecial(id) {
      this._write(this.specialsKey, this.getSpecials().filter(s => s.id !== id));
    },

    // ── analytics ────────────────────────────────────────────────────────────
    getAnalytics() {
      const clients       = this.getAllClients();
      const allPayments   = this.getAllPayments();
      const totalRevenue  = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalOutstanding = clients.reduce((sum, u) => sum + (u.clientData?.balance || 0), 0);

      const monthlySignups = {};
      clients.forEach(u => {
        const month = u.createdAt.substring(0, 7);
        monthlySignups[month] = (monthlySignups[month] || 0) + 1;
      });

      const serviceDistribution = {};
      clients.forEach(u => {
        const svc = u.clientData?.service || 'Unknown';
        serviceDistribution[svc] = (serviceDistribution[svc] || 0) + 1;
      });

      return {
        totalClients: clients.length,
        totalRevenue,
        totalOutstanding,
        recentSignups:  clients.slice(-5).reverse(),
        recentPayments: allPayments.slice(0, 5),
        monthlySignups,
        serviceDistribution
      };
    }
  };

  // Expose globally so portal.js and admin.js can use it
  window.auth = auth;

  // Initialise the DB
  auth.init();

  // =========================================================================
  // 3. UI INTERACTIONS & FORM HANDLERS
  // =========================================================================
  const modeToggle      = document.getElementById('modeToggle');
  const toggleBtns      = modeToggle ? modeToggle.querySelectorAll('.toggle-btn') : [];
  const animatedTitle   = document.getElementById('animatedTitle');
  const animatedSubtitle= document.getElementById('animatedSubtitle');
  const underlinePath   = document.querySelector('.underline-path');
  const loginForm       = document.getElementById('loginForm');
  const signupForm      = document.getElementById('signupForm');
  const authMessage     = document.getElementById('authMessage');

  const modeContent = {
    login:  { title: 'Welcome Back',   subtitle: 'Sign in to access your enterprise portal',      path: 'M 0,10 Q 75,0 150,10 Q 225,20 300,10' },
    signup: { title: 'Join Us Today',  subtitle: 'Create your account in just a few steps',        path: 'M 0,10 Q 75,20 150,10 Q 225,0 300,10' }
  };

  let currentMode = 'login';

  function showMessage(type, text) {
    if (!authMessage) return;
    authMessage.textContent = text;
    authMessage.className = `auth-message show ${type}`;
    setTimeout(() => authMessage.classList.remove('show'), 5000);
  }

  function animateTitleChange(newTitle, newSubtitle, newPath) {
    if (!animatedTitle) return;
    animatedTitle.style.opacity   = '0';
    animatedTitle.style.transform = 'translateY(-20px)';
    if (animatedSubtitle) animatedSubtitle.style.opacity = '0';
    if (underlinePath) {
      underlinePath.style.animation = 'none';
      underlinePath.offsetHeight;
      underlinePath.setAttribute('d', newPath);
      underlinePath.style.animation = 'drawUnderline 1.5s ease-in-out forwards';
    }
    setTimeout(() => {
      animatedTitle.textContent = newTitle;
      if (animatedSubtitle) animatedSubtitle.textContent = newSubtitle;
      animatedTitle.style.opacity   = '1';
      animatedTitle.style.transform = 'translateY(0)';
      if (animatedSubtitle) animatedSubtitle.style.opacity = '1';
    }, 200);
  }

  function switchMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    toggleBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    if (modeToggle) modeToggle.dataset.active = mode;
    const content = modeContent[mode];
    animateTitleChange(content.title, content.subtitle, content.path);
    if (mode === 'login') {
      if (loginForm)  loginForm.classList.add('active');
      if (signupForm) signupForm.classList.remove('active');
    } else {
      if (signupForm) signupForm.classList.add('active');
      if (loginForm)  loginForm.classList.remove('active');
    }
    if (authMessage) authMessage.classList.remove('show');
  }

  if (modeToggle) {
    toggleBtns.forEach(btn =>
      btn.addEventListener('click', () => switchMode(btn.dataset.mode))
    );
  }

  // Login Handler
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const result   = auth.login(email, password);
      if (result.success) {
        showMessage('success', `✅ ${result.message} Redirecting...`);
        setTimeout(() => {
          window.location.href = result.user.role === 'admin' ? 'admin.html' : 'portal.html';
        }, 1200);
      } else {
        showMessage('error', `❌ ${result.message}`);
      }
    });
  }

  // Signup Handler
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name            = document.getElementById('signupName').value.trim();
      const email           = document.getElementById('signupEmail').value.trim();
      const phone           = document.getElementById('signupPhone').value.trim();
      const password        = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('signupConfirmPassword').value;

      if (password !== confirmPassword) { showMessage('error', '❌ Passwords do not match'); return; }
      if (password.length < 6)          { showMessage('error', '❌ Password must be at least 6 characters'); return; }

      const result = auth.register({ name, email, phone, password });
      if (result.success) {
        showMessage('success', `✅ ${result.message}`);
        signupForm.reset();
        setTimeout(() => switchMode('login'), 1500);
      } else {
        showMessage('error', `❌ ${result.message}`);
      }
    });
  }

  // Auto-redirect if already logged in
  const existingUser = auth.getCurrentUser();
  if (existingUser) {
    showMessage('success', `✅ Already logged in as ${existingUser.name}. Redirecting...`);
    setTimeout(() => {
      window.location.href = existingUser.role === 'admin' ? 'admin.html' : 'portal.html';
    }, 1500);
  }

  // Initialise Navbar
  document.addEventListener('DOMContentLoaded', () => {
    new SideNav();
    console.log('Mdukazi Projects — Account page loaded');
    console.log('Demo Admin:  admin@mdukazi.co.za / admin123');
    console.log('Demo Client: client@mdukazi.co.za / client123');
  });

})();