import { Ship } from './ship';

export function Gameboard() {
  const board = Array(10).fill(null).map(() => Array(10).fill(null)); // 10x10 grid
  const missedShots = [];
  const ships = [];

  function placeShip(ship, coords, direction) {
    const [x, y] = coords;
    if (direction === 'horizontal') {
      for (let i = 0; i < ship.length; i++) {
        board[x][y + i] = ship;
      }
    } else if (direction === 'vertical') {
      for (let i = 0; i < ship.length; i++) {
        board[x + i][y] = ship;
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

  function areAllShipsSunk() {
    return ships.every(ship => ship.isSunk());
  }

  return {
    board,
    missedShots,
    placeShip,
    receiveAttack,
    areAllShipsSunk,
  };
}
