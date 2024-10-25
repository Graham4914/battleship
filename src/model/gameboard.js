import { Ship } from './ship.js';
import { GridView } from '../view/gridView.js';
export const attackedCells = new Set(); 

export function Gameboard() {
  // Ensure the board is a 10x10 grid of null values
  let board = Array(10).fill(null).map(() => Array(10).fill(null)); // Creates a 2D array of nulls
  let missedShots = [];
  let ships = [];
  let attackedCells = new Set();  // A set to track all attacked coordinates

  function placeShipSafely(x, y, ship, isHorizontal) {
    const length = ship.length;  // Extract length from the Ship object

    console.log(`Checking if ship ${ship.name} can be safely placed at (${x}, ${y}) with orientation ${isHorizontal ? 'horizontal' : 'vertical'}`);
    
    for (let i = 0; i < length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;

        if (targetX < 0 || targetX >= 10 || targetY < 0 || targetY >= 10) {
            console.log(`Out of bounds at (${targetX}, ${targetY})`);
            return false;
        }
        if (board[targetX][targetY]) {
            console.log(`Cell at (${targetX}, ${targetY}) is already occupied. Cannot place ship.`);
            return false;
        }
    }

    // Assign positions if placement is valid
    for (let i = 0; i < length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;
        board[targetX][targetY] = ship;
        ship.positions.push({ x: targetX, y: targetY });
        console.log(`Marking cell (${targetX}, ${targetY}) for ship ${ship.name}`);
    }

    console.log(`Ship ${ship.name} placed successfully with positions:`, ship.positions);
    return true;
}



function placeShip(ship, x, y, isHorizontal) {
    console.log(`Attempting to place ship ${ship.name} of length ${ship.length} at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}`);
    
    // Check if the ship can be placed safely first
    if (!placeShipSafely(x, y, ship, isHorizontal)) {
        console.error(`Failed to place ship safely at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}`);
        return false;  // Placement failed
    }

    // Ensure positions array is initialized and empty before adding new positions
    ship.positions = [];  // Clear positions to ensure there are no duplicates

    // Iterate through each segment of the ship to place it on the board
    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x : x + i;  // Correct handling for vertical placement
        const targetY = isHorizontal ? y + i : y;  // Correct handling for horizontal placement

        // Place the ship on the board and ensure we're within the bounds of the board
        if (targetX >= 0 && targetX < 10 && targetY >= 0 && targetY < 10) {
            board[targetX][targetY] = ship;
            ship.positions.push({ x: targetX, y: targetY });
            console.log(`Marking cell (${targetX}, ${targetY}) as occupied for ship ${ship.name}`);
        } else {
            console.error(`Error: Attempted to place ship out of bounds at (${targetX}, ${targetY})`);
            return false;  // If an out-of-bounds placement occurs, we should stop placement
        }
    }

    // Add this ship to the list of ships on the board
    ships.push(ship);
    
    // Log the successful ship placement and positions array
    console.log(`Ship ${ship.name} of length ${ship.length} placed successfully at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}. Positions:`, ship.positions);

    return true;  // Placement succeeded
}


function placeShipsForComputer(computerGridElement) {
    const shipsToPlace = [
        Ship('Destroyer', 2),
        Ship('Submarine', 3),
        Ship('Cruiser', 3),
        Ship('Battleship', 4),
        Ship('Carrier', 5)
    ];

    shipsToPlace.forEach((ship) => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            const isHorizontal = Math.random() < 0.5;
            const x = Math.floor(Math.random() * (isHorizontal ? 10 : (10 - ship.length)));
            const y = Math.floor(Math.random() * (isHorizontal ? (10 - ship.length) : 10));

            console.log(`Attempting to place ship: ${ship.name} at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}`);
            placed = placeShip(ship, x, y, isHorizontal);
            if (!placed) {
                console.warn(`Failed attempt to place ${ship.name} at (${x}, ${y}). Attempt: ${attempts + 1}`);
            }
            attempts++;
        }

        if (!placed) {
            console.error(`Failed to place ship (${ship.name}) after ${attempts} attempts.`);
        } else {
            console.log(`Ship placed:`, ship);
        }
    });

    console.log("Computer's ships array:", ships);
}



function receiveAttack([x, y]) {
    const key = `${x},${y}`;
    
    // Check if the cell has already been attacked
    if (attackedCells.has(key)) {
        console.log(`Cell (${x}, ${y}) was already attacked.`);
        return { result: 'already_attacked', coordinates: [x, y] };
    }

    // Mark the cell as attacked
    attackedCells.add(key);

    const target = board[x][y];

    // Check if it's a miss
    if (target === null) {
        missedShots.push([x, y]);
        console.log(`Missed at (${x}, ${y})`);
        return { result: 'miss', coordinates: [x, y] };
    }
    
    // Check if it's a hit on a ship
    else if (typeof target === 'object' && typeof target.hit === 'function') {
        target.hit();  // Register the hit on the ship
        if (target.isSunk()) {
            console.log(`Sunk a ship at (${x}, ${y})`);
            return { result: 'sunk', coordinates: [x, y] };
        }
        console.log(`Hit at (${x}, ${y})`);
        return { result: 'hit', coordinates: [x, y] };
    }
    
    // If there's an unexpected condition
    console.error(`Error: Invalid target at (${x}, ${y})`);
    return { result: 'error', coordinates: [x, y] };
}

function alreadyAttacked(x, y) {
    return attackedCells.has(`${x},${y}`);
}




  
function attackCell(x, y) {
    const target = board[x][y];  // Access the targeted cell on the board

    if (target === null) {
        console.log('Miss');
        missedShots.push([x, y]);  // Track missed shots
        return { result: 'miss', coordinates: [x, y] };  // Return result for controller to handle
    } else if (typeof target === 'object' && typeof target.hit === 'function') {
        target.hit();  // Register the hit on the ship
        console.log('Hit');

        if (target.isSunk()) {
            console.log('Ship has been sunk!');
            return { result: 'sunk', coordinates: [x, y] };
        }
        return { result: 'hit', coordinates: [x, y] };
    } else {
        console.error('Invalid hit detection');
        return { result: 'error', coordinates: [x, y] };
    }
}

function allShipsSunk() {
    console.log('Checking if all ships are sunk...');
    console.log('Ships array in allShipsSunk:', ships);  // <-- Add this line
    if (ships.length === 0) {
        console.log('No ships placed! This should not happen in a normal game.');
        return false;  // Safety check if no ships have been placed
    }
    const allSunk = ships.every(ship => ship.isSunk());
    console.log(`All ships sunk: ${allSunk}`);
    return allSunk;
}

function reset() {
    board = Array(10).fill(null).map(() => Array(10).fill(null));  // Reset the board to empty state
    missedShots = [];  // Clear all missed shots
    ships = [];  // Remove all placed ships
    attackedCells.clear();  // Clear all recorded attacks
}


  return {
      placeShip,
    //   canPlaceShip,
      placeShipSafely,
      placeShipsForComputer,
      receiveAttack,
      attackCell,
      allShipsSunk,
      alreadyAttacked,
      reset,
      get missedShots() {
          return missedShots;
      },
      get board() {
          return board;
      },
      get attackedCells(){
        return attackedCells;
      },
      get ships() {
        return ships;
      }
  };
}
