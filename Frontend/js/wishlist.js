class WishlistService {
    constructor() {
        this.api = api;
    }
    
    async getWishlist() {
        try {
            if (!auth.getAuthToken()) {
                return { wishlistItems: [] };
            }
            
            const response = await this.api.get('/Wishlist');
            return response || { wishlistItems: [] };
        } catch (error) {
            if (error.message.includes('401')) {
                return { wishlistItems: [] };
            }
            console.error('Error fetching wishlist:', error);
            throw error;
        }
    }
    
    async addToWishlist(productId) {
    try {
        const response = await this.api.post('/Wishlist/items', {
            productId: parseInt(productId)
        });
        
        // Update badge after adding to wishlist
        if (window.badgeManager) {
            await window.badgeManager.updateWishlistBadge();
        }
        
        return response;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
}

async removeFromWishlist(itemId) {
    try {
        const response = await this.api.delete(`/Wishlist/items/${itemId}`);
        
        // Update badge after removing from wishlist
        if (window.badgeManager) {
            await window.badgeManager.updateWishlistBadge();
        }
        
        return response;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
}

async clearWishlist() {
    try {
        const response = await this.api.delete('/Wishlist');
        
        // Update badge after clearing wishlist
        if (window.badgeManager) {
            await window.badgeManager.updateWishlistBadge();
        }
        
        return response;
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        throw error;
    }
}
    
    async isProductInWishlist(productId) {
        try {
            const wishlist = await this.getWishlist();
            return wishlist.wishlistItems.some(item => item.productId === parseInt(productId));
        } catch (error) {
            console.error('Error checking wishlist status:', error);
            return false;
        }
    }
}

const wishlist = new WishlistService();


// Wishlist Page Specific Code
if (window.location.pathname.includes('wishlist.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        auth.checkAuthState();
        
        // Show loading state
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="loading-spinner text-primary"></div>
                <p class="mt-3">جاري تحميل قائمة المفضلة...</p>
            </div>
        `;
        
        try {
            // Fetch wishlist
            const wishlistData = await wishlist.getWishlist();
            
            // Render wishlist
            renderWishlist(wishlistData);
        } catch (error) {
            auth.showToast(error.message, 'danger');
            mainContent.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message || 'فشل تحميل قائمة المفضلة. يرجى المحاولة مرة أخرى.'}
                </div>
            `;
        }
    });
    
    function renderWishlist(wishlist) {
        const mainContent = document.getElementById('main-content');
        
        if (!wishlist || !wishlist.wishlistItems || wishlist.wishlistItems.length === 0) {
            mainContent.innerHTML = `
                <div class="empty-wishlist animate-up">
                    <div class="empty-wishlist-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h2 class="mb-3">قائمة المفضلة فارغة</h2>
                    <p class="mb-4">يبدو أنك لم تقم بإضافة أي عناصر إلى قائمة المفضلة الخاصة بك بعد.</p>
                    <a href="product.html" class="btn btn-primary btn-lg">تصفح المنتجات</a>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="wishlist-header animate-up">
                <h2><i class="fas fa-heart me-2"></i>قائمة المفضلة الخاصة بك</h2>
                <p class="text-muted">لديك ${wishlist.wishlistItems.length} عنصر(عناصر) في قائمة المفضلة</p>
            </div>
            
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 animate-up" style="animation-delay: 0.2s;">
        `;
        
        wishlist.wishlistItems.forEach(item => {
            const priceHtml = item.discountedPrice 
                ? `<span class="original-price">$${item.price.toFixed(2)}</span>
                   <span class="discounted-price">$${item.discountedPrice.toFixed(2)}</span>`
                : `$${item.price.toFixed(2)}`;
            
            html += `
                <div class="col">
                    <div class="wishlist-card">
                        <div class="product-img-container">
                            <img src="${item.productImageUrl || 'https://via.placeholder.com/300'}" 
                                 class="product-img" 
                                 alt="${item.productName}">
                            ${item.discountedPrice ? '<span class="product-badge">خصم</span>' : ''}
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${item.productName}</h5>
                            <div class="product-price mb-3">${priceHtml}</div>
                            <div class="d-flex justify-content-between">
                                <a href="product-details.html?id=${item.productId}" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-eye me-1"></i> عرض
                                </a>
                                <button class="btn btn-sm btn-outline-success add-to-cart-btn" 
                                        data-product-id="${item.productId}">
                                    <i class="fas fa-cart-plus me-1"></i> أضف للسلة
                                </button>
                                <button class="btn btn-sm btn-outline-danger remove-item-btn" 
                                        data-item-id="${item.id}"
                                        data-product-id="${item.productId}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            
            <div class="d-flex justify-content-end mt-4 animate-up" style="animation-delay: 0.4s;">
                <button class="btn btn-outline-danger" id="clear-wishlist-btn">
                    <i class="fas fa-trash me-2"></i>إفراغ القائمة
                </button>
            </div>
        `;
        
        mainContent.innerHTML = html;
        attachWishlistEventListeners();
    }

    function attachWishlistEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = e.currentTarget.getAttribute('data-product-id');
                try {
                    await cart.addToCart(productId, 1);
                    auth.showToast('تمت إضافة المنتج إلى السلة', 'success');
                } catch (error) {
                    auth.showToast(error.message, 'danger');
                }
            });
        });
        
        // Remove item buttons
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const button = e.currentTarget;
                const itemId = button.getAttribute('data-item-id');
                const card = button.closest('.col');
                
                if (!card) {
                    console.error('Could not find parent card element');
                    return;
                }
                
                // Show loading state
                const originalHtml = button.innerHTML;
                button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                button.disabled = true;
                
                try {
                    await window.wishlist.removeFromWishlist(itemId);
                    
                    // Remove the card with animation
                    card.classList.add('animate__animated', 'animate__fadeOut');
                    
                    setTimeout(() => {
                        card.remove();
                        
                        // Update the wishlist count
                        const countElement = document.querySelector('.wishlist-header p.text-muted');
                        if (countElement) {
                            const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]) || 0;
                            const newCount = currentCount - 1;
                            
                            if (newCount > 0) {
                                countElement.textContent = `لديك ${newCount} عنصر(عناصر) في قائمة المفضلة`;
                            } else {
                                // Show empty state if no items left
                                document.getElementById('main-content').innerHTML = `
                                    <div class="empty-wishlist text-center py-5">
                                        <div class="empty-wishlist-icon mb-4">
                                            <i class="fas fa-heart fa-5x text-muted"></i>
                                        </div>
                                        <h2 class="mb-3">قائمة المفضلة فارغة</h2>
                                        <p class="mb-4">لم تقم بإضافة أي عناصر إلى قائمة المفضلة الخاصة بك بعد.</p>
                                        <a href="product.html" class="btn btn-primary btn-lg">تصفح المنتجات</a>
                                    </div>
                                `;
                            }
                        }
                    }, 300);
                    
                    auth.showToast('تمت إزالة العنصر من المفضلة', 'success');
                } catch (error) {
                    // Reset button state on error
                    button.innerHTML = originalHtml;
                    button.disabled = false;
                    auth.showToast(error.message || 'فشل إزالة العنصر من المفضلة', 'danger');
                }
            });
        });
        
        // Clear wishlist button
        const clearBtn = document.getElementById('clear-wishlist-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const button = e.currentTarget;
                const originalHtml = button.innerHTML;
                
                // Show loading state
                button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> جاري الإفراغ...';
                button.disabled = true;
                
                try {
                    await window.wishlist.clearWishlist();
                    
                    // Show empty state
                    document.getElementById('main-content').innerHTML = `
                        <div class="empty-wishlist text-center py-5">
                            <div class="empty-wishlist-icon mb-4">
                                <i class="fas fa-heart fa-5x text-muted"></i>
                            </div>
                            <h2 class="mb-3">قائمة المفضلة فارغة</h2>
                            <p class="mb-4">لم تقم بإضافة أي عناصر إلى قائمة المفضلة الخاصة بك بعد.</p>
                            <a href="product.html" class="btn btn-primary btn-lg">تصفح المنتجات</a>
                        </div>
                    `;
                    
                    auth.showToast('تم إفراغ قائمة المفضلة', 'success');
                } catch (error) {
                    auth.showToast(error.message || 'فشل إفراغ قائمة المفضلة', 'danger');
                } finally {
                    // Reset button state
                    button.innerHTML = originalHtml;
                    button.disabled = false;
                }
            });
        }
    }
}

// Export for use in other modules
window.wishlist = wishlist;