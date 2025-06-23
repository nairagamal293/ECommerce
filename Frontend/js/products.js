document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuthState();
    
    // Show loading state
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="text-center py-5">
            <div class="loading-spinner text-primary"></div>
            <p class="mt-2">Loading products...</p>
        </div>
    `;
    
    try {
        // Fetch all products
        const products = await api.get('/Products');
        
        // Render products
        renderProducts(products);
    } catch (error) {
        auth.showToast(error.message, 'danger');
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                Failed to load products. Please try again later.
            </div>
        `;
    }
});

function renderProducts(products) {
    const mainContent = document.getElementById('main-content');
    
    if (products.length === 0) {
        mainContent.innerHTML = `
            <div class="alert alert-info">
                No products found.
            </div>
        `;
        return;
    }
    
    mainContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2 class="section-title">All Products</h2>
            </div>
        </div>
        <div class="row g-4" id="products-grid">
            <!-- Products will be inserted here -->
        </div>
    `;
    
    const productsGrid = document.getElementById('products-grid');
    
    products.forEach((product, index) => {
        const priceHtml = product.discountedPrice 
            ? `<span class="original-price">$${product.price.toFixed(2)}</span>
               <span class="discounted-price">$${product.discountedPrice.toFixed(2)}</span>`
            : `$${product.price.toFixed(2)}`;
        
        const productCard = document.createElement('div');
        productCard.className = `col-md-6 col-lg-4 col-xl-3 animate-up`;
        productCard.style.animationDelay = `${0.1 * index}s`;
        productCard.innerHTML = `
            <div class="product-card">
                <div class="product-img-container">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" 
                         alt="${product.name}" 
                         class="product-img">
                    ${product.discountedPrice ? '<span class="product-badge">Sale</span>' : ''}
                </div>
                <div class="product-body">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">${product.categoryName}</p>
                    <div class="product-price">${priceHtml}</div>
                    <div class="product-actions">
                        <button class="btn btn-add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-add-to-wishlist" data-product-id="${product.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
        
        // Add event listeners
        productCard.querySelector('.btn-add-to-cart').addEventListener('click', async () => {
            try {
                await cart.addToCart(product.id, 1);
                auth.showToast('Product added to cart', 'success');
            } catch (error) {
                auth.showToast(error.message, 'danger');
            }
        });
        
        productCard.querySelector('.btn-add-to-wishlist').addEventListener('click', async () => {
            try {
                await wishlist.addToWishlist(product.id);
                auth.showToast('Product added to wishlist', 'success');
            } catch (error) {
                auth.showToast(error.message, 'danger');
            }
        });
    });
}