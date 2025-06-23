document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuthState();
    
    // Toggle billing form
    document.getElementById('same-billing').addEventListener('change', (e) => {
        document.getElementById('billing-form').classList.toggle('d-none', e.target.checked);
    });

    // Toggle payment methods
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('credit-card-form').style.display = 
                e.target.id === 'credit-card' ? 'block' : 'none';
        });
    });

    try {
        // Load cart items
        const cart = await api.get('/Cart');
        renderOrderSummary(cart);
        
        // Set up place order button
        document.getElementById('place-order-btn').addEventListener('click', async () => {
            await placeOrder(cart);
        });
    } catch (error) {
        auth.showToast(error.message, 'danger');
        document.getElementById('order-summary').innerHTML = `
            <div class="alert alert-danger">
                Failed to load order summary. Please try again later.
            </div>
        `;
    }
});

function renderOrderSummary(cart) {
    const orderSummary = document.getElementById('order-summary');
    
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        orderSummary.innerHTML = `
            <div class="alert alert-warning">
                Your cart is empty. <a href="index.html">Continue shopping</a>
            </div>
        `;
        document.getElementById('place-order-btn').disabled = true;
        return;
    }

    let html = '';
    cart.cartItems.forEach(item => {
        const price = item.discountedPrice || item.price;
        const total = price * item.quantity;
        
        html += `
            <div class="d-flex justify-content-between mb-3">
                <div>
                    <h6 class="mb-0">${item.productName}</h6>
                    <small class="text-muted">${item.quantity} × $${price.toFixed(2)}</small>
                </div>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
    });

    orderSummary.innerHTML = html;
    document.getElementById('subtotal').textContent = `$${cart.totalAmount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${cart.totalAmount.toFixed(2)}`;
}

async function placeOrder(cart) {
    const shippingForm = document.getElementById('shipping-form');
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').id;
    
    if (!shippingForm.checkValidity()) {
        shippingForm.reportValidity();
        return;
    }

    try {
        // Prepare shipping address
        const shippingAddress = {
            street: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zip').value,
            country: document.getElementById('country').value
        };

        // Prepare billing address (use shipping address if checkbox is checked)
        const billingAddress = document.getElementById('same-billing').checked
            ? { ...shippingAddress } // Clone shipping address
            : {
                street: document.getElementById('billing-address').value,
                city: document.getElementById('billing-city').value,
                state: document.getElementById('billing-state').value,
                zipCode: document.getElementById('billing-zip').value,
                country: document.getElementById('billing-country').value
            };

        const orderData = {
            paymentMethod: formatPaymentMethod(paymentMethod),
            shippingAddress: shippingAddress,
            billingAddress: billingAddress // Always include billing address
        };

        console.log('Order data being sent:', orderData);

        const order = await api.post('/Orders', orderData);
        showToast('Order placed successfully!', 'success');
        
        await api.delete('/Cart');
        
        setTimeout(() => {
            window.location.href = `order-confirmation.html?orderId=${order.id}`;
        }, 1500);
    } catch (error) {
        console.error('Order placement failed:', error);
        showToast(`Order failed: ${error.message}`, 'danger');
    }
}

function formatPaymentMethod(method) {
    // Match exactly what your API expects
    switch (method) {
        case 'credit-card': return 'Credit Card';
        case 'paypal': return 'PayPal';
        case 'cash-on-delivery': return 'Cash on Delivery';
        default: return method;
    }
}


