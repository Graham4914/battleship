import { Ship } from './ship.js';
import { GridView } from '../view/gridView.js';
export const attackedCells = new Set(); 

export function Gameboard() {
  // Ensure the board is a 10x10 grid of null values
  let board = Array(10).fill(null).map(() => Array(10).fill(null)); // Creates a 2D array of nulls
  let missedShots = [];
  let ships = [];
  let attackedCells = new Set();  // A set to track all attacked coordinates

  function placeShipSafely( x, y, ship, isHorizontal) {
    // Check if the ship can be placed within bounds
    if (isHorizontal) {
        if (y + ship.length > 10 || y < 0) {
            console.log(`Ship exceeds horizontal bounds at (${x}, ${y})`);
            return false;
        }
    } else {
        if (x + ship.length > 10 || x < 0) {
            console.log(`Ship exceeds vertical bounds at (${x}, ${y})`);
            return false;
        }
    }

    // Check for overlaps
    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;

        if (board[targetX][targetY] !== null) {
            console.log(`Cell (${targetX}, ${targetY}) is already occupied`);
            return false;
        }
    }

    // Place the ship on the board
    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;

        board[targetX][targetY] = ship;
        console.log(`Marking cell (${targetX}, ${targetY}) as occupied`);
    }

    return true;
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
    if (!canPlaceShip(x, y, ship.length, isHorizontal)) {
        return false;  // Placement failed
    }

    ship.positions = [];  // Initialize or clear the positions array

    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;
        board[targetX][targetY] = ship;

        // Add the position to the ship's positions array
        ship.positions.push({ x: targetX, y: targetY });
    }

    ships.push(ship);
    return true;  // Placement succeeded
}



function placeShipsForComputer(computerGridElement) {
    const shipsToPlace = [
        new Ship(2), // Destroyer
        new Ship(3), // Submarine
        new Ship(3), // Cruiser
        new Ship(4), // Battleship
        new Ship(5)  // Carrier
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
                // Initialize the positions array to track the ship's coordinates
                ship.positions = [];
                for (let i = 0; i < ship.length; i++) {
                    const targetX = isHorizontal ? x : x + i;
                    const targetY = isHorizontal ? y + i : y;

                    // Store each part of the ship's position
                    ship.positions.push({ x: targetX, y: targetY });
                }

                // Render the ship on the computer's grid for debugging purposes
                ship.positions.forEach(({ x, y }) => {
                    GridView.renderShip(computerGridElement, ship, x, y, isHorizontal);
                });

                console.log(`Ship placed:`, ship);
                console.log('Computer Board:', board);
                console.log(`Placed ${ship.length}-length ship successfully after ${attempts} attempts at (${x}, ${y})`);
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
