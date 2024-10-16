import { Gameboard } from "../model/gameboard.js";
import { GridView } from "../view/gridView.js";
import { Ship } from "../model/ship.js";

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

function updateStatus(message) {
    console.log('Status Update:', message);
    setTimeout(() => {
        statusMessageElement.textContent = message;
    }, 1000);  // 1-second delay for smoother flow
}

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
     const mouseoverHandler = (e) => {
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
    };

    // Handle ship placement on click
    gridElement.addEventListener('click', function (e) {
        if (allShipsPlaced) return;  // Prevent placing ships after all are placed
    
        const cell = e.target;
        const cellIndex = Array.from(gridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;
        const currentShip = new Ship(ships[currentShipIndex].length);  // Create a new Ship object for each ship placement
    
        console.log(`Trying to place ${currentShip.name} at (${x}, ${y}) with orientation ${isHorizontal ? 'horizontal' : 'vertical'}`);
    
        // Check if the ship can be placed at the desired location
        const placed = playerBoard.placeShipSafely( x, y, currentShip, isHorizontal);
    
        if (placed) {
            console.log('Ship placed successfully');
            GridView.renderShip(gridElement, currentShip, x, y, isHorizontal);

            playerBoard.ships.push(currentShip);
            console.log(`Player's ship array:`, playerBoard.ships); 
    
            
            // Clear highlights and temporarily remove mouseover
            clearHighlights(gridElement);
            gridElement.removeEventListener('mouseover', mouseoverHandler);
    
            // Move to the next ship or start battle phase
            currentShipIndex++;
            if (currentShipIndex >= ships.length) {
                allShipsPlaced = true;
                statusMessageElement.textContent = 'All ships placed. Battle begins!';
                startBattlePhase();
            } else {
                statusMessageElement.textContent = `Place your ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces)`;
            }
    
            // Add mousemove event to reactivate hover behavior only when the mouse moves
            gridElement.addEventListener('mousemove', () => {
                gridElement.addEventListener('mouseover', mouseoverHandler);
            }, { once: true });
        } else {
            console.log('Failed to place ship due to overlap or invalid position');
        }
    });
    
        // Initialize hover handler
        gridElement.addEventListener('mouseover', mouseoverHandler);
    

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
    // Horizontal placement check
    if (isHorizontal) {
        if (y + length > 10 || y < 0) {
            console.log(`Ship exceeds horizontal bounds at (${x}, ${y})`);
            return false;
        }
        for (let i = 0; i < length; i++) {
            if (board[x][y + i] !== null) {
                console.log(`Cell (${x}, ${y + i}) is already occupied`);
                return false;
            }
        }
    } else {  // Vertical placement check
        if (x + length > 10 || x < 0) {
            console.log(`Ship exceeds vertical bounds at (${x}, ${y})`);
            return false;
        }
        for (let i = 0; i < length; i++) {
            if (board[x + i][y] !== null) {
                console.log(`Cell (${x + i}, ${y}) is already occupied`);
                return false;
            }
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
        { name: 'Destroyer', length: 2, ship: new Ship(2) },
        { name: 'Submarine', length: 3, ship: new Ship(3) },
        { name: 'Cruiser', length: 3, ship: new Ship(3) },
        { name: 'Battleship', length: 4, ship: new Ship(4) },
        { name: 'Carrier', length: 5, ship: new Ship(5) }
    ];

    computerShips.forEach(({ name, ship }) => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            let x, y;
            const isHorizontal = Math.random() < 0.5;

            // Adjust starting positions to ensure ships don't go out of bounds
            if (isHorizontal) {
                x = Math.floor(Math.random() * 10);  // Random x coordinate
                y = Math.floor(Math.random() * (10 - ship.length));  // Adjust y so ship fits horizontally
            } else {
                x = Math.floor(Math.random() * (10 - ship.length));  // Adjust x so ship fits vertically
                y = Math.floor(Math.random() * 10);  // Random y coordinate
            }

            console.log(`Trying to place ${name} at (${x}, ${y}) with orientation ${isHorizontal ? 'horizontal' : 'vertical'}`);

            // Use the placeShip function from the Gameboard to ensure it's added to the ships array
            placed = computerBoard.placeShipSafely( x, y, ship, isHorizontal);

            if (placed) {
                console.log(`${name} placed successfully.`);
                computerBoard.ships.push(ship); 
                console.log(`Current computer ships array:`, computerBoard.ships);

                GridView.renderShip(computerGridElement, ship, x, y, isHorizontal);// Render ship on grid
             
            } else {
                console.log(`Failed to place ${name}. Retrying...`);
            }

            attempts++;
        }

        if (!placed) {
            console.error(`Failed to place ${name} after ${attempts} attempts.`);
        }
    });
}


const toggleButton = document.getElementById('toggle-axis-btn');

// Start the battle phase after all ships are placed
function startBattlePhase() {
    toggleButton.style.display = 'none';
    computerGridElement.style.visibility = 'visible'; 
    // Add classes to trigger transition effects
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.add('slide-left');
    gridContainer.classList.add('show-battle');  // Show the computer grid
    

    updateStatus('Computer is placing ships...');
    placeComputerShips();

    // Add event listeners for player attacks
    updateStatus('Attack the enemy ships!');
    addPlayerAttackListener();
}


