import { STATES, createGame, flagTile } from "../core/minesweeper.js";

const LEVELS = {
  EASY: {
    boardSize: 10,
    numberOfMines: 10,
  },
  MEDIUM: {
    boardSize: 15,
    numberOfMines: 30,
  },
  HARD: {
    boardSize: 20,
    numberOfMines: 60,
  },
};

const revealSound = new Audio("sounds/reveal.mp3");
const flagSound = new Audio("sounds/flag.mp3");
const bombSound = new Audio("sounds/boom.mp3");

const levelEl = document.querySelector("#level");
const gameBoardEl = document.querySelector("#gameBoard");
const mineCountEl = document.querySelector("#mineCount");
const timerEl = document.querySelector("#timer");
const resultEl = document.querySelector("#result");

// to track if mouse is down when dragging it over another field
let isMouseDown = false;
window.addEventListener("mousedown", () => (isMouseDown = true));
window.addEventListener("mouseup", () => (isMouseDown = false));

const Timer = () => {
  let seconds = 0;
  let interval;
  const start = () =>
    (interval = setInterval(() => (timerEl.innerHTML = seconds++), 1000));
  const stop = () => clearInterval(interval);
  const reset = () => {
    stop();
    seconds = 0;
    timerEl.innerHTML = 0;
    start();
  };
  return { stop, reset };
};
const timer = Timer();

const newGame = () => {
  timer.reset();
  resultEl.textContent = "";

  const onGameEnd = (result) => {
    gameBoardEl.classList.add("ended");
    timer.stop();

    if (result === "win") {
      resultEl.textContent = "😎 Gg, you won! 😎";
    } else {
      bombSound.play();
      resultEl.textContent = "☠ Game over! You lost ☠";
    }
  };

  const { boardSize, numberOfMines } = LEVELS[levelEl.value];

  gameBoardEl.classList = "";
  gameBoardEl.innerHTML = "";

  const { board, revealTile } = createGame(boardSize, numberOfMines, onGameEnd);

  gameBoardEl.style.setProperty("--size", boardSize);
  mineCountEl.textContent = numberOfMines;

  board.forEach((row) => {
    row.forEach((tile) => {
      const element = document.createElement("button");
      const setElementState = (value) => (element.dataset.state = value);
      const setElementContent = (value) => (element.dataset.value = value);
      setElementState(STATES.INITIAL);
      gameBoardEl.append(element);

      const open = () => element.classList.add("open");
      const close = () => element.classList.remove("open");
      const revealHandler = (e) => {
        if (e.button === 0) {
          close();
          revealTile(tile);
          revealSound.play();
        }
      };
      const flagHandler = () => {
        const flaggedChange = flagTile(tile);
        mineCountEl.textContent =
          parseInt(mineCountEl.textContent) + flaggedChange;
        flagSound.play();
      };
      element.addEventListener("mousedown", (e) => e.button === 0 && open());
      element.addEventListener("mouseleave", close);
      element.addEventListener("mouseenter", () => isMouseDown && open());
      element.addEventListener("mouseup", revealHandler);
      element.addEventListener("click", revealHandler);
      element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        flagHandler();
      });
      element.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowDown":
            board[tile.position.x + 1]?.[tile.position.y].element.focus();
            break;
          case "ArrowUp":
            board[tile.position.x - 1]?.[tile.position.y].element.focus();
            break;
          case "ArrowLeft":
            board[tile.position.x][tile.position.y - 1]?.element.focus();
            break;
          case "ArrowRight":
            board[tile.position.x][tile.position.y + 1]?.element.focus();
            break;
          case "f":
          case "F":
            flagHandler();
            break;
          default:
            return;
        }
      });

      Object.assign(tile, { element, setElementState, setElementContent });
    });
  });

  gameBoardEl.children[0].focus();

  return false;
};

newGame();

document.querySelector("#form").addEventListener("submit", newGame);
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "r":
    case "R":
      newGame();
      break;
    case "l":
    case "L":
      levelEl.focus();
      break;
    default:
      return;
  }
});
