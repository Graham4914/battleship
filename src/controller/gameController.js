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
console.log('Initializing ships:', ships);

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
    
        // If cellIndex is -1, it means the target element isn't valid
        if (cellIndex === -1) return;
    
        // Clear previous highlights
        GridView.clearHighlights(gridElement);
    
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;
    
        // Make sure x and y are within bounds before proceeding
        if (x < 0 || x >= 10 || y < 0 || y >= 10) {
            return;  // Prevent further action if out of bounds
        }
    
        const currentShip = Ship(ships[currentShipIndex].name, ships[currentShipIndex].length);

    
        // Highlight cells for the current ship length if placement is valid
        if (playerBoard.canPlaceShip(x, y, currentShip.length, isHorizontal)) {
            GridView.highlightCells(gridElement, x, y, currentShip.length, isHorizontal);
        }
    };
    

    // Handle ship placement on click
    gridElement.addEventListener('click', function (e) {
        if (allShipsPlaced) return;  // Prevent placing ships after all are placed
    
        const cell = e.target;
        const cellIndex = Array.from(gridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;
        const currentShip = Ship(ships[currentShipIndex].name, ships[currentShipIndex].length);
        

        console.log(`Trying to place ${currentShip.name} at (${x}, ${y}) with orientation ${isHorizontal ? 'horizontal' : 'vertical'}`);
        console.log('Current Ship Details:', currentShip);


        // Check if the ship can be placed at the desired location
        const placed = playerBoard.placeShipSafely( x, y, currentShip, isHorizontal);
    
        if (placed) {
            console.log('Ship placed successfully:', currentShip);
            GridView.renderShip(gridElement, currentShip, x, y, isHorizontal);

            playerBoard.ships.push(currentShip);
            console.log(`Player's ship array:`, playerBoard.ships); 
            
    
            
            // Clear highlights and temporarily remove mouseover
            GridView.clearHighlights(gridElement);
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
    console.log(`Rotating ship. New orientation is ${isHorizontal ? 'Horizontal' : 'Vertical'}`);
    isHorizontal = !isHorizontal;
    statusMessageElement.innerHTML = `Placing ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces). Currently ${isHorizontal ? 'Horizontal' : 'Vertical'}`;
    GridView.clearHighlights(playerGridElement); 
}

const toggleAxisButton = document.getElementById('toggle-axis-btn');

toggleAxisButton.addEventListener('click', () => {
    rotateShip();  // Call the rotate function when the button is clicked
});



const toggleButton = document.getElementById('toggle-axis-btn');

// Start the battle phase after all ships are placed
function startBattlePhase() {
    // Hide the toggle axis button, slide the player grid to the left, and show the computer grid
    toggleButton.style.display = 'none';
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.add('slide-left', 'show-battle');
    computerGridElement.style.visibility = 'visible';

    // Update the status message
    GridView.updateStatus('Computer is placing ships...');

    // Place computer ships logically on the board
    computerBoard.placeShipsForComputer(computerGridElement);  // This will add ships to the board model, not the UI

    // Render the ships on the computer grid for testing purposes (remove later in the final game)
    computerBoard.ships.forEach(ship => {
        ship.positions.forEach(({ x, y }) => {
            GridView.renderShip(computerGridElement, ship, x, y, ship.isHorizontal);
        });
    });

    // Update the status to notify the player it's their turn to attack
    GridView.updateStatus('Attack the enemy ships!');
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
            GridView.updateStatus('You win! All enemy ships are sunk!');
            endGame('player');
        } else {
            setTimeout(() => {
                GridView.updateStatus("Computer's turn...");
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
        GridView.updateStatus(`Computer hit a ship at (${x}, ${y})!`);
    } else if (result === 'sunk') {
        GridView.updateStatus(`Computer sank a ship at (${x}, ${y})!`);
    } else if (result === 'miss') {
        GridView.updateStatus(`Computer missed at (${x}, ${y})!`);
    }

    // Process the result of the computer's attack
    handleAttackResult({ result }, x, y, 'computer');

    // Check if the player has lost all ships
    if (playerBoard.allShipsSunk()) {
        GridView.updateStatus('Computer wins! All your ships are sunk.');
        endGame('computer');
    } else {
        // Add a delay before handing control back to the player
        setTimeout(() => {
            GridView.updateStatus("Player's turn!");
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
        GridView.updateStatus('Congratulations! You win! All enemy ships are sunk.');
    } else if (winner === 'computer') {
        GridView.updateStatus('Game Over. The computer has sunk all your ships!');
    }

    disablePlayerActions(); // Disable clicking on grids once the game ends

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
    // Determine which grid and which cell to target
    const gridElement = (attacker === 'computer') ? playerGridElement : computerGridElement;
    const cell = gridElement.children[x * 10 + y]; 

    // Log the attack result
    console.log(`${attacker.charAt(0).toUpperCase() + attacker.slice(1)} attack result: ${attackResult.result} at (${x}, ${y})`);

    // Delay the visual update to synchronize with the game flow and provide better feedback
    setTimeout(() => {
        if (attackResult.result === 'hit') {
            cell.classList.add('hit');
            GridView.updateStatus(`${attacker === 'computer' ? 'Computer' : 'Player'} hit a ship at (${x}, ${y})!`);
        } else if (attackResult.result === 'sunk') {
            cell.classList.add('hit');
            GridView.updateStatus(`${attacker === 'computer' ? 'Computer' : 'Player'} sank a ship at (${x}, ${y})!`);
        } else if (attackResult.result === 'miss') {
            cell.classList.add('miss');
            GridView.updateStatus(`${attacker === 'computer' ? 'Computer' : 'Player'} missed at (${x}, ${y})!`);
        } else {
            console.error('Invalid attack result');
        }

        // If it's the computer's attack, check if all player's ships are sunk
        if (attacker === 'computer' && playerBoard.allShipsSunk()) {
            GridView.updateStatus('Computer wins! All your ships are sunk.');
            endGame('computer');
        } else if (attacker === 'player' && computerBoard.allShipsSunk()) {
            GridView.updateStatus('You win! All enemy ships are sunk!');
            endGame('player');
        }

    }, 200); // 200ms delay to ensure the feedback feels natural
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
    GridView.updateStatus('Place your ships to begin the game.');

    toggleAxisButton.style.display = 'block';

    handleShipPlacement(playerGridElement, playerBoard);
}

// Export startGame for the entry point
export default { startGame };
