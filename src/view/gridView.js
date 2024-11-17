import { Gameboard } from '../model/gameboard.js';

export const GridView = {
    createGrid,
    renderShip,
    updateCell,
    clearGrid,
    updateStatus,  
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
function renderShip(gridElement, ship, shipCells, startX, startY, isHorizontal, isPlayer) {
    if (!(shipCells instanceof Set)) {
        console.error('Error: shipCells is not a Set. Received:', shipCells);
        return; 
    }

    if (isPlayer) {
        for (let i = 0; i < ship.length; i++) {
            const coordX = startX + (isHorizontal ? 0 : i);
            const coordY = startY + (isHorizontal ? i : 0);
            const index = isHorizontal ? (startX * 10 + (startY + i)) : ((startX + i) * 10 + startY);
            const cell = gridElement.children[index];


            if (cell && shipCells.has(`${coordX},${coordY}`)) {
                cell.classList.add('placed-ship');  // Only add the class if it's a player's ship
                cell.dataset.shipName = ship.name;
            } else if (cell) {
                console.warn(`Cell index ${index} is either already occupied or not part of a valid ship, skipping render.`);
            } else {
                console.error(`Cell index ${index} is out of bounds or does not exist.`);
            }
        }
    }
}




function highlightCells(gridElement, x, y, length, isHorizontal) {
    for (let i = 0; i < length; i++) {
        const cellIndex = isHorizontal ? (x * 10 + y + i) : ((x + i) * 10 + y);
        const cell = gridElement.children[cellIndex];
        if (cell && !cell.classList.contains('placed-ship')) {  // Check if the cell is not already part of another ship
            cell.classList.add('highlight');
        } else if (cell) {
            console.warn(`Skipped highlighting cell index ${cellIndex} as it's already occupied by a ship.`);
        }
    }
}



function clearHighlights(gridElement) {
    Array.from(gridElement.children).forEach(cell => {
        cell.classList.remove('highlight');
    });
}

function updateStatus(message, delay = 0) {
    const statusMessageElement = document.querySelector('.status-message');
    if (!statusMessageElement) {
        console.error('Status message element not found.');
        return;
    }

    // If the delay is 0, update immediately
    if (delay === 0) {
        statusMessageElement.textContent = message;
        statusMessageElement.style.display = 'block'; // Ensure it's visible
    } else {
        // Use a timeout for delayed updates
        setTimeout(() => {
            statusMessageElement.textContent = message;
            statusMessageElement.style.display = 'block';
        }, delay);
    }
}


function updateCell(cell, result) {
    if (result === 'hit') {
        cell.classList.add('hit');  
    } else if (result === 'miss') {
        cell.classList.add('miss');  
    }
}


function clearGrid(gridElement) {
    if (!gridElement) {
        console.error('Grid element is undefined in clearGrid function.');
        return;
    }

    // Proceed if the gridElement is defined
    Array.from(gridElement.children).forEach(cell => {
        cell.classList.remove('hit', 'miss', 'placed-ship');
    });
}