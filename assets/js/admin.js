// Admin Portal Functionality

let currentIssueId = null;
let currentClientId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    const currentUser = auth.getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
            
            document.getElementById('pageTitle').textContent = this.querySelector('span:last-child').textContent;
            
            loadSectionData(section);
        });
    });

    // Load dashboard data
    loadDashboard();

    // Special Form
    const specialForm = document.getElementById('specialForm');
    if (specialForm) {
        specialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createSpecial();
        });
    }

    // Resolve Form
    const resolveForm = document.getElementById('resolveForm');
    if (resolveForm) {
        resolveForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resolveIssue();
        });
    }
});

function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'issues':
            loadIssues();
            break;
        case 'specials':
            loadSpecials();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'outstanding':
            loadOutstanding();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

function loadDashboard() {
    const analytics = auth.getAnalytics();
    
    document.getElementById('totalClients').textContent = analytics.totalClients;
    document.getElementById('totalRevenue').textContent = `R ${analytics.totalRevenue.toFixed(2)}`;
    document.getElementById('totalOutstanding').textContent = `R ${analytics.totalOutstanding.toFixed(2)}`;
    
    const allIssues = auth.getAllIssues();
    const pendingIssues = allIssues.filter(i => i.status === 'pending');
    document.getElementById('pendingIssues').textContent = pendingIssues.length;

    // Recent Signups
    const recentSignups = document.getElementById('recentSignups');
    recentSignups.innerHTML = analytics.recentSignups.map(user => `
        <div class="list-item">
            <h4>${user.name}</h4>
            <p>${user.email}</p>
            <div class="timestamp">${new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
    `).join('');

    // Recent Payments
    const recentPayments = document.getElementById('recentPayments');
    recentPayments.innerHTML = analytics.recentPayments.map(payment => `
        <div class="list-item">
            <h4>${payment.clientName}</h4>
            <p>R ${payment.amount.toFixed(2)} - ${payment.service}</p>
            <div class="timestamp">${new Date(payment.date).toLocaleDateString()}</div>
        </div>
    `).join('');

    // Recent Issues
    const recentIssues = document.getElementById('recentIssues');
    const recentIssuesList = allIssues.slice(0, 5);
    recentIssues.innerHTML = recentIssuesList.map(issue => `
        <div class="list-item">
            <h4>${issue.clientName} - ${issue.type}</h4>
            <p>${issue.description.substring(0, 100)}...</p>
            <div class="timestamp">${new Date(issue.createdAt).toLocaleDateString()}</div>
        </div>
    `).join('');
}

