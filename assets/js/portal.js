// Client Portal Functionality - Updated to fetch specials from admin

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = auth.getCurrentUser();
    if (!currentUser || currentUser.isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;
    loadClientData();
    loadSpecials();

    // Form handlers
    const issueForm = document.getElementById('issueForm');
    if (issueForm) {
        issueForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitIssue();
        });
    }

    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment();
        });
    }

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            bookService();
        });
    }

    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            const cardDetails = document.getElementById('cardDetails');
            cardDetails.style.display = this.value === 'card' ? 'block' : 'none';
        });
    }
});

function loadClientData() {
    const currentUser = auth.getCurrentUser();
    const clientData = currentUser.clientData;

    document.getElementById('servicePlan').textContent = clientData.service;
    document.getElementById('serviceSpeed').textContent = clientData.speed;
    document.getElementById('outstandingBalance').textContent = `R ${clientData.balance.toFixed(2)}`;
    document.getElementById('dueDate').textContent = clientData.dueDate;
}

function loadSpecials() {
    const specials = auth.getSpecials();
    const specialsList = document.getElementById('specials');
    
    // Filter active specials
    const today = new Date().toISOString().split('T')[0];
    const activeSpecials = specials.filter(s => s.startDate <= today && s.endDate >= today);
    
    specialsList.innerHTML = activeSpecials.map(special => `
        <div class="special-item">
            <h4>${special.title}</h4>
            <p>${special.description}</p>
            <span class="special-badge">${special.badge}</span>
        </div>
    `).join('');
}

function openPaymentModal() {
    const currentUser = auth.getCurrentUser();
    const clientData = currentUser.clientData;

    document.getElementById('paymentAmount').textContent = `R ${clientData.balance.toFixed(2)}`;
    document.getElementById('paymentService').textContent = clientData.service;
    document.getElementById('billingPeriod').textContent = `Until ${clientData.dueDate}`;

    openModal('paymentModal');
}

function openBookingModal() {
    openModal('bookingModal');
}

function submitIssue() {
    const issueType = document.getElementById('issueType').value;
    const description = document.getElementById('issueDescription').value;

    const currentUser = auth.getCurrentUser();
    const clientData = currentUser.clientData;

    const newIssue = {
        id: Date.now(),
        type: issueType,
        description: description,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    clientData.issues.push(newIssue);
    auth.updateUserClientData(clientData);

    document.getElementById('issueForm').style.display = 'none';
    document.getElementById('issueConfirmation').style.display = 'block';

    setTimeout(() => {
        document.getElementById('issueForm').style.display = 'block';
        document.getElementById('issueConfirmation').style.display = 'none';
        document.getElementById('issueForm').reset();
    }, 3000);
}

function processPayment() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const currentUser = auth.getCurrentUser();
    const clientData = currentUser.clientData;

    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;

        if (!cardNumber || !cardExpiry || !cardCVV) {
            alert('Please fill in all card details');
            return;
        }
    }

    const currentMonth = new Date().toISOString().substring(0, 7);
    
    const payment = {
        id: Date.now(),
        amount: clientData.balance,
        method: paymentMethod,
        date: new Date().toISOString(),
        service: clientData.service,
        period: currentMonth
    };

    clientData.paymentHistory.push(payment);
    if (!clientData.monthsPaid) {
        clientData.monthsPaid = [];
    }
    clientData.monthsPaid.push(currentMonth);
    clientData.balance = 0;
    clientData.dueDate = auth.getNextBillingDate();

    auth.updateUserClientData(clientData);

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
    const duration = document.getElementById('contractDuration').value;

    if (!serviceType) {
        alert('Please select a service');
        return;
    }

    const currentUser = auth.getCurrentUser();
    const clientData = currentUser.clientData;

    const serviceMap = {
        'dia-100': { name: 'DIA 100Mbps', speed: '100 Mbps', price: 2999 },
        'dia-500': { name: 'DIA 500Mbps', speed: '500 Mbps', price: 7999 },
        'dia-1000': { name: 'DIA 1Gbps', speed: '1 Gbps', price: 14999 },
        'business-fibre': { name: 'Business Fibre + CCTV', speed: '200 Mbps', price: 3499 },
        'business-vpn': { name: 'Business VPN + Security', speed: '100 Mbps', price: 1999 },
        'carrier-10g': { name: '10Gbps Carrier Link', speed: '10 Gbps', price: 29999 },
        'metro-ethernet': { name: 'Metro Ethernet', speed: '1 Gbps', price: 19999 }
    };

    const selectedService = serviceMap[serviceType];
    let discount = 1;
    if (duration === '6') discount = 0.95;
    if (duration === '12') discount = 0.90;

    clientData.service = selectedService.name;
    clientData.speed = selectedService.speed;
    clientData.balance = selectedService.price * discount * duration;

    auth.updateUserClientData(clientData);

    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('bookingConfirmation').style.display = 'block';

    setTimeout(() => {
        document.getElementById('bookingForm').style.display = 'block';
        document.getElementById('bookingConfirmation').style.display = 'none';
        closeModal('bookingModal');
        loadClientData();
    }, 3000);
}