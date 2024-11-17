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
   
    for (let i = 0; i < length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;

        if (targetX < 0 || targetX >= 10 || targetY < 0 || targetY >= 10) {
            return false;
        }

        if (typeof targetX === 'undefined' || typeof targetY === 'undefined' || targetX < 0 || targetX >= 10 || targetY < 0 || targetY >= 10) {
            return false; 
        }
        
        if (board[targetX][targetY]) {
            return false;
        }
    }
    for (let i = 0; i < length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;
        board[targetX][targetY] = ship;
        ship.positions.push({ x: targetX, y: targetY });
        shipCells.add(`${targetX},${targetY}`);  // Track ship positions in shipCells set
    }
  
    return true;
  }



  function placeShip(ship, x, y, isHorizontal) {
    if (!ship || typeof x !== 'number' || typeof y !== 'number' || typeof isHorizontal !== 'boolean') {
        return false;
    }

  

    // Proceed only if the parameters are valid
    if (!placeShipSafely(x, y, ship, isHorizontal)) {
        return false;
    }

    ship.positions = [];  
    for (let i = 0; i < ship.length; i++) {
        const targetX = isHorizontal ? x : x + i;
        const targetY = isHorizontal ? y + i : y;

        if (targetX >= 0 && targetX < 10 && targetY >= 0 && targetY < 10) {
            board[targetX][targetY] = ship;
            ship.positions.push({ x: targetX, y: targetY });
        } else {
            return false;
        }
    }

    ships.push(ship);
   
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

   

    shipsToPlace.forEach((ship) => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            const isHorizontal = Math.random() < 0.5;
            const x = Math.floor(Math.random() * (isHorizontal ? 10 : (10 - ship.length)));
            const y = Math.floor(Math.random() * (isHorizontal ? (10 - ship.length) : 10));

       

            placed = placeShip(ship, x, y, isHorizontal);

            if (!placed) {
               
            }
            attempts++;
        }

        if (!placed) {
          
        } else {
           
        }
    });

  
ships.forEach(ship => {
    
});

}



function receiveAttack([x, y]) {

    console.log(`Attacking cell: (${x}, ${y})`);
    console.log(`Ship cells:`, shipCells); // 
    
    // Ensure x and y are within valid bounds
    if (typeof x !== 'number' || typeof y !== 'number' || x < 0 || x >= 10 || y < 0 || y >= 10) {
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
        return { result: 'hit', coordinates: [x, y], ship: target }; 
    }

    console.error(`Error: Invalid target at (${x}, ${y})`);
    return { result: 'error', coordinates: [x, y] };
}


function alreadyAttacked(x, y) {
    return attackedCells.has(`${x},${y}`);
}






  
function attackCell(x, y) {
    const target = board[x][y];  
    if (target === null) {
        console.log('Miss');
        missedShots.push([x, y]);  
        return { result: 'miss', coordinates: [x, y] };  
    } else if (typeof target === 'object' && typeof target.hit === 'function') {
        target.hit();  
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
 
    
    ships.forEach(ship => {
       
    });

    if (ships.length === 0) {
      
        return false;  
    }

    const allSunk = ships.every(ship => ship.isSunk());
  
    return allSunk;
}

function reset() {
    board = Array(10).fill(null).map(() => Array(10).fill(null));  
    missedShots = [];  
    ships = [];  
    attackedCells.clear();  
    shipCells.clear();  
}


  return {
      placeShip,
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
    
        return shipCells;
      }
  };
}
