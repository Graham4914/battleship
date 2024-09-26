import { Ship } from './ship';

export function Gameboard() {
  // Ensure the board is a 10x10 grid of null values
  const board = Array(10).fill(null).map(() => Array(10).fill(null)); // Creates a 2D array of nulls
  const missedShots = [];
  const ships = [];

  function placeShip(ship, startX, startY, direction = 'horizontal') {
    const { length } = ship;

    if (startX < 0 || startX >= 10 || startY < 0 || startY >= 10) {
        throw new Error('Invalid starting position for ship placement');
    }

    if (direction === 'horizontal') {
        if (startY + length > 10) {
            throw new Error('Ship placement out of bounds horizontally');
        }
        for (let i = 0; i < length; i++) {
            if (board[startX][startY + i] === undefined) {
                throw new Error('Invalid ship placement: index out of bounds');
            }
            board[startX][startY + i] = ship;
        }
    } else if (direction === 'vertical') {
        if (startX + length > 10) {
            throw new Error('Ship placement out of bounds vertically');
        }
        for (let i = 0; i < length; i++) {
            if (board[startX + i][startY] === undefined) {
                throw new Error('Invalid ship placement: index out of bounds');
            }
            board[startX + i][startY] = ship;
        }
    }
    ships.push(ship);
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
