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
                <div class="quantity-selector d-flex align-items-center mb-3">
                    <button class="btn btn-outline-secondary quantity-btn" id="decrease-qty">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" id="product-quantity" 
                           min="1" max="${product.quantityInStock}" 
                           value="1" class="form-control text-center mx-2" 
                           style="width: 60px;">
                    <button class="btn btn-outline-secondary quantity-btn" id="increase-qty">
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
    
    // Setup quantity buttons
    document.getElementById('decrease-qty').addEventListener('click', () => {
        const input = document.getElementById('product-quantity');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });
    
    document.getElementById('increase-qty').addEventListener('click', () => {
        const input = document.getElementById('product-quantity');
        if (parseInt(input.value) < product.quantityInStock) {
            input.value = parseInt(input.value) + 1;
        }
    });
    
    // Setup add to cart button
    document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
        const quantity = parseInt(document.getElementById('product-quantity').value);
        try {
            await cart.addToCart(product.id, quantity);
            auth.showToast('تمت إضافة المنتج إلى السلة بنجاح', 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            auth.showToast(error.message, 'danger');
        }
    });
    
    // Setup wishlist button
    document.getElementById('add-to-wishlist-btn').addEventListener('click', async () => {
        try {
            await wishlist.addToWishlist(product.id);
            auth.showToast('تمت إضافة المنتج إلى المفضلة بنجاح', 'success');
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            auth.showToast(error.message, 'danger');
        }
    });
}