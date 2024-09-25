export function Player(isComputer = false) {
    const previousMoves = new Set();
  
    function attack(gameboard, coords) {
      gameboard.receiveAttack(coords);
    }
  
    function randomAttack(gameboard) {
      let x, y, coords;
      do {
        x = Math.floor(Math.random() * 10); // Random x between 0 and 9
        y = Math.floor(Math.random() * 10); // Random y between 0 and 9
        coords = [x, y];
      } while (previousMoves.has(coords.toString())); // Ensure it's a new move
  
      previousMoves.add(coords.toString());
      gameboard.receiveAttack(coords);
      return coords;
    }
  
    return {
      attack,
      randomAttack: isComputer ? randomAttack : null, // Only for computer player
    };
  }
  