import { Player } from '../src/model/player';
import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship';

describe('Computer Attack Logic', () => {
  test('computer generates random attack', () => {
    const computer = Player(true);
    const enemyBoard = Gameboard();
    const attackCoords = computer.randomAttack(enemyBoard);
    
    // Simulate an attack and check the result
    const attackResult = enemyBoard.receiveAttack(attackCoords);
    if (attackResult.result === 'miss') {
        expect(enemyBoard.missedShots).toContainEqual(attackCoords);
    }
});


test('Computer attacks adjacent cells after a hit', () => {
  const computer = Player(true);
  const gameboard = Gameboard();
  
  // Place a horizontal ship
  gameboard.placeShip(5, 5, Ship(3), true);
  
  // First attack on the ship
  const firstAttack = computer.randomAttack(gameboard);
  gameboard.receiveAttack(firstAttack);
  
  // Second attack should target adjacent cells
  const secondAttack = computer.computerAttack(gameboard).coords;
  const adjacentCells = [
      [4, 5], [6, 5], [5, 4], [5, 6]
  ];
  expect(adjacentCells).toContainEqual(secondAttack);
});


test('Computer follows the correct axis after multiple hits', () => {
  const computer = Player(true);
  const gameboard = Gameboard();

  // Place a horizontal ship
  gameboard.placeShip(5, 5, Ship(3), true);

  // First hit on the ship
  let firstAttack = computer.randomAttack(gameboard);
  gameboard.receiveAttack(firstAttack);

  // Second hit on the ship along the same axis
  let secondAttack = computer.computerAttack(gameboard).coords;
  gameboard.receiveAttack(secondAttack);

  // Expect the third attack to follow the same horizontal axis
  let thirdAttack = computer.computerAttack(gameboard).coords;
  expect(thirdAttack).toEqual([5, 7]);  // Continue attacking to the right
});

});
