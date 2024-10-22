import { Ship } from '../src/model/ship'

describe('Ship Factory', () => {
    test('creates a ship with the correct length', () => {
      const ship = Ship('TestShip', 4)
      expect(ship.length).toBe(4);
    });
  
    test('hit() increases the number of hits', () => {
      const ship = Ship('TestShip', 4)
      ship.hit();
      expect(ship.hits).toBe(1);
    });
  
    test('isSunk() returns true when ship is sunk', () => {
      const ship = Ship('TestShip', 4);  // Create a ship of length 4
      ship.hit(); // 1st hit
      ship.hit(); // 2nd hit
      ship.hit(); // 3rd hit
      ship.hit(); // 4th hit
      expect(ship.isSunk()).toBe(true);  // Test if the ship is sunk after 4 hits
    });
  
    test('isSunk() returns false when ship is not yet sunk', () => {
      const ship = Ship('TestShip', 4)
      ship.hit();
      expect(ship.isSunk()).toBe(false);
    });
  });