document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuthState();
    
    try {
        // Show loading state
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="loading-spinner text-primary"></div>
                <p class="mt-2">Loading orders...</p>
            </div>
        `;
        
        // Fetch orders
        const orders = await api.get('/Orders');
        
        // Render orders
        renderOrders(orders);
    } catch (error) {
        auth.showToast(error.message, 'danger');
        document.getElementById('main-content').innerHTML = `
            <div class="alert alert-danger">
                Failed to load orders. Please try again later.
            </div>
        `;
    }
});

function renderOrders(orders) {
    const mainContent = document.getElementById('main-content');
    
    if (!orders || orders.length === 0) {
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <h2 class="mb-3">You haven't placed any orders yet</h2>
                <p class="mb-4">Start shopping to see your orders here.</p>
                <a href="index.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">Your Orders</h2>
                <div class="accordion" id="ordersAccordion">
    `;
    
    orders.forEach((order, index) => {
        const orderDate = new Date(order.orderDate).toLocaleDateString();
        const statusClass = getStatusClass(order.status);
        
        html += `
            <div class="accordion-item mb-3">
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#collapse${index}" 
                            aria-expanded="${index === 0 ? 'true' : 'false'}" 
                            aria-controls="collapse${index}">
                        <div class="d-flex justify-content-between w-100 me-3">
                            <div>
                                <span class="me-3">Order #${order.id}</span>
                                <span class="me-3">${orderDate}</span>
                            </div>
                            <div>
                                <span class="badge ${statusClass}">${order.status}</span>
                                <span class="ms-3 fw-bold">$${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </button>
                </h2>
                <div id="collapse${index}" 
                     class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                     aria-labelledby="heading${index}" 
                     data-bs-parent="#ordersAccordion">
                    <div class="accordion-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h5>Shipping Address</h5>
                                <address>
                                    ${order.shippingAddress.street}<br>
                                    ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
                                    ${order.shippingAddress.zipCode}<br>
                                    ${order.shippingAddress.country}
                                </address>
                            </div>
                            <div class="col-md-6">
                                <h5>Billing Address</h5>
                                <address>
                                    ${order.billingAddress.street}<br>
                                    ${order.billingAddress.city}, ${order.billingAddress.state}<br>
                                    ${order.billingAddress.zipCode}<br>
                                    ${order.billingAddress.country}
                                </address>
                            </div>
                        </div>
                        
                        <h5 class="mb-3">Order Items</h5>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
        `;
        
        order.orderItems.forEach(item => {
            const price = item.discountedPrice || item.unitPrice;
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
                    <td>${item.quantity}</td>
                    <td>$${total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="row mt-4">
                            <div class="col-md-6">
                                <h5>Payment Information</h5>
                                <p>
                                    <strong>Method:</strong> ${order.paymentMethod}<br>
                                    <strong>Status:</strong> ${order.paymentStatus}
                                </p>
                            </div>
                            <div class="col-md-6 text-end">
                                <div class="d-inline-block text-start">
                                    <div class="d-flex justify-content-between">
                                        <span class="me-3">Subtotal:</span>
                                        <span>$${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span class="me-3">Shipping:</span>
                                        <span>Free</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span class="me-3">Tax:</span>
                                        <span>$0.00</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between fw-bold">
                                        <span class="me-3">Total:</span>
                                        <span>$${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = html;
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-warning text-dark';
        case 'completed':
            return 'bg-success';
        case 'shipped':
            return 'bg-info';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}