class CartService {
    constructor() {
        if (!window.api) {
            throw new Error('خدمة API غير متاحة');
        }
        this.api = window.api;
    }
    
    async getCart() {
        try {
            const response = await this.api.get('/Cart');
            return response;
        } catch (error) {
            console.error('خطأ في جلب عربة التسوق:', error);
            throw error;
        }
    }
    
    async addToCart(productId, quantity = 1) {
    try {
        const response = await this.api.post('/Cart/items', {
            productId,
            quantity
        });
        
        // Update badge after adding to cart
        if (window.badgeManager) {
            await window.badgeManager.updateCartBadge();
        }
        
        return response;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
}
    
    async updateCartItem(itemId, quantity) {
        try {
            const response = await this.api.put(`/Cart/items/${itemId}`, {
                quantity: quantity
            });
            return response;
        } catch (error) {
            console.error('خطأ في تحديث عنصر العربة:', error);
            throw error;
        }
    }
    
    async removeFromCart(itemId) {
    try {
        const response = await this.api.delete(`/Cart/items/${itemId}`);
        
        // Update badge after removing from cart
        if (window.badgeManager) {
            await window.badgeManager.updateCartBadge();
        }
        
        return response;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
}

async clearCart() {
    try {
        const response = await this.api.delete('/Cart');
        
        // Update badge after clearing cart
        if (window.badgeManager) {
            await window.badgeManager.updateCartBadge();
        }
        
        return response;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
}
}

// Initialize and expose the cart service
if (!window.cart) {
    try {
        window.cart = new CartService();
        console.log('تم تهيئة خدمة العربة بنجاح', window.cart);
    } catch (error) {
        console.error('فشل في تهيئة خدمة العربة:', error);
    }
}

// Cart Page Specific Code
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        // Check authentication state
        if (typeof auth !== 'undefined' && auth.checkAuthState) {
            auth.checkAuthState();
        }

        try {
            // Show loading state
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="text-center py-5">
                        <div class="loading-spinner text-primary"></div>
                        <p class="mt-2">جاري تحميل عربة التسوق...</p>
                    </div>
                `;
            }

            // Verify cart service is available
            if (typeof window.cart === 'undefined' || !window.cart.getCart) {
                throw new Error('خدمة العربة غير متاحة');
            }

            // Fetch cart
            const cartData = await window.cart.getCart();
            
            // Render cart
            renderCart(cartData);
        } catch (error) {
            console.error('خطأ في تهيئة العربة:', error);
            if (typeof auth !== 'undefined' && auth.showToast) {
                auth.showToast(error.message, 'danger');
            }
            
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="alert alert-danger">
                        ${error.message || 'فشل تحميل عربة التسوق'}
                    </div>
                `;
            }
        }
    });

    function renderCart(cart) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
            mainContent.innerHTML = `
                <div class="text-center py-5">
                    <h2 class="mb-3">عربة التسوق فارغة</h2>
                    <p class="mb-4">يبدو أنك لم تقم بإضافة أي عناصر إلى عربة التسوق بعد.</p>
                    <a href="index.html" class="btn btn-primary">مواصلة التسوق</a>
                </div>
            `;
            return;
        }

        let html = `
            <div class="row">
                <div class="col-lg-8">
                    <div class="card mb-4">
                        <div class="card-header bg-white">
                            <h4 class="mb-0">عربة التسوق</h4>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>المنتج</th>
                                            <th>السعر</th>
                                            <th>الكمية</th>
                                            <th>المجموع</th>
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
                    <td>${price.toFixed(2)} ر.س</td>
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
                    <td>${total.toFixed(2)} ر.س</td>
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
                                    <i class="fas fa-trash"></i> إفراغ العربة
                                </button>
                                <button class="btn btn-outline-secondary" id="continue-shopping-btn">
                                    <i class="fas fa-arrow-left"></i> مواصلة التسوق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card mb-4">
                        <div class="card-header bg-white">
                            <h4 class="mb-0">ملخص الطلب</h4>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <span>المجموع الفرعي</span>
                                <span>${cart.totalAmount.toFixed(2)} ر.س</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>الشحن</span>
                                <span>مجاني</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>الضريبة</span>
                                <span>0.00 ر.س</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between mb-3 fw-bold">
                                <span>الإجمالي</span>
                                <span>${cart.totalAmount.toFixed(2)} ر.س</span>
                            </div>
                            <button class="btn btn-primary w-100" id="checkout-btn">
                                إتمام الشراء
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainContent.innerHTML = html;

        // Add event listeners
        document.getElementById('clear-cart-btn')?.addEventListener('click', async () => {
            try {
                await window.cart.clearCart();
                if (auth?.showToast) auth.showToast('تم تفريغ العربة بنجاح', 'success');
                const cartData = await window.cart.getCart();
                renderCart(cartData);
            } catch (error) {
                console.error('خطأ في تفريغ العربة:', error);
                if (auth?.showToast) auth.showToast(error.message, 'danger');
            }
        });

        document.getElementById('continue-shopping-btn')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('checkout-btn')?.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }

    // Unified event delegation for all cart interactions
    document.addEventListener('click', async (e) => {
        if (!window.cart) {
            console.error('خدمة العربة غير متاحة');
            return;
        }

        // Handle minus button
        if (e.target.closest('.minus-btn')) {
            const button = e.target.closest('.minus-btn');
            const itemId = button.getAttribute('data-item-id');
            const input = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
            let value = parseInt(input.value);
            
            if (value > 1) {
                input.value = value - 1;
                try {
                    await window.cart.updateCartItem(itemId, input.value);
                    const cartData = await window.cart.getCart();
                    renderCart(cartData);
                } catch (error) {
                    console.error('خطأ في التحديث:', error);
                    if (auth?.showToast) auth.showToast(error.message, 'danger');
                }
            }
        }
        
        // Handle plus button
        else if (e.target.closest('.plus-btn')) {
            const button = e.target.closest('.plus-btn');
            const itemId = button.getAttribute('data-item-id');
            const input = document.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
            let value = parseInt(input.value);
            input.value = value + 1;
            try {
                await window.cart.updateCartItem(itemId, input.value);
                const cartData = await window.cart.getCart();
                renderCart(cartData);
            } catch (error) {
                console.error('خطأ في التحديث:', error);
                if (auth?.showToast) auth.showToast(error.message, 'danger');
            }
        }
        
        // Handle remove item button
        else if (e.target.closest('.remove-item-btn')) {
            const button = e.target.closest('.remove-item-btn');
            const itemId = button.getAttribute('data-item-id');
            try {
                await window.cart.removeFromCart(itemId);
                if (auth?.showToast) auth.showToast('تمت إزالة العنصر بنجاح', 'success');
                const cartData = await window.cart.getCart();
                renderCart(cartData);
            } catch (error) {
                console.error('خطأ في الإزالة:', error);
                if (auth?.showToast) auth.showToast(error.message, 'danger');
            }
        }
    });

    // Handle quantity input changes
    document.addEventListener('change', async (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const input = e.target;
            const itemId = input.getAttribute('data-item-id');
            let value = parseInt(input.value);
            
            if (isNaN(value) || value < 1) {
                value = 1;
                input.value = 1;
            }
            
            try {
                await window.cart.updateCartItem(itemId, value);
                const cartData = await window.cart.getCart();
                renderCart(cartData);
            } catch (error) {
                console.error('خطأ في التحديث:', error);
                if (auth?.showToast) auth.showToast(error.message, 'danger');
            }
        }
    });
}