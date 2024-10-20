// export function Player(isComputer = false) {
//     const previousMoves = new Set();
  
//     function attack(gameboard, coords) {
//       gameboard.receiveAttack(coords);
//     }
  
//     function randomAttack(gameboard) {
//       let x, y, coords;
//       do {
//         x = Math.floor(Math.random() * 10); // Random x between 0 and 9
//         y = Math.floor(Math.random() * 10); // Random y between 0 and 9
//         coords = [x, y];
//       } while (previousMoves.has(coords.toString())); // Ensure it's a new move
  
//       previousMoves.add(coords.toString());
//       gameboard.receiveAttack(coords);
//       return coords;
//     }
  
//     return {
//       attack,
//       randomAttack: isComputer ? randomAttack : null, // Only for computer player
//     };
//   }
  
// player.js (model)
// player.js (model)
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
      return coords;
  }

  function computerAttack(gameboard) {
      let attackCoords;
      
      if (potentialTargets.length > 0) {
          attackCoords = potentialTargets.pop();
      } else {
          attackCoords = randomAttack(gameboard);
      }

      const [x, y] = attackCoords;
      const attackResult = gameboard.receiveAttack(attackCoords);

      // Process the attack result
      if (attackResult.result === 'hit') {
          lastHit = [x, y];
          addAdjacentCells(x, y);
          if (!currentAxis && lastHit) {
              const [lastX, lastY] = lastHit;
              currentAxis = (x === lastX) ? 'horizontal' : 'vertical';
          }
      } else if (attackResult.result === 'sunk') {
          potentialTargets = [];
          currentAxis = null;
          lastHit = null;
      }

      return { coords: attackCoords, result: attackResult.result };
  }

  return {
      attack: (gameboard, coords) => gameboard.receiveAttack(coords),  // For human player
      computerAttack: isComputer ? computerAttack : null,  // Only for computer player
  };
}
