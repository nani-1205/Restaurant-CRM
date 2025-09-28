document.addEventListener('DOMContentLoaded', () => {
    const tablesView = document.getElementById('tables-view');
    const orderView = document.getElementById('order-view');
    const backToTablesBtn = document.getElementById('back-to-tables');
    const tableNameDisplay = document.getElementById('table-name-display');
    const menuCategoriesContainer = document.getElementById('menu-categories');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTaxEl = document.getElementById('cart-tax');
    const cartTotalEl = document.getElementById('cart-total');
    const employeeSelect = document.getElementById('employee-select');
    const placeOrderBtn = document.getElementById('place-order-btn');

    let state = {
        selectedTableId: null,
        selectedTableName: null,
        cart: [], // { id, name, price, quantity }
        menu: [],
    };

    // EVENT LISTENERS
    tablesView.addEventListener('click', (e) => {
        const tableEl = e.target.closest('.pos-table');
        if (tableEl && !tableEl.classList.contains('status-occupied')) {
            state.selectedTableId = tableEl.dataset.tableId;
            state.selectedTableName = tableEl.dataset.tableName;
            showOrderView();
        }
    });

    backToTablesBtn.addEventListener('click', showTablesView);

    menuCategoriesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-item-btn')) {
            const itemId = parseInt(e.target.dataset.itemId);
            addItemToCart(itemId);
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.dataset.itemId);
        if (e.target.classList.contains('cart-qty-increase')) {
            updateCartQuantity(itemId, 1);
        }
        if (e.target.classList.contains('cart-qty-decrease')) {
            updateCartQuantity(itemId, -1);
        }
    });
    
    placeOrderBtn.addEventListener('click', placeOrder);


    // FUNCTIONS
    const showTablesView = () => {
        orderView.classList.add('d-none');
        tablesView.classList.remove('d-none');
        resetState();
    };

    const showOrderView = async () => {
        tablesView.classList.add('d-none');
        orderView.classList.remove('d-none');
        tableNameDisplay.textContent = state.selectedTableName;
        await fetchMenu();
        renderMenu();
    };

    const fetchMenu = async () => {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) throw new Error('Network response was not ok');
            state.menu = await response.json();
        } catch (error) {
            console.error('Failed to fetch menu:', error);
            // Show error to user
        }
    };

    const renderMenu = () => {
        menuCategoriesContainer.innerHTML = '';
        state.menu.forEach(category => {
            let itemsHtml = '';
            category.items.forEach(item => {
                itemsHtml += `
                    <div class="pos-menu-item">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">$${item.price.toFixed(2)}</div>
                        <button class="btn btn-sm btn-outline-primary add-item-btn" data-item-id="${item.id}">+</button>
                    </div>`;
            });

            const categoryHtml = `
                <div class="pos-menu-category">
                    <h5>${category.name}</h5>
                    ${itemsHtml}
                </div>`;
            menuCategoriesContainer.innerHTML += categoryHtml;
        });
    };
    
    const addItemToCart = (itemId) => {
        const existingItem = state.cart.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            const menuItem = findMenuItem(itemId);
            if (menuItem) {
                state.cart.push({ ...menuItem, quantity: 1 });
            }
        }
        renderCart();
    };
    
    const updateCartQuantity = (itemId, change) => {
        const cartItem = state.cart.find(item => item.id === itemId);
        if (cartItem) {
            cartItem.quantity += change;
            if (cartItem.quantity <= 0) {
                state.cart = state.cart.filter(item => item.id !== itemId);
            }
        }
        renderCart();
    };

    const renderCart = () => {
        if (state.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-muted">No items added yet.</p>';
        } else {
            cartItemsContainer.innerHTML = '';
            state.cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                const itemHtml = `
                    <div class="pos-cart-item">
                        <div>
                            <div class="fw-bold">${item.name}</div>
                            <small class="text-muted">$${item.price.toFixed(2)} x ${item.quantity}</small>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="fw-bold me-3">$${itemTotal.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-secondary cart-qty-decrease" data-item-id="${item.id}">-</button>
                            <button class="btn btn-sm btn-outline-secondary cart-qty-increase" data-item-id="${item.id}">+</button>
                        </div>
                    </div>`;
                cartItemsContainer.innerHTML += itemHtml;
            });
        }
        calculateTotals();
        validateOrder();
    };

    const calculateTotals = () => {
        const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.10;
        const total = subtotal + tax;
        cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        cartTaxEl.textContent = `$${tax.toFixed(2)}`;
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
    };

    const findMenuItem = (itemId) => {
        for (const category of state.menu) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    };
    
    const validateOrder = () => {
        const isEmployeeSelected = employeeSelect.value !== '';
        const hasItems = state.cart.length > 0;
        placeOrderBtn.disabled = !(isEmployeeSelected && hasItems);
    };
    
    employeeSelect.addEventListener('change', validateOrder);

    async function placeOrder() {
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Placing...';

        const orderData = {
            table_ids: [parseInt(state.selectedTableId)],
            employee_id: parseInt(employeeSelect.value),
            items: state.cart.map(item => ({ id: item.id, quantity: item.quantity }))
        };

        try {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to place order.');
            }
            // SUCCESS
            alert('Order placed successfully!');
            window.location.reload(); // Simple way to refresh table statuses
        } catch (error) {
            alert(`Error: ${error.message}`);
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
        }
    }

    const resetState = () => {
        state.selectedTableId = null;
        state.selectedTableName = null;
        state.cart = [];
        employeeSelect.value = '';
        renderCart();
    };
});