/**
 * auth.js — Mdukazi Projects shared authentication & data layer
 * 
 * WHY localStorage INSTEAD OF A .json FILE:
 *   Browsers cannot read/write files on disk without a server.
 *   localStorage is the standard client-side equivalent for static demo
 *   projects — it persists across page reloads exactly like a JSON file would,
 *   lives in the browser, and requires zero server setup.
 *
 * Load this script FIRST on every page (account.html, portal.html, admin.html).
 * It exposes window.auth which all other scripts depend on.
 */

(function () {
  'use strict';

  const USERS_KEY    = 'mdukazi_users_db';
  const SESSION_KEY  = 'mdukazi_current_user';
  const SPECIALS_KEY = 'mdukazi_specials_db';

  /* ── tiny helpers ─────────────────────────────────────────────────────── */
  function read(key)       { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function nextBillingDate() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  }

  function defaultClientData(service, speed, price) {
    return {
      service,
      speed,
      balance: price,
      dueDate: nextBillingDate(),
      issues: [],
      paymentHistory: [],
      monthsPaid: []
    };
  }

  /* ── seed default data on first load ─────────────────────────────────── */
  function seedDefaults() {
    if (!read(USERS_KEY)) {
      write(USERS_KEY, [
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
          clientData: defaultClientData('Business Fibre + CCTV', '200 Mbps', 3499)
        }
      ]);
    }
    if (!read(SPECIALS_KEY)) {
      write(SPECIALS_KEY, [
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
  }

  /* ── auth public API ──────────────────────────────────────────────────── */
  const auth = {

    /* session */
    getCurrentUser() { return read(SESSION_KEY); },
    logout()         { localStorage.removeItem(SESSION_KEY); },
    getNextBillingDate: nextBillingDate,

    /* users */
    getUsers()        { return read(USERS_KEY) || []; },
    _saveUsers(users) { write(USERS_KEY, users); },

    getAllClients() {
      return this.getUsers().filter(u => u.role === 'client');
    },

    register({ name, email, phone, password }) {
      const users = this.getUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'This email is already registered.' };
      }
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
      }
      const user = {
        id: Date.now(),
        name, email, phone, password,
        role: 'client',
        createdAt: new Date().toISOString(),
        clientData: defaultClientData('Business Fibre + CCTV', '200 Mbps', 3499)
      };
      users.push(user);
      this._saveUsers(users);
      return { success: true, message: 'Account created successfully! Please login.' };
    },

    login(email, password) {
      const user = this.getUsers().find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!user) return { success: false, message: 'Invalid email or password.' };
      write(SESSION_KEY, user);
      return { success: true, message: 'Login successful!', user };
    },

    updateUserClientData(clientData) {
      const current = this.getCurrentUser();
      if (!current) return false;
      const users = this.getUsers();
      const idx   = users.findIndex(u => u.id === current.id);
      if (idx === -1) return false;
      users[idx].clientData = clientData;
      this._saveUsers(users);
      current.clientData = clientData;
      write(SESSION_KEY, current);
      return true;
    },

    /* issues */
    getAllIssues() {
      return this.getAllClients()
        .flatMap(u => (u.clientData?.issues || []).map(i => ({
          ...i,
          clientId:    u.id,
          clientName:  u.name,
          clientEmail: u.email
        })))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    updateIssueStatus(issueId, clientId, status, response) {
      const users = this.getUsers();
      const ui    = users.findIndex(u => u.id === clientId);
      if (ui === -1) return false;
      const issue = (users[ui].clientData?.issues || []).find(i => i.id === issueId);
      if (!issue) return false;
      issue.status     = status;
      issue.response   = response;
      issue.resolvedAt = new Date().toISOString();
      this._saveUsers(users);
      return true;
    },

    /* payments */
    getAllPayments() {
      return this.getAllClients()
        .flatMap(u => (u.clientData?.paymentHistory || []).map(p => ({
          ...p,
          clientId:   u.id,
          clientName: u.name
        })))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /* outstanding */
    getOutstandingAccounts() {
      return this.getAllClients().filter(u => (u.clientData?.balance || 0) > 0);
    },

    /* specials */
    getSpecials()    { return read(SPECIALS_KEY) || []; },
    createSpecial(d) {
      const list = this.getSpecials();
      list.push({ id: Date.now(), ...d });
      write(SPECIALS_KEY, list);
    },
    deleteSpecial(id) {
      write(SPECIALS_KEY, this.getSpecials().filter(s => s.id !== id));
    },

    /* analytics */
    getAnalytics() {
      const clients      = this.getAllClients();
      const payments     = this.getAllPayments();
      const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const totalOut     = clients.reduce((s, u) => s + (u.clientData?.balance || 0), 0);

      const monthly = {};
      clients.forEach(u => {
        const m = u.createdAt.substring(0, 7);
        monthly[m] = (monthly[m] || 0) + 1;
      });

      const services = {};
      clients.forEach(u => {
        const s = u.clientData?.service || 'Unknown';
        services[s] = (services[s] || 0) + 1;
      });

      return {
        totalClients:        clients.length,
        totalRevenue,
        totalOutstanding:    totalOut,
        recentSignups:       [...clients].reverse().slice(0, 5),
        recentPayments:      payments.slice(0, 5),
        monthlySignups:      monthly,
        serviceDistribution: services
      };
    }
  };

  seedDefaults();
  window.auth = auth;

})();