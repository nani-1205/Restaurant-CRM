document.addEventListener('DOMContentLoaded', function () {
    // The TABLE_ID is now passed securely from the template
    const menuGrid = document.getElementById('menu-items-grid');
    const orderList = document.getElementById('order-items-list');
    const noItemsMsg = document.getElementById('no-items-msg');
    const orderTotalEl = document.getElementById('order-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    let currentOrder = {}; // Stores { menu_item_id: { name, price, quantity } }

    const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    // Fetch menu and render it
    fetch('/api/menu/')
        .then(response => response.json())
        .then(menuItems => {
            menuGrid.innerHTML = ''; // Clear loading state
            menuItems.forEach(item => {
                const menuItemCard = `
                    <div class="col">
                        <div class="card h-100 menu-item-card" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                            <div class="card-body">
                                <h6 class="card-title mb-1">${item.name}</h6>
                                <p class="card-text text-muted">${formatCurrency(item.price)}</p>
                            </div>
                        </div>
                    </div>
                `;
                menuGrid.innerHTML += menuItemCard;
            });
        });

    // Handle clicking on a menu item
    menuGrid.addEventListener('click', function(e) {
        const card = e.target.closest('.menu-item-card');
        if (card) {
            const itemId = card.dataset.id;
            const itemName = card.dataset.name;
            const itemPrice = parseFloat(card.dataset.price);

            if (currentOrder[itemId]) {
                currentOrder[itemId].quantity++;
            } else {
                currentOrder[itemId] = { name: itemName, price: itemPrice, quantity: 1 };
            }
            updateOrderSummary();
        }
    });

    function updateOrderSummary() {
        orderList.innerHTML = '';
        let total = 0;

        if (Object.keys(currentOrder).length === 0) {
            orderList.appendChild(noItemsMsg);
            placeOrderBtn.disabled = true;
        } else {
            placeOrderBtn.disabled = false;
            for (const itemId in currentOrder) {
                const item = currentOrder[itemId];
                total += item.price * item.quantity;

                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `
                    <span>
                        ${item.name} <small class="text-muted">x${item.quantity}</small>
                    </span>
                    <strong>${formatCurrency(item.price * item.quantity)}</strong>
                `;
                orderList.appendChild(listItem);
            }
        }
        orderTotalEl.textContent = formatCurrency(total);
    }
    
    placeOrderBtn.addEventListener('click', function() {
        this.disabled = true;
        this.textContent = 'Placing...';

        const orderData = {
            table_id: TABLE_ID,
            items: Object.keys(currentOrder).map(itemId => ({
                menu_item_id: parseInt(itemId),
                quantity: currentOrder[itemId].quantity
            }))
        };

        fetch('/api/orders/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(response => {
            if (!response.ok) {
                // If the server sends a non-200 response, read the error message
                return response.json().then(err => { throw new Error(err.error || 'Order placement failed') });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            window.location.href = '/tables'; // Redirect to tables page on success
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Could not place order: ${error.message}`);
            this.disabled = false; // Re-enable the button on failure
            this.textContent = 'Place Order';
        });
    });
});