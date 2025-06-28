class BadgeManager {
    constructor() {
        this.cartBadge = document.getElementById('cart-badge');
        this.wishlistBadge = document.getElementById('wishlist-badge');
        
        // Initialize badges
        this.updateBadges();
        
        // Update when auth state changes
        document.addEventListener('authStateChanged', () => this.updateBadges());
    }
    
    async updateBadges() {
        await this.updateCartBadge();
        await this.updateWishlistBadge();
    }
    
    async updateCartBadge() {
        try {
            if (!auth.getAuthToken()) {
                this.cartBadge?.classList.add('d-none');
                return;
            }
            
            const cart = await api.get('/Cart');
            const itemCount = cart.cartItems?.length || 0;
            
            if (this.cartBadge) {
                if (itemCount > 0) {
                    this.cartBadge.textContent = itemCount;
                    this.cartBadge.classList.remove('d-none');
                } else {
                    this.cartBadge.classList.add('d-none');
                }
            }
        } catch (error) {
            console.error('Error updating cart badge:', error);
            this.cartBadge?.classList.add('d-none');
        }
    }
    
    async updateWishlistBadge() {
        try {
            if (!auth.getAuthToken()) {
                this.wishlistBadge?.classList.add('d-none');
                return;
            }
            
            const wishlist = await api.get('/Wishlist');
            const itemCount = wishlist.wishlistItems?.length || 0;
            
            if (this.wishlistBadge) {
                if (itemCount > 0) {
                    this.wishlistBadge.textContent = itemCount;
                    this.wishlistBadge.classList.remove('d-none');
                } else {
                    this.wishlistBadge.classList.add('d-none');
                }
            }
        } catch (error) {
            console.error('Error updating wishlist badge:', error);
            this.wishlistBadge?.classList.add('d-none');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.badgeManager = new BadgeManager();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.badgeManager = new BadgeManager();
});

// Initialize and attach to window
document.addEventListener('DOMContentLoaded', () => {
    if (!window.badgeManager) {
        window.badgeManager = new BadgeManager();
    }
    
    // Update badges when auth state changes
    document.addEventListener('authStateChanged', () => {
        if (window.badgeManager) {
            window.badgeManager.updateCartBadge();
            window.badgeManager.updateWishlistBadge();
        }
    });
});