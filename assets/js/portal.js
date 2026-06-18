/**
 * portal.js — Client portal functionality
 * Requires auth.js to be loaded first.
 */

let currentIssueId = null;
let currentClientId = null;

// FIXED: Bulletproof logout function that clears storage and forces redirect
function logout() {
    try {
        if (window.auth && typeof window.auth.logout === 'function') {
            window.auth.logout();
        }
    } catch (e) {
        console.error('Error during logout:', e);
    }
    
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'account.html';
}

function openModal(id)  { 
    const m = document.getElementById(id); 
    if (m) m.style.display = 'flex'; 
}

function closeModal(id) { 
    const m = document.getElementById(id); 
    if (m) m.style.display = 'none'; 
}

document.addEventListener('DOMContentLoaded', function () {
    // Auth guard  
    const currentUser = window.auth.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'account.html';
        return;
    }
    if (currentUser.role === 'admin') {
        window.location.href = 'admin.html';
        return;
    }

    // Populate header  
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = 'Welcome, ' + currentUser.name;
    
    loadClientData();
    loadSpecials();

    // Form handlers  
    const issueForm = document.getElementById('issueForm');
    if (issueForm) issueForm.addEventListener('submit', e => { e.preventDefault(); submitIssue(); });
    
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) paymentForm.addEventListener('submit', e => { e.preventDefault(); processPayment(); });
    
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) bookingForm.addEventListener('submit', e => { e.preventDefault(); bookService(); });
    
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function () {
            const cardDetails = document.getElementById('cardDetails');
            if (cardDetails) cardDetails.style.display = this.value === 'card' ? 'block' : 'none';
        });
    }
});

function loadClientData() {
    const user = window.auth.getCurrentUser();
    const cd = user.clientData;
    if (!cd) return;
    
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('servicePlan', cd.service);
    set('serviceSpeed', cd.speed);
    set('outstandingBalance', 'R ' + cd.balance.toFixed(2));
    set('dueDate', cd.dueDate);
}

function loadSpecials() {
    const specials = window.auth.getSpecials();
    const specialsList = document.getElementById('specials');
    if (!specialsList) return;
    
    const today = new Date().toISOString().split('T')[0];
    const active = specials.filter(s => s.startDate <= today && s.endDate >= today);
    
    if (!active.length) { 
        specialsList.innerHTML = '<p>No active specials at the moment.</p>'; 
        return; 
    }
    
    // FIXED: Cleaned up broken template literal syntax
    specialsList.innerHTML = active.map(s => `
        <div class="special-item">
            <h4>${s.title}</h4>
            <p>${s.description}</p>
            <span class="special-badge">${s.badge}</span>
        </div>
    `).join('');
}

function openPaymentModal() {
    const cd = window.auth.getCurrentUser()?.clientData;
    if (!cd) return;
    
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('paymentAmount', 'R ' + cd.balance.toFixed(2));
    set('paymentService', cd.service);
    set('billingPeriod', 'Until ' + cd.dueDate);
    openModal('paymentModal');
}

function openBookingModal() { 
    openModal('bookingModal'); 
}

function submitIssue() {
    const issueType = document.getElementById('issueType').value;
    const description = document.getElementById('issueDescription').value;
    const user = window.auth.getCurrentUser();
    const cd = user.clientData;
    
    cd.issues.push({ 
        id: Date.now(), 
        type: issueType, 
        description, 
        status: 'pending', 
        createdAt: new Date().toISOString() 
    });
    
    window.auth.updateUserClientData(cd);
    
    document.getElementById('issueForm').style.display = 'none';
    document.getElementById('issueConfirmation').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('issueForm').style.display = 'block';
        document.getElementById('issueConfirmation').style.display = 'none';
        document.getElementById('issueForm').reset();
    }, 3000);
}

function processPayment() {
    const method = document.getElementById('paymentMethod').value;
    if (method === 'card') {
        const cn = document.getElementById('cardNumber').value;
        const ce = document.getElementById('cardExpiry').value;
        const cv = document.getElementById('cardCVV').value;
        if (!cn || !ce || !cv) { 
            alert('Please fill in all card details'); 
            return; 
        }
    }
    
    const user = window.auth.getCurrentUser();
    const cd = user.clientData;
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    cd.paymentHistory.push({ 
        id: Date.now(), 
        amount: cd.balance, 
        method, 
        date: new Date().toISOString(), 
        service: cd.service, 
        period: currentMonth 
    });
    
    if (!cd.monthsPaid) cd.monthsPaid = [];
    cd.monthsPaid.push(currentMonth);
    cd.balance = 0;
    cd.dueDate = window.auth.getNextBillingDate();
    
    window.auth.updateUserClientData(cd);
    
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('paymentConfirmation').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('paymentForm').style.display = 'block';
        document.getElementById('paymentConfirmation').style.display = 'none';
        closeModal('paymentModal');
        loadClientData();
    }, 3000);
}

function bookService() {
    const serviceType = document.getElementById('bookingService').value;
    const duration = parseInt(document.getElementById('contractDuration').value);
    
    if (!serviceType) { 
        alert('Please select a service'); 
        return; 
    }
    
    const serviceMap = {
        'dia-100':        { name: 'DIA 100Mbps',           speed: '100 Mbps',  price: 2999  },
        'dia-500':        { name: 'DIA 500Mbps',           speed: '500 Mbps',  price: 7999  },
        'dia-1000':       { name: 'DIA 1Gbps',             speed: '1 Gbps',    price: 14999 },
        'business-fibre': { name: 'Business Fibre + CCTV', speed: '200 Mbps',  price: 3499  },
        'business-vpn':   { name: 'Business VPN + Security', speed: '100 Mbps', price: 1999 },
        'carrier-10g':    { name: '10Gbps Carrier Link',   speed: '10 Gbps',   price: 29999 },
        'metro-ethernet': { name: 'Metro Ethernet',        speed: '1 Gbps',    price: 19999 }
    };
    
    const svc = serviceMap[serviceType];
    const discount = duration === 6 ? 0.95 : duration === 12 ? 0.90 : 1;
    const user = window.auth.getCurrentUser();
    const cd = user.clientData;
    
    cd.service = svc.name;
    cd.speed = svc.speed;
    cd.balance = svc.price * discount * duration;
    
    window.auth.updateUserClientData(cd);
    
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('bookingConfirmation').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('bookingForm').style.display = 'block';
        document.getElementById('bookingConfirmation').style.display = 'none';
        closeModal('bookingModal');
        loadClientData();
    }, 3000);
}