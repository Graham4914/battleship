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
        console.log("Generated random attack coordinates:", coords);
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
        console.log("Handling first hit. Created new target:", JSON.stringify(target));
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
            console.error('No hits to use for axis alignment');
            return [];
        }
    
        // Extract X and Y values from hits
        const xValues = hitsToUse.map(hit => hit[0]);
        const yValues = hitsToUse.map(hit => hit[1]);
    
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
    
        console.log(`\n--- Generating Axis-Aligned Cells ---`);
        console.log(`Attack axis: ${attackAxis}, Current direction: ${direction}`);
        console.log(`Hits:`, JSON.stringify(hitsToUse));
        console.log(`minX: ${minX}, maxX: ${maxX}, minY: ${minY}, maxY: ${maxY}`);
    
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
    
        console.log("New potential targets after axis alignment:", JSON.stringify(potentialTargets));
        return potentialTargets;
    }
    
    
    
    
    function computerAttack(gameboard, testAttackCoords = null) {
        console.log("\n=== Computer Attack Initiated ===");
        console.log("Active Targets at start:", JSON.stringify(activeTargets));
    
        let attackCoords;
        let target = activeTargets[0]; // Fetch the first active target, if any
    
        if (testAttackCoords) {
            attackCoords = testAttackCoords;
            console.log(`Using test attack coordinates: ${attackCoords}`);
        } else if (!target) {
            attackCoords = randomAttack();
            console.log("No active target. Random attack selected:", attackCoords);
        } else {
            console.log("Current target:", JSON.stringify(target));
    
            while (true) {
                if (target.potentialTargets.length === 0) {
                    if (!target.reversed) {
                        // Reverse direction
                        target.direction = target.direction === 'positive' ? 'negative' : 'positive';
                        target.reversed = true;
                        console.log(`Reversing direction to ${target.direction}`);
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
                                console.log(`Switching to perpendicular axis: ${target.attackAxis}`);
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
                                console.log("Both axes exhausted. Removing target.");
                                activeTargets = activeTargets.filter(t => t !== target);
                                target = null;
                                attackCoords = randomAttack();
                                console.log("Random attack selected after exhausting targets:", attackCoords);
                                break;
                            }
                        } else {
                            // No unsunk hits left
                            console.log("No unsunk hits left. Removing target.");
                            activeTargets = activeTargets.filter(t => t !== target);
                            target = null;
                            attackCoords = randomAttack();
                            console.log("Random attack selected after exhausting targets:", attackCoords);
                            break;
                        }
                    }
                }
    
                if (target && target.potentialTargets.length > 0) {
                    attackCoords = target.potentialTargets.shift();
                    console.log("Targeting potential adjacent cell:", attackCoords);
                    if (!previousMoves.has(`${attackCoords[0]},${attackCoords[1]}`)) {
                        break;
                    }
                } else if (!target) {
                    break;
                }
            }
    
            if (!attackCoords) {
                attackCoords = randomAttack();
                console.log("No valid adjacent cell. Random attack selected:", attackCoords);
            }
        }
    
        console.log("Final attack coordinates:", attackCoords);
    
        // Perform the attack and handle the result
        const attackResult = gameboard.receiveAttack(attackCoords);
        previousMoves.add(`${attackCoords[0]},${attackCoords[1]}`);
    
        // Handle attack results
        if (attackResult.result === 'hit' || attackResult.result === 'sunk') {
            if (!target) {
                // If no target was set, create a new one
                target = handleFirstHit(attackCoords);
                console.log("New target created after first hit:", JSON.stringify(target));
            } else {
                // Append the hit coordinates to the current target's hits
                target.hits.push(attackCoords);
                target.unsunkHits.push(attackCoords);
                console.log("Updated target after additional hit:", JSON.stringify(target));
            }
    
            // Determine attack axis if not set
            if (target.attackAxis === null) {
                target.attackAxis = determineAttackAxis(target.hits);
                if (target.attackAxis) {
                    console.log(`Attack axis determined: ${target.attackAxis}`);
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
    
            // Remove hit from unsunkHits if ship is sunk
            if (attackResult.result === 'sunk') {
                console.log("Ship sunk!");
    
                // Remove all hits belonging to the sunk ship from unsunkHits
                target.unsunkHits = target.unsunkHits.filter(coord =>
                    !attackResult.ship.positions.some(pos => pos.x === coord[0] && pos.y === coord[1])
                );
    
                // Remove hits from target.hits as well
                target.hits = target.hits.filter(coord =>
                    !attackResult.ship.positions.some(pos => pos.x === coord[0] && pos.y === coord[1])
                );
    
                if (target.unsunkHits.length === 0) {
                    // All ships in this cluster are sunk
                    activeTargets = activeTargets.filter(t => t !== target);
                    console.log("All ships in cluster sunk. Removing target.");
                    target = null;
                } else {
                    console.log("Ships remain in cluster. Continuing attack.");
                    // Generate new potential targets along the same axis
                    target.potentialTargets = getAxisAlignedCells(target);
                }
            }
        }
    
        console.log("Active Targets at end:", JSON.stringify(activeTargets));
        return { coords: attackCoords, result: attackResult.result, ship: attackResult.ship || null, };
    }
    
    
    
 function determineAttackAxis(hits) {
    console.log("Determining attack axis based on hits:", JSON.stringify(hits));
    if (hits.length < 2) return null;

    const [firstHit, secondHit] = hits;

    if (firstHit[0] === secondHit[0]) {
        console.log("Hits are on the same row. Attack axis: horizontal");
        return 'horizontal';
    } else if (firstHit[1] === secondHit[1]) {
        console.log("Hits are on the same column. Attack axis: vertical");
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
        handleFirstHit,  // Expose handleFirstHit here
        getAdjacentCells,
        reset,  // Expose getAdjacentCells for any isolated testing
    };
}



