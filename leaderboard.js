// Leaderboard functionality
class LeaderboardManager {
    constructor() {
        this.dataStore = new DataStore();
        this.currentFilter = 'revenue';
        this.currentTimeFilter = 'month';
    }

    initialize() {
        this.updateLeaderboard();
        this.updateStats();
    }

    updateStats() {
        const totalStores = this.dataStore.stores.length;
        const totalRevenue = this.dataStore.stores.reduce((sum, store) => sum + store.revenue, 0);
        
        document.getElementById('totalStores').textContent = totalStores.toLocaleString();
        document.getElementById('totalRevenue').textContent = this.formatCurrency(totalRevenue);
    }

    updateLeaderboard() {
        const sortedStores = this.getSortedStores();
        this.updatePodium(sortedStores);
        this.updateTable(sortedStores);
    }

    getSortedStores() {
        let stores = [...this.dataStore.stores];
        
        // Apply time filter (for demo purposes, we'll just use all data)
        // In a real app, you would filter by date ranges here
        
        // Sort by current filter
        switch (this.currentFilter) {
            case 'revenue':
                stores.sort((a, b) => b.revenue - a.revenue);
                break;
            case 'orders':
                stores.sort((a, b) => b.orders - a.orders);
                break;
            case 'growth':
                // For demo, calculate growth based on revenue per day since creation
                stores = stores.map(store => {
                    const daysActive = Math.max(1, Math.floor((new Date() - new Date(store.createdAt)) / (1000 * 60 * 60 * 24)));
                    const dailyRevenue = store.revenue / daysActive;
                    return { ...store, growth: dailyRevenue };
                }).sort((a, b) => b.growth - a.growth);
                break;
        }
        
        return stores;
    }

    updatePodium(stores) {
        const podiumPlaces = ['firstPlace', 'secondPlace', 'thirdPlace'];
        
        podiumPlaces.forEach((placeId, index) => {
            const place = document.getElementById(placeId);
            const store = stores[index];
            
            if (store) {
                const info = place.querySelector('.podium-info');
                info.querySelector('h3').textContent = store.name;
                
                switch (this.currentFilter) {
                    case 'revenue':
                        info.querySelector('p').textContent = this.formatCurrency(store.revenue);
                        break;
                    case 'orders':
                        info.querySelector('p').textContent = `${store.orders} orders`;
                        break;
                    case 'growth':
                        const growth = store.growth || 0;
                        info.querySelector('p').textContent = `${this.formatCurrency(growth)}/day`;
                        break;
                }
            } else {
                const info = place.querySelector('.podium-info');
                info.querySelector('h3').textContent = '-';
                info.querySelector('p').textContent = '$0';
            }
        });
    }

    updateTable(stores) {
        const tableContent = document.getElementById('leaderboardContent');
        
        tableContent.innerHTML = stores.slice(3).map((store, index) => {
            const rank = index + 4;
            const growth = this.calculateGrowth(store);
            const avgOrderValue = store.orders > 0 ? store.revenue / store.orders : 0;
            
            return `
                <div class="leaderboard-row">
                    <div class="col-rank">
                        <div class="rank-badge">${rank}</div>
                    </div>
                    <div class="col-store">
                        <div class="store-info">
                            <div class="store-name">${store.name}</div>
                            <div class="store-url">${this.formatUrl(store.url)}</div>
                        </div>
                    </div>
                    <div class="col-revenue">
                        <div class="revenue-amount">${this.formatCurrency(store.revenue)}</div>
                    </div>
                    <div class="col-orders">
                        <div>${store.orders}</div>
                    </div>
                    <div class="col-growth">
                        <div class="growth-badge ${growth >= 0 ? 'growth-positive' : 'growth-negative'}">
                            ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateGrowth(store) {
        // For demo purposes, generate random growth between -15% and +25%
        return (Math.random() * 40) - 15;
    }

    formatUrl(url) {
        return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Data Storage (reuse from app.js)
class DataStore {
    constructor() {
        this.stores = JSON.parse(localStorage.getItem('ecomLeaderStores') || '[]');
        this.initializeDemoData();
    }

    initializeDemoData() {
        if (this.stores.length === 0) {
            const demoStores = [
                { id: 'demo1', name: 'TechWorld Store', email: 'demo@techworld.com', url: 'https://techworld.com', revenue: 45670, orders: 234, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                { id: 'demo2', name: 'Fashion Hub', email: 'demo@fashionhub.com', url: 'https://fashionhub.com', revenue: 38920, orders: 189, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
                { id: 'demo3', name: 'Home Essentials', email: 'demo@homeessentials.com', url: 'https://homeessentials.com', revenue: 32150, orders: 156, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
                { id: 'demo4', name: 'Sports Central', email: 'demo@sportscentral.com', url: 'https://sportscentral.com', revenue: 28900, orders: 143, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
                { id: 'demo5', name: 'Beauty Corner', email: 'demo@beautycorner.com', url: 'https://beautycorner.com', revenue: 25600, orders: 128, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
                { id: 'demo6', name: 'Pet Paradise', email: 'demo@petparadise.com', url: 'https://petparadise.com', revenue: 22300, orders: 112, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
                { id: 'demo7', name: 'Book Haven', email: 'demo@bookhaven.com', url: 'https://bookhaven.com', revenue: 19800, orders: 98, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
                { id: 'demo8', name: 'Garden Grove', email: 'demo@gardengrove.com', url: 'https://gardengrove.com', revenue: 17500, orders: 85, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }
            ];
            this.stores = demoStores;
            localStorage.setItem('ecomLeaderStores', JSON.stringify(this.stores));
        }
    }
}

// Global functions for HTML event handlers
function filterLeaderboard(type) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update leaderboard
    leaderboardManager.currentFilter = type;
    leaderboardManager.updateLeaderboard();
}

function updateTimeFilter() {
    const timeFilter = document.getElementById('timeFilter').value;
    leaderboardManager.currentTimeFilter = timeFilter;
    leaderboardManager.updateLeaderboard();
}

// Initialize leaderboard
const leaderboardManager = new LeaderboardManager();

document.addEventListener('DOMContentLoaded', function() {
    leaderboardManager.initialize();
});
