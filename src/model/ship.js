export function Ship(name, length) {
    let hits = 0;
    let positions = [];
  
    function hit() {
      hits += 1;
    }
  
    function isSunk() {
      return hits >= length;
    }
    function setPositions(newPositions) {
      if (Array.isArray(newPositions)) {
        positions = newPositions;
      } else {
        throw new Error('Positions must be an array of coordinates.');
      }
    }
  
    return {
      name,
      length,
      hit,
      isSunk,
      positions,
      setPositions,
      get hits() {
        return hits;
      },
    };
  }
  
