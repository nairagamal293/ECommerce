document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuthState();
    
    try {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            throw new Error('معرف المنتج غير موجود في الرابط');
        }
        
        // Fetch product details
        const product = await api.get(`/Products/${productId}`);
        
        // Render product details
        renderProductDetails(product);
    } catch (error) {
        console.error('Error loading product details:', error);
        auth.showToast(error.message, 'danger');
        document.getElementById('product-details-content').innerHTML = `
            <div class="alert alert-danger">
                فشل تحميل تفاصيل المنتج. يرجى المحاولة مرة أخرى لاحقًا.
            </div>
        `;
    }
});

async function renderProductDetails(product) {
    const priceHtml = product.discountedPrice 
        ? `<span class="original-price">$${product.price.toFixed(2)}</span>
           <span class="discounted-price">$${product.discountedPrice.toFixed(2)}</span>`
        : `$${product.price.toFixed(2)}`;
    
    const availability = product.isAvailable 
        ? `<span class="text-success"><i class="fas fa-check-circle"></i> متوفر</span>`
        : `<span class="text-danger"><i class="fas fa-times-circle"></i> غير متوفر</span>`;
    
    document.getElementById('product-details-content').innerHTML = `
        <div class="col-lg-6">
            <div class="product-image-container mb-4">
                <img src="${product.imageUrl || 'https://via.placeholder.com/500'}" 
                     alt="${product.name}" 
                     class="img-fluid rounded-3">
            </div>
        </div>
        <div class="col-lg-6">
            <h1 class="product-title mb-3">${product.name}</h1>
            <p class="product-category mb-3">
                <i class="fas fa-tag"></i> ${product.categoryName}
            </p>
            <div class="product-price mb-4 fs-3">${priceHtml}</div>
            
            <div class="availability mb-4">
                <strong>التوفر:</strong> ${availability}
                <span class="ms-3"><strong>الكمية المتاحة:</strong> ${product.quantityInStock}</span>
            </div>
            
            <div class="product-description mb-4">
                <h5 class="mb-3">الوصف</h5>
                <p>${product.description || 'لا يوجد وصف متاح لهذا المنتج'}</p>
            </div>
            
            <div class="product-actions d-flex gap-3">
                <div class="input-group quantity-control" style="width: 150px;">
                    <button class="btn btn-outline-secondary minus-btn" type="button">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" id="product-quantity" 
                           class="form-control text-center" 
                           value="1" min="1" max="${product.quantityInStock}">
                    <button class="btn btn-outline-secondary plus-btn" type="button">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="btn btn-primary btn-lg flex-grow-1" id="add-to-cart-btn">
                    <i class="fas fa-cart-plus me-2"></i> أضف إلى السلة
                </button>
                <button class="btn btn-outline-danger btn-lg" id="add-to-wishlist-btn">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;

    // Get references to the quantity elements
    const quantityInput = document.getElementById('product-quantity');
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');
    
    // Quantity control handlers
    minusBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });
    
    plusBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value < product.quantityInStock) {
            quantityInput.value = value + 1;
        }
    });
    
    quantityInput.addEventListener('change', () => {
        let value = parseInt(quantityInput.value);
        if (isNaN(value)) {
            quantityInput.value = 1;
        } else if (value < 1) {
            quantityInput.value = 1;
        } else if (value > product.quantityInStock) {
            quantityInput.value = product.quantityInStock;
        }
    });
    
    // Add to cart button with login check
    document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
        if (!auth.getAuthToken()) {
            auth.showLoginAlert('cart');
            return;
        }
        
        const quantity = parseInt(quantityInput.value);
        try {
            await cart.addToCart(product.id, quantity);
            auth.showToast('تمت إضافة المنتج إلى السلة بنجاح', 'success');
            
            // Update cart badge
            if (window.badgeManager) {
                await badgeManager.updateCartBadge();
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            auth.showToast(error.message, 'danger');
        }
    });
    
    // Add to wishlist button with login check
    document.getElementById('add-to-wishlist-btn').addEventListener('click', async () => {
        if (!auth.getAuthToken()) {
            auth.showLoginAlert('wishlist');
            return;
        }
        
        try {
            await wishlist.addToWishlist(product.id);
            auth.showToast('تمت إضافة المنتج إلى المفضلة بنجاح', 'success');
            
            // Update wishlist badge
            if (window.badgeManager) {
                await badgeManager.updateWishlistBadge();
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            auth.showToast(error.message, 'danger');
        }
    });
}