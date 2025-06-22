document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuthState();
    
    try {
        // Show loading state
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="loading-spinner text-primary"></div>
                <p class="mt-2">Loading products...</p>
            </div>
        `;
        
        // Fetch products
        const products = await api.get('/Products');
        
        // Render products
        renderProducts(products);
    } catch (error) {
        auth.showToast(error.message, 'danger');
        document.getElementById('main-content').innerHTML = `
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
    
    // Group products by category
    const productsByCategory = {};
    products.forEach(product => {
        if (!productsByCategory[product.categoryName]) {
            productsByCategory[product.categoryName] = [];
        }
        productsByCategory[product.categoryName].push(product);
    });
    
    let html = '<div class="row">';
    
    // Create a section for each category
    for (const [category, categoryProducts] of Object.entries(productsByCategory)) {
        html += `
            <div class="col-12 mb-4">
                <h2 class="mb-3">${category}</h2>
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        `;
        
        // Add products for this category
        categoryProducts.forEach(product => {
            const priceHtml = product.discountedPrice 
                ? `<span class="original-price">$${product.price.toFixed(2)}</span> 
                   <span class="discounted-price">$${product.discountedPrice.toFixed(2)}</span>`
                : `<span>$${product.price.toFixed(2)}</span>`;
            
            html += `
                <div class="col">
                    <div class="card product-card h-100">
                        <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" 
                             class="card-img-top product-img" 
                             alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text text-muted">${product.description || 'No description available'}</p>
                            <div class="mb-2">${priceHtml}</div>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-secondary">${product.categoryName}</span>
                                <span class="text-success">${product.quantityInStock} in stock</span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <a href="product.html?id=${product.id}" class="btn btn-primary btn-sm w-100 mb-2">
                                View Details
                            </a>
                            <button class="btn btn-outline-success btn-sm btn-add-to-cart w-100" 
                                    data-product-id="${product.id}">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    mainContent.innerHTML = html;
    
    // Add event listeners to Add to Cart buttons
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
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
}