// In player.js
export function Player(isComputer = false) {
    const previousMoves = new Set();
    let activeTargets = [];

    // Function to perform a random attack
    function randomAttack() {
        let x, y, coords;
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            coords = [x, y];
        } while (previousMoves.has(coords.toString()));
      
        return coords;
    }

    // Function to handle the first hit and populate potential targets
    function handleFirstHit(hitCoords) {
        const target = {
            hits: [hitCoords],
            unsunkHits: [hitCoords],
            potentialTargets: getAdjacentCells(hitCoords[0], hitCoords[1]),
            attackAxis: null,
            direction: null,
            reversed: false,
            triedAxes: new Set()
        };
        activeTargets.push(target);
        return target;
    }
    
    
    // Helper function to get adjacent cells
    function getAdjacentCells(x, y) {
        const directions = [
            [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
        ];
        return directions.filter(([newX, newY]) => {
            return (
                newX >= 0 && newX < 10 &&
                newY >= 0 && newY < 10 &&
                !previousMoves.has(`${newX},${newY}`)
            );
        });
    }

    // Function to get axis-aligned cells
    function getAxisAlignedCells(target) {
        const { hits, attackAxis, direction } = target;
        const potentialTargets = [];
    
        // Use hits or unsunkHits based on context
        let hitsToUse = target.unsunkHits && target.unsunkHits.length > 0 ? target.unsunkHits : target.hits;
    
        if (!hitsToUse || hitsToUse.length === 0) {
            return [];
        }
    
        // Extract X and Y values from hits
        const xValues = hitsToUse.map(hit => hit[0]);
        const yValues = hitsToUse.map(hit => hit[1]);
    
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
    

        // Generate potential targets based on the axis and direction
        if (attackAxis === 'horizontal') {
            const nextY = direction === 'positive' ? maxY + 1 : minY - 1;
            if (nextY >= 0 && nextY < 10 && !previousMoves.has(`${minX},${nextY}`)) {
                potentialTargets.push([minX, nextY]);
            }
        } else if (attackAxis === 'vertical') {
            const nextX = direction === 'positive' ? maxX + 1 : minX - 1;
            if (nextX >= 0 && nextX < 10 && !previousMoves.has(`${nextX},${minY}`)) {
                potentialTargets.push([nextX, minY]);
            }
        }
    
        return potentialTargets;
    }
    
    
    
    
    function computerAttack(gameboard, testAttackCoords = null) {
    
        let attackCoords;
        let target = activeTargets[0]; // Fetch the first active target, if any
    
        if (testAttackCoords) {
            attackCoords = testAttackCoords;
        } else if (!target) {
            attackCoords = randomAttack();
        } else {
    
            while (true) {
                if (target.potentialTargets.length === 0) {
                    if (!target.reversed) {
                        // Reverse direction
                        target.direction = target.direction === 'positive' ? 'negative' : 'positive';
                        target.reversed = true;
                        target.potentialTargets = getAxisAlignedCells(target);
                    } else {
                        // Both directions exhausted
                        target.triedAxes.add(target.attackAxis);
    
                        if (target.unsunkHits.length > 0) {
                            // Switch to perpendicular axis
                            const perpendicularAxis = target.attackAxis === 'horizontal' ? 'vertical' : 'horizontal';
                            if (!target.triedAxes.has(perpendicularAxis)) {
                                target.attackAxis = perpendicularAxis;
                                target.direction = 'positive';
                                target.reversed = false;
                                target.potentialTargets = [];
    
                                target.unsunkHits.forEach(hit => {
                                    const newTargets = getAxisAlignedCells({
                                        hits: [hit],
                                        attackAxis: target.attackAxis,
                                        direction: target.direction
                                    });
                                    target.potentialTargets.push(...newTargets);
                                });
                            } else {
                                // Both axes tried
                                activeTargets = activeTargets.filter(t => t !== target);
                                target = null;
                                attackCoords = randomAttack();
                                break;
                            }
                        } else {
                            // No unsunk hits left
                            activeTargets = activeTargets.filter(t => t !== target);
                            target = null;
                            attackCoords = randomAttack();
                            break;
                        }
                    }
                }
    
                if (target && target.potentialTargets.length > 0) {
                    attackCoords = target.potentialTargets.shift();
                    if (!previousMoves.has(`${attackCoords[0]},${attackCoords[1]}`)) {
                        break;
                    }
                } else if (!target) {
                    break;
                }
            }
    
            if (!attackCoords) {
                attackCoords = randomAttack();
            }
        }
    
    
        // Perform the attack and handle the result
        const attackResult = gameboard.receiveAttack(attackCoords);
        previousMoves.add(`${attackCoords[0]},${attackCoords[1]}`);
    
        // Handle attack results
        if (attackResult.result === 'hit' || attackResult.result === 'sunk') {
            if (!target) {
                // If no target was set, create a new one
                target = handleFirstHit(attackCoords);
            } else {
                // Append the hit coordinates to the current target's hits
                target.hits.push(attackCoords);
                target.unsunkHits.push(attackCoords);
            }
    
            // Determine attack axis if not set
            if (target.attackAxis === null) {
                target.attackAxis = determineAttackAxis(target.hits);
                if (target.attackAxis) {
                    target.direction = 'positive';
                    target.reversed = false;
                    target.triedAxes.add(target.attackAxis);
                    target.potentialTargets = getAxisAlignedCells(target);
                } else {
                    // No axis determined, use adjacent cells
                    target.potentialTargets = getAdjacentCells(attackCoords[0], attackCoords[1]);
                }
            } else {
                // Generate new potential targets along the axis
                target.potentialTargets = getAxisAlignedCells(target);
            }
    
            
            if (attackResult.result === 'sunk') {
    
              
                target.unsunkHits = target.unsunkHits.filter(coord =>
                    !attackResult.ship.positions.some(pos => pos.x === coord[0] && pos.y === coord[1])
                );
    
               
                target.hits = target.hits.filter(coord =>
                    !attackResult.ship.positions.some(pos => pos.x === coord[0] && pos.y === coord[1])
                );
    
                if (target.unsunkHits.length === 0) {
                    // All ships in this cluster are sunk
                    activeTargets = activeTargets.filter(t => t !== target);
                    target = null;
                } else {
                    // Generate new potential targets along the same axis
                    target.potentialTargets = getAxisAlignedCells(target);
                }
            }
        }
    
    
        return { coords: attackCoords, result: attackResult.result, ship: attackResult.ship || null, };
    }
    
    
    
 function determineAttackAxis(hits) {
 if (hits.length < 2) return null;

    const [firstHit, secondHit] = hits;

    if (firstHit[0] === secondHit[0]) {
        return 'horizontal';
    } else if (firstHit[1] === secondHit[1]) {
        return 'vertical';
    }
    return null;
}

function reset() {
    previousMoves.clear();
    activeTargets = [];
}

    return {
        attack: (gameboard, coords) => gameboard.receiveAttack(coords),
        randomAttack,
        computerAttack,
        determineAttackAxis,
        handleFirstHit,  
        getAdjacentCells,
        reset,  
    };
}



