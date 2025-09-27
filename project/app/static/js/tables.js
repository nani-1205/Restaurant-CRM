document.addEventListener('DOMContentLoaded', function () {
    const tableGrid = document.getElementById('table-grid');
    const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
    const statusModalTitle = document.getElementById('statusModalTitle');
    let currentTableId = null;

    const renderTables = (tables) => {
        tableGrid.innerHTML = '';
        tables.forEach(table => {
            const tableCard = document.createElement('div');
            tableCard.className = `table-card d-flex flex-column align-items-center justify-content-center status-${table.status}`;
            tableCard.dataset.tableId = table.id;
            tableCard.dataset.tableNumber = table.table_number;
            
            tableCard.innerHTML = `
                <div class="table-number">T${table.table_number}</div>
                <div class="table-capacity">${table.capacity} Guests</div>
            `;
            
            tableCard.addEventListener('click', () => {
                currentTableId = table.id;
                statusModalTitle.textContent = `Change Status for Table ${table.table_number}`;
                statusModal.show();
            });

            tableGrid.appendChild(tableCard);
        });
    };

    const fetchTables = () => {
        fetch('/api/tables/')
            .then(response => response.json())
            .then(data => renderTables(data))
            .catch(error => console.error('Error fetching tables:', error));
    };

    document.querySelectorAll('.status-change-btn').forEach(button => {
        button.addEventListener('click', () => {
            const newStatus = button.dataset.status;
            
            fetch(`/api/tables/${currentTableId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            .then(response => response.json())
            .then(() => {
                statusModal.hide();
                fetchTables(); // Refresh the table grid
            })
            .catch(error => console.error('Error updating status:', error));
        });
    });

    // Initial load
    fetchTables();
});