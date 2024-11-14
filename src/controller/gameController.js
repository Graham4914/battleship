
import { Gameboard } from "../model/gameboard.js";
import { GridView } from "../view/gridView.js";
import { Player } from "../model/player.js";  // Import Player model
import { Ship } from "../model/ship.js";


let playerGridElement, computerGridElement, statusMessageElement,toggleAxisButton;
let playerAttackHandler = null;
let playerName = 'Player';

// Declare event handler variables
let mouseoverHandler;
let clickHandler;
let rotateShipHandler;

let computerAttackTimeout = null;


// Initialize the gameboards for player and computer
const playerBoard = Gameboard();
const computerBoard = Gameboard();
console.log('Initialized computerBoard shipCells:', computerBoard.shipCells instanceof Set ? 'Valid Set' : 'Not a Set', computerBoard.shipCells);

// Initialize players
const player = Player();
const computer = Player(true);  // Computer player

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the view elements (grids and status message)
    playerGridElement = document.getElementById('player-grid');
    computerGridElement = document.getElementById('computer-grid');
    statusMessageElement = document.querySelector('.status-message');
    toggleAxisButton = document.getElementById('toggle-axis-btn');
    toggleAxisButton.addEventListener('click', rotateShip);

    // Initialize grids
    GridView.createGrid(playerGridElement, playerBoard.board);
    GridView.createGrid(computerGridElement, computerBoard.board);

    // Set up event listeners
    handleShipPlacement(playerGridElement, playerBoard);
   

    // Start game setup
    const startGameBtn = document.getElementById('start-game-btn');
    startGameBtn.addEventListener('click', () => {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        startGame();  // Proceed to ship placement phase
    });
});

// Getter functions for accessing DOM elements
export function getPlayerGridElement() {
    return playerGridElement;
}

export function getComputerGridElement() {
    return computerGridElement;
}







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
  

    // Define the mouseover handler
    mouseoverHandler = function (e) {
        if (allShipsPlaced) return;
        const cell = e.target;
        const cellIndex = Array.from(gridElement.children).indexOf(cell);
        if (cellIndex === -1) return;
        GridView.clearHighlights(gridElement);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;
        if (x < 0 || x >= 10 || y < 0 || y >= 10) {
            return;
        }
        const currentShip = Ship(ships[currentShipIndex].name, ships[currentShipIndex].length);
        if (playerBoard.placeShipSafely(x, y, currentShip.length, isHorizontal)) {
            GridView.highlightCells(gridElement, x, y, currentShip.length, isHorizontal);
        }
    };

    // Define the click handler
    clickHandler = function (e) {
        if (allShipsPlaced) return;
        GridView.clearHighlights(gridElement);
        const cell = e.target;
        const cellIndex = Array.from(gridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;
        const currentShip = Ship(ships[currentShipIndex].name, ships[currentShipIndex].length);
        console.log(`Attempting to place ship: ${currentShip.name} (Length: ${currentShip.length}) at (${x}, ${y}) with orientation ${isHorizontal ? 'horizontal' : 'vertical'}`);
        const placed = playerBoard.placeShipSafely(x, y, currentShip, isHorizontal);
        if (placed) {
            console.log('Ship placed successfully:', currentShip);
            console.log('Ship positions before render:', currentShip.positions);
            const playerShipCells = playerBoard.shipCells; // Get the player ship cells
            GridView.renderShip(gridElement, currentShip, playerShipCells, x, y, isHorizontal, true);
            playerBoard.ships.push(currentShip);
            currentShipIndex++;
            if (currentShipIndex >= ships.length) {
                allShipsPlaced = true;
                statusMessageElement.textContent = 'All ships placed. Battle begins!';
                startBattlePhase();
            } else {
                statusMessageElement.textContent = `Place your ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces)`;
            }
            // Remove and re-add mouseover handler
            gridElement.removeEventListener('mouseover', mouseoverHandler);
            gridElement.addEventListener('mousemove', () => {
                gridElement.addEventListener('mouseover', mouseoverHandler);
            }, { once: true });
        } else {
            console.log('Failed to place ship due to overlap or invalid position');
        }
    };

    // Define the rotate ship handler
    rotateShipHandler = function (e) {
        if (e.key === 'r') {
            rotateShip();
        }
    };

    // Add event listeners
    gridElement.addEventListener('click', clickHandler);
    gridElement.addEventListener('mouseover', mouseoverHandler);
    document.addEventListener('keydown', rotateShipHandler);
}


