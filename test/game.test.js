import { describe, it, expect, vi } from 'vitest';
import { createGameState, checkLevelComplete, applyMove, isGameOver } from '../src/components/game.js';
import * as gridModule from '../src/components/grid.js';

describe('game.js', () => {
  it('createGameState crea estado con 2 tiles', () => {
    vi.spyOn(gridModule, 'addRandomTile').mockImplementation(g => g); // mock para evitar aleatoriedad
    const state = createGameState(3, 1);
    expect(state.grid.length).toBe(3);
    expect(state.score).toBe(0);
    expect(state.level).toBe(1);
    expect(state.target).toBe(16);
    vi.restoreAllMocks();
  });

  it('checkLevelComplete devuelve true si hay tile objetivo', () => {
    const grid = [
      [{ value: 2 }, null],
      [null, { value: 16 }]
    ];
    expect(checkLevelComplete(grid, 16)).toBe(true);
    expect(checkLevelComplete(grid, 32)).toBe(false);
  });

  it('applyMove actualiza estado y añade tile', () => {
    const grid = [
      [{ value: 2 }, { value: 2 }],
      [null, null]
    ];
    const state = { grid, score: 0, target: 4 };
    // mock moveGrid para control
    vi.spyOn(gridModule, 'moveGrid').mockReturnValue({ moved: true, grid, gained: 4 });
    vi.spyOn(gridModule, 'addRandomTile').mockImplementation(g => g);
    const newState = applyMove(state, 'ArrowRight');
    expect(newState.score).toBe(4);
    vi.restoreAllMocks();
  });

  it('isGameOver devuelve true si no hay movimientos', () => {
    const state = { grid: [[{ value: 2 }, { value: 4 }], [{ value: 8 }, { value: 16 }]] };
    expect(isGameOver(state)).toBe(true);
  });
});