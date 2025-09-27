// frontend/static/js/main.js
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// --- DASHBOARD ---
async function loadDashboardData() {
    // ... existing dashboard code from previous response ...
}
function renderSalesChart() {
    // ... existing chart code from previous response ...
}


// --- EMPLOYEES PAGE ---
async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}/employees/`);
        const employees = await response.json();
        const tableBody = document.getElementById('employee-table-body');
        tableBody.innerHTML = ''; // Clear existing rows
        employees.forEach(emp => {
            const hireDate = new Date(emp.hire_date).toLocaleDateString();
            const row = `
                <tr>
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${hireDate}</td>
                    <td>${emp.performance_score}/100</td>
                    <td>
                        <button class="btn btn-secondary btn-sm">Edit</button>
                        <button class="btn btn-danger btn-sm">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load employees:", error);
    }
}

function openAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'block';
}

function closeAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'none';
}

document.addEventListener('submit', async function(event) {
    if (event.target.id === 'addEmployeeForm') {
        event.preventDefault();
        const formData = new FormData(event.target);
        const employeeData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/employees/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employeeData)
            });
            if (response.ok) {
                closeAddEmployeeModal();
                loadEmployees(); // Refresh the table
            } else {
                alert('Failed to add employee.');
            }
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    }
});


// --- ORDERS PAGE ---
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/`);
        const orders = await response.json();
        const tableBody = document.getElementById('orders-table-body');
        tableBody.innerHTML = '';
        orders.forEach(order => {
            const orderDate = new Date(order.timestamp).toLocaleString();
            const row = `
                <tr>
                    <td>#${order.id}</td>
                    <td>${orderDate}</td>
                    <td>$${order.total_price.toFixed(2)}</td>
                    <td><span class="status status-${order.status.toLowerCase()}">${order.status}</span></td>
                    <td><button class="btn btn-secondary btn-sm">Details</button></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load orders:", error);
    }
}


// --- INVENTORY PAGE ---
async function loadInventory() {
     try {
        const response = await fetch(`${API_BASE_URL}/inventory/`);
        const items = await response.json();
        const tableBody = document.getElementById('inventory-table-body');
        tableBody.innerHTML = '';
        items.forEach(item => {
            const isLowStock = item.quantity <= item.low_stock_threshold;
            const statusClass = isLowStock ? 'status-low' : 'status-ok';
            const statusText = isLowStock ? 'Low Stock' : 'In Stock';
            const row = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load inventory:", error);
    }
}
// Modal functions for inventory are similar to employee modal functions
function openAddItemModal() { document.getElementById('addItemModal').style.display = 'block'; }
function closeAddItemModal() { document.getElementById('addItemModal').style.display = 'none'; }
// Form submission handler for adding inventory items can be added similarly to the employee form