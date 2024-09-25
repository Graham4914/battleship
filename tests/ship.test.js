import { Ship } from '../src/model/ship'

describe('Ship Factory', () => {
    test('creates a ship with the correct length', () => {
      const ship = Ship(4); 
      expect(ship.length).toBe(4);
    });
  
    test('hit() increases the number of hits', () => {
      const ship = Ship(4);
      ship.hit();
      expect(ship.hits).toBe(1);
    });
  
    test('isSunk() returns true when ship is sunk', () => {
      const ship = Ship(2);
      ship.hit();
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    });
  
    test('isSunk() returns false when ship is not yet sunk', () => {
      const ship = Ship(3);
      ship.hit();
      expect(ship.isSunk()).toBe(false);
    });
  });