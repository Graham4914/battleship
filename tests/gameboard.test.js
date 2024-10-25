import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship';

describe('Gameboard Factory', () => {
    test('places a ship horizontally', () => {
        const gameboard = Gameboard();
        const ship = Ship('Destroyer', 3); // Ship with name 'Destroyer' and length 3
        gameboard.placeShip(ship, 0, 0, 'horizontal');
        expect(gameboard.board[0][0]).toBe(ship);
        expect(gameboard.board[0][1]).toBe(ship);
        expect(gameboard.board[0][2]).toBe(ship);
    });

    test('places a ship vertically', () => {
        const gameboard = Gameboard();
        const ship = Ship('Submarine', 3);
    
        // Attempt to place the ship vertically starting at (0, 0)
        const placed = gameboard.placeShipSafely(0, 0, ship, false);
        expect(placed).toBe(true); // Ensure the function indicates successful placement
    
        // Check that the ship is correctly referenced in the gameboard
        for (let i = 0; i < ship.length; i++) {
            console.log(`Expected cell (0, ${i}) to contain part of ship ${ship.name}`);
            expect(gameboard.board[0 + i][0]).toEqual(ship); // Adjust this if you’re storing something else (e.g., an ID)
        }
    });
    
    

    test('records a hit on the ship', () => {
        const gameboard = Gameboard();
        const ship = Ship('Patrol Boat', 2);
        gameboard.placeShip(ship, 0, 0, 'horizontal');
        gameboard.receiveAttack([0, 0]);
        expect(ship.hits).toBe(1);
    });

    test('records a missed shot', () => {
        const gameboard = Gameboard();
        gameboard.receiveAttack([3, 3]);
        expect(gameboard.missedShots).toContainEqual([3, 3]);
    });

    test('checks if all ships are sunk', () => {
        const gameboard = Gameboard();
        const ship1 = Ship('Cruiser', 2);
        const ship2 = Ship('Battleship', 3);
        gameboard.placeShip(ship1, 0, 0, 'horizontal');
        gameboard.placeShip(ship2, 2, 0, 'horizontal');

        // Sink ship1
        gameboard.receiveAttack([0, 0]);
        gameboard.receiveAttack([0, 1]);

        // Sink ship2
        gameboard.receiveAttack([2, 0]);
        gameboard.receiveAttack([2, 1]);
        gameboard.receiveAttack([2, 2]);

        expect(gameboard.allShipsSunk()).toBe(true);
    });
});
