import { Player } from '../src/model/player';
import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship';

describe('Computer Attack Logic', () => {
    test('computer generates random attack', () => {
        const computer = Player(true);
        const enemyBoard = Gameboard();
    
        // Perform an attack using computerAttack
        const attackResult = computer.computerAttack(enemyBoard);
        const attackCoords = attackResult.coords;
    
        expect(attackResult.result).toMatch(/hit|miss|sunk/);
        expect(attackCoords[0]).toBeGreaterThanOrEqual(0);
        expect(attackCoords[0]).toBeLessThan(10);
        expect(attackCoords[1]).toBeGreaterThanOrEqual(0);
        expect(attackCoords[1]).toBeLessThan(10);
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

    test('AI reverses direction after missing in one direction on a vertical ship', () => {
        const computer = Player(true);
        const gameboard = Gameboard();
    
        // Place a vertical ship from (2,7) to (5,7)
        const ship = Ship('Battleship', 4);
        gameboard.placeShip(ship, 2, 7, false);
    
        // First hit at (3,7)
        computer.computerAttack(gameboard, [3, 7]);
    
        // Second hit at (2,7)
        computer.computerAttack(gameboard, [2, 7]);
    
        // AI should now determine axis as vertical and have potential target at (1,7)
        // Simulate AI missing at (1,7)
        computer.computerAttack(gameboard, [1, 7]);
    
        // AI should reverse direction and attack (4,7)
        const fourthAttackResult = computer.computerAttack(gameboard);
        const fourthAttack = fourthAttackResult.coords;
    
        expect(fourthAttack).toEqual([4, 7]);
    });
    

});
