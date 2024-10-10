import { Ship } from './ship.js';

export function Gameboard() {
  // Ensure the board is a 10x10 grid of null values
  const board = Array(10).fill(null).map(() => Array(10).fill(null)); // Creates a 2D array of nulls
  const missedShots = [];
  const ships = [];

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


function placeShip(ship, x, y, direction = 'horizontal') {
    console.log(`Placing ship with length ${ship.length} at (${x}, ${y})`);
    const { length } = ship;

    // Check if the ship can be placed without going out of bounds
    if (direction === 'horizontal') {
        if (y + length > 10 || y < 0) {
            throw new Error('Invalid starting position for ship placement');
        }
        for (let i = 0; i < length; i++) {
            if (board[x][y + i] !== null) {
                throw new Error('Position is already occupied');
            }
        }
        // Place the ship on the board
        for (let i = 0; i < length; i++) {
            board[x][y + i] = ship;
        }
    } else if (direction === 'vertical') {
        if (x + length > 10 || x < 0) {
            throw new Error('Invalid starting position for ship placement');
        }
        for (let i = 0; i < length; i++) {
            if (board[x + i][y] !== null) {
                throw new Error('Position is already occupied');
            }
        }
        // Place the ship on the board
        for (let i = 0; i < length; i++) {
            board[x + i][y] = ship;
        }
    }

    // Add the placed ship to the ships array
    ships.push(ship);  
    console.log('Ship placed:', ship);
    console.log('Current ships array:', ships);// <-- This line is crucial
    return true;  // Return true if ship placement succeeds
}

function receiveAttack([x, y]) {
    const target = board[x][y];

    if (target === null) {
        console.log('Miss');
        missedShots.push([x, y]);
        return 'miss';
    } else if (typeof target === 'object' && typeof target.hit === 'function') {
        target.hit();  // Call the hit method on the ship
        console.log('Hit');
        
        // Check if the ship is sunk after the hit
        if (target.isSunk()) {
            console.log('Ship has been sunk!');
            return 'sunk';  // Return a specific "sunk" status
        }
        return 'hit';
    } else {
        console.error('Invalid hit detection');
        return 'error';
    }
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


  return {
      placeShip,
      placeShipSafely,
      receiveAttack,
      attackCell,
      allShipsSunk,
      get missedShots() {
          return missedShots;
      },
      get board() {
          return board;
      },
      get ships() {
        return ships;
      }
  };
}
