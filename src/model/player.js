export function Player(isComputer = false) {
    const previousMoves = new Set();
    let activeTargets = []; // Queue of active targets

    function createNewActiveTarget(ship, hitCoords) {
        const [x, y] = hitCoords;
        const target = {
            ship: ship,
            hits: [hitCoords],
            potentialTargets: getAdjacentCells(x, y),
            axis: null, // Will be set after second hit
            direction: null, //Will be set when axis determined
            reversed: false, // Tracks if direction has been reversed
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

    function updateTargetPotential(target) {
        const { hits, axis } = target;
    
        if (hits.length === 1) {
            // Only one hit, add adjacent cells
            const [x, y] = hits[0];
            target.potentialTargets = getAdjacentCells(x, y);
        } else {
            if (!axis) {
                // Determine the axis
                const [x1, y1] = hits[0];
                const [x2, y2] = hits[1];
    
                if (x1 === x2) {
                    target.axis = 'horizontal'; // x is constant, so horizontal
                } else if (y1 === y2) {
                    target.axis = 'vertical';   // y is constant, so vertical
                } else {
                    console.error('Error: Hits are not aligned along an axis');
                }
    
                console.log(`Axis determined: ${target.axis}`);
            }
    
            // Ensure direction is set
            if (target.direction === null || target.direction === undefined) {
                const [x1, y1] = hits[0];
                const [x2, y2] = hits[1];
    
                if (target.axis === 'horizontal') {
                    target.direction = y2 > y1 ? 'positive' : 'negative';
                } else if (target.axis === 'vertical') {
                    target.direction = x2 > x1 ? 'positive' : 'negative';
                }
            }
    
            // Generate potential targets along the axis
            target.potentialTargets = getAxisAlignedCells(target);
        }
    }
    
    // Function to get cells aligned along the axis
    function getAxisAlignedCells(target) {
        const { hits, axis, direction, reversed } = target;
        const [x, y] = reversed ? hits[0] : hits[hits.length - 1]; // Use first hit if reversed
    
        const potentialTargets = [];
    
        if (axis === 'horizontal') {
            if (direction === 'positive') {
                // Move right
                let newY = y + 1;
                if (newY < 10 && !previousMoves.has(`${x},${newY}`)) {
                    potentialTargets.push([x, newY]);
                }
            } else if (direction === 'negative') {
                // Move left
                let newY = y - 1;
                if (newY >= 0 && !previousMoves.has(`${x},${newY}`)) {
                    potentialTargets.push([x, newY]);
                }
            }
        } else if (axis === 'vertical') {
            if (direction === 'positive') {
                // Move down
                let newX = x + 1;
                if (newX < 10 && !previousMoves.has(`${newX},${y}`)) {
                    potentialTargets.push([newX, y]);
                }
            } else if (direction === 'negative') {
                // Move up
                let newX = x - 1;
                if (newX >= 0 && !previousMoves.has(`${newX},${y}`)) {
                    potentialTargets.push([newX, y]);
                }
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
        console.log('Active Targets before attack:', JSON.stringify(activeTargets, null, 2));
        console.log('Previous Moves:', Array.from(previousMoves));
    
        let attackCoords;
        let target; // Declare target here for scope
    
        if (testAttackCoords) {
            attackCoords = testAttackCoords;
        } else if (activeTargets.length > 0) {
            // Always work on the first active target
            target = activeTargets[0];
    
            // Ensure potential targets are up to date
            target.potentialTargets = target.potentialTargets.filter(coords => !previousMoves.has(coords.toString()));
    
            // If no potential targets, update them
            if (target.potentialTargets.length === 0) {
                if (!target.reversed) {
                    // Reverse direction
                    target.reversed = true;
                    target.direction = target.direction === 'positive' ? 'negative' : 'positive';
                    console.log('Reversing direction for target:', target);
                    updateTargetPotential(target);
                } else {
                    // No more options; remove target
                    activeTargets.shift();
                    console.log('No more potential targets after reversing, removing target');
                    return computerAttack(gameboard); // Retry with updated active targets
                }
            }
            
    
            // Now, pick the next potential target
            attackCoords = target.potentialTargets.shift();
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
            target = activeTargets.find(t => t.ship.id === attackResult.ship.id);
    
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
    
        // After processing the result of the attack
        console.log('Attack Result:', attackResult);
        if (typeof target !== 'undefined') {
            console.log('Updated Active Target:', JSON.stringify(target, null, 2));
        }
        console.log('Active Targets after attack:', JSON.stringify(activeTargets, null, 2));
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
