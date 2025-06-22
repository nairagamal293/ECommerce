class WishlistService {
    constructor() {
        this.api = api;
    }
    
    async getWishlist() {
        try {
            const userId = await this.getCurrentUserId();
            return this.api.get(`/Wishlist?userId=${userId}`);
        } catch (error) {
            throw error;
        }
    }
    
    async addToWishlist(productId) {
        try {
            const userId = await this.getCurrentUserId();
            const response = await this.api.post('/Wishlist/items', {
                productId
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    async removeFromWishlist(itemId) {
        try {
            const userId = await this.getCurrentUserId();
            const response = await this.api.delete(`/Wishlist/items/${itemId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    async clearWishlist() {
        try {
            const userId = await this.getCurrentUserId();
            const response = await this.api.delete('/Wishlist');
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    async getCurrentUserId() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User not authenticated');
        }
        
        // In a real app, you might decode the JWT to get the user ID
        // For this demo, we'll use a placeholder
        return 'current-user-id';
    }
}

const wishlist = new WishlistService();

// Export for use in other modules
window.wishlist = wishlist;

// Wishlist Page Specific Code
if (window.location.pathname.includes('wishlist.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        auth.checkAuthState();
        
        try {
            // Show loading state
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="text-center py-5">
                    <div class="loading-spinner text-primary"></div>
                    <p class="mt-2">Loading wishlist...</p>
                </div>
            `;
            
            // Fetch wishlist
            const wishlistData = await wishlist.getWishlist();
            
            // Render wishlist
            renderWishlist(wishlistData);
        } catch (error) {
            auth.showToast(error.message, 'danger');
            document.getElementById('main-content').innerHTML = `
                <div class="alert alert-danger">
                    ${error.message}
                </div>
            `;
        }
    });
    
    function renderWishlist(wishlist) {
        const mainContent = document.getElementById('main-content');
        
        if (!wishlist || !wishlist.wishlistItems || wishlist.wishlistItems.length === 0) {
            mainContent.innerHTML = `
                <div class="text-center py-5">
                    <h2 class="mb-3">Your wishlist is empty</h2>
                    <p class="mb-4">Looks like you haven't added any items to your wishlist yet.</p>
                    <a href="index.html" class="btn btn-primary">Browse Products</a>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="row">
                <div class="col-12">
                    <div class="card mb-4">
                        <div class="card-header bg-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">Wishlist</h4>
                                <button class="btn btn-sm btn-outline-danger" id="clear-wishlist-btn">
                                    <i class="fas fa-trash"></i> Clear All
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        `;
        
        wishlist.wishlistItems.forEach(item => {
            const priceHtml = item.discountedPrice 
                ? `<span class="original-price me-2">$${item.price.toFixed(2)}</span>
                   <span class="discounted-price">$${item.discountedPrice.toFixed(2)}</span>`
                : `<span>$${item.price.toFixed(2)}</span>`;
            
            html += `
                <div class="col">
                    <div class="card h-100">
                        <img src="${item.productImageUrl || 'https://via.placeholder.com/300'}" 
                             class="card-img-top product-img" 
                             alt="${item.productName}">
                        <div class="card-body">
                            <h5 class="card-title">${item.productName}</h5>
                            <div class="mb-2">${priceHtml}</div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <div class="d-flex justify-content-between">
                                <a href="product.html?id=${item.productId}" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-eye"></i> View
                                </a>
                                <button class="btn btn-sm btn-outline-success add-to-cart-btn" 
                                        data-product-id="${item.productId}">
                                    <i class="fas fa-cart-plus"></i> Add to Cart
                                </button>
                                <button class="btn btn-sm btn-outline-danger remove-item-btn" 
                                        data-item-id="${item.id}">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.getAttribute('data-product-id');
                try {
                    await cart.addToCart(productId, 1);
                    auth.showToast('Product added to cart', 'success');
                } catch (error) {
                    auth.showToast(error.message, 'danger');
                }
            });
        });
        
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                try {
                    await wishlist.removeFromWishlist(itemId);
                    auth.showToast('Item removed from wishlist', 'success');
                    location.reload();
                } catch (error) {
                    auth.showToast(error.message, 'danger');
                }
            });
        });
        
        document.getElementById('clear-wishlist-btn').addEventListener('click', async () => {
            try {
                await wishlist.clearWishlist();
                auth.showToast('Wishlist cleared', 'success');
                location.reload();
            } catch (error) {
                auth.showToast(error.message, 'danger');
            }
        });
    }
}