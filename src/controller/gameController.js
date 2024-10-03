import { Gameboard } from "../model/gameboard.js";
import { GridView } from "../view/gridView.js";

// Initialize the gameboards for player and computer
const playerBoard = Gameboard();
const computerBoard = Gameboard();

// Initialize the view elements (grids and status message)
const playerGridElement = document.getElementById('player-grid');
const computerGridElement = document.getElementById('computer-grid');
const statusMessageElement = document.querySelector('.status-message');

// Initialize grids
GridView.createGrid(playerGridElement, playerBoard.board);
GridView.createGrid(computerGridElement, computerBoard.board);

let allShipsPlaced = false;  // Flag to track if all ships have been placed
let currentShipIndex = 0;
const ships = [
    { name: 'Destroyer', length: 2 },
    { name: 'Submarine', length: 3 },
    { name: 'Cruiser', length: 3 },
    { name: 'Battleship', length: 4 },
    { name: 'Carrier', length: 5 }
];
let isHorizontal = true;  // Default ship placement orientation

// Handle ship placement logic
function handleShipPlacement(gridElement, playerBoard) {
    if (currentShipIndex >= ships.length) {
        return;  // All ships are placed, prevent any further action
    }

    statusMessageElement.innerHTML = `Place your ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces)`;

    // Mouseover for cell highlighting
    gridElement.addEventListener('mouseover', (e) => {
        if (allShipsPlaced) return;  // Prevent further highlights after all ships are placed

        const cell = e.target;
        const cellIndex = Array.from(gridElement.children).indexOf(cell);

        // Clear previous highlights
        clearHighlights(gridElement);

        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;
        const currentShip = ships[currentShipIndex];  // Ensure valid current ship

        // Highlight cells for the current ship length if placement is valid
        if (canPlaceShip(playerBoard.board, x, y, currentShip.length, isHorizontal)) {
            highlightCells(gridElement, x, y, currentShip.length, isHorizontal);
        }
    });

    // Handle ship placement on click
gridElement.addEventListener('click', (e) => {
    if (allShipsPlaced) return;  // Prevent placing ships after all are placed

    const cell = e.target;
    const cellIndex = Array.from(gridElement.children).indexOf(cell);
    const x = Math.floor(cellIndex / 10);
    const y = cellIndex % 10;
    const currentShip = ships[currentShipIndex];

    // Try to place the ship
    try {
        const placed = playerBoard.placeShip({ length: currentShip.length }, x, y, isHorizontal ? 'horizontal' : 'vertical');
        if (placed) {
            // Render the ship permanently after placing it
            GridView.renderShip(gridElement, currentShip, x, y, isHorizontal);

            // Move to the next ship
            currentShipIndex++;
            if (currentShipIndex >= ships.length) {
                allShipsPlaced = true;
                statusMessageElement.textContent = 'All ships placed. Battle begins!';
                startBattlePhase();  // Start the battle once all ships are placed
            } else {
                statusMessageElement.textContent = `Place your ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces)`;
            }
        } else {
            console.log('Invalid placement');
        }
    } catch (error) {
        console.error(error.message);
    }
});

    // Rotate the ship when 'r' is pressed
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r') {
            rotateShip();
        }
    });
}


// Rotate the current ship's orientation
function rotateShip() {
    isHorizontal = !isHorizontal;
    statusMessageElement.innerHTML = `Placing ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces). Currently ${isHorizontal ? 'Horizontal' : 'Vertical'}`;
    clearHighlights(playerGridElement); 
}

const toggleAxisButton = document.getElementById('toggle-axis-btn');

toggleAxisButton.addEventListener('click', () => {
    rotateShip();  // Call the rotate function when the button is clicked
});

// Helper function to check if a ship can be placed
function canPlaceShip(board, x, y, length, isHorizontal) {
    if (isHorizontal) {
        if (y + length > 10 || y < 0) return false;  // Horizontal bounds check
        for (let i = 0; i < length; i++) {
            if (board[x][y + i] !== null) return false;  // Ensure cells are empty
        }
    } else {
        if (x + length > 10 || x < 0) return false;  // Vertical bounds check
        for (let i = 0; i < length; i++) {
            if (board[x + i][y] !== null) return false;  // Ensure cells are empty
        }
    }
    return true;
}

