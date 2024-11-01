import { Player } from '../src/model/player';
import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship';

describe('Player Factory', () => {
  test('player attacks enemy gameboard', () => {
    const player = Player();
    const enemyBoard = Gameboard();
    const ship = Ship('Submarine', 3);  // Name and length provided
    enemyBoard.placeShip(ship, 0, 0, true);  // Place the ship horizontally at (0, 0)
    
    player.attack(enemyBoard, [0, 0]);  // Attack the enemy board at (0, 0)
    expect(ship.hits).toBe(1); // The ship should register a hit
  });

  test('computer generates a valid attack', () => {
    const computer = Player(true);
    const enemyBoard = Gameboard();

    // Perform an attack using computerAttack
    const attackResult = computer.computerAttack(enemyBoard);

    // Get the attack coordinates
    const attackCoords = attackResult.coords;

    // Verify the attack coordinates are valid and within the board range
    expect(attackCoords[0]).toBeGreaterThanOrEqual(0);
    expect(attackCoords[0]).toBeLessThan(10);
    expect(attackCoords[1]).toBeGreaterThanOrEqual(0);
    expect(attackCoords[1]).toBeLessThan(10);
});


test('computer does not repeat the same attack', () => {
  const computer = Player(true);
  const enemyBoard = Gameboard();

  // Perform the first attack
  const firstAttackResult = computer.computerAttack(enemyBoard);
  const firstAttack = firstAttackResult.coords;

  // Perform the second attack
  const secondAttackResult = computer.computerAttack(enemyBoard);
  const secondAttack = secondAttackResult.coords;

  expect(firstAttack).not.toEqual(secondAttack); // Ensure different coordinates are attacked
});

});
