const STATES = {
  INITIAL: "initial",
  NUMBER: "number",
  EXPLODED: "exploded",
  FLAGGED: "flagged",
};

const revealTileFn = (board, onGameEnd) => (tile) => {
  if (tile.state !== STATES.INITIAL) return;

  if (tile.mine) {
    tile.setState(STATES.EXPLODED);
    revealMines(board);
    onGameEnd("lose");
    return;
  }

  tile.setState(STATES.NUMBER);
  const nearbyTiles = getNearbyTiles(board, tile);
  const nearbyMinesCount = nearbyTiles.filter((t) => t.mine).length;
  if (nearbyMinesCount === 0) {
    nearbyTiles.forEach((t) => revealTileFn(board, onGameEnd)(t));
  } else {
    tile.setElementContent(nearbyMinesCount);
    if (checkWin(board)) onGameEnd("win");
  }
};

const getNearbyTiles = (board, { position: { x, y } }) => {
  const tiles = [];

  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      const tile = board[x + xOffset]?.[y + yOffset];
      if (tile) tiles.push(tile);
    }
  }

  return tiles;
};

/**
 * @param {Object} tile
 * @returns an Int indicating how the remaining mines count changed
 */
const flagTile = (tile) => {
  if (tile.state === STATES.NUMBER || tile.state === STATES.EXPLODED) {
    return 0;
  }

  if (tile.state === STATES.FLAGGED) {
    tile.setState(STATES.INITIAL);
    return 1;
  } else {
    tile.setState(STATES.FLAGGED);
    return -1;
  }
};

const revealMines = (board) => {
  board.forEach((row) => {
    row.forEach((tile) => {
      if (tile.state === STATES.MARKED) flagTile(tile);
      if (tile.mine) tile.setState(STATES.EXPLODED);
    });
  });
};

const checkWin = (board) => {
  return board.every((row) => {
    return row.every((tile) => {
      return (
        tile.state === STATES.NUMBER ||
        (tile.mine &&
          (tile.state === STATES.INITIAL || tile.state === STATES.FLAGGED))
      );
    });
  });
};

const createGame = (boardSize, numberOfMines, onGameEnd) => {
  const board = [];

  const minesArray = Array(numberOfMines).fill(true);
  const clearArray = Array(boardSize * boardSize - numberOfMines).fill(false);
  const gameArray = clearArray
    .concat(minesArray)
    .sort(() => Math.random() - 0.5);

  for (let x = 0; x < boardSize; x++) {
    const row = [];
    for (let y = 0; y < boardSize; y++) {
      const tile = {
        position: { x, y },
        mine: gameArray[x * boardSize + y],
        state: STATES.INITIAL,
        setState(value) {
          if (this.setElementState) this.setElementState(value);
          this.state = value;
        },
      };
      row.push(tile);
    }
    board.push(row);
  }

  const revealTile = revealTileFn(board, onGameEnd);
  return { board, revealTile };
};

export { createGame, flagTile, STATES };
