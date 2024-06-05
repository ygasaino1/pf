// Sample array of objects
let allData = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, value: Math.floor(Math.random() * 100) }));
let nextId = 16; // To keep track of the next id for new objects

// Function to render rows
function renderRows(data) {
    const container = document.getElementById('container');
    container.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row-${item.id}`;
        row.setAttribute('data-value', item.value);
        row.innerHTML = `<div>${item.id}</div><div>${item.value}</div>`;
        container.appendChild(row);
    });
}

// Function to update and animate rows
function updateRows(allData) {
    // Sort data by value
    const topData = [...allData].sort((a, b) => b.value - a.value).slice(0, 50);

    const container = document.getElementById('container');
    const rows = Array.from(container.children);
    const containerTop = container.getBoundingClientRect().top;

    // Get current positions of all rows relative to the container
    const positions = rows.map(row => ({
        id: parseInt(row.id.replace('row-', ''), 10),
        top: row.getBoundingClientRect().top - containerTop
    }));

    // Clear and re-add rows in sorted order to the DOM
    const currentIds = new Set(topData.map(item => item.id));
    rows.forEach(row => {
        const rowId = parseInt(row.id.replace('row-', ''), 10);
        if (!currentIds.has(rowId)) {
            row.remove();
        }
    });

    topData.forEach(item => {
        const row = document.getElementById(`row-${item.id}`);
        if (row) {
            container.appendChild(row);
        } else {
            const newRow = document.createElement('div');
            newRow.className = 'row';
            newRow.id = `row-${item.id}`;
            newRow.setAttribute('data-value', item.value);
            newRow.innerHTML = `<div>${item.id}</div><div>${item.value}</div>`;
            container.appendChild(newRow); // Add new rows to the bottom
        }
    });

    // Get new positions of all rows relative to the container
    const newPositions = Array.from(container.children).map(row => ({
        id: parseInt(row.id.replace('row-', ''), 10),
        top: row.getBoundingClientRect().top - containerTop
    }));

    // Apply transformations and animations
    positions.forEach(pos => {
        const newPos = newPositions.find(np => np.id === pos.id);
        if (newPos) {
            const row = document.getElementById(`row-${pos.id}`);
            const offset = pos.top - newPos.top;

            if (offset !== 0) {
                row.style.transition = 'none';
                row.style.transform = `translateY(${offset}px)`;
                requestAnimationFrame(() => {
                    row.style.transition = 'transform 0.5s, background-color 3s ease-out';
                    row.style.transform = '';
                });
            } else {
                row.style.transition = 'background-color 0.5s ease-out';
                row.style.transform = '';
            }
        }
    });

    // Update content and apply background color animation
    topData.forEach(item => {
        const row = document.getElementById(`row-${item.id}`);
        const oldValue = parseInt(row.getAttribute('data-value'), 10);
        const newValue = item.value;

        row.setAttribute('data-value', newValue);
        row.innerHTML = `<div>${item.id}</div><div>${newValue}</div>`;

        if (newValue > oldValue) {
            row.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Green
        } else if (newValue < oldValue) {
            row.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Red
        }

        requestAnimationFrame(() => {
            row.style.transition = 'transform 0.5s, background-color 3s ease-out';
            row.style.backgroundColor = 'transparent';
        });
    });
}

// Initial render
renderRows(allData.slice(0, 50));

// Simulate updates
setInterval(() => {
    // Randomly update a few data values
    allData.forEach(item => {
        if (Math.random() > 0.7) { // Update approximately 30% of items
            item.value = Math.floor(Math.random() * 100);
        }
    });

    // Sometimes add new objects
    if (Math.random() > 0.5) {
        const newItems = Array.from({ length: Math.floor(Math.random() * 5) }, () => ({ id: nextId++, value: Math.floor(Math.random() * 100) }));
        allData = allData.concat(newItems);
    }

    // Update rows with new data
    updateRows(allData);
}, 3000);
