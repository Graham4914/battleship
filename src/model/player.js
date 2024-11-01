export function Player(isComputer = false) {
    const previousMoves = new Set();
    let activeTargets = []; // Queue of active targets

    // Function to create a new active target
    function createNewActiveTarget(ship, hitCoords) {
        const [x, y] = hitCoords;
        const target = {
            ship: ship,
            hits: [hitCoords],
            potentialTargets: getAdjacentCells(x, y),
            axis: null, // Will be set when two hits are recorded
        };
        return target;
    }

    // Function to get adjacent cells
    function getAdjacentCells(x, y) {
        const directions = [
            [x - 1, y], // up
            [x + 1, y], // down
            [x, y - 1], // left
            [x, y + 1]  // right
        ];
        return directions.filter(([newX, newY]) => {
            return (
                newX >= 0 && newX < 10 &&
                newY >= 0 && newY < 10 &&
                !previousMoves.has(`${newX},${newY}`)
            );
        });
    }

    // Function to update target's potential targets based on hits
    function updateTargetPotential(target) {
        const { hits, axis } = target;
        const [x, y] = hits[hits.length - 1];
    
        if (hits.length === 1) {
            // Only one hit, add adjacent cells
            target.potentialTargets = getAdjacentCells(x, y);
        } else if (!axis) {
            // Determine the axis
            const [x1, y1] = hits[0];
            const [x2, y2] = hits[1];
    
            if (x1 === x2) {
                // x is the same, so ship is horizontal
                target.axis = 'horizontal';
            } else {
                // y is the same, so ship is vertical
                target.axis = 'vertical';
            }
            console.log(`Axis determined: ${target.axis}`);
            // Update potential targets along the axis
            target.potentialTargets = getAxisAlignedCells(target);
        } else {
            // Continue along the axis
            target.potentialTargets = getAxisAlignedCells(target);
        }
    }
    

    // Function to get cells aligned along the axis
    function getAxisAlignedCells(target) {
        const { hits, axis } = target;
        const [x1, y1] = hits[0]; // First hit
        const [x2, y2] = hits[hits.length - 1]; // Last hit
    
        let potentialTargets = [];
    
        if (axis === 'horizontal') {
            // Positive direction from last hit
            let newYPos = y2 + 1;
            if (newYPos < 10 && !previousMoves.has(`${x2},${newYPos}`)) {
                potentialTargets.push([x2, newYPos]);
            }
    
            // Negative direction from first hit
            let newYNeg = y1 - 1;
            if (newYNeg >= 0 && !previousMoves.has(`${x1},${newYNeg}`)) {
                potentialTargets.push([x1, newYNeg]);
            }
        } else if (axis === 'vertical') {
            // Positive direction from last hit
            let newXPos = x2 + 1;
            if (newXPos < 10 && !previousMoves.has(`${newXPos},${y2}`)) {
                potentialTargets.push([newXPos, y2]);
            }
    
            // Negative direction from first hit
            let newXNeg = x1 - 1;
            if (newXNeg >= 0 && !previousMoves.has(`${newXNeg},${y1}`)) {
                potentialTargets.push([newXNeg, y1]);
            }
        }
    
        return potentialTargets;
    }
    // Function to generate a random attack coordinate
    function randomAttack() {
        let x, y, coords;
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            coords = [x, y];
        } while (
            previousMoves.has(coords.toString())
        );
        // Do not add to previousMoves here; it will be added after the attack is confirmed
        return coords;
    }

    // The main computer attack function
    function computerAttack(gameboard, testAttackCoords = null) {
        console.log('--- computerAttack START ---');
        console.log('Active Targets before attack:', activeTargets);
        console.log('Previous Moves:', Array.from(previousMoves));
    
        let attackCoords;
    
        if (testAttackCoords) {
            // Always use testAttackCoords if provided
            attackCoords = testAttackCoords;
        } else if (activeTargets.length > 0) {
            // Remove any targets that have no potential targets left
            while (activeTargets.length > 0 && activeTargets[0].potentialTargets.length === 0) {
                // Remove exhausted active targets from the front of the queue
                activeTargets.shift();
            }
    
            if (activeTargets.length > 0) {
                // Always work on the first active target
                const currentTarget = activeTargets[0];
    
                // Ensure potential targets are up to date
                currentTarget.potentialTargets = currentTarget.potentialTargets.filter(coords => !previousMoves.has(coords.toString()));
    
                if (currentTarget.potentialTargets.length > 0) {
                    attackCoords = currentTarget.potentialTargets.shift();
                } else {
                    // No potential targets left for this target; remove it
                    activeTargets.shift();
                    return computerAttack(gameboard); // Retry with updated active targets
                }
            } else {
                attackCoords = randomAttack();
            }
        } else {
            attackCoords = randomAttack();
        }

        const [x, y] = attackCoords;
        const attackResult = gameboard.receiveAttack(attackCoords);

        // Mark the cell as attacked
        previousMoves.add(`${x},${y}`);

        // Process the result of the attack
        if (attackResult.result === 'hit' || attackResult.result === 'sunk') {
            // Check if we already have an active target for this ship
            let target = activeTargets.find(t => t.ship.id === attackResult.ship.id);

            if (!target) {
                // Create a new active target and add it to the end of the queue
                target = createNewActiveTarget(attackResult.ship, [x, y]);
                activeTargets.push(target);
            } else {
                // Update the existing target
                target.hits.push([x, y]);
                updateTargetPotential(target);
            }

            if (attackResult.result === 'sunk') {
                // Remove the sunk ship from active targets
                activeTargets = activeTargets.filter(t => t.ship.id !== attackResult.ship.id);
            }
        }

        console.log('Selected Attack Coordinates:', attackCoords);
        console.log('Active Targets after attack:', activeTargets);
        console.log('--- computerAttack END ---');

        return { coords: attackCoords, result: attackResult.result };
    }

    return {
        attack: (gameboard, coords) => gameboard.receiveAttack(coords),  // For human player
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
