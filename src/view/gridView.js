export const GridView = {
    createGrid,
    renderShip,
    updateCell,
    clearGrid,
    updateStatus,  // Make sure this function is included in the export
    highlightCells,
    clearHighlights
};

  // Create the grid visually on the DOM
 function createGrid(gridElement) {
    gridElement.innerHTML = ''; 

    // Create 100 cells for a 10x10 grid
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');  // Add a CSS class for styling
        gridElement.appendChild(cell);
    }
  }

// Render the ship visually on the grid
function renderShip(gridElement, ship, startX, startY, isHorizontal) {
    for (let i = 0; i < ship.length; i++) {
        const index = isHorizontal ? (startX * 10 + (startY + i)) : ((startX + i) * 10 + startY);
        const cell = gridElement.children[index];
        if (cell) {
            cell.classList.add('placed-ship');  // Add class for ship styling
        }
    }
}

function highlightCells(gridElement, x, y, length, isHorizontal) {
    for (let i = 0; i < length; i++) {
        const cellIndex = isHorizontal ? (x * 10 + y + i) : ((x + i) * 10 + y);
        const cell = gridElement.children[cellIndex];
        if (cell) {
            cell.classList.add('highlight');
        }
    }
}

function clearHighlights(gridElement) {
    Array.from(gridElement.children).forEach(cell => {
        cell.classList.remove('highlight');
    });
}

function updateStatus(message) {
    // Always select the element fresh to ensure it's not stale
    const statusMessageElement = document.querySelector('.status-message');
    if (!statusMessageElement) {
        console.error('Status message element not found.');
        return;
    }

    console.log('Status Update:', message);
    statusMessageElement.style.display = 'none';  // Force the element to repaint
    setTimeout(() => {
        statusMessageElement.textContent = message;
        statusMessageElement.style.display = 'block';  // Show the element again
    }, 1000);  // 1-second delay for smoother flow
}
// Update the cell after an attack (hit or miss)
function updateCell(cell, result) {
    if (result === 'hit') {
        cell.classList.add('hit');  // Add class for hit styling
    } else if (result === 'miss') {
        cell.classList.add('miss');  // Add class for miss styling
    }
}

// Clear the grid by removing all relevant classes
function clearGrid(gridElement) {
    Array.from(gridElement.children).forEach(cell => {
        cell.classList.remove('hit', 'miss', 'placed-ship');  // Remove the classes for reset
        cell.textContent = '';  // Optional: clear any text in the cells
    });
}