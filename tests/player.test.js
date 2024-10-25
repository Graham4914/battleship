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

  test('computer generates a valid random attack', () => {
    const computer = Player(true);
    const enemyBoard = Gameboard();
    
    // Perform a random attack
    const attackCoords = computer.randomAttack(enemyBoard);
    
    // Verify the attack coordinates are valid and within the board range
    expect(attackCoords[0]).toBeGreaterThanOrEqual(0);
    expect(attackCoords[0]).toBeLessThan(10);
    expect(attackCoords[1]).toBeGreaterThanOrEqual(0);
    expect(attackCoords[1]).toBeLessThan(10);
    
    // Verify the attack result is recorded properly (miss, hit, etc.)
    const attackResult = enemyBoard.receiveAttack(attackCoords);
    expect(['miss', 'hit', 'sunk']).toContain(attackResult.result);
});

  test('computer does not repeat the same attack', () => {
    const computer = Player(true);
    const enemyBoard = Gameboard();
    
    const firstAttack = computer.randomAttack(enemyBoard);
    const secondAttack = computer.randomAttack(enemyBoard);
    
    expect(firstAttack).not.toEqual(secondAttack); // Ensure different coordinates are attacked
  });
});
