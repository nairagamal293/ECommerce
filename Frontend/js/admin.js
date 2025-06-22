// Admin Dashboard Script
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication and admin status
    try {
        const user = await auth.checkUserRole();
        if (!user || !user.roles || !user.roles.includes('Admin')) {
            window.location.href = '../index.html';
            return;
        }
    } catch (error) {
        console.error('Error verifying admin status:', error);
        window.location.href = '../login.html';
        return;
    }
    
    // Initialize DataTables
    let productsTable, categoriesTable, ordersTable, usersTable;
    
    // Navigation links
    const navLinks = {
        dashboard: document.getElementById('dashboard-link'),
        products: document.getElementById('products-link'),
        categories: document.getElementById('categories-link'),
        orders: document.getElementById('orders-link'),
        users: document.getElementById('users-link'),
        logout: document.getElementById('logout-link')
    };
    
    // Content sections
    const contentSections = {
        dashboard: document.getElementById('dashboard-content'),
        products: document.getElementById('products-content'),
        categories: document.getElementById('categories-content'),
        orders: document.getElementById('orders-content'),
        users: document.getElementById('users-content')
    };
    
    // Page title
    const pageTitle = document.getElementById('page-title');
    
    // Quick action buttons
    const quickActionButtons = {
        addProduct: document.getElementById('add-product-btn'),
        addCategory: document.getElementById('add-category-btn'),
        viewOrders: document.getElementById('view-orders-btn')
    };
    
    // Modal elements
    const modals = {
        product: new bootstrap.Modal(document.getElementById('productModal')),
        category: new bootstrap.Modal(document.getElementById('categoryModal')),
        order: new bootstrap.Modal(document.getElementById('orderModal'))
    };
    
    // Form buttons
    const formButtons = {
        saveProduct: document.getElementById('saveProductBtn'),
        saveCategory: document.getElementById('saveCategoryBtn'),
        updateOrderStatus: document.getElementById('updateOrderStatusBtn')
    };
    
    // Current filter for orders
    let currentOrderFilter = 'all';
    
    // Initialize the dashboard
    initDashboard();
    
    // Navigation event listeners
    navLinks.dashboard.addEventListener('click', () => showSection('dashboard'));
    navLinks.products.addEventListener('click', () => showSection('products'));
    navLinks.categories.addEventListener('click', () => showSection('categories'));
    navLinks.orders.addEventListener('click', () => showSection('orders'));
    navLinks.users.addEventListener('click', () => showSection('users'));
    navLinks.logout.addEventListener('click', handleLogout);
    
    // Quick action buttons
    quickActionButtons.addProduct.addEventListener('click', () => showAddProductModal());
    quickActionButtons.addCategory.addEventListener('click', () => showAddCategoryModal());
    quickActionButtons.viewOrders.addEventListener('click', () => showSection('orders'));
    
    // Order filter buttons
    document.getElementById('all-orders-btn').addEventListener('click', () => filterOrders('all'));
    document.getElementById('pending-orders-btn').addEventListener('click', () => filterOrders('Pending'));
    document.getElementById('dispatch-orders-btn').addEventListener('click', () => filterOrders('Dispatch'));
    document.getElementById('completed-orders-btn').addEventListener('click', () => filterOrders('Completed'));
    
    // Form buttons
    formButtons.saveProduct.addEventListener('click', saveProduct);
    formButtons.saveCategory.addEventListener('click', saveCategory);
    formButtons.updateOrderStatus.addEventListener('click', updateOrderStatus);
    
    // Add new buttons in management sections
    document.getElementById('add-new-product-btn').addEventListener('click', () => showAddProductModal());
    document.getElementById('add-new-category-btn').addEventListener('click', () => showAddCategoryModal());
    
    function initDashboard() {
        loadDashboardStats();
        loadRecentOrders();
    }
    
    function showSection(section) {
        // Hide all sections
        Object.values(contentSections).forEach(sec => sec.classList.add('d-none'));
        
        // Show selected section
        contentSections[section].classList.remove('d-none');
        
        // Update page title
        pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
        
        // Load data for the section if needed
        switch(section) {
            case 'products':
                if (!productsTable) {
                    loadProductsTable();
                }
                break;
            case 'categories':
                if (!categoriesTable) {
                    loadCategoriesTable();
                }
                break;
            case 'orders':
                if (!ordersTable) {
                    loadOrdersTable();
                }
                break;
            case 'users':
                if (!usersTable) {
                    loadUsersTable();
                }
                break;
        }
    }
    
    function loadDashboardStats() {
        // Load total products
        api.get('/Products')
            .then(products => {
                document.getElementById('total-products').textContent = products.length;
            });
        
        // Load total categories
        api.get('/Categories')
            .then(categories => {
                document.getElementById('total-categories').textContent = categories.length;
            });
        
        // Load total orders
        api.get('/Orders/all')
            .then(orders => {
                document.getElementById('total-orders').textContent = orders.length;
            });
        
        // Load total users
        api.get('/Auth/users')
            .then(users => {
                document.getElementById('total-users').textContent = users.length;
            })
            .catch(error => {
                console.error('Error loading users:', error);
                document.getElementById('total-users').textContent = '0';
            });
    }
    
    function loadRecentOrders() {
        api.get('/Orders/all')
            .then(orders => {
                const recentOrders = orders.slice(0, 5); // Get the 5 most recent orders
                const tableBody = document.querySelector('#recent-orders-table tbody');
                tableBody.innerHTML = '';
                
                recentOrders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${order.userEmail}</td>
                        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>$${order.totalAmount.toFixed(2)}</td>
                        <td><span class="status-badge ${getStatusClass(order.status)}">${order.status}</span></td>
                    `;
                    row.addEventListener('click', () => showOrderDetails(order.id));
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error loading recent orders:', error);
            });
    }
    
    function loadProductsTable() {
    // Destroy existing DataTable if it exists
    if ($.fn.DataTable.isDataTable('#products-table')) {
        $('#products-table').DataTable().destroy();
    }

    api.get('/Products')
        .then(products => {
            const tableBody = document.querySelector('#products-table tbody');
            tableBody.innerHTML = '';

            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td><img src="${product.imageUrl || '../images/products/default.png'}" alt="${product.name}" width="50"></td>
                    <td>${product.name}</td>
                    <td>${product.categoryName}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.quantityInStock}</td>
                    <td>${product.isAvailable ? 'Available' : 'Out of Stock'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-product" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-product" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Reinitialize DataTable
            $('#products-table').DataTable({
                responsive: true,
                destroy: true
            });

            // Attach event listeners
            document.querySelectorAll('.edit-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = btn.getAttribute('data-id');
                    showEditProductModal(productId);
                });
            });

            document.querySelectorAll('.delete-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = btn.getAttribute('data-id');
                    deleteProduct(productId);
                });
            });

            document.querySelectorAll('#products-table tbody tr').forEach(row => {
                row.addEventListener('click', () => {
                    const productId = row.cells[0].textContent;
                    showEditProductModal(productId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
        });
}

    
    function loadCategoriesTable() {
    // Destroy existing DataTable if it exists
    if ($.fn.DataTable.isDataTable('#categories-table')) {
        $('#categories-table').DataTable().destroy();
    }

    api.get('/Categories')
        .then(categories => {
            const tableBody = document.querySelector('#categories-table tbody');
            tableBody.innerHTML = '';

            categories.forEach(category => {
                const productCount = 0; // Replace this with real count if available

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${category.id}</td>
                    <td>${category.name}</td>
                    <td>${category.description || 'N/A'}</td>
                    <td>${productCount}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-category" data-id="${category.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-category" data-id="${category.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Reinitialize DataTable
            $('#categories-table').DataTable({
                responsive: true,
                destroy: true
            });

            // Attach event listeners
            document.querySelectorAll('.edit-category').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const categoryId = btn.getAttribute('data-id');
                    showEditCategoryModal(categoryId);
                });
            });

            document.querySelectorAll('.delete-category').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const categoryId = btn.getAttribute('data-id');
                    deleteCategory(categoryId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

    
    function loadOrdersTable(filter = 'all') {
        api.get('/Orders/all')
            .then(orders => {
                let filteredOrders = orders;
                if (filter !== 'all') {
                    filteredOrders = orders.filter(order => order.status === filter);
                }
                
                const tableBody = document.querySelector('#orders-table tbody');
                tableBody.innerHTML = '';
                
                filteredOrders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${order.userEmail}</td>
                        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>$${order.totalAmount.toFixed(2)}</td>
                        <td><span class="status-badge ${getStatusClass(order.status)}">${order.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-order" data-id="${order.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
                // Initialize DataTable if not already done
                if (!ordersTable) {
                    ordersTable = $('#orders-table').DataTable({
                        responsive: true,
                        order: [[2, 'desc']] // Sort by date descending
                    });
                } else {
                    ordersTable.clear().rows.add($(tableBody).find('tr')).draw();
                }
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-order').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const orderId = btn.getAttribute('data-id');
                        showOrderDetails(orderId);
                    });
                });
                
                // Make rows clickable
                document.querySelectorAll('#orders-table tbody tr').forEach(row => {
                    row.addEventListener('click', () => {
                        const orderId = row.cells[0].textContent.substring(1); // Remove #
                        showOrderDetails(orderId);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading orders:', error);
            });
    }
    
    function loadUsersTable() {
        api.get('/Auth/users')
            .then(users => {
                const tableBody = document.querySelector('#users-table tbody');
                tableBody.innerHTML = '';
                
                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.firstName} ${user.lastName}</td>
                        <td>${user.email}</td>
                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>${user.roles && user.roles.includes('Admin') ? 'Admin' : 'User'}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" disabled>
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
                // Initialize DataTable
                usersTable = $('#users-table').DataTable({
                    responsive: true
                });
            })
            .catch(error => {
                console.error('Error loading users:', error);
            });
    }
    
    function filterOrders(status) {
        currentOrderFilter = status === 'all' ? 'all' : status;
        loadOrdersTable(currentOrderFilter);
    }
    
    function showAddProductModal() {
        // Reset form
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModalTitle').textContent = 'Add New Product';
        document.getElementById('productImagePreview').innerHTML = '';
        
        // Load categories for dropdown
        loadCategoriesForDropdown();
        
        // Show modal
        modals.product.show();
    }
    
    function showEditProductModal(productId) {
        api.get(`/Products/${productId}`)
            .then(product => {
                // Fill form
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productDiscountedPrice').value = product.discountedPrice || '';
                document.getElementById('productStock').value = product.quantityInStock;
                
                // Load categories for dropdown and select the current one
                loadCategoriesForDropdown(product.categoryId);
                
                // Show image preview if exists
                const imagePreview = document.getElementById('productImagePreview');
                if (product.imageUrl) {
                    imagePreview.innerHTML = `
                        <p>Current Image:</p>
                        <img src="${product.imageUrl}" alt="${product.name}" class="img-thumbnail" width="150">
                    `;
                } else {
                    imagePreview.innerHTML = '';
                }
                
                // Update modal title
                document.getElementById('productModalTitle').textContent = 'Edit Product';
                
                // Show modal
                modals.product.show();
            })
            .catch(error => {
                console.error('Error loading product:', error);
                auth.showToast('Failed to load product details', 'danger');
            });
    }
    
    function loadCategoriesForDropdown(selectedId = null) {
        const categorySelect = document.getElementById('productCategory');
        categorySelect.innerHTML = '<option value="">Loading categories...</option>';
        
        api.get('/Categories')
            .then(categories => {
                categorySelect.innerHTML = '';
                
                if (categories.length === 0) {
                    categorySelect.innerHTML = '<option value="">No categories available</option>';
                    return;
                }
                
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    if (selectedId && category.id == selectedId) {
                        option.selected = true;
                    }
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                categorySelect.innerHTML = '<option value="">Failed to load categories</option>';
            });
    }
    
    function saveProduct() {
        const productId = document.getElementById('productId').value;
        const isEdit = !!productId;
        
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            discountedPrice: document.getElementById('productDiscountedPrice').value ? 
                parseFloat(document.getElementById('productDiscountedPrice').value) : null,
            quantityInStock: parseInt(document.getElementById('productStock').value),
            categoryId: parseInt(document.getElementById('productCategory').value)
        };
        
        const imageFile = document.getElementById('productImage').files[0];
        
        let savePromise;
        if (isEdit) {
            savePromise = api.put(`/Products/${productId}`, productData)
                .then(() => {
                    if (imageFile) {
                        return uploadProductImage(productId, imageFile);
                    }
                    return Promise.resolve();
                });
        } else {
            savePromise = api.post('/Products', productData)
                .then(newProduct => {
                    if (imageFile) {
                        return uploadProductImage(newProduct.id, imageFile);
                    }
                    return Promise.resolve();
                });
        }
        
        savePromise
            .then(() => {
                auth.showToast(`Product ${isEdit ? 'updated' : 'added'} successfully`, 'success');
                modals.product.hide();
                loadProductsTable();
                loadDashboardStats(); // Refresh stats
            })
            .catch(error => {
                console.error('Error saving product:', error);
                auth.showToast(`Failed to ${isEdit ? 'update' : 'add'} product: ${error.message}`, 'danger');
            });
    }
    
    function uploadProductImage(productId, file) {
        const formData = new FormData();
        formData.append('file', file);
        
        return fetch(`${API_BASE_URL}/Products/${productId}/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            return response.json();
        });
    }
    
    function deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        api.delete(`/Products/${productId}`)
            .then(() => {
                auth.showToast('Product deleted successfully', 'success');
                loadProductsTable();
                loadDashboardStats(); // Refresh stats
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                auth.showToast('Failed to delete product', 'danger');
            });
    }
    
    function showAddCategoryModal() {
        // Reset form
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryModalTitle').textContent = 'Add New Category';
        
        // Show modal
        modals.category.show();
    }
    
    function showEditCategoryModal(categoryId) {
        api.get(`/Categories/${categoryId}`)
            .then(category => {
                // Fill form
                document.getElementById('categoryId').value = category.id;
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryDescription').value = category.description || '';
                
                // Update modal title
                document.getElementById('categoryModalTitle').textContent = 'Edit Category';
                
                // Show modal
                modals.category.show();
            })
            .catch(error => {
                console.error('Error loading category:', error);
                auth.showToast('Failed to load category details', 'danger');
            });
    }
    
    function saveCategory() {
        const categoryId = document.getElementById('categoryId').value;
        const isEdit = !!categoryId;
        
        const categoryData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value
        };
        
        const apiCall = isEdit ? 
            api.put(`/Categories/${categoryId}`, categoryData) :
            api.post('/Categories', categoryData);
        
        apiCall
            .then(() => {
                auth.showToast(`Category ${isEdit ? 'updated' : 'added'} successfully`, 'success');
                modals.category.hide();
                loadCategoriesTable();
                loadDashboardStats(); // Refresh stats
            })
            .catch(error => {
                console.error('Error saving category:', error);
                auth.showToast(`Failed to ${isEdit ? 'update' : 'add'} category: ${error.message}`, 'danger');
            });
    }
    
    function deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }
        
        api.delete(`/Categories/${categoryId}`)
            .then(() => {
                auth.showToast('Category deleted successfully', 'success');
                loadCategoriesTable();
                loadDashboardStats(); // Refresh stats
            })
            .catch(error => {
                console.error('Error deleting category:', error);
                auth.showToast('Failed to delete category', 'danger');
            });
    }
    
    function showOrderDetails(orderId) {
        api.get(`/Orders/${orderId}`)
            .then(order => {
                // Fill order details
                document.getElementById('orderIdTitle').textContent = `#${order.id}`;
                document.getElementById('customerEmail').textContent = order.userEmail;
                document.getElementById('customerName').textContent = order.userId;
                document.getElementById('orderDate').textContent = new Date(order.orderDate).toLocaleString();
                document.getElementById('orderStatus').textContent = order.status;
                document.getElementById('orderStatus').className = `status-badge ${getStatusClass(order.status)}`;
                document.getElementById('paymentMethod').textContent = order.paymentMethod;
                document.getElementById('paymentStatus').textContent = order.paymentStatus;
                
                // Fill addresses
                if (order.shippingAddress) {
                    document.getElementById('shippingAddress').innerHTML = `
                        ${order.shippingAddress.street}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
                        ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}
                    `;
                }
                
                if (order.billingAddress) {
                    document.getElementById('billingAddress').innerHTML = `
                        ${order.billingAddress.street}<br>
                        ${order.billingAddress.city}, ${order.billingAddress.state}<br>
                        ${order.billingAddress.zipCode}, ${order.billingAddress.country}
                    `;
                }
                
                // Fill order items
                const orderItemsTable = document.getElementById('orderItemsTable');
                orderItemsTable.innerHTML = '';
                
                order.orderItems.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.productName}</td>
                        <td>$${item.unitPrice.toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.totalPrice.toFixed(2)}</td>
                    `;
                    orderItemsTable.appendChild(row);
                });
                
                // Set total amount
                document.getElementById('orderTotalAmount').textContent = `$${order.totalAmount.toFixed(2)}`;
                
                // Set current status in select
                document.getElementById('orderStatusSelect').value = order.status;
                
                // Store order ID for status update
                document.getElementById('orderStatusUpdateSection').setAttribute('data-order-id', order.id);
                
                // Show modal
                modals.order.show();
            })
            .catch(error => {
                console.error('Error loading order details:', error);
                auth.showToast('Failed to load order details', 'danger');
            });
    }
    
    function updateOrderStatus() {
        const orderId = document.getElementById('orderStatusUpdateSection').getAttribute('data-order-id');
        const newStatus = document.getElementById('orderStatusSelect').value;
        
        if (!orderId || !newStatus) {
            auth.showToast('Invalid order or status', 'danger');
            return;
        }
        
        api.put(`/Orders/${orderId}/status`, { status: newStatus })
            .then(() => {
                auth.showToast('Order status updated successfully', 'success');
                modals.order.hide();
                loadOrdersTable(currentOrderFilter);
                loadRecentOrders(); // Refresh recent orders on dashboard
            })
            .catch(error => {
                console.error('Error updating order status:', error);
                auth.showToast('Failed to update order status', 'danger');
            });
    }
    
    function getStatusClass(status) {
        switch(status) {
            case 'Pending': return 'status-pending';
            case 'Completed': return 'status-completed';
            case 'Dispatch': return 'status-dispatch';
            default: return '';
        }
    }
    
    function handleLogout() {
        auth.handleLogout();
    }
});