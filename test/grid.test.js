import { describe, it, expect, vi } from 'vitest';
import { createGrid, getEmptyCells, addRandomTile, moveGrid, canMove } from '../src/components/grid.js';

describe('grid.js', () => {
  it('createGrid devuelve grid vacío del tamaño correcto', () => {
    const grid = createGrid(4);
    expect(grid.length).toBe(4);
    expect(grid[0].length).toBe(4);
    expect(grid.flat().every(cell => cell === null)).toBe(true);
  });

  it('getEmptyCells devuelve todas las posiciones vacías', () => {
    const grid = [
      [null, { value: 2 }],
      [null, null]
    ];
    const empty = getEmptyCells(grid);
    expect(empty).toEqual([{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }]);
  });

  it('addRandomTile añade un tile con valor 2 o 4', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // fuerza valor 2
    const grid = createGrid(2);
    const newGrid = addRandomTile(grid);
    const flat = newGrid.flat().filter(Boolean);
    expect(flat.length).toBe(1);
    expect([2, 4]).toContain(flat[0].value);
    vi.restoreAllMocks();
  });

  it('canMove detecta movimiento posible', () => {
    const grid = [
      [{ value: 2 }, { value: 2 }],
      [{ value: 4 }, { value: 8 }]
    ];
    expect(canMove(grid)).toBe(true);
  });

  it('canMove detecta cuando no hay movimientos', () => {
    const grid = [
      [{ value: 2 }, { value: 4 }],
      [{ value: 8 }, { value: 16 }]
    ];
    expect(canMove(grid)).toBe(false);
  });
});
