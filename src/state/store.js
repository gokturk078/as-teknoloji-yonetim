/**
 * ============================================
 * AS TEKNOLOJİ YÖNETİM - CENTRALIZED STATE STORE
 * Ultra Professional State Management
 * ============================================
 */

// Singleton State Store
const AppState = {
    // Core Data
    _payments: [],
    _filteredPayments: [],
    _currencyRates: { USD: 34.50, EUR: 37.20, STG: 43.80 },
    
    // Subscribers for reactive updates
    _listeners: new Set(),

    // ============================================
    // GETTERS
    // ============================================
    
    get payments() {
        return this._payments;
    },

    get filteredPayments() {
        return this._filteredPayments;
    },

    get currencyRates() {
        return this._currencyRates;
    },

    /**
     * Get a payment by ID - ALWAYS returns fresh data
     * @param {string} id - Payment UUID
     * @returns {Object|null} Payment object or null if not found
     */
    getPaymentById(id) {
        return this._payments.find(p => p.id === id) || null;
    },

    // ============================================
    // SETTERS / MUTATIONS
    // ============================================

    /**
     * Update the payments array and notify listeners
     * @param {Array} newPayments - Fresh payments from API
     */
    updatePayments(newPayments) {
        this._payments = [...newPayments];
        this._filteredPayments = [...newPayments];
        this._notify();
        console.log('📦 State: Payments updated', this._payments.length, 'records');
    },

    /**
     * Update filtered payments (for search/filter results)
     * @param {Array} filtered - Filtered payment subset
     */
    updateFilteredPayments(filtered) {
        this._filteredPayments = [...filtered];
        this._notify();
        console.log('🔍 State: Filtered payments updated', this._filteredPayments.length, 'records');
    },

    /**
     * Update currency rates
     * @param {Object} rates - { USD, EUR, STG } rates
     */
    updateCurrencyRates(rates) {
        this._currencyRates = { ...this._currencyRates, ...rates };
        this._notify();
    },

    /**
     * Update a single payment in-place (optimistic update)
     * @param {string} id - Payment ID
     * @param {Object} updates - Fields to update
     */
    patchPayment(id, updates) {
        const idx = this._payments.findIndex(p => p.id === id);
        if (idx !== -1) {
            this._payments[idx] = { ...this._payments[idx], ...updates };
            
            // Also update in filtered if present
            const filteredIdx = this._filteredPayments.findIndex(p => p.id === id);
            if (filteredIdx !== -1) {
                this._filteredPayments[filteredIdx] = { ...this._filteredPayments[filteredIdx], ...updates };
            }
            
            this._notify();
            console.log('✏️ State: Payment patched', id);
        }
    },

    /**
     * Remove a payment from state
     * @param {string} id - Payment ID to remove
     */
    removePayment(id) {
        this._payments = this._payments.filter(p => p.id !== id);
        this._filteredPayments = this._filteredPayments.filter(p => p.id !== id);
        this._notify();
        console.log('🗑️ State: Payment removed', id);
    },

    // ============================================
    // SUBSCRIPTION (Observer Pattern)
    // ============================================

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    },

    /**
     * Notify all listeners of state change
     */
    _notify() {
        this._listeners.forEach(fn => {
            try {
                fn(this);
            } catch (e) {
                console.error('State listener error:', e);
            }
        });
    },

    // ============================================
    // UTILITIES
    // ============================================

    /**
     * Reset state to initial values
     */
    reset() {
        this._payments = [];
        this._filteredPayments = [];
        this._listeners.clear();
        console.log('🔄 State: Reset complete');
    },

    /**
     * Debug: Log current state
     */
    debug() {
        console.table({
            payments: this._payments.length,
            filteredPayments: this._filteredPayments.length,
            listeners: this._listeners.size,
            rates: JSON.stringify(this._currencyRates)
        });
    }
};

// Freeze to prevent accidental property additions
Object.seal(AppState);

export { AppState };
