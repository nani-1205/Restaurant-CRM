document.addEventListener('DOMContentLoaded', function () {
    const tableGrid = document.getElementById('table-grid');

    const renderTables = (tables) => {
        tableGrid.innerHTML = '';
        if (tables.length === 0) {
            tableGrid.innerHTML = '<p>No tables found. Please seed the database.</p>';
            return;
        }

        tables.forEach(table => {
            const tableCardWrapper = document.createElement('a');
            tableCardWrapper.className = `table-card-link`;
            
            // Allow creating new orders only for 'Available' tables.
            // For 'Occupied' or 'Reserved', you might link to an "edit order" page in the future.
            if (table.status === 'Available') {
                tableCardWrapper.href = `/order/${table.id}`; 
            } else {
                tableCardWrapper.style.cursor = 'not-allowed'; // Non-available tables are not clickable for new orders.
                tableCardWrapper.onclick = (e) => e.preventDefault(); // Prevent navigation
            }

            tableCardWrapper.innerHTML = `
                <div class="table-card d-flex flex-column justify-content-center p-3 status-${table.status}">
                    <div class="table-number">T${table.table_number}</div>
                    <div class="table-capacity">${table.capacity} Guests</div>
                </div>
            `;
            
            tableGrid.appendChild(tableCardWrapper);
        });
    };

    const fetchTables = () => {
        fetch('/api/tables/')
            .then(response => response.json())
            .then(data => renderTables(data))
            .catch(error => console.error('Error fetching tables:', error));
    };

    // Initial load
    fetchTables();
});