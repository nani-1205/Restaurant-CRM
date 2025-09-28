document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Element Declarations ---
    // Get references to all the interactive elements on the page.
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

    // --- 2. State Management ---
    // A central object to hold the application's current state.
    let state = {
        selectedTableId: null,
        selectedTableName: null,
        cart: [], // Format: { id, name, price, quantity }
        menu: [], // Will be populated by the API call
    };

    // --- 3. Function Definitions ---
    // All functions are defined here, before they are attached to any events.

    /** Switches the view to show the table layout. */
    const showTablesView = () => {
        orderView.classList.add('d-none');
        tablesView.classList.remove('d-none');
        resetState();
    };

    /** Switches the view to show the menu and order summary for a selected table. */
    const showOrderView = async () => {
        tablesView.classList.add('d-none');
        orderView.classList.remove('d-none');
        tableNameDisplay.textContent = state.selectedTableName;
        // Fetch the menu only if it hasn't been fetched before.
        if (state.menu.length === 0) {
            await fetchMenu();
        }
        renderMenu();
    };

    /** Fetches the menu data from the server's API endpoint. */
    const fetchMenu = async () => {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) throw new Error('Network response was not ok');
            state.menu = await response.json();
        } catch (error) {
            console.error('Failed to fetch menu:', error);
            menuCategoriesContainer.innerHTML = `<div class="alert alert-danger">Failed to load menu. Please try again.</div>`;
        }
    };

    /** Renders the fetched menu data into the menu container. */
    const renderMenu = () => {
        menuCategoriesContainer.innerHTML = '';
        if (state.menu.length === 0) {
            menuCategoriesContainer.innerHTML = '<p class="text-muted">No menu items found. Please add categories and items in the admin panel.</p>';
            return;
        }
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
    
    /** Adds an item to the cart or increments its quantity if it already exists. */
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
    
    /** Increases or decreases an item's quantity in the cart. Removes if quantity becomes zero. */
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

    /** Renders the current state of the cart into the order summary panel. */
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

    /** Calculates and displays the subtotal, tax, and total for the cart. */
    const calculateTotals = () => {
        const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.10; // 10% tax
        const total = subtotal + tax;
        cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        cartTaxEl.textContent = `$${tax.toFixed(2)}`;
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
    };

    /** Finds a menu item object by its ID from the fetched menu data. */
    const findMenuItem = (itemId) => {
        for (const category of state.menu) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    };
    
    /** Checks if an order is valid (has items and an employee) and enables/disables the place order button. */
    const validateOrder = () => {
        const isEmployeeSelected = employeeSelect.value !== '';
        const hasItems = state.cart.length > 0;
        placeOrderBtn.disabled = !(isEmployeeSelected && hasItems);
    };
    
    /** Submits the completed order to the server API. */
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
            if (!response.ok) throw new Error(result.error || 'Failed to place order.');
            
            alert('Order placed successfully!');
            window.location.reload(); // Reload the page to show updated table statuses
        } catch (error) {
            alert(`Error: ${error.message}`);
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
        }
    }

    /** Resets the application state when returning to the table view. */
    const resetState = () => {
        state.selectedTableId = null;
        state.selectedTableName = null;
        state.cart = [];
        employeeSelect.value = '';
        renderCart();
    };

    // --- 4. Event Listeners ---
    // Attaches all the defined functions to their corresponding user actions.
    
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
            addItemToCart(parseInt(e.target.dataset.itemId));
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
    employeeSelect.addEventListener('change', validateOrder);
});