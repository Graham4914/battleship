import { Ship } from './ship.js';

export function Gameboard() {
  // Ensure the board is a 10x10 grid of null values
  const board = Array(10).fill(null).map(() => Array(10).fill(null)); // Creates a 2D array of nulls
  const missedShots = [];
  const ships = [];

  function placeShip(ship, x, y, direction = 'horizontal') {
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
    return true;  // Return true if ship placement succeeds
}
  function receiveAttack(coords) {
      const [x, y] = coords;
      if (board[x][y]) {
          board[x][y].hit();
      } else {
          missedShots.push(coords);
      }
  }

  function allShipsSunk() {
      return ships.every(ship => ship.isSunk());
  }

  return {
      placeShip,
      receiveAttack,
      allShipsSunk,
      get missedShots() {
          return missedShots;
      },
      get board() {
          return board;
      },
  };
}
