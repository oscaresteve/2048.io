import { createGrid, addRandomTile, moveGrid, canMove } from "./grid.js";

// estado inicial del juego
export function createGameState(size = 5, level = 1) {
  const levelTargets = {
    1: 16,
    2: 64,
    3: 256,
    4: 1024,
    5: 4096,
  };

  let grid = createGrid(size);
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);

  return {
    size,
    score: 0,
    level,
    target: levelTargets[level] ?? Math.pow(4, level),
    grid,
  };
}

// comprobar si se ha completado el nivel
export function checkLevelComplete(grid, target) {
  return grid.some(row => row.some(tile => tile?.value === target));
}

// mover en una direccion
export function applyMove(gameState, direction) {
  const {
    moved,
    grid: movedGrid,
    gained,
  } = moveGrid(gameState.grid, direction);

  if (!moved) return gameState;

  let newGrid = movedGrid;
  newGrid = addRandomTile(newGrid);

  const newState = {
    ...gameState,
    grid: newGrid,
    score: gameState.score + gained,
  };

  if (checkLevelComplete(newGrid, gameState.target)) {
    newState.levelCompleted = true;
  }

  return newState;
}

// comprobar si se pueden hacer mas movimientos
export function isGameOver(gameState) {
  return !canMove(gameState.grid);
}