// Helper function to highlight cells for ship placement
function highlightCells(gridElement, x, y, length, isHorizontal) {
    for (let i = 0; i < length; i++) {
        const cellIndex = isHorizontal ? (x * 10 + y + i) : ((x + i) * 10 + y);
        const cell = gridElement.children[cellIndex];
        if (cell) {
            cell.classList.add('highlight');  // Add visual highlight class
        }
    }
}

// Helper function to clear all cell highlights
function clearHighlights(gridElement) {
    Array.from(gridElement.children).forEach(cell => {
        cell.classList.remove('highlight');
    });
}

// Randomly place ships for the computer
function placeComputerShips() {
    const computerShips = [
        { name: 'Destroyer', length: 2 },
        { name: 'Submarine', length: 3 },
        { name: 'Cruiser', length: 3 },
        { name: 'Battleship', length: 4 },
        { name: 'Carrier', length: 5 }
    ];

    computerShips.forEach(ship => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const isHorizontal = Math.random() < 0.5;
            placed = computerBoard.placeShip({ length: ship.length }, x, y, isHorizontal ? 'horizontal' : 'vertical');
        }
    });
    console.log("Computer ships placed.");
}

const toggleButton = document.getElementById('toggle-axis-btn');

// Start the battle phase after all ships are placed
function startBattlePhase() {
    toggleButton.style.display = 'none';
    // Add classes to trigger transition effects
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.add('slide-left');
    gridContainer.classList.add('show-battle');  // Show the computer grid
    
    statusMessageElement.textContent = 'Attack the enemy ships!';

    // Call the function to place the computer's ships randomly
    placeComputerShips();

    // Add event listeners for player attacks
    addPlayerAttackListener();
}
// Handle player attacks on the computer's grid
function addPlayerAttackListener() {
    computerGridElement.addEventListener('click', (e) => {
        const cell = e.target;
        const cellIndex = Array.from(computerGridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;

        // Handle attack logic (e.g., hit or miss) on the computer's board
        const attackResult = computerBoard.receiveAttack([x, y]);
        GridView.updateCell(cell, attackResult);  // Update cell color based on result (hit/miss)

        // Check if the player has won
        if (computerBoard.allShipsSunk()) {
            statusMessageElement.textContent = 'You win! All enemy ships are sunk!';
        } else {
            computerAttack();  // Trigger computer's turn to attack
        }
    });
}


// In your gameController.js or similar entry point
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const startGameBtn = document.getElementById('start-game-btn');

// Event listener to start the game
startGameBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';  // Hide the start screen
    gameContainer.style.display = 'block';  // Show the main game
    startGame();  // Proceed to ship placement phase
});

// function for computer's attack logic
function computerAttack() {
    let attackSuccessful = false;

    while (!attackSuccessful) {
        // Randomly select coordinates to attack
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);

        // Check if the cell has already been attacked
        if (playerBoard.board[x][y] === null || typeof playerBoard.board[x][y] === 'object') {
            const attackResult = playerBoard.receiveAttack([x, y]);
            const playerCell = playerGridElement.children[x * 10 + y]; // Access the corresponding grid cell

            GridView.updateCell(playerCell, attackResult);  // Update the player's grid based on the attack result

            // Check if all player's ships are sunk
            if (playerBoard.allShipsSunk()) {
                statusMessageElement.textContent = 'Computer wins! All your ships are sunk!';
            } else {
                statusMessageElement.textContent = 'Computer attacked!';
            }
            attackSuccessful = true;  // Exit the loop after a successful attack
        }
    }
    console.log('Computer attacks!');
}




// Start the ship placement phase
function startGame() {
    handleShipPlacement(playerGridElement, playerBoard);
}

// Export startGame for the entry point
export default { startGame };

