export function Ship(name,length) {
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
  
    return {
      name,
      length,
      hit,
      isSunk,
      positions,
      get hits() {
        return hits;
      },
    };
  }
  
