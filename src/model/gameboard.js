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
    console.log(`Checking if ship can be safely placed at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}`);

    // Check boundaries
    if (isHorizontal) {
        if (y + ship.length > 10 || y < 0) {
            console.log(`Horizontal ship placement out of bounds at (${x}, ${y})`);
            return false;
        }
    } else {
        if (x + ship.length > 10 || x < 0) {
            console.log(`Vertical ship placement out of bounds at (${x}, ${y})`);
            return false;
        }
    }

    // Check for overlap
    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;

        if (board[targetX][targetY] !== null) {
            console.log(`Cell (${targetX}, ${targetY}) is already occupied. Cannot place ship.`);
            return false;
        }
    }

    return true; // If all checks pass, the ship can be placed
}


function canPlaceShip(x, y, length, isHorizontal) {
    // Checks if the ship can be placed without collisions or going out of bounds
    if (isHorizontal) {
        if (y + length > 10) return false;
        for (let i = 0; i < length; i++) {
            if (board[x][y + i] !== null) return false;
        }
    } else {
        if (x + length > 10) return false;
        for (let i = 0; i < length; i++) {
            if (board[x + i][y] !== null) return false;
        }
    }
    return true;
}

function placeShip(ship, x, y, isHorizontal) {
    console.log(`Attempting to place ship of length ${ship.length} at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}`);
    
    // Check if the ship can be placed safely first
    if (!placeShipSafely(x, y, ship, isHorizontal)) {
        return false;  // Placement failed
    }

    // Initialize the positions array to track where the ship is placed
    ship.positions = [];  // Clear positions to ensure there are no duplicates

    // Iterate through each segment of the ship to place it on the board
    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x : x + i;  // Correct handling for vertical placement
        const targetY = isHorizontal ? y + i : y;  // Correct handling for horizontal placement

        // Place the ship on the board
        board[targetX][targetY] = ship;

        // Record the positions occupied by this ship
        ship.positions.push({ x: targetX, y: targetY });

        // Log the placement
        console.log(`Marking cell (${targetX}, ${targetY}) as occupied`);
    }

    // Add this ship to the list of ships on the board
    ships.push(ship);
    
    // Log the successful ship placement and positions array
    console.log(`Ship of length ${ship.length} placed successfully at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}. Positions:`, ship.positions);

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

            placed = placeShip(ship, x, y, isHorizontal);
            if (placed) {
                ship.positions = [];  // Initialize the positions array

                for (let i = 0; i < ship.length; i++) {
                    const targetX = isHorizontal ? x : x + i;
                    const targetY = isHorizontal ? y + i : y;
                    ship.positions.push({ x: targetX, y: targetY });
                }

                console.log(`Ship placed:`, ship);
            }
            attempts++;
        }

        if (!placed) {
            console.error(`Failed to place ship after ${attempts} attempts.`);
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
      canPlaceShip,
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
