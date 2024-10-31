// jest.setup.js

// Set up the DOM structure that your JavaScript expects
document.body.innerHTML = `
  <div id="player-grid"></div>
  <div id="computer-grid"></div>
  <button id="restart-btn">Restart</button>
  <button id="rotate-btn">Rotate</button>
  <button id="start-game-btn">Start Game</button>
  <div id="start-screen">Start Screen</div>
  <div id="game-container" style="display: none;">Game Container</div>
  <div id="status-message"></div> <!-- Add more elements as needed -->
`;
