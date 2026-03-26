// crear un grid
export function createGrid(size = 5) {
  return Array(size)
    .fill()
    .map(() => Array(size).fill(null));
}

// recoger las celdas vacias
export function getEmptyCells(cells) {
  const empty = [];
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells.length; c++) {
      if (!cells[r][c]) empty.push({ r, c });
    }
  }
  return empty;
}

// añadir un tile aleatoramente con valor 2 o 4
export function addRandomTile(grid) {
  const empty = getEmptyCells(grid);
  if (!empty.length) return grid;

  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newGrid = grid.map((row) => row.slice());
  newGrid[r][c] = { value };

  return newGrid;
}

// movimientos del grid
const DIRS = {
  ArrowUp: { r: -1, c: 0 },
  ArrowDown: { r: 1, c: 0 },
  ArrowLeft: { r: 0, c: -1 },
  ArrowRight: { r: 0, c: 1 },
};

// mover en una direccion
export function moveGrid(grid, direction) {
  const dir = DIRS[direction];
  if (!dir) return { moved: false, grid, gained: 0 };

  const size = grid.length;

  const newGrid = grid.map((row) => row.slice());
  const merged = Array(size)
    .fill()
    .map(() => Array(size).fill(false));

  const range = [...Array(size).keys()];
  if (dir.r === 1) range.reverse();
  if (dir.c === 1) range.reverse();

  let moved = false;
  let gained = 0;

  range.forEach((r) => {
    range.forEach((c) => {
      const tile = newGrid[r][c];
      if (!tile) return;

      let nr = r;
      let nc = c;

      while (true) {
        const nextR = nr + dir.r;
        const nextC = nc + dir.c;

        if (nextR < 0 || nextR >= size || nextC < 0 || nextC >= size) break;

        const nextTile = newGrid[nextR][nextC];

        if (!nextTile) {
          newGrid[nextR][nextC] = tile;
          newGrid[nr][nc] = null;
          nr = nextR;
          nc = nextC;
          moved = true;
        } else if (!merged[nextR][nextC] && nextTile.value === tile.value) {
          newGrid[nextR][nextC] = { value: tile.value * 2 };
          newGrid[nr][nc] = null;
          merged[nextR][nextC] = true;

          gained += tile.value * 2;
          moved = true;
          break;
        } else break;
      }
    });
  });

  return { moved, grid: newGrid, gained };
}

// comprobacion del moviemiento
export function canMove(grid) {
  if (getEmptyCells(grid).length) return true;

  const size = grid.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r][c]?.value;
      if (!v) continue;

      if (r < size - 1 && grid[r + 1][c]?.value === v) return true;
      if (c < size - 1 && grid[r][c + 1]?.value === v) return true;
    }
  }

  return false;
}
