
import { Gameboard } from "../model/gameboard.js";
import { GridView } from "../view/gridView.js";
import { Player } from "../model/player.js";  
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







let currentShipIndex = 0;  
let allShipsPlaced = false;  

const ships = [
    { name: 'Destroyer', length: 2 },
    { name: 'Submarine', length: 3 },
    { name: 'Cruiser', length: 3 },
    { name: 'Battleship', length: 4 },
    { name: 'Carrier', length: 5 }
];

let isHorizontal = true; 


function handleShipPlacement(gridElement, playerBoard) {
  

    
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

   
    clickHandler = function (e) {
        if (allShipsPlaced) return;
        GridView.clearHighlights(gridElement);
        const cell = e.target;
        const cellIndex = Array.from(gridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;
        const currentShip = Ship(ships[currentShipIndex].name, ships[currentShipIndex].length);
        const placed = playerBoard.placeShipSafely(x, y, currentShip, isHorizontal);
        if (placed) {
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

 
    rotateShipHandler = function (e) {
        if (e.key === 'r') {
            rotateShip();
        }
    };

   
    gridElement.addEventListener('click', clickHandler);
    gridElement.addEventListener('mouseover', mouseoverHandler);
    document.addEventListener('keydown', rotateShipHandler);
}


// Rotate the current ship's orientation
function rotateShip() {
    isHorizontal = !isHorizontal;
    statusMessageElement.innerHTML = `Placing ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces). Currently ${isHorizontal ? 'Horizontal' : 'Vertical'}`;
    GridView.clearHighlights(playerGridElement); 
}





const toggleButton = document.getElementById('toggle-axis-btn');


function startBattlePhase() {
   
    toggleButton.style.display = 'none';
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.add('slide-left', 'show-battle');
    computerGridElement.style.visibility = 'visible';
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.add('game-started');

    GridView.updateStatus('Computer is placing ships...');
    GridView.clearHighlights(computerGridElement);

    
    computerBoard.placeShipsForComputer();  


const computerShipCells = computerBoard.shipCells; 
const playerShipCells = playerBoard.shipCells; 

computerBoard.ships.forEach(ship => {
  

    ship.positions.forEach(({ x, y }) => {
        GridView.renderShip(computerGridElement, ship, computerShipCells, x, y, ship.isHorizontal, false);
    });
});
 
    GridView.updateStatus('Attack the enemy ships!', 2000);
    addPlayerAttackListener();
}




function addPlayerAttackListener() {
  
    if (playerAttackHandler) {
        computerGridElement.removeEventListener('click', playerAttackHandler);
    }

    playerAttackHandler = function (e) {
        const cell = e.target;
        if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

        const cellIndex = Array.from(computerGridElement.children).indexOf(cell);
        const x = Math.floor(cellIndex / 10);
        const y = cellIndex % 10;

        const attackResult = player.attack(computerBoard, [x, y]); 

       
        if (attackResult.result === 'hit' || attackResult.result === 'sunk') {
            cell.classList.add('hit');
        } else if (attackResult.result === 'miss') {
            cell.classList.add('miss');
        }

        handleAttackResult(attackResult, x, y, 'player');

        if (computerBoard.allShipsSunk()) {
            GridView.updateStatus('You win! All enemy ships are sunk!',2000);
            endGame();
        } else {
            setTimeout(() => {
                GridView.updateStatus("Computer's turn...");
                handleComputerAttack();
            }, 1500);
        }
    };

    
    computerGridElement.addEventListener('click', playerAttackHandler);
}



function handleComputerAttack() {
    const attackResult = computer.computerAttack(playerBoard);
    const { coords, result, ship } = attackResult;
    const [x, y] = coords;

  
    handleAttackResult(attackResult, x, y, 'computer')

   
    if (playerBoard.allShipsSunk()) {
        GridView.updateStatus('Computer wins! All your ships are sunk.',2000);
        endGame('computer');
    } else {
        
        computerAttackTimeout = setTimeout(() => {
            GridView.updateStatus(`${playerName}'s turn!`);
        }, 2000); 
    }
}



function enablePlayerActions() {
    computerGridElement.style.pointerEvents = 'auto';  
    playerGridElement.style.pointerEvents = 'auto';  
}




// End the game
function endGame(winner) {
    if (winner === 'player') {
        GridView.updateStatus(`Congratulations ${playerName}! You win! All enemy ships are sunk.`);
    } else if (winner === 'computer') {
        GridView.updateStatus('Game Over. The computer has sunk all your ships!');
    }

    disablePlayerActions(); 

        // Remove attack event listener
        if (playerAttackHandler) {
            computerGridElement.removeEventListener('click', playerAttackHandler);
            playerAttackHandler = null;
        }

    // Show the restart button
    const restartButton = document.getElementById('restart-btn');
    restartButton.style.display = 'block'; 
}


const restartButton = document.getElementById('restart-btn');
restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';  
    startGame();  
});

function disablePlayerActions() {
    computerGridElement.style.pointerEvents = 'none';  
}

const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const startGameBtn = document.getElementById('start-game-btn');
const playerNameInput = document.getElementById('player-name-input');

startGameBtn.addEventListener('click', () => {
   
    const inputName = playerNameInput.value.trim();
    if (inputName !== '') {
        playerName = inputName;
    } else {
        playerName = 'Player'; 
    }

    startScreen.style.display = 'none'; 
    gameContainer.style.display = 'block'; 
    startGame(); 
});

function handleAttackResult(attackResult, x, y, attacker = 'computer') {
    const { result, ship } = attackResult;

    if (result === 'already_attacked') {
        console.warn("Attempted attack on already attacked cell.");
        return;
    }

    const gridElement = (attacker === 'computer') ? playerGridElement : computerGridElement;
    const cell = gridElement.children[x * 10 + y];

   

    setTimeout(() => {
        if (attacker === 'computer') {
            if (result === 'hit' || result === 'sunk') {
                cell.classList.add('hit');
                GridView.updateStatus(`Computer ${result === 'sunk' ? `sank your ${ship.name}!` : 'hit your ship!'}`, 900);
            } else if (result === 'miss') {
                cell.classList.add('miss');
                GridView.updateStatus('Computer missed!', 900);
            }
        } else {
            if (result === 'sunk') {
                const shipName = ship ? ship.name : 'a ship';
                GridView.updateStatus(`${playerName} sank the enemy's ${shipName}!`);
            } else if (result === 'hit') {
                GridView.updateStatus(`${playerName} hit a ship!`, 900);
            } else if (result === 'miss') {
                GridView.updateStatus(`${playerName} missed!`, 900);
            }
        }
    }, 200);
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

function startGame() {
       
        if (computerAttackTimeout) {
            clearTimeout(computerAttackTimeout);
            computerAttackTimeout = null;
        }
   
    removeShipPlacementEventListeners();
    if (playerAttackHandler) {
        computerGridElement.removeEventListener('click', playerAttackHandler);
        playerAttackHandler = null;
    }

 
    playerGridElement = getPlayerGridElement();
    computerGridElement = getComputerGridElement();

    if (!playerGridElement || !computerGridElement) {
        console.error('Grid elements are not initialized properly. Aborting startGame.');
        return;
    }

    
    playerBoard.reset();
    computerBoard.reset();

    
    computer.reset();
   
    GridView.clearGrid(playerGridElement);
    GridView.clearGrid(computerGridElement);

   
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.remove('slide-left', 'show-battle');
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('game-started');
    computerGridElement.style.visibility = 'hidden';
    playerGridElement.style.visibility = 'visible';
    toggleAxisButton.style.display = 'block';
    restartButton.style.display = 'none';

   
    currentShipIndex = 0;
    allShipsPlaced = false;
    isHorizontal = true; 

   
  
   GridView.updateStatus(`Hi ${playerName}! Shall we play a game?`, 0); 
   setTimeout(() => {
       GridView.updateStatus(`Place your ships to begin the game.`);
   }, 2000); 
  
   setTimeout(() => {
       if (currentShipIndex < ships.length) {
           GridView.updateStatus(`${playerName}, place your ${ships[currentShipIndex].name} (${ships[currentShipIndex].length} spaces)`);
       }
   }, 4000); 

    enablePlayerActions();
    handleShipPlacement(playerGridElement, playerBoard);
}


export default { startGame };
