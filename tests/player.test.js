import { Player } from '../src/model/player';
import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship';

describe('Player Factory', () => {
    test('player attacks enemy gameboard', () => {
      const player = Player();
      const enemyBoard = Gameboard();
      const ship = Ship(3); 
      enemyBoard.placeShip(ship, 0, 0, 'horizontal');
      player.attack(enemyBoard, [0, 0]);
      expect(ship.hits).toBe(1); // The ship should register a hit
    });
  
    test('computer generates random attack', () => {
      const computer = Player(true); 
      const enemyBoard = Gameboard();
      const attackCoords = computer.randomAttack(enemyBoard);
      expect(enemyBoard.missedShots).toContainEqual(attackCoords); // Attack is valid
    });
  
    test('computer does not repeat the same attack', () => {
      const computer = Player(true);
      const enemyBoard = Gameboard();
      const firstAttack = computer.randomAttack(enemyBoard);
      const secondAttack = computer.randomAttack(enemyBoard);
      expect(firstAttack).not.toEqual(secondAttack); 
    });
  });