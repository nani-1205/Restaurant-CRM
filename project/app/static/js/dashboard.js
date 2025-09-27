document.addEventListener('DOMContentLoaded', function () {
    const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    
    const updateStat = (elementId, value, changeId, change) => {
        const valueEl = document.getElementById(elementId);
        const changeEl = document.getElementById(changeId);
        
        if (valueEl) valueEl.textContent = value;
        if (changeEl) {
            changeEl.textContent = `${change >= 0 ? '+' : ''}${change}%`;
            changeEl.className = change >= 0 ? 'text-success' : 'text-danger';
        }
    };

    const createPieChart = (ctx, data) => {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    label: 'Sales',
                    data: data.map(item => item.value),
                    backgroundColor: ['#6f42c1', '#fd7e14', '#20c997', '#0dcaf0', '#d63384'],
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } }
            }
        });
    };
    
    const createLineChart = (ctx, data) => {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Actual',
                        data: data.actual,
                        borderColor: '#0d6efd',
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: 'Planned',
                        data: data.planned,
                        borderColor: '#6c757d',
                        borderDash: [5, 5],
                        tension: 0.1,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
            }
        });
    };

    fetch('/api/dashboard/summary')
        .then(response => response.json())
        .then(data => {
            // Update summary stats
            updateStat('total-sales', formatCurrency(data.summary_stats.sales.value), 'sales-change', data.summary_stats.sales.change);
            updateStat('total-covers', data.summary_stats.covers.value, 'covers-change', data.summary_stats.covers.change);
            updateStat('avg-check', formatCurrency(data.summary_stats.avg_check.value), 'check-change', data.summary_stats.avg_check.change);

            // Render charts
            const foodSalesCtx = document.getElementById('foodSalesChart').getContext('2d');
            createPieChart(foodSalesCtx, data.biggest_food_item_sales);

            const profitCtx = document.getElementById('profitChart').getContext('2d');
            createLineChart(profitCtx, data.actual_vs_planned_profit);
        })
        .catch(error => console.error('Error fetching dashboard data:', error));
});