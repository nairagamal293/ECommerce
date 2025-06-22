class CartService {
    constructor() {
        this.api = api;
    }
    
    async getCart() {
        try {
            const userId = await this.getCurrentUserId();
            return this.api.get(`/Cart?userId=${userId}`);
        } catch (error) {
            throw error;
        }
    }
    
    async addToCart(productId, quantity = 1) {
        try {
            const userId = await this.getCurrentUserId();
            const response = await this.api.post('/Cart/items', {
                productId,
                quantity
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    async updateCartItem(itemId, quantity) {
        try {
            const userId = await this.getCurrentUserId();
            const response = await this.api.put(`/Cart/items/${itemId}`, {
                quantity
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    async removeFromCart(itemId) {
        try {
            const userId = await this.getCurrentUserId();
            const response = await this.api.delete(`/Cart/items/${itemId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    async clearCart() {
        try {
            const userId = await this.getCurrentUserId();
            const response = await this.api.delete('/Cart');
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

const cart = new CartService();

// Export for use in other modules
window.cart = cart;

// Cart Page Specific Code
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        auth.checkAuthState();
        
        try {
            // Show loading state
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="text-center py-5">
                    <div class="loading-spinner text-primary"></div>
                    <p class="mt-2">Loading cart...</p>
                </div>
            `;
            
            // Fetch cart
            const cartData = await cart.getCart();
            
            // Render cart
            renderCart(cartData);
        } catch (error) {
            auth.showToast(error.message, 'danger');
            document.getElementById('main-content').innerHTML = `
                <div class="alert alert-danger">
                    ${error.message}
                </div>
            `;
        }
    });
    
    function renderCart(cart) {
        const mainContent = document.getElementById('main-content');
        
        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
            mainContent.innerHTML = `
                <div class="text-center py-5">
                    <h2 class="mb-3">Your cart is empty</h2>
                    <p class="mb-4">Looks like you haven't added any items to your cart yet.</p>
                    <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="row">
                <div class="col-lg-8">
                    <div class="card mb-4">
                        <div class="card-header bg-white">
                            <h4 class="mb-0">Shopping Cart</h4>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
        `;
        
        cart.cartItems.forEach(item => {
            const price = item.discountedPrice || item.price;
            const total = price * item.quantity;
            
            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${item.productImageUrl || 'https://via.placeholder.com/80'}" 
                                 class="cart-item-img me-3" 
                                 alt="${item.productName}">
                            <div>
                                <h6 class="mb-0">${item.productName}</h6>
                                <small class="text-muted">${item.productId}</small>
                            </div>
                        </div>
                    </td>
                    <td>$${price.toFixed(2)}</td>
                    <td>
                        <div class="input-group" style="width: 120px;">
                            <button class="btn btn-outline-secondary minus-btn" 
                                    type="button" 
                                    data-item-id="${item.id}">-</button>
                            <input type="number" 
                                   class="form-control text-center quantity-input" 
                                   value="${item.quantity}" 
                                   min="1"
                                   data-item-id="${item.id}">
                            <button class="btn btn-outline-secondary plus-btn" 
                                    type="button" 
                                    data-item-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td>$${total.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger remove-item-btn" 
                                data-item-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                                    </tbody>
                                </table>
                            </div>
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-outline-danger me-2" id="clear-cart-btn">
                                    <i class="fas fa-trash"></i> Clear Cart
                                </button>
                                <button class="btn btn-outline-secondary" id="continue-shopping-btn">
                                    <i class="fas fa-arrow-left"></i> Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card mb-4">
                        <div class="card-header bg-white">
                            <h4 class="mb-0">Order Summary</h4>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <span>Subtotal</span>
                                <span>$${cart.totalAmount.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Tax</span>
                                <span>$0.00</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between mb-3 fw-bold">
                                <span>Total</span>
                                <span>$${cart.totalAmount.toFixed(2)}</span>
                            </div>
                            <button class="btn btn-primary w-100" id="checkout-btn">
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.minus-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                const input = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
                let value = parseInt(input.value);
                if (value > 1) {
                    input.value = value - 1;
                    await cart.updateCartItem(itemId, input.value);
                    location.reload(); // Refresh to update totals
                }
            });
        });
        
        document.querySelectorAll('.plus-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                const input = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
                let value = parseInt(input.value);
                input.value = value + 1;
                await cart.updateCartItem(itemId, input.value);
                location.reload(); // Refresh to update totals
            });
        });
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', async (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                let value = parseInt(e.target.value);
                if (value < 1) value = 1;
                e.target.value = value;
                await cart.updateCartItem(itemId, value);
                location.reload(); // Refresh to update totals
            });
        });
        
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                try {
                    await cart.removeFromCart(itemId);
                    auth.showToast('Item removed from cart', 'success');
                    location.reload();
                } catch (error) {
                    auth.showToast(error.message, 'danger');
                }
            });
        });
        
        document.getElementById('clear-cart-btn').addEventListener('click', async () => {
            try {
                await cart.clearCart();
                auth.showToast('Cart cleared', 'success');
                location.reload();
            } catch (error) {
                auth.showToast(error.message, 'danger');
            }
        });
        
        document.getElementById('continue-shopping-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        document.getElementById('checkout-btn').addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
}