document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuthState();
    
    // Show loading state
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="text-center py-5">
            <div class="loading-spinner text-primary"></div>
            <p class="mt-2">جاري تحميل المنتجات...</p>
        </div>
    `;
    
    try {
        // Fetch all products, categories, and wishlist items in parallel
        const [products, categories, wishlistItems] = await Promise.all([
            api.get('/Products'),
            api.get('/Categories'),
            auth.getAuthToken() ? api.get('/Wishlist') : Promise.resolve({ wishlistItems: [] })
        ]);
        
        // Render categories sidebar and products with wishlist status
        renderCategoriesSidebar(categories, products, wishlistItems.wishlistItems || []);
        
    } catch (error) {
        auth.showToast(error.message, 'danger');
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                فشل تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقًا.
            </div>
        `;
    }
});

function renderCategoriesSidebar(categories, products, wishlistItems) {
    const mainContent = document.getElementById('main-content');
    
    // Create the sidebar structure
    const sidebarHtml = `
        <div class="row">
            <div class="col-lg-3 mb-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">التصنيفات</h5>
                    </div>
                    <div class="card-body p-0">
                        <ul class="list-group list-group-flush" id="categories-list">
                            <li class="list-group-item active" data-category-id="all">
                                <i class="fas fa-list me-2"></i> جميع المنتجات
                            </li>
                            ${categories.map(category => `
                                <li class="list-group-item" data-category-id="${category.id}">
                                    <i class="fas fa-tag me-2"></i> ${category.name}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-lg-9">
                <div class="row mb-4">
                    <div class="col-12">
                        <h2 class="section-title">المنتجات</h2>
                    </div>
                </div>
                <div class="row g-4" id="products-grid">
                    <!-- Products will be inserted here -->
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = sidebarHtml;
    
    // Render initial products (all products)
    renderFilteredProducts(products, wishlistItems);
    
    // Set up event listeners for category filtering
    setupCategoryFilters(products, wishlistItems);
}

function setupCategoryFilters(products, wishlistItems) {
    const categoryItems = document.querySelectorAll('#categories-list li');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', async () => {
            // Update active state
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const categoryId = item.getAttribute('data-category-id');
            
            // Show loading state
            const productsGrid = document.getElementById('products-grid');
            productsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="loading-spinner text-primary"></div>
                    <p class="mt-2">جاري تحميل المنتجات...</p>
                </div>
            `;
            
            try {
                let filteredProducts;
                if (categoryId === 'all') {
                    filteredProducts = products;
                } else {
                    filteredProducts = products.filter(p => p.categoryId == categoryId);
                }
                
                // Clear and re-render products
                productsGrid.innerHTML = '';
                renderFilteredProducts(filteredProducts, wishlistItems);
            } catch (error) {
                auth.showToast(error.message, 'danger');
                productsGrid.innerHTML = `
                    <div class="alert alert-danger">
                        فشل تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقًا.
                    </div>
                `;
            }
        });
    });
}

function renderFilteredProducts(products, wishlistItems) {
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    لا توجد منتجات في هذا التصنيف.
                </div>
            </div>
        `;
        return;
    }
    
    // Create a Set of product IDs in wishlist for quick lookup
    const wishlistProductIds = new Set(wishlistItems.map(item => item.productId));
    
    products.forEach((product, index) => {
        const priceHtml = product.discountedPrice 
            ? `<span class="original-price">$${product.price.toFixed(2)}</span>
               <span class="discounted-price">$${product.discountedPrice.toFixed(2)}</span>`
            : `$${product.price.toFixed(2)}`;
        
        const isInWishlist = wishlistProductIds.has(product.id);
        
        const productCard = document.createElement('div');
        productCard.className = `col-md-6 col-lg-4 col-xl-3 animate-up`;
        productCard.style.animationDelay = `${0.1 * index}s`;
        productCard.innerHTML = `
    <div class="product-card" onclick="window.location.href='product-details.html?id=${product.id}'" style="cursor: pointer;">
        <div class="product-img-container">
            <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" 
                 alt="${product.name}" 
                 class="product-img">
            ${product.discountedPrice ? '<span class="product-badge">خصم</span>' : ''}
        </div>
        <div class="product-body">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-category">${product.categoryName}</p>
            <div class="product-price">${priceHtml}</div>
            <div class="product-actions">
                <button class="btn btn-add-to-cart" data-product-id="${product.id}" onclick="event.stopPropagation()">
                    <i class="fas fa-cart-plus"></i>
                </button>
                <button class="btn btn-add-to-wishlist ${isInWishlist ? 'text-danger' : ''}" 
                        data-product-id="${product.id}" 
                        data-in-wishlist="${isInWishlist}"
                        onclick="event.stopPropagation()">
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
                auth.showToast('تم إضافة المنتج إلى السلة', 'success');
            } catch (error) {
                auth.showToast(error.message, 'danger');
            }
        });
        
        const wishlistBtn = productCard.querySelector('.btn-add-to-wishlist');
        wishlistBtn.addEventListener('click', async () => {
            try {
                if (wishlistBtn.dataset.inWishlist === 'true') {
                    // Find the wishlist item ID to remove
                    const wishlistItem = wishlistItems.find(item => item.productId === product.id);
                    if (wishlistItem) {
                        await wishlist.removeFromWishlist(wishlistItem.id);
                        wishlistBtn.classList.remove('text-danger');
                        wishlistBtn.dataset.inWishlist = 'false';
                        auth.showToast('تمت إزالة المنتج من المفضلة', 'success');
                        
                        // Update the wishlistItems array
                        const index = wishlistItems.findIndex(item => item.id === wishlistItem.id);
                        if (index !== -1) {
                            wishlistItems.splice(index, 1);
                        }
                    }
                } else {
                    const response = await wishlist.addToWishlist(product.id);
                    wishlistBtn.classList.add('text-danger');
                    wishlistBtn.dataset.inWishlist = 'true';
                    auth.showToast('تمت إضافة المنتج إلى المفضلة', 'success');
                    
                    // Add to wishlistItems array
                    wishlistItems.push({
                        id: response.id,
                        productId: product.id,
                        productName: product.name,
                        productImageUrl: product.imageUrl,
                        price: product.price,
                        discountedPrice: product.discountedPrice
                    });
                }
            } catch (error) {
                auth.showToast(error.message, 'danger');
            }
        });
    });
}