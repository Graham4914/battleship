import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship';

describe('Attack Logic', () => {
    let gameboard;
    let ship;

    beforeEach(() => {
        // Set up a fresh gameboard and ship before each test
        gameboard = Gameboard();
        ship = Ship(3); // Ship of length 3
        gameboard.placeShip(ship, 0, 0, 'horizontal');
    });

    test('registers a hit correctly', () => {
        const attackResult = gameboard.receiveAttack([0, 0]);
        expect(attackResult.result).toBe('hit');
        expect(ship.hits).toBe(1); // Ensure the ship registers the hit
    });

    test('registers a miss correctly', () => {
        const attackResult = gameboard.receiveAttack([4, 4]);
        expect(attackResult.result).toBe('miss');
        expect(gameboard.missedShots).toContainEqual([4, 4]);
    });

    test('prevents attacking the same cell twice', () => {
        // Attack the same cell twice
        gameboard.receiveAttack([0, 0]);
        const attackResult = gameboard.receiveAttack([0, 0]);
        expect(attackResult.result).toBe('already_attacked');
    });

    test('continues after sinking a ship', () => {
        // Place another ship to ensure not all ships are sunk
        const secondShip = Ship(2);
        gameboard.placeShip(secondShip, 5, 5, 'horizontal');
    
        // Sink the first ship by attacking all parts of it
        gameboard.receiveAttack([0, 0]);
        gameboard.receiveAttack([0, 1]);
        const attackResult = gameboard.receiveAttack([0, 2]);
    
        expect(attackResult.result).toBe('sunk'); // Ensure the ship is marked as sunk
        expect(gameboard.allShipsSunk()).toBe(false); // Since there are other ships left
    });

    test('correctly handles all ships being sunk', () => {
        // Place a second ship
        const secondShip = Ship(2);
        gameboard.placeShip(secondShip, 2, 0, 'horizontal');
        
        // Sink both ships
        gameboard.receiveAttack([0, 0]);
        gameboard.receiveAttack([0, 1]);
        gameboard.receiveAttack([0, 2]);
        gameboard.receiveAttack([2, 0]);
        gameboard.receiveAttack([2, 1]);

        expect(gameboard.allShipsSunk()).toBe(true); // All ships should now be sunk
    });
});