// Rotate the current ship's orientation
function rotateShip() {
    console.log(`Rotating ship. New orientation is ${isHorizontal ? 'Horizontal' : 'Vertical'}`);
    isHorizontal = !isHorizontal;
    statusMessageElement.innerHTML = `Placing ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces). Currently ${isHorizontal ? 'Horizontal' : 'Vertical'}`;
    GridView.clearHighlights(playerGridElement); 
}





const toggleButton = document.getElementById('toggle-axis-btn');

// Start the battle phase after all ships are placed
function startBattlePhase() {
    // Hide the toggle axis button, slide the player grid to the left, and show the computer grid
    toggleButton.style.display = 'none';
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.add('slide-left', 'show-battle');
    computerGridElement.style.visibility = 'visible';
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.add('game-started');


    // Update the status message
    GridView.updateStatus('Computer is placing ships...');
    GridView.clearHighlights(computerGridElement);

    // Place computer ships logically on the board
    computerBoard.placeShipsForComputer();  // Use the method from the Gameboard object

    console.log('Rendering computer ships, shipCells:', computerBoard.shipCells instanceof Set ? 'Valid Set' : 'Not a Set', computerBoard.shipCells);
    // Render the ships on the computer grid for testing purposes (remove later in the final game)

 // Correct way to access shipCells using the getter from computerBoard instance
const computerShipCells = computerBoard.shipCells; 
console.log('Assigned computerShipCells from computerBoard:', computerShipCells instanceof Set ? 'Valid Set' : 'Not a Set', computerShipCells);
const playerShipCells = playerBoard.shipCells; 
// When rendering the ships, pass computerShipCells to renderShip function
computerBoard.ships.forEach(ship => {
    console.log('Rendering ship:', ship);
    console.log('Ship positions:', ship.positions); // Log ship positions

    ship.positions.forEach(({ x, y }) => {
        console.log('Before calling renderShip:', computerShipCells instanceof Set ? 'Valid Set' : 'Not a Set', computerShipCells);
        GridView.renderShip(computerGridElement, ship, computerShipCells, x, y, ship.isHorizontal, false);
    });
});
    // Update the status to notify the player it's their turn to attack
    GridView.updateStatus('Attack the enemy ships!', 2000);
    addPlayerAttackListener();
}



