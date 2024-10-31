export function Player(isComputer = false) {
    const previousMoves = new Set();
    let lastHit = null;  // Track the last hit
    let potentialTargets = [];  // Adjacent cells to target
    let currentAxis = null;  // Horizontal or vertical axis
    let axisDirection = null; // Track direction along axis (positive or negative)

    // Helper function to add adjacent cells to potential targets
    function addAdjacentCells(x, y) {
        const directions = [
            [x - 1, y], // up
            [x + 1, y], // down
            [x, y - 1], // left
            [x, y + 1]  // right
        ];
        directions.forEach(([newX, newY]) => {
            if (
                newX >= 0 && newX < 10 &&
                newY >= 0 && newY < 10 &&
                !previousMoves.has(`${newX},${newY}`) &&
                !potentialTargets.some(coords => coords[0] === newX && coords[1] === newY) // Prevent duplicates
            ) {
                potentialTargets.push([newX, newY]);
            }
        });
    }

    function randomAttack() {
        let x, y, coords;
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            coords = [x, y];
        } while (previousMoves.has(coords.toString())); // Ensure new move
        previousMoves.add(coords.toString());
        return coords;
    }

    function computerAttack(gameboard, testAttackCoords = null) {
        console.log('--- computerAttack START ---');
        console.log('Potential Targets before filtering:', potentialTargets);
        console.log('Previous Moves:', Array.from(previousMoves));
        console.log('Current Axis:', currentAxis);
    
        let attackCoords;
    
        // Filter potential targets to remove already attacked cells
        potentialTargets = potentialTargets.filter(coords => !previousMoves.has(coords.toString()));
    
        if (testAttackCoords) {
            attackCoords = testAttackCoords;
        } else if (potentialTargets.length > 0) {
            attackCoords = potentialTargets.shift();  // Take the first target in the queue
        } else {
            attackCoords = randomAttack();
        }

        const [x, y] = attackCoords;
        const attackResult = gameboard.receiveAttack(attackCoords);
    
        // Mark the cell as attacked
        previousMoves.add(`${x},${y}`);
    
        // Process the result of the attack
        if (attackResult.result === 'hit') {
            if (!lastHit) {
                // This is the first hit, determine potential targets around it
                lastHit = { coords: [x, y], ship: attackResult.ship };
                addAdjacentCells(x, y);
            } else {
                // Check if it's the same ship as the last hit
                if (attackResult.ship !== lastHit.ship) {
                    // It's a different ship; reset axis and targets
                    console.log('Hit a different ship, resetting axis and last hit.');
                    lastHit = { coords: [x, y], ship: attackResult.ship };
                    potentialTargets = [];
                    currentAxis = null;
                    axisDirection = null;
                    addAdjacentCells(x, y);
                } else {
                    // Determine the axis after the second hit if it hasn't been set
                    const [lastX, lastY] = lastHit.coords;
                    if (!currentAxis) {
                        if (x === lastX) {
                            currentAxis = 'horizontal';
                            axisDirection = y > lastY ? 'positive' : 'negative';
                        } else {
                            currentAxis = 'vertical';
                            axisDirection = x > lastX ? 'positive' : 'negative';
                        }
                        console.log('Axis determined:', currentAxis, 'Direction:', axisDirection);
                    }
    
                    // Add new potential targets based on the current hit along the determined axis
                    if (currentAxis === 'horizontal') {
                        if (axisDirection === 'positive' && y + 1 < 10 && !previousMoves.has(`${x},${y + 1}`)) {
                            potentialTargets.unshift([x, y + 1]);
                        } else if (axisDirection === 'negative' && y - 1 >= 0 && !previousMoves.has(`${x},${y - 1}`)) {
                            potentialTargets.unshift([x, y - 1]);
                        } else {
                            // Axis continuation is blocked, try the opposite direction
                            axisDirection = axisDirection === 'positive' ? 'negative' : 'positive';
                            if (axisDirection === 'positive' && y + 1 < 10 && !previousMoves.has(`${x},${y + 1}`)) {
                                potentialTargets.unshift([x, y + 1]);
                            } else if (axisDirection === 'negative' && y - 1 >= 0 && !previousMoves.has(`${x},${y - 1}`)) {
                                potentialTargets.unshift([x, y - 1]);
                            }
                        }
                    } else if (currentAxis === 'vertical') {
                        if (axisDirection === 'positive' && x + 1 < 10 && !previousMoves.has(`${x + 1},${y}`)) {
                            potentialTargets.unshift([x + 1, y]);
                        } else if (axisDirection === 'negative' && x - 1 >= 0 && !previousMoves.has(`${x - 1},${y}`)) {
                            potentialTargets.unshift([x - 1, y]);
                        } else {
                            // Axis continuation is blocked, try the opposite direction
                            axisDirection = axisDirection === 'positive' ? 'negative' : 'positive';
                            if (axisDirection === 'positive' && x + 1 < 10 && !previousMoves.has(`${x + 1},${y}`)) {
                                potentialTargets.unshift([x + 1, y]);
                            } else if (axisDirection === 'negative' && x - 1 >= 0 && !previousMoves.has(`${x - 1},${y}`)) {
                                potentialTargets.unshift([x - 1, y]);
                            }
                        }
                    }
                }
            }
    
        } else if (attackResult.result === 'sunk') {
            // If the ship is sunk, clear all targeting data
            console.log(`Ship sunk: ${attackResult.ship.name}. Clearing targeting data.`);
            potentialTargets = [];
            currentAxis = null;
            lastHit = null;
            axisDirection = null;
        }
    
        console.log('Selected Attack Coordinates:', attackCoords);
        console.log('Potential Targets after attack:', potentialTargets);
        console.log('--- computerAttack END ---');
    
        return { coords: attackCoords, result: attackResult.result };
    }
    
    return {
        attack: (gameboard, coords) => gameboard.receiveAttack(coords),  // For human player
        randomAttack: isComputer ? randomAttack : null,  // Ensure randomAttack is available only for computer
        computerAttack: isComputer ? computerAttack : null,  // Only for computer player
    };
}


