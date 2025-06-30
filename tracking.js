// eCOMLeaderboard 2025 Tracking Script
// This is the embeddable tracking script that stores add to their websites

(function(window, document) {
    'use strict';
    
    // Initialize eCOMLeaderboard namespace
    window.eCOMLeaderboard = window.eCOMLeaderboard || {};
    
    const ECL = window.eCOMLeaderboard;
    
    // Configuration
    ECL.config = {
        apiEndpoint: 'https://api.ecomleaderboard.com/track', // In production, this would be your actual API
        debug: false
    };
    
    // Utility functions
    ECL.utils = {
        log: function(message, data) {
            if (ECL.config.debug) {
                console.log('[eCOMLeaderboard]', message, data);
            }
        },
        
        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        },
        
        setCookie: function(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/`;
        },
        
        generateSessionId: function() {
            return 'ecl_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
        },
        
        getSessionId: function() {
            let sessionId = this.getCookie('ecl_session');
            if (!sessionId) {
                sessionId = this.generateSessionId();
                this.setCookie('ecl_session', sessionId, 30); // 30 days
            }
            return sessionId;
        }
    };
    
    // Session management
    ECL.session = {
        id: ECL.utils.getSessionId(),
        startTime: Date.now(),
        pageViews: 0
    };
    
    // Data collection
    ECL.data = {
        collectPageData: function() {
            return {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                sessionId: ECL.session.id,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };
        },
        
        collectPurchaseData: function(data) {
            return {
                ...this.collectPageData(),
                event: 'purchase',
                amount: parseFloat(data.amount) || 0,
                orderId: data.orderId || null,
                currency: data.currency || 'USD',
                products: data.products || []
            };
        }
    };
    
    // Tracking functions
    ECL.track = function(event, data) {
        if (!ECL.apiKey) {
            ECL.utils.log('Error: API key not set. Please set eCOMLeaderboard.apiKey');
            return;
        }
        
        let eventData;
        
        switch (event) {
            case 'page_view':
                eventData = ECL.data.collectPageData();
                ECL.session.pageViews++;
                break;
            case 'purchase':
                eventData = ECL.data.collectPurchaseData(data || {});
                break;
            default:
                eventData = {
                    ...ECL.data.collectPageData(),
                    event: event,
                    data: data || {}
                };
        }
        
        ECL.utils.log('Tracking event:', event, eventData);
        
        // Send data to API
        ECL.send(eventData);
    };
    
    // API communication
    ECL.send = function(data) {
        const payload = {
            apiKey: ECL.apiKey,
            ...data
        };
        
        // For demo purposes, we'll store in localStorage
        // In production, this would make an actual API call
        if (typeof localStorage !== 'undefined') {
            try {
                const existingData = JSON.parse(localStorage.getItem('ecomLeaderboardTracking') || '[]');
                existingData.push(payload);
                localStorage.setItem('ecomLeaderboardTracking', JSON.stringify(existingData));
                ECL.utils.log('Data stored locally (demo mode):', payload);
            } catch (e) {
                ECL.utils.log('Error storing tracking data:', e);
            }
        }
        
        // In production, uncomment this for actual API calls:
        /*
        fetch(ECL.config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            ECL.utils.log('Tracking successful:', data);
        }).catch(error => {
            ECL.utils.log('Tracking error:', error);
        });
        */
    };
    
    // E-commerce specific tracking helpers
    ECL.ecommerce = {
        trackPurchase: function(orderId, amount, products) {
            ECL.track('purchase', {
                orderId: orderId,
                amount: amount,
                products: products || []
            });
        },
        
        trackAddToCart: function(productId, productName, price) {
            ECL.track('add_to_cart', {
                productId: productId,
                productName: productName,
                price: price
            });
        },
        
        trackProductView: function(productId, productName, category) {
            ECL.track('product_view', {
                productId: productId,
                productName: productName,
                category: category
            });
        }
    };
    
    // Auto-initialization
    ECL.init = function() {
        // Track page view automatically
        ECL.track('page_view');
        
        // Set up automatic e-commerce tracking for common platforms
        ECL.autoTrack.setupShopify();
        ECL.autoTrack.setupWooCommerce();
        ECL.autoTrack.setupMagento();
        
        ECL.utils.log('eCOMLeaderboard 2025 initialized');
    };
    
    // Automatic tracking for popular e-commerce platforms
    ECL.autoTrack = {
        setupShopify: function() {
            // Shopify checkout tracking
            if (window.Shopify && window.Shopify.checkout) {
                const checkout = window.Shopify.checkout;
                if (checkout.order_id && checkout.total_price) {
                    ECL.ecommerce.trackPurchase(
                        checkout.order_id,
                        checkout.total_price,
                        checkout.line_items
                    );
                }
            }
        },
        
        setupWooCommerce: function() {
            // WooCommerce order tracking
            if (window.wc_order_tracking) {
                const order = window.wc_order_tracking;
                ECL.ecommerce.trackPurchase(
                    order.order_id,
                    order.order_total,
                    order.items
                );
            }
        },
        
        setupMagento: function() {
            // Magento order tracking
            if (window.checkout && window.checkout.success) {
                const order = window.checkout.success;
                ECL.ecommerce.trackPurchase(
                    order.orderId,
                    order.total,
                    order.items
                );
            }
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ECL.init);
    } else {
        ECL.init();
    }
    
})(window, document);