// Handle player attacks
function addPlayerAttackListener() {
    // Remove existing event listener if it exists
    if (playerAttackHandler) {
        computerGridElement.removeEventListener('click', playerAttackHandler);
    }

    // Define the event handler function
    playerAttackHandler = function (e) {
        const cell = e.target;
      

        if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

        if (cell.classList.contains('clicked')) return;

        // // Add 'clicked' class to remove hover effect and show instant feedback
        // cell.classList.add('clicked');
        // cell.style.pointerEvents = 'none'; // Prevent further interactions with the cell
        // cell.offsetHeight; // Trigger reflow to immediately apply the class change


        const cellIndex = Array.from(computerGridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;



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
    };

    // Add the event listener
    computerGridElement.addEventListener('click', playerAttackHandler);
}


// Handle computer attacks
function handleComputerAttack() {
    const attackResult = computer.computerAttack(playerBoard);
    const { coords, result, ship } = attackResult;
    const [x, y] = coords;
    console.log('Computer attacking at:', x, y, 'Result:', result);
    console.log('Computer attack result:', attackResult); 

   
    // Process the result of the computer's attack
    handleAttackResult(attackResult, x, y, 'computer')

    // Check if the player has lost all ships
    if (playerBoard.allShipsSunk()) {
        GridView.updateStatus('Computer wins! All your ships are sunk.');
        endGame('computer');
    } else {
        // Add a delay before handing control back to the player
        computerAttackTimeout = setTimeout(() => {
            GridView.updateStatus(`${playerName}'s turn!`);
        }, 2000); // Delay to ensure the computer's attack result is visible
    }
}



function enablePlayerActions() {
    computerGridElement.style.pointerEvents = 'auto';  // Re-enable clicking on the grid
    playerGridElement.style.pointerEvents = 'auto';  // Re-enable clicking on the player's grid as well (if needed)
}




// End the game
function endGame(winner) {
    if (winner === 'player') {
        GridView.updateStatus(`Congratulations ${playerName}! You win! All enemy ships are sunk.`);
    } else if (winner === 'computer') {
        GridView.updateStatus('Game Over. The computer has sunk all your ships!');
    }

    disablePlayerActions(); // Disable clicking on grids once the game ends

        // Remove attack event listener
        if (playerAttackHandler) {
            computerGridElement.removeEventListener('click', playerAttackHandler);
            playerAttackHandler = null;
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
const playerNameInput = document.getElementById('player-name-input');

startGameBtn.addEventListener('click', () => {
    // Get the player's name from the input field
    const inputName = playerNameInput.value.trim();
    if (inputName !== '') {
        playerName = inputName;
    } else {
        playerName = 'Player'; // Default name
    }

    startScreen.style.display = 'none'; // Hide the start screen
    gameContainer.style.display = 'block'; // Show the main game
    startGame(); // Proceed to ship placement phase
});

// Handle the result of attacks 
function handleAttackResult(attackResult, x, y, attacker = 'computer') {
    const { result, ship } = attackResult;

    if (result === 'already_attacked') {  // Change this line
        console.warn("Attempted attack on already attacked cell.");
        return;
    }
    // Determine which grid and which cell to target
    const gridElement = (attacker === 'computer') ? playerGridElement : computerGridElement;
    const cell = gridElement.children[x * 10 + y]; 

    // Log the attack result
    console.log(`${attacker.charAt(0).toUpperCase() + attacker.slice(1)} attack result: ${attackResult.result} at (${x}, ${y})`);

    // Delay the visual update to synchronize with the game flow and provide better feedback
    setTimeout(() => {
        if (result === 'hit') {
            cell.classList.add('hit');
            GridView.updateStatus(`${attacker === 'computer' ? 'Computer' : playerName} hit a ship!`,900);
        } else if (result === 'sunk') {
            cell.classList.add('hit');
            console.log('Ship object in handleAttackResult:', ship); // Check the ship object
            const shipName = ship ? ship.name : 'a ship';
            GridView.updateStatus(`${attacker === 'computer' ? `Computer sank your ${shipName}!` : `${playerName} sank the enemy's ${shipName}!`}`);
        } else if (result === 'miss') {
            cell.classList.add('miss');
            GridView.updateStatus(`${attacker === 'computer' ? 'Computer' : playerName} missed!`,900);
        } else {
            console.error('Invalid attack result');
        }

    }, 200); // 200ms delay to ensure the feedback feels natural
}


function removeShipPlacementEventListeners() {
    if (clickHandler) {
        playerGridElement.removeEventListener('click', clickHandler);
        clickHandler = null;
    }
    if (mouseoverHandler) {
        playerGridElement.removeEventListener('mouseover', mouseoverHandler);
        mouseoverHandler = null;
    }
    if (rotateShipHandler) {
        document.removeEventListener('keydown', rotateShipHandler);
        rotateShipHandler = null;
    }
}


// Restart game functionality
function startGame() {
        // Clear existing timeouts
        if (computerAttackTimeout) {
            clearTimeout(computerAttackTimeout);
            computerAttackTimeout = null;
        }
    // Remove existing event listeners before starting the game
    removeShipPlacementEventListeners();
    if (playerAttackHandler) {
        computerGridElement.removeEventListener('click', playerAttackHandler);
        playerAttackHandler = null;
    }

    // Re-initialize grid elements
    playerGridElement = getPlayerGridElement();
    computerGridElement = getComputerGridElement();

    if (!playerGridElement || !computerGridElement) {
        console.error('Grid elements are not initialized properly. Aborting startGame.');
        return;
    }

    // Reset game boards
    playerBoard.reset();
    computerBoard.reset();

    // Reset player
    computer.reset();
    // Clear grids
    GridView.clearGrid(playerGridElement);
    GridView.clearGrid(computerGridElement);

    // Reset UI
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.remove('slide-left', 'show-battle');
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('game-started');
    computerGridElement.style.visibility = 'hidden';
    playerGridElement.style.visibility = 'visible';
    toggleAxisButton.style.display = 'block';
    restartButton.style.display = 'none';

    // Reset game state variables
    currentShipIndex = 0;
    allShipsPlaced = false;
    isHorizontal = true; // Reset orientation

    // Update status message
   // Display the initial status messages in sequence
   GridView.updateStatus(`Hi ${playerName}! Shall we play a game?`, 0); // Immediate display
   setTimeout(() => {
       GridView.updateStatus(`Place your ships to begin the game.`);
   }, 2000); // 2-second delay

   // Show the first ship placement message after the initial message
   setTimeout(() => {
       if (currentShipIndex < ships.length) {
           GridView.updateStatus(`${playerName}, place your ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces)`);
       }
   }, 4000); // 2 seconds after the "Place your ships" message

 // Re-enable player actions
    enablePlayerActions();
    // Set up event listeners for ship placement
    handleShipPlacement(playerGridElement, playerBoard);
}


// Export startGame for the entry point
export default { startGame };
