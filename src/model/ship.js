export function Ship(name, length) {
  console.log(`Creating ship: ${name}, Length: ${length}`);
    let hits = 0;
    let positions = [];
  
    function hit() {
      hits += 1;
      console.log(`Ship hit! Current hits: ${hits}`);
    }
  
    function isSunk() {
      console.log(`Checking if ship is sunk: Hits = ${hits}, Length = ${length}`);
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
  
