
export function Player(isComputer = false) {
  const previousMoves = new Set();
  let lastHit = null;  // Track the last hit
  let potentialTargets = [];  // Adjacent cells to target
  let currentAxis = null;  // Horizontal or vertical axis
  
  // Helper function to add adjacent cells to potential targets
  function addAdjacentCells(x, y) {
      const directions = [
          [x - 1, y], // up
          [x + 1, y], // down
          [x, y - 1], // left
          [x, y + 1]  // right
      ];
      directions.forEach(([newX, newY]) => {
          if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10 && !previousMoves.has(`${newX},${newY}`)) {
              potentialTargets.push([newX, newY]);
          }
      });
  }

  function randomAttack(gameboard) {
      let x, y, coords;
      do {
          x = Math.floor(Math.random() * 10);
          y = Math.floor(Math.random() * 10);
          coords = [x, y];
      } while (previousMoves.has(coords.toString())); // Ensure new move
      previousMoves.add(coords.toString());

    //   const attackResult = gameboard.receiveAttack(coords);  // Execute the attack on the gameboard
    //   if (attackResult.result === 'miss') {
    //     gameboard.missedShots.push(coords);  // Mark it as a miss
    //   }
      return coords;
  }

  function computerAttack(gameboard) {
    let attackCoords;

    // Check if there are valid potential targets
    if (potentialTargets.length > 0) {
        // Filter out already attacked cells from potential targets
        potentialTargets = potentialTargets.filter(coords => !previousMoves.has(coords.toString()));
        
        if (potentialTargets.length > 0) {
            attackCoords = potentialTargets.shift();  // Use `shift()` to maintain order instead of `pop()`
        }
    }

    // If no valid potential targets, generate a random attack
    if (!attackCoords) {
        attackCoords = randomAttack(gameboard);
    }

    const [x, y] = attackCoords;
    const attackResult = gameboard.receiveAttack(attackCoords);

    // Mark the cell as attacked
    previousMoves.add(`${x},${y}`);

    // Process the result of the attack
    if (attackResult.result === 'hit') {
        lastHit = [x, y];
        addAdjacentCells(x, y);  // Add adjacent cells for future attacks

        // Determine the axis after the second hit
        if (!currentAxis && lastHit) {
            const [lastX, lastY] = lastHit;
            currentAxis = (x === lastX) ? 'horizontal' : 'vertical';
        }

        // Prioritize targets along the current axis
        if (currentAxis === 'horizontal') {
            potentialTargets = potentialTargets.filter(([targetX]) => targetX === x);  // Keep only horizontal targets
            if (!previousMoves.has(`${x},${y + 1}`) && y + 1 < 10) potentialTargets.push([x, y + 1]);
            if (!previousMoves.has(`${x},${y - 1}`) && y - 1 >= 0) potentialTargets.push([x, y - 1]);
        } else if (currentAxis === 'vertical') {
            potentialTargets = potentialTargets.filter(([, targetY]) => targetY === y);  // Keep only vertical targets
            if (!previousMoves.has(`${x + 1},${y}`) && x + 1 < 10) potentialTargets.push([x + 1, y]);
            if (!previousMoves.has(`${x - 1},${y}`) && x - 1 >= 0) potentialTargets.push([x - 1, y]);
        }

    } else if (attackResult.result === 'sunk') {
        // If the ship is sunk, clear all targeting data
        potentialTargets = [];
        currentAxis = null;
        lastHit = null;
    }

    return { coords: attackCoords, result: attackResult.result };
}


  return {
      attack: (gameboard, coords) => gameboard.receiveAttack(coords),  // For human player
      randomAttack: isComputer ? randomAttack : null,  // Ensure randomAttack is available only for computer
      computerAttack: isComputer ? computerAttack : null,  // Only for computer player
  };
}
