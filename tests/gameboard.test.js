import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship'; 

describe('Gameboard Factory', () => {
  test('places a ship at the correct coordinates', () => {
    const gameboard = Gameboard();
    const ship = Ship(3); 
    gameboard.placeShip(ship, [0, 0], 'horizontal');
    expect(gameboard.board[0][0]).toBe(ship); // Check the ship is placed
  });

  test('receives an attack that hits a ship', () => {
    const gameboard = Gameboard();
    const ship = Ship(3);
    gameboard.placeShip(ship, [0, 0], 'horizontal');
    gameboard.receiveAttack([0, 0]);
    expect(ship.hits).toBe(1); // The ship should register a hit
  });

  test('receives an attack that misses', () => {
    const gameboard = Gameboard();
    gameboard.receiveAttack([1, 1]);
    expect(gameboard.missedShots).toContainEqual([1, 1]); // Track missed shots
  });

  test('reports when all ships are sunk', () => {
    const gameboard = Gameboard();
    const ship1 = Ship(2);
    const ship2 = Ship(3);
    gameboard.placeShip(ship1, [0, 0], 'horizontal');
    gameboard.placeShip(ship2, [1, 0], 'horizontal');
    gameboard.receiveAttack([0, 0]);
    gameboard.receiveAttack([0, 1]); // Sink ship1
    gameboard.receiveAttack([1, 0]);
    gameboard.receiveAttack([1, 1]);
    gameboard.receiveAttack([1, 2]); // Sink ship2
    expect(gameboard.areAllShipsSunk()).toBe(true); // All ships should be sunk
  });
});
