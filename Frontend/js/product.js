document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuthState();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Show loading state
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="loading-spinner text-primary"></div>
                <p class="mt-2">Loading product details...</p>
            </div>
        `;
        
        // Fetch product
        const product = await api.get(`/Products/${productId}`);
        
        // Render product
        renderProduct(product);
    } catch (error) {
        auth.showToast(error.message, 'danger');
        document.getElementById('main-content').innerHTML = `
            <div class="alert alert-danger">
                Failed to load product. Please try again later.
            </div>
        `;
    }
});

function renderProduct(product) {
    const mainContent = document.getElementById('main-content');
    
    const priceHtml = product.discountedPrice 
        ? `<h3 class="mb-3">
                <span class="original-price me-2">$${product.price.toFixed(2)}</span>
                <span class="discounted-price">$${product.discountedPrice.toFixed(2)}</span>
           </h3>`
        : `<h3 class="mb-3">$${product.price.toFixed(2)}</h3>`;
    
    const stockStatus = product.quantityInStock > 0 
        ? `<span class="text-success"><i class="fas fa-check-circle"></i> In Stock (${product.quantityInStock} available)</span>`
        : `<span class="text-danger"><i class="fas fa-times-circle"></i> Out of Stock</span>`;
    
    mainContent.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-4">
                <img src="${product.imageUrl || 'https://via.placeholder.com/500'}" 
                     class="img-fluid rounded" 
                     alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h1 class="mb-3">${product.name}</h1>
                <div class="mb-3">
                    <span class="badge bg-secondary">${product.categoryName}</span>
                </div>
                ${priceHtml}
                <div class="mb-3">
                    ${stockStatus}
                </div>
                <p class="mb-4">${product.description || 'No description available'}</p>
                
                <div class="d-flex gap-2 mb-4">
                    <div class="input-group" style="width: 120px;">
                        <button class="btn btn-outline-secondary minus-btn" type="button">-</button>
                        <input type="number" class="form-control text-center quantity-input" value="1" min="1" max="${product.quantityInStock}">
                        <button class="btn btn-outline-secondary plus-btn" type="button">+</button>
                    </div>
                    <button class="btn btn-primary btn-add-to-cart flex-grow-1" data-product-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
                
                <button class="btn btn-outline-danger btn-add-to-wishlist w-100 mb-3" data-product-id="${product.id}">
                    <i class="fas fa-heart"></i> Add to Wishlist
                </button>
                
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Product Details</h5>
                        <ul class="list-unstyled">
                            <li><strong>Category:</strong> ${product.categoryName}</li>
                            <li><strong>Added on:</strong> ${new Date(product.createdAt).toLocaleDateString()}</li>
                            <li><strong>Last updated:</strong> ${new Date(product.updatedAt).toLocaleDateString()}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Quantity controls
    const quantityInput = document.querySelector('.quantity-input');
    document.querySelector('.minus-btn').addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });
    
    document.querySelector('.plus-btn').addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value < product.quantityInStock) {
            quantityInput.value = value + 1;
        }
    });
    
    // Add to cart button
    document.querySelector('.btn-add-to-cart').addEventListener('click', async () => {
        const quantity = parseInt(quantityInput.value);
        try {
            await cart.addToCart(product.id, quantity);
            auth.showToast('Product added to cart', 'success');
        } catch (error) {
            auth.showToast(error.message, 'danger');
        }
    });
    
    // Add to wishlist button
    document.querySelector('.btn-add-to-wishlist').addEventListener('click', async () => {
        try {
            await wishlist.addToWishlist(product.id);
            auth.showToast('Product added to wishlist', 'success');
        } catch (error) {
            auth.showToast(error.message, 'danger');
        }
    });
}