// Handle player attacks on the computer's grid
function addPlayerAttackListener() {
    computerGridElement.addEventListener('click', (e) => {
        const cell = e.target;
        const cellIndex = Array.from(computerGridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;

        // Prevent attacking the same cell twice
        if (cell.classList.contains('hit') || cell.classList.contains('miss')) {
            return;  // Already attacked
        }

        // Handle the attack on the computer board and get the result
        const attackResult = computerBoard.receiveAttack([x, y]);

        // Now process the result using a refined handleAttackResult for player attacks
        handleAttackResult(attackResult, x, y, 'player'); // Call with 'player' context

        // Check if the player has won after the attack
        if (computerBoard.allShipsSunk()) {
            updateStatus('You win! All enemy ships are sunk!');
            endGame('player');
        } else {
            // After the player's turn, switch to computer's turn with a short delay
            setTimeout(() => {
                updateStatus("Computer's turn...");
                computerAttack(); // Let the computer take its turn
            }, 1500);  // Delay before the computer's turn
        }
    });
}


function endGame(winner) {
    if (winner === 'player') {
        updateStatus('Congratulations! You win! All enemy ships are sunk.');
    } else if (winner === 'computer') {
        updateStatus('Game Over. The computer has sunk all your ships!');
    }

    // Show the restart button
    const restartButton = document.getElementById('restart-btn');
    restartButton.style.display = 'block';  // Make the button visible
}

// Ensure that the restart button only has a single event listener attached
const restartButton = document.getElementById('restart-btn');
restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';  // Hide the button again
    startGame();  // Simply restart the game by calling startGame
});



function disablePlayerActions() {
    computerGridElement.style.pointerEvents = 'none';  // Disable clicking on the grid
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
let lastHit = null;  // Store the last hit position
let potentialTargets = [];  // List of adjacent cells to check

function computerAttack() {
    let attackSuccessful = false;

    if (potentialTargets.length > 0) {
        // Prioritize hitting adjacent cells if there was a previous hit
        const nextTarget = potentialTargets.pop();
        const [x, y] = nextTarget;
        
        // Call receiveAttack from Gameboard.js and get the result
        const attackResult = playerBoard.receiveAttack([x, y]);  // Pass coordinates as an array

        // Check if the attack result is valid (hit, miss, or sunk) and handle it
        if (attackResult.result === 'hit' || attackResult.result === 'miss' || attackResult.result === 'sunk') {
            // Call handleAttackResult to update the UI
            handleAttackResult(attackResult, x, y, 'computer');  
            attackSuccessful = true;
        }
    }

    // If no adjacent targets, randomly select a cell to attack
    while (!attackSuccessful) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);

        // Call receiveAttack from Gameboard.js and get the result
        const attackResult = playerBoard.receiveAttack([x, y]);  // Pass coordinates as an array
        console.log(attackResult);

        // Check if the attack result is valid and handle it, while also skipping already attacked cells
        if (attackResult.result === 'hit' || attackResult.result === 'miss' || attackResult.result === 'sunk') {
            // Call handleAttackResult to update the UI
            handleAttackResult(attackResult, x, y, 'computer');  
            attackSuccessful = true;
        }
        // Skip if the result is 'already_attacked' and try again in the next loop iteration
    }

    // After the computer's turn, switch back to the player
    setTimeout(() => {
        updateStatus("Player's turn!");
    }, 1500);
}


function handleAttackResult(attackResult, x, y, attacker = 'computer') {
    if (attacker === 'computer') {
        console.log(`Computer attack result: ${attackResult.result} at (${x}, ${y})`);
    } else {
        console.log(`Player attack result: ${attackResult.result} at (${x}, ${y})`);
    }

    const gridElement = (attacker === 'computer') ? playerGridElement : computerGridElement;
    const cell = gridElement.children[x * 10 + y]; // Target the correct grid (player or computer)

    // Process the result of the attack (hit/miss/sunk)
    if (attackResult.result === 'hit') {
        cell.classList.add('hit');
        updateStatus(`${attacker === 'computer' ? 'Computer' : 'Player'} hit a ship!`);
    } else if (attackResult.result === 'sunk') {
        cell.classList.add('hit');
        updateStatus(`${attacker === 'computer' ? 'Computer' : 'Player'} sank a ship!`);
    } else if (attackResult.result === 'miss') {
        cell.classList.add('miss');
        updateStatus(`${attacker === 'computer' ? 'Computer' : 'Player'} missed.`);
    } else {
        console.error('Invalid attack result');
    }

    // If it's the computer's attack, check if the player lost all ships
    if (attacker === 'computer' && playerBoard.allShipsSunk()) {
        updateStatus('Computer wins! All your ships are sunk.');
        endGame('computer');
    }
}


// Helper function to add adjacent cells to potential targets
function addAdjacentCellsToTargets(x, y) {
    const directions = [
        [x - 1, y], // up
        [x + 1, y], // down
        [x, y - 1], // left
        [x, y + 1]  // right
    ];

    directions.forEach(([newX, newY]) => {
        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {  // Ensure it's within bounds
            potentialTargets.push([newX, newY]);
        }
    });
}








function startGame() {
    // Reset the game state
    playerBoard.reset();  // Clear the player's board and state
    computerBoard.reset();  // Clear the computer's board and state

    // Clear the grids visually
    GridView.clearGrid(playerGridElement);
    GridView.clearGrid(computerGridElement);

    // Reset grid container to remove battle phase transitions
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.remove('slide-left', 'show-battle');  // Remove transition classes
    

    // Hide the computer grid and show only the player grid initially
    // computerGridElement.style.visibility = 'hidden';  // Hide the computer grid
    playerGridElement.style.visibility = 'visible';  // Show the player grid

    // Reset the status message and the ship index
    currentShipIndex = 0;
    allShipsPlaced = false;
    updateStatus('Place your ships to begin the game.');

      // Show the ship placement toggle button again
      toggleAxisButton.style.display = 'block';

    // Start the ship placement process again
    handleShipPlacement(playerGridElement, playerBoard);
}


// Export startGame for the entry point
export default { startGame };

