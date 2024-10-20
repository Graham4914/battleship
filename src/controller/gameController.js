import { Gameboard } from "../model/gameboard.js";
import { GridView } from "../view/gridView.js";
import { Player } from "../model/player.js";  // Import Player model
import { Ship } from "../model/ship.js";

// Initialize the gameboards for player and computer
const playerBoard = Gameboard();
const computerBoard = Gameboard();

// Initialize players
const player = Player();
const computer = Player(true);  // Computer player

// Initialize the view elements (grids and status message)
const playerGridElement = document.getElementById('player-grid');
const computerGridElement = document.getElementById('computer-grid');
const statusMessageElement = document.querySelector('.status-message');

// Initialize grids
GridView.createGrid(playerGridElement, playerBoard.board);
GridView.createGrid(computerGridElement, computerBoard.board);

let currentShipIndex = 0;  // Track the current ship being placed
let allShipsPlaced = false;  // Flag to check if all ships are placed
// Define ships for the game (fixed array with ship names and lengths)
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




// // Function to update status messages
// function updateStatus(message) {
//     console.log('Status Update:', message);
//     setTimeout(() => {
//         statusMessageElement.textContent = message;
//     }, 1000);  // 1-second delay for smoother flow
// }
function updateStatus(message) {
    console.log('Status Update:', message);
    statusMessageElement.style.display = 'none';  // Force the element to repaint
    setTimeout(() => {
        statusMessageElement.textContent = message;
        statusMessageElement.style.display = 'block';  // Show the element again
    }, 1000);  // 1-second delay for smoother flow
}



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
    return true;  // Ship can be placed
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





// Handle player ship placement logic

// Function to place ships for the computer
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
            const isHorizontal = Math.random() < 0.5;
            const x = Math.floor(Math.random() * (isHorizontal ? 10 : (10 - ship.length)));
            const y = Math.floor(Math.random() * (isHorizontal ? (10 - ship.length) : 10));

            placed = computerBoard.placeShipSafely(x, y, ship, isHorizontal);

            if (placed) {
                GridView.renderShip(computerGridElement, ship, x, y, isHorizontal);
                computerBoard.ships.push(ship);  // Add to the computer's ship array
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
    // Add class to hide the ship placement controls and show the battle phase
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.add('slide-left');  // Slide the player grid to the left
    gridContainer.classList.add('show-battle');  // Ensure computer grid is visible
    
    // Show the computer grid (this element should now be visible with the animation)
    computerGridElement.style.visibility = 'visible';

    updateStatus('Computer is placing ships...');
    placeComputerShips();  // Place computer ships

    // Start player attack phase
    updateStatus('Attack the enemy ships!');
    addPlayerAttackListener();
}


// Handle player attacks
function addPlayerAttackListener() {
    computerGridElement.addEventListener('click', (e) => {
        const cell = e.target;
        const cellIndex = Array.from(computerGridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;

        if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

        const attackResult = player.attack(computerBoard, [x, y]);  // Player attacks the computer
        handleAttackResult(attackResult, x, y, 'player');

        if (computerBoard.allShipsSunk()) {
            updateStatus('You win! All enemy ships are sunk!');
            endGame('player');
        } else {
            setTimeout(() => {
                updateStatus("Computer's turn...");
                handleComputerAttack();
            }, 1500);
        }
    });
}

// Handle computer attacks
function handleComputerAttack() {
    const { coords, result } = computer.computerAttack(playerBoard);
    const [x, y] = coords;
    console.log('Computer attacking at:', x, y, 'Result:', result);

    // Update status based on the result of the computer's attack
    if (result === 'hit') {
        updateStatus(`Computer hit a ship at (${x}, ${y})!`);
    } else if (result === 'sunk') {
        updateStatus(`Computer sank a ship at (${x}, ${y})!`);
    } else if (result === 'miss') {
        updateStatus(`Computer missed at (${x}, ${y})!`);
    }

    // Process the result of the computer's attack
    handleAttackResult({ result }, x, y, 'computer');

    // Check if the player has lost all ships
    if (playerBoard.allShipsSunk()) {
        updateStatus('Computer wins! All your ships are sunk.');
        endGame('computer');
    } else {
        // Add a delay before handing control back to the player
        setTimeout(() => {
            updateStatus("Player's turn!");
        }, 1500); // Delay to ensure the computer's attack result is visible
    }
}



function enablePlayerActions() {
    computerGridElement.style.pointerEvents = 'auto';  // Re-enable clicking on the grid
    playerGridElement.style.pointerEvents = 'auto';  // Re-enable clicking on the player's grid as well (if needed)
}




// End the game
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

// Event listener to start the game
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const startGameBtn = document.getElementById('start-game-btn');

startGameBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';  // Hide the start screen
    gameContainer.style.display = 'block';  // Show the main game
    startGame();  // Proceed to ship placement phase
});

// Handle the result of attacks
function handleAttackResult(attackResult, x, y, attacker = 'computer') {
    if (attacker === 'computer') {
        console.log(`Computer attack result: ${attackResult.result} at (${x}, ${y})`);
    } else {
        console.log(`Player attack result: ${attackResult.result} at (${x}, ${y})`);
    }

    const gridElement = (attacker === 'computer') ? playerGridElement : computerGridElement;
    const cell = gridElement.children[x * 10 + y]; // Target the correct grid (player or computer)
    console.log(gridElement, x, y); 

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




// Restart game functionality
function startGame() {
    playerBoard.reset();
    computerBoard.reset();

    GridView.clearGrid(playerGridElement);
    GridView.clearGrid(computerGridElement);

    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.remove('slide-left', 'show-battle');

    computerGridElement.style.visibility = 'hidden';
    playerGridElement.style.visibility = 'visible';

    enablePlayerActions();

    currentShipIndex = 0;
    allShipsPlaced = false;
    updateStatus('Place your ships to begin the game.');

    toggleAxisButton.style.display = 'block';

    handleShipPlacement(playerGridElement, playerBoard);
}

// Export startGame for the entry point
export default { startGame };
