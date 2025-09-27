// frontend/static/js/main.js
const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/summary`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        document.getElementById('total-sales').textContent = data.totalSales;
        document.getElementById('total-orders').textContent = data.totalOrders;
        document.getElementById('avg-order-value').textContent = data.avgOrderValue;
        document.getElementById('employee-count').textContent = data.employeeCount;
        
        const topPerformersList = document.getElementById('top-performers-list');
        topPerformersList.innerHTML = ''; // Clear existing list
        data.topPerformers.forEach(emp => {
            const li = document.createElement('li');
            li.textContent = `${emp.name} - Score: ${emp.score}`;
            topPerformersList.appendChild(li);
        });
        
        renderSalesChart();

    } catch (error) {
        console.error("Could not load dashboard data:", error);
    }
}

function renderSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    // Dummy data - replace with real API data
    const salesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Monthly Sales',
            data: [12000, 19000, 15000, 21000, 18000, 24000],
            backgroundColor: 'rgba(106, 90, 205, 0.2)',
            borderColor: 'rgba(106, 90, 205, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: salesData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}