// export function Player(isComputer = false) {
//   const previousMoves = new Set();
//   let lastHit = null;  // Track the last hit
//   let potentialTargets = [];  // Adjacent cells to target
//   let currentAxis = null;  // Horizontal or vertical axis
  
//   // Helper function to add adjacent cells to potential targets
//   function addAdjacentCells(x, y) {
//       const directions = [
//           [x - 1, y], // up
//           [x + 1, y], // down
//           [x, y - 1], // left
//           [x, y + 1]  // right
//       ];
//       directions.forEach(([newX, newY]) => {
//           if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10 && !previousMoves.has(`${newX},${newY}`)) {
//               potentialTargets.push([newX, newY]);
//           }
//       });
//   }



//   function randomAttack(gameboard) {
//       let x, y, coords;
//       do {
//           x = Math.floor(Math.random() * 10);
//           y = Math.floor(Math.random() * 10);
//           coords = [x, y];
//       } while (previousMoves.has(coords.toString())); // Ensure new move
//       previousMoves.add(coords.toString());
//       return coords;
//   }

//   function computerAttack(gameboard) {
//     let attackCoords;

//     // Check if there are valid potential targets
//     if (potentialTargets.length > 0) {
//         // Filter out already attacked cells from potential targets
//         potentialTargets = potentialTargets.filter(coords => !previousMoves.has(coords.toString()));
        
//         if (potentialTargets.length > 0) {
//             attackCoords = potentialTargets.shift();  // Use `shift()` to maintain order instead of `pop()`
//         }
//     }

//     // If no valid potential targets, generate a random attack
//     if (!attackCoords) {
//         attackCoords = randomAttack(gameboard);
//     }

//     const [x, y] = attackCoords;
//     const attackResult = gameboard.receiveAttack(attackCoords);

//     // Mark the cell as attacked
//     previousMoves.add(`${x},${y}`);

//     // Process the result of the attack
//     if (attackResult.result === 'hit') {
//         lastHit = [x, y];
//         addAdjacentCells(x, y);  // Add adjacent cells for future attacks

//         // Determine the axis after the second hit
//         if (!currentAxis && lastHit) {
//             const [lastX, lastY] = lastHit;
//             currentAxis = (x === lastX) ? 'horizontal' : 'vertical';
//         }

//         // Prioritize targets along the current axis
//         if (currentAxis === 'horizontal') {
//             potentialTargets = potentialTargets.filter(([targetX]) => targetX === x);  // Keep only horizontal targets
//             if (!previousMoves.has(`${x},${y + 1}`) && y + 1 < 10) potentialTargets.push([x, y + 1]);
//             if (!previousMoves.has(`${x},${y - 1}`) && y - 1 >= 0) potentialTargets.push([x, y - 1]);
//         } else if (currentAxis === 'vertical') {
//             potentialTargets = potentialTargets.filter(([, targetY]) => targetY === y);  // Keep only vertical targets
//             if (!previousMoves.has(`${x + 1},${y}`) && x + 1 < 10) potentialTargets.push([x + 1, y]);
//             if (!previousMoves.has(`${x - 1},${y}`) && x - 1 >= 0) potentialTargets.push([x - 1, y]);
//         }

//     } else if (attackResult.result === 'sunk') {
//         // If the ship is sunk, clear all targeting data
//         potentialTargets = [];
//         currentAxis = null;
//         lastHit = null;
//     }

//     return { coords: attackCoords, result: attackResult.result };
// }


//   return {
//       attack: (gameboard, coords) => gameboard.receiveAttack(coords),  // For human player
//       randomAttack: isComputer ? randomAttack : null,  // Ensure randomAttack is available only for computer
//       computerAttack: isComputer ? computerAttack : null,  // Only for computer player
//   };
// }
