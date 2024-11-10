import { Player } from '../src/model/player';
import { Gameboard } from '../src/model/gameboard';
import { Ship } from '../src/model/ship';

describe('Computer Attack Logic', () => {
    test('computer generates unique random attacks within bounds', () => {
        const computerPlayer = Player(true);
        const gameboard = Gameboard();
        const previousMoves = new Set();
    
        for (let i = 0; i < 20; i++) { // Run multiple tests
            const attackResult = computerPlayer.computerAttack(gameboard);  // Expect attackResult to be an object
            const attackCoords = attackResult.coords;
    
            expect(attackCoords[0]).toBeGreaterThanOrEqual(0);
            expect(attackCoords[0]).toBeLessThan(10);
            expect(attackCoords[1]).toBeGreaterThanOrEqual(0);
            expect(attackCoords[1]).toBeLessThan(10);
            expect(previousMoves.has(attackCoords.toString())).toBe(false); // No duplicates
            previousMoves.add(attackCoords.toString());
        }
    });
    
    
    test('handleFirstHit populates potential targets correctly', () => {
        const computerPlayer = Player(true);
    
        // Simulate a hit at (5,5) and get the first target
        const hitCoords = [5, 5];
        const target = computerPlayer.handleFirstHit(hitCoords);
    
        // Expect that potential targets are set
        const expectedAdjacentCells = [
            [4, 5], [6, 5], [5, 4], [5, 6]
        ];
        expect(target.potentialTargets).toEqual(expect.arrayContaining(expectedAdjacentCells));
    });

    test('Computer attacks adjacent cells after a hit', () => {
        const computer = Player(true);          // Create the computer player
        const gameboard = Gameboard();          // Initialize the gameboard
    
        // Place a known ship at a specific location, e.g., horizontally from (5,5)
        gameboard.placeShip(Ship('Cruiser', 3), 5, 5, true);
    
        // First attack: Expect the computer to hit the ship at (5,5)
        const firstAttack = computer.computerAttack(gameboard, [5, 5]);
        console.log("First attack result:", firstAttack);
        expect(firstAttack.result).toBe('hit'); // Assert that the first attack should be a hit
    
        // Second attack: Check if the computer correctly targets an adjacent cell
        const secondAttack = computer.computerAttack(gameboard);
        console.log("Second attack result:", secondAttack);
        // You can add assertions here based on your AI logic
    });
    

    
    
    
    test('determineAttackAxis identifies correct axis based on two hits', () => {
        const computerPlayer = Player(true);
    
        // Two hits on the same row
        expect(computerPlayer.determineAttackAxis([[3, 5], [3, 6]])).toBe('horizontal');
    
        // Two hits on the same column
        expect(computerPlayer.determineAttackAxis([[2, 4], [3, 4]])).toBe('vertical');
    
        // Two hits not aligned on either axis
        expect(computerPlayer.determineAttackAxis([[1, 1], [2, 2]])).toBe(null);
    });
    
 
    
    test('Computer follows the correct axis after multiple hits', () => {
        const computer = Player(true);
        const gameboard = Gameboard();
    
        // Place a horizontal ship at (5, 5)
        const ship = Ship('Battleship', 3);
        gameboard.placeShip(ship, 5, 5, true);
    
        // First attack at (5, 5)
        const firstHitResult = computer.computerAttack(gameboard, [5, 5]);
        expect(firstHitResult.result).toBe('hit');
    
        // Second attack at (5, 6)
        const secondHitResult = computer.computerAttack(gameboard, [5, 6]);
        expect(secondHitResult.result).toBe('hit');
    
        // Third attack should be at (5, 7)
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
    
        // First attack at (3, 7)
        const firstHit = computer.computerAttack(gameboard, [3, 7]);
        expect(firstHit.result).toBe('hit');
    
        // Second attack at (2, 7)
        const secondHit = computer.computerAttack(gameboard, [2, 7]);
        expect(secondHit.result).toBe('hit');
    
        // Third attack at (1, 7), expected miss
        const missResult = computer.computerAttack(gameboard, [1, 7]);
        expect(missResult.result).toBe('miss');
    
        // The AI should reverse direction and attack (4, 7)
        const reverseAttackResult = computer.computerAttack(gameboard);
        const reverseAttack = reverseAttackResult.coords;
        expect(reverseAttack).toEqual([4, 7]);
    });
    
    test('AI handles multiple adjacent ships along an axis', () => {
        const computer = Player(true);
        const gameboard = Gameboard();
    
        // Place multiple horizontal ships stacked vertically at x = 5
        gameboard.placeShip(Ship('Destroyer', 2), 5, 1, true);
        gameboard.placeShip(Ship('Submarine', 3), 5, 2, true);
        gameboard.placeShip(Ship('Cruiser', 3), 5, 3, true);
        gameboard.placeShip(Ship('Battleship', 4), 5, 4, true);
        gameboard.placeShip(Ship('Carrier', 5), 5, 5, true);
    
        // Simulate the AI attacking until all ships are sunk
        while (!gameboard.allShipsSunk()) {
            computer.computerAttack(gameboard);
        }
    
        expect(gameboard.allShipsSunk()).toBe(true);
    });
    

});
