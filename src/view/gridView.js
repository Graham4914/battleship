export const GridView = {
    // Create the grid visually on the DOM
    createGrid(gridElement) {
        gridElement.innerHTML = ''; 

        // Create 100 cells for a 10x10 grid
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');  // Add a CSS class for styling
            gridElement.appendChild(cell);
        }
    },

    // Render the ship visually on the grid
    renderShip(gridElement, ship, startX, startY, isHorizontal) {
        for (let i = 0; i < ship.length; i++) {
            const index = isHorizontal ? (startX * 10 + (startY + i)) : ((startX + i) * 10 + startY);
            const cell = gridElement.children[index];
            if (cell) {
                cell.classList.add('placed-ship');  // Add class for ship styling
            }
        }
    },

    // Update the cell after an attack (hit or miss)
    updateCell(cell, result) {
        if (result === 'hit') {
            cell.classList.add('hit');  // Add class for hit styling
        } else if (result === 'miss') {
            cell.classList.add('miss');  // Add class for miss styling
        }
    },

    // Clear the grid by removing all relevant classes
    clearGrid(gridElement) {
        Array.from(gridElement.children).forEach(cell => {
            cell.classList.remove('hit', 'miss', 'placed-ship');  // Remove the classes for reset
            cell.textContent = '';  // Optional: clear any text in the cells
        });
    }
};
