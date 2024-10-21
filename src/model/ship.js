export function Ship(length) {
    let hits = 0;
    let positions = [];
  
    function hit() {
      hits += 1;
    }
  
    function isSunk() {
      return hits >= length;
    }
  
    return {
      length,
      hit,
      isSunk,
      positions,
      get hits() {
        return hits;
      },
    };
  }
  
