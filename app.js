// Data Storage
class DataStore {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('ecomLeaderUsers') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.stores = JSON.parse(localStorage.getItem('ecomLeaderStores') || '[]');
        this.transactions = JSON.parse(localStorage.getItem('ecomLeaderTransactions') || '[]');
        
        // Initialize demo data if empty
        this.initializeDemoData();
    }

    initializeDemoData() {
        if (this.stores.length === 0) {
            const demoStores = [
                { id: 'demo1', name: 'TechWorld Store', email: 'demo@techworld.com', url: 'https://techworld.com', revenue: 45670, orders: 234, createdAt: new Date() },
                { id: 'demo2', name: 'Fashion Hub', email: 'demo@fashionhub.com', url: 'https://fashionhub.com', revenue: 38920, orders: 189, createdAt: new Date() },
                { id: 'demo3', name: 'Home Essentials', email: 'demo@homeessentials.com', url: 'https://homeessentials.com', revenue: 32150, orders: 156, createdAt: new Date() },
                { id: 'demo4', name: 'Sports Central', email: 'demo@sportscentral.com', url: 'https://sportscentral.com', revenue: 28900, orders: 143, createdAt: new Date() },
                { id: 'demo5', name: 'Beauty Corner', email: 'demo@beautycorner.com', url: 'https://beautycorner.com', revenue: 25600, orders: 128, createdAt: new Date() }
            ];
            this.stores = demoStores;
            this.saveStores();
        }
    }

    saveUsers() {
        localStorage.setItem('ecomLeaderUsers', JSON.stringify(this.users));
    }

    saveCurrentUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    saveStores() {
        localStorage.setItem('ecomLeaderStores', JSON.stringify(this.stores));
    }

    saveTransactions() {
        localStorage.setItem('ecomLeaderTransactions', JSON.stringify(this.transactions));
    }

    register(userData) {
        const user = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date(),
            apiKey: this.generateApiKey()
        };
        
        this.users.push(user);
        this.saveUsers();
        
        // Add to stores leaderboard
        const store = {
            id: user.id,
            name: userData.storeName,
            email: userData.email,
            url: userData.storeUrl,
            revenue: 0,
            orders: 0,
            createdAt: new Date()
        };
        
        this.stores.push(store);
        this.saveStores();
        
        return user;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            this.saveCurrentUser();
            return user;
        }
        return null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    generateApiKey() {
        return 'ecl_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    addTransaction(storeId, amount) {
        const transaction = {
            id: Date.now().toString(),
            storeId,
            amount: parseFloat(amount),
            timestamp: new Date()
        };
        
        this.transactions.push(transaction);
        this.saveTransactions();
        
        // Update store stats
        const store = this.stores.find(s => s.id === storeId);
        if (store) {
            store.revenue += transaction.amount;
            store.orders += 1;
            this.saveStores();
        }
        
        return transaction;
    }

    getStoreStats(storeId) {
        const store = this.stores.find(s => s.id === storeId);
        if (!store) return { revenue: 0, orders: 0, rank: 0, avgOrderValue: 0 };
        
        const sortedStores = [...this.stores].sort((a, b) => b.revenue - a.revenue);
        const rank = sortedStores.findIndex(s => s.id === storeId) + 1;
        const avgOrderValue = store.orders > 0 ? store.revenue / store.orders : 0;
        
        return {
            revenue: store.revenue,
            orders: store.orders,
            rank,
            avgOrderValue
        };
    }
}

// Initialize data store
const dataStore = new DataStore();

// Auth Functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = dataStore.login(email, password);
    if (user) {
        showDashboard();
        showNotification('Welcome back!', 'success');
    } else {
        showNotification('Invalid credentials. Try demo@store.com / password', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    const userData = {
        storeName: document.getElementById('storeName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        storeUrl: document.getElementById('storeUrl').value
    };
    
    const user = dataStore.register(userData);
    if (user) {
        dataStore.currentUser = user;
        dataStore.saveCurrentUser();
        showDashboard();
        showNotification('Account created successfully!', 'success');
    }
}

function logout() {
    dataStore.logout();
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
    showNotification('Logged out successfully', 'success');
}

// Dashboard Functions
function showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    
    if (dataStore.currentUser) {
        updateDashboard();
    }
}

function updateDashboard() {
    const user = dataStore.currentUser;
    const stats = dataStore.getStoreStats(user.id);
    
    document.getElementById('userStoreName').textContent = user.storeName;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.revenue);
    document.getElementById('totalOrders').textContent = stats.orders.toLocaleString();
    document.getElementById('leaderboardRank').textContent = `#${stats.rank}`;
    document.getElementById('avgOrderValue').textContent = formatCurrency(stats.avgOrderValue);
    
    // Update tracking code
    const trackingCode = generateTrackingCode(user.apiKey);
    document.getElementById('trackingCode').textContent = trackingCode;
    
    // Update integration status
    updateIntegrationStatus();
    
    // Update recent activity
    updateRecentActivity();
}

function generateTrackingCode(apiKey) {
    return `<!-- eCOMLeaderboard 2025 Tracking Code -->
<script>
(function() {
    var ecl = window.eCOMLeaderboard = window.eCOMLeaderboard || {};
    ecl.apiKey = '${apiKey}';
    ecl.track = function(event, data) {
        fetch('https://api.ecomleaderboard.com/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: ecl.apiKey, event: event, data: data })
        });
    };
    
    // Auto-track page views
    ecl.track('page_view', { url: window.location.href });
    
    // Track purchases (call this on order confirmation)
    // ecl.track('purchase', { amount: 99.99, orderId: 'ORD123' });
})();
</script>`;
}

function copyTrackingCode() {
    const code = document.getElementById('trackingCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Tracking code copied to clipboard!', 'success');
    });
}

function updateIntegrationStatus() {
    // Simulate connection status
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    
    // For demo purposes, show as connected after first login
    if (dataStore.currentUser) {
        statusDot.classList.add('connected');
        statusText.textContent = 'Connected & Tracking';
    }
}

function updateRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    const user = dataStore.currentUser;
    
    // Get recent transactions for this user
    const userTransactions = dataStore.transactions
        .filter(t => t.storeId === user.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    if (userTransactions.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <span class="activity-icon">🔗</span>
                <span>Tracking code generated</span>
                <span class="activity-time">Just now</span>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = userTransactions.map(transaction => `
        <div class="activity-item">
            <span class="activity-icon">💰</span>
            <span>Sale recorded: ${formatCurrency(transaction.amount)}</span>
            <span class="activity-time">${formatTimeAgo(transaction.timestamp)}</span>
        </div>
    `).join('');
}

function simulatePurchase(event) {
    event.preventDefault();
    const amount = document.getElementById('testOrderValue').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid order amount', 'error');
        return;
    }
    
    dataStore.addTransaction(dataStore.currentUser.id, amount);
    updateDashboard();
    showNotification(`Test purchase of ${formatCurrency(amount)} recorded!`, 'success');
    
    // Clear the input
    document.getElementById('testOrderValue').value = '';
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #10B981;' : ''}
        ${type === 'error' ? 'background: #EF4444;' : ''}
        ${type === 'info' ? 'background: #DF1783;' : ''}
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    if (dataStore.currentUser) {
        showDashboard();
    } else {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('dashboardSection').style.display = 'none';
    }
});
