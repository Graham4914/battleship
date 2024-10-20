import { Player } from '../src/model/player';
import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship';

describe('Computer Attack Logic', () => {
  test('Computer attacks random cells initially', () => {
    const computer = Player(true);
    const gameboard = Gameboard();
    const attackCoords = computer.randomAttack(gameboard);

    expect(gameboard.missedShots).toContainEqual(attackCoords);
  });

  test('Computer attacks adjacent cells after a hit', () => {
    const computer = Player(true);
    const playerBoard = Gameboard();

    // Place a ship
    const ship = Ship(3);
    playerBoard.placeShip(ship, 5, 5, 'horizontal');

    // First attack hits
    const firstHit = [5, 5];
    playerBoard.receiveAttack(firstHit);
    const secondAttack = computer.computerAttack(playerBoard, firstHit);

    // Ensure the second attack is on an adjacent cell
    const adjacentCells = [
      [4, 5], [6, 5], [5, 4], [5, 6]
    ];
    expect(adjacentCells).toContainEqual(secondAttack);
  });

  test('Computer follows the correct axis after multiple hits', () => {
    const computer = Player(true);
    const playerBoard = Gameboard();

    // Place a horizontal ship
    const ship = Ship(3);
    playerBoard.placeShip(ship, 5, 5, 'horizontal');

    // First two hits
    playerBoard.receiveAttack([5, 5]);
    playerBoard.receiveAttack([5, 6]);

    const thirdAttack = computer.computerAttack(playerBoard, [5, 6]);

    // Expect the computer to continue along the same horizontal axis
    expect(thirdAttack).toEqual([5, 7]);  // Continue attacking to the right
  });
});