function loadIssues() {
    const allIssues = auth.getAllIssues();
    const issuesList = document.getElementById('issuesList');
    
    issuesList.innerHTML = allIssues.map(issue => `
        <div class="issue-card ${issue.status}">
            <div class="issue-header">
                <h4>${issue.type}</h4>
                <span class="issue-status ${issue.status}">${issue.status}</span>
            </div>
            <div class="issue-details">
                <p><strong>Client:</strong> ${issue.clientName}</p>
                <p><strong>Email:</strong> ${issue.clientEmail}</p>
                <p>${issue.description}</p>
                ${issue.response ? `<p><strong>Response:</strong> ${issue.response}</p>` : ''}
            </div>
            <div class="issue-meta">
                <span>Reported: ${new Date(issue.createdAt).toLocaleString()}</span>
                ${issue.resolvedAt ? `<span>Resolved: ${new Date(issue.resolvedAt).toLocaleString()}</span>` : ''}
            </div>
            ${issue.status === 'pending' ? `
                <div class="issue-actions">
                    <button onclick="openResolveModal(${issue.id}, ${issue.clientId})" class="btn-sm btn-primary">Resolve</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function filterIssues() {
    const filter = document.getElementById('issueFilter').value;
    const allIssues = auth.getAllIssues();
    const filtered = filter === 'all' ? allIssues : allIssues.filter(i => i.status === filter);
    
    const issuesList = document.getElementById('issuesList');
    issuesList.innerHTML = filtered.map(issue => `
        <div class="issue-card ${issue.status}">
            <div class="issue-header">
                <h4>${issue.type}</h4>
                <span class="issue-status ${issue.status}">${issue.status}</span>
            </div>
            <div class="issue-details">
                <p><strong>Client:</strong> ${issue.clientName}</p>
                <p><strong>Email:</strong> ${issue.clientEmail}</p>
                <p>${issue.description}</p>
                ${issue.response ? `<p><strong>Response:</strong> ${issue.response}</p>` : ''}
            </div>
            <div class="issue-meta">
                <span>Reported: ${new Date(issue.createdAt).toLocaleString()}</span>
                ${issue.resolvedAt ? `<span>Resolved: ${new Date(issue.resolvedAt).toLocaleString()}</span>` : ''}
            </div>
            ${issue.status === 'pending' ? `
                <div class="issue-actions">
                    <button onclick="openResolveModal(${issue.id}, ${issue.clientId})" class="btn-sm btn-primary">Resolve</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function openResolveModal(issueId, clientId) {
    currentIssueId = issueId;
    currentClientId = clientId;
    document.getElementById('resolveModal').style.display = 'flex';
}

function closeResolveModal() {
    document.getElementById('resolveModal').style.display = 'none';
    document.getElementById('resolveForm').reset();
}

function resolveIssue() {
    const message = document.getElementById('resolveMessage').value;
    
    if (auth.updateIssueStatus(currentIssueId, currentClientId, 'resolved', message)) {
        alert('Issue resolved successfully!');
        closeResolveModal();
        loadIssues();
    } else {
        alert('Error resolving issue');
    }
}

function loadSpecials() {
    const specials = auth.getSpecials();
    const specialsList = document.getElementById('specialsList');
    
    specialsList.innerHTML = specials.map(special => `
        <div class="special-card">
            <span class="special-badge">${special.badge}</span>
            <h4>${special.title}</h4>
            <p>${special.description}</p>
            <div class="special-meta">
                <p><strong>Period:</strong> ${special.startDate} to ${special.endDate}</p>
                <p><strong>Target:</strong> ${special.targetServices || 'All Services'}</p>
                <p><strong>Created:</strong> ${new Date(special.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="special-actions">
                <button onclick="deleteSpecial(${special.id})" class="btn-sm btn-danger">Delete</button>
            </div>
        </div>
    `).join('');
}

function openSpecialModal() {
    document.getElementById('specialModal').style.display = 'flex';
}

function closeSpecialModal() {
    document.getElementById('specialModal').style.display = 'none';
    document.getElementById('specialForm').reset();
}

function createSpecial() {
    const specialData = {
        title: document.getElementById('specialTitle').value,
        description: document.getElementById('specialDescription').value,
        badge: document.getElementById('specialBadge').value,
        startDate: document.getElementById('specialStartDate').value,
        endDate: document.getElementById('specialEndDate').value,
        targetServices: document.getElementById('specialTargetServices').value
    };

    auth.createSpecial(specialData);
    alert('Special created successfully!');
    closeSpecialModal();
    loadSpecials();
}

function deleteSpecial(specialId) {
    if (confirm('Are you sure you want to delete this special?')) {
        auth.deleteSpecial(specialId);
        loadSpecials();
    }
}

function loadPayments() {
    const payments = auth.getAllPayments();
    const users = auth.getAllClients();
    
    // Populate client filter
    const clientFilter = document.getElementById('paymentClient');
    clientFilter.innerHTML = '<option value="all">All Clients</option>' +
        users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    
    displayPayments(payments);
}

function displayPayments(payments) {
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${new Date(payment.date).toLocaleDateString()}</td>
            <td>${payment.clientName}</td>
            <td>R ${payment.amount.toFixed(2)}</td>
            <td>${payment.service}</td>
            <td>${payment.period || 'N/A'}</td>
            <td>${payment.method}</td>
            <td><span class="status-badge paid">Paid</span></td>
        </tr>
    `).join('');
}

function filterPayments() {
    const month = document.getElementById('paymentMonth').value;
    const clientId = document.getElementById('paymentClient').value;
    
    let payments = auth.getAllPayments();
    
    if (month) {
        payments = payments.filter(p => p.date.startsWith(month));
    }
    
    if (clientId !== 'all') {
        payments = payments.filter(p => p.clientId === parseInt(clientId));
    }
    
    displayPayments(payments);
}

function loadOutstanding() {
    const outstanding = auth.getOutstandingAccounts();
    displayOutstanding(outstanding);
}

function displayOutstanding(accounts) {
    const tbody = document.getElementById('outstandingTableBody');
    tbody.innerHTML = accounts.map(account => {
        const dueDate = new Date(account.clientData.dueDate);
        const today = new Date();
        const isOverdue = dueDate < today;
        const monthsOutstanding = Math.max(1, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24 * 30)));
        
        return `
            <tr>
                <td>${account.name}</td>
                <td>${account.email}</td>
                <td>${account.clientData.service}</td>
                <td>R ${account.clientData.balance.toFixed(2)}</td>
                <td>${account.clientData.dueDate}</td>
                <td>${monthsOutstanding} month(s)</td>
                <td><span class="status-badge ${isOverdue ? 'overdue' : 'pending'}">${isOverdue ? 'Overdue' : 'Pending'}</span></td>
                <td><button onclick="sendReminder('${account.email}')" class="btn-sm btn-primary">Send Reminder</button></td>
            </tr>
        `;
    }).join('');
}

function filterOutstanding() {
    const filter = document.getElementById('outstandingFilter').value;
    let accounts = auth.getOutstandingAccounts();
    
    if (filter === 'overdue') {
        const today = new Date();
        accounts = accounts.filter(a => new Date(a.clientData.dueDate) < today);
    } else if (filter === 'current') {
        const today = new Date();
        accounts = accounts.filter(a => new Date(a.clientData.dueDate) >= today);
    }
    
    displayOutstanding(accounts);
}

function sendReminder(email) {
    alert(`Payment reminder would be sent to: ${email}\n\n(In production, this would send an actual email)`);
}

function loadAnalytics() {
    const analytics = auth.getAnalytics();
    
    // Creation Timeline
    const timeline = document.getElementById('creationTimeline');
    const users = auth.getAllClients();
    const groupedByDate = {};
    
    users.forEach(user => {
        const date = user.createdAt.split('T')[0];
        groupedByDate[date] = (groupedByDate[date] || 0) + 1;
    });
    
    const sortedDates = Object.keys(groupedByDate).sort().reverse().slice(0, 10);
    timeline.innerHTML = sortedDates.map(date => `
        <div class="timeline-item">
            <div class="timeline-date">${date}</div>
            <div class="timeline-count">${groupedByDate[date]} account(s) created</div>
        </div>
    `).join('');

    // Monthly Signups Chart
    const monthlyChart = document.getElementById('monthlySignups');
    const monthlyData = analytics.monthlySignups;
    const months = Object.keys(monthlyData).sort();
    const maxCount = Math.max(...Object.values(monthlyData));
    
    monthlyChart.innerHTML = `
        <div class="bar-chart">
            ${months.map(month => {
                const height = (monthlyData[month] / maxCount) * 100;
                return `
                    <div class="bar" style="height: ${height}%">
                        <div class="bar-value">${monthlyData[month]}</div>
                        <div class="bar-label">${month}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // Service Distribution
    const distribution = document.getElementById('serviceDistribution');
    const services = analytics.serviceDistribution;
    const totalClients = analytics.totalClients;
    
    distribution.innerHTML = Object.entries(services).map(([service, count]) => {
        const percentage = (count / totalClients) * 100;
        return `
            <div class="distribution-item">
                <span>${service}</span>
                <div class="distribution-bar">
                    <div class="distribution-fill" style="width: ${percentage}%"></div>
                </div>
                <span>${count} (${percentage.toFixed(1)}%)</span>
            </div>
        `;
    }).join('');

    // Client Growth
    const growth = document.getElementById('clientGrowth');
    const thisMonth = new Date().toISOString().substring(0, 7);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7);
    const thisMonthCount = monthlyData[thisMonth] || 0;
    const lastMonthCount = monthlyData[lastMonth] || 0;
    const growthRate = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount * 100).toFixed(1) : 0;
    
    growth.innerHTML = `
        <div class="growth-stat">
            <span>This Month</span>
            <span class="growth-value">${thisMonthCount}</span>
        </div>
        <div class="growth-stat">
            <span>Last Month</span>
            <span class="growth-value">${lastMonthCount}</span>
        </div>
        <div class="growth-stat">
            <span>Growth Rate</span>
            <span class="growth-value">${growthRate}%</span>
        </div>
        <div class="growth-stat">
            <span>Total Clients</span>
            <span class="growth-value">${totalClients}</span>
        </div>
    `;
}