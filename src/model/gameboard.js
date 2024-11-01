import { Ship } from './ship.js';
import { GridView } from '../view/gridView.js';
import { getPlayerGridElement, getComputerGridElement } from '../controller/gameController.js';



export function Gameboard() {
  // Ensure the board is a 10x10 grid of null values
  let board = Array(10).fill(null).map(() => Array(10).fill(null)); // Creates a 2D array of nulls
  let missedShots = [];
  let ships = [];
  let attackedCells = new Set();  // A set to track all attacked coordinates
  let shipCells = new Set();

  function placeShipSafely(x, y, ship, isHorizontal) {
    const length = ship.length;
    console.log(`Checking if ship ${ship.name} can be safely placed at (${x}, ${y}) with orientation ${isHorizontal ? 'horizontal' : 'vertical'}`);
    for (let i = 0; i < length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;

        if (targetX < 0 || targetX >= 10 || targetY < 0 || targetY >= 10) {
            console.log(`Out of bounds at (${targetX}, ${targetY})`);
            return false;
        }

        if (typeof targetX === 'undefined' || typeof targetY === 'undefined' || targetX < 0 || targetX >= 10 || targetY < 0 || targetY >= 10) {
            console.error(`Invalid target coordinates: (${targetX}, ${targetY})`);
            return false; // Or handle the error appropriately
        }
        
        if (board[targetX][targetY]) {
            console.log(`Cell at (${targetX}, ${targetY}) is already occupied. Cannot place ship.`);
            return false;
        }
    }
    for (let i = 0; i < length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;
        board[targetX][targetY] = ship;
        ship.positions.push({ x: targetX, y: targetY });
        shipCells.add(`${targetX},${targetY}`);  // Track ship positions in shipCells set
        console.log(`Marking cell (${targetX}, ${targetY}) for ship ${ship.name}. Current shipCells:`, shipCells);
    }
    console.log(`Ship ${ship.name} placed successfully with positions:`, ship.positions);
    return true;
  }



  function placeShip(ship, x, y, isHorizontal) {
    if (!ship || typeof x !== 'number' || typeof y !== 'number' || typeof isHorizontal !== 'boolean') {
        console.error('Invalid parameters provided to placeShip:', { ship, x, y, isHorizontal });
        return false;
    }

    console.log(`Attempting to place ship ${ship.name} of length ${ship.length} at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}`);

    // Proceed only if the parameters are valid
    if (!placeShipSafely(x, y, ship, isHorizontal)) {
        console.error(`Failed to place ship safely at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}`);
        return false;
    }

    ship.positions = [];  // Initialize positions

    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;

        if (targetX >= 0 && targetX < 10 && targetY >= 0 && targetY < 10) {
            board[targetX][targetY] = ship;
            ship.positions.push({ x: targetX, y: targetY });
            console.log(`Marking cell (${targetX}, ${targetY}) as occupied for ship ${ship.name}`);
        } else {
            console.error(`Error: Attempted to place ship out of bounds at (${targetX}, ${targetY})`);
            return false;
        }
    }

    ships.push(ship);
    console.log(`Ship ${ship.name} placed successfully at (${x}, ${y}) ${isHorizontal ? 'horizontally' : 'vertically'}`);
    return true;
}




function placeShipsForComputer() {
    const shipsToPlace = [
        Ship('Destroyer', 2),
        Ship('Submarine', 3),
        Ship('Cruiser', 3),
        Ship('Battleship', 4),
        Ship('Carrier', 5)
    ];

    console.log('Starting ship placement for computer. Ships to place:', shipsToPlace);

    shipsToPlace.forEach((ship) => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            const isHorizontal = Math.random() < 0.5;
            const x = Math.floor(Math.random() * (isHorizontal ? 10 : (10 - ship.length)));
            const y = Math.floor(Math.random() * (isHorizontal ? (10 - ship.length) : 10));

            console.log(`Trying to place ship ${ship.name} at (${x}, ${y}) with orientation ${isHorizontal ? 'horizontal' : 'vertical'}. Attempt number: ${attempts + 1}`);

            placed = placeShip(ship, x, y, isHorizontal);

            if (!placed) {
                console.warn(`Failed attempt to place ${ship.name} at (${x}, ${y}). Attempt: ${attempts + 1}`);
            }
            attempts++;
        }

        if (!placed) {
            console.error(`Failed to place ship (${ship.name}) after ${attempts} attempts.`);
        } else {
            console.log(`Successfully placed ${ship.name} with positions:`, ship.positions);
        }
    });

    console.log('Finished placing ships for computer.');
    console.log('Final shipCells after placing all ships:', shipCells);
ships.forEach(ship => {
    console.log(`Ship ${ship.name}: Positions =`, ship.positions);
});

}



function receiveAttack([x, y]) {
    // Ensure x and y are within valid bounds
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
        console.error(`Invalid attack coordinates: (${x}, ${y})`);
        return { result: 'error', coordinates: [x, y] };
    }

    const key = `${x},${y}`;
    if (attackedCells.has(key)) {
        console.log(`Cell (${x}, ${y}) was already attacked.`);
        return { result: 'already_attacked', coordinates: [x, y] };
    }

    attackedCells.add(key);
    const target = board[x][y];

    if (target === null) {
        missedShots.push([x, y]);
        console.log(`Missed at (${x}, ${y})`);
        return { result: 'miss', coordinates: [x, y] };
    } else if (typeof target === 'object' && typeof target.hit === 'function') {
        console.log(`Hitting ship: ${target.name} at (${x}, ${y})`);
        target.hit();
        console.log(`Ship ${target.name} hit! Current hits after attack: ${target.hits}`);

        if (target.isSunk()) {
            console.log(`Sunk a ship at (${x}, ${y})`);
            return { result: 'sunk', coordinates: [x, y], ship: target };
        }

        console.log(`Hit at (${x}, ${y})`);
        return { result: 'hit', coordinates: [x, y], ship: target }; // Include 'ship' here
    }

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
    console.log('Ships array in allShipsSunk:', ships);
    
    ships.forEach(ship => {
        console.log(`Ship ${ship.name}: Length = ${ship.length}, Hits = ${ship.hits}`);
    });

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
    shipCells.clear();  // Clear shipCells set during reset
}


  return {
      placeShip,
    //   canPlaceShip,
      placeShipSafely,
      placeShipsForComputer: (boardInstance) => placeShipsForComputer(boardInstance),
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
      },
      get shipCells() {
        console.log('Accessing shipCells:', shipCells instanceof Set ? 'Valid Set' : 'Not a Set', shipCells);
        return shipCells;
      }
  };
}
