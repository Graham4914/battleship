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
    
        // Place a ship at a known location
        const ship = Ship('Cruiser', 3);
        gameboard.placeShip(ship, 5, 5, true);
    
        // First attack: simulate a hit at (5,5)
        computer.computerAttack(gameboard, [5, 5]);
    
        // Second attack: the computer should now attack an adjacent cell
        const secondAttackResult = computer.computerAttack(gameboard);
        const secondAttack = secondAttackResult.coords;
    
        const adjacentCells = [
            [4, 5], [6, 5], [5, 4], [5, 6]
        ];
    
        expect(adjacentCells).toContainEqual(secondAttack);
    });

    test('Computer follows the correct axis after multiple hits', () => {
        const computer = Player(true);
        const gameboard = Gameboard();
    
        // Place a horizontal ship
        const ship = Ship('Battleship', 3);
        gameboard.placeShip(ship, 5, 5, true);
    
        // First hit
        computer.computerAttack(gameboard, [5, 5]);
    
        // Second hit
        computer.computerAttack(gameboard, [5, 6]);
    
        // Third attack should continue along the same horizontal axis
        const thirdAttackResult = computer.computerAttack(gameboard);
        const thirdAttack = thirdAttackResult.coords;
    
        expect(thirdAttack).toEqual([5, 7]);
    });
});
