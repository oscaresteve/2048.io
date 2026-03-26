import { setState, state$ } from "../services/stateService.js";
import { createGameState, applyMove, isGameOver } from "../components/game.js";
import { saveGame } from "../services/gameService.js";
import { fetchGlobalRanking } from "../services/rankingService.js";
import { updateNickname } from "../services/userService.js";
import { logout } from "../services/authService.js";
import { uploadAvatar, getAvatar } from "../services/userService.js";
import defaultAvatar from "../assets/default-avatar.jpg"

let gameSubscription = null;
let keyListenerAdded = false;
let gameOver = false;

export function renderGameView(root) {
  root.innerHTML = `
  <div class="flex flex-row min-h-screen bg-gray-50 p-4 gap-4">

  <!-- Perfil -->
  <div class="w-1/4 bg-white p-4 rounded-xl shadow-md flex flex-col items-center gap-4">
    <img id="profileAvatar" class="w-24 h-24 rounded-full shadow-lg" src="" alt="Avatar">
    <div class="text-center">
      <p class="font-semibold text-gray-700"><span id="user-email"></span></p>
      <label for="nickname-input" class="block font-semibold mt-2">Nickname</label>
      <input id="nickname-input" type="text" class="w-full border rounded px-2 py-1 mt-1">
      <button id="update-nickname-btn" class="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Actualizar</button>
    </div>
    <form id="avatarForm" class="flex flex-col gap-2 w-full">
      <input class="border rounded px-2 py-1" type="file" name="avatar" accept="image/*" />
      <button class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" type="submit">Subir foto</button>
    </form>
    <p id="text-msg" class="text-l mt-1"></p>
    <button id="logout-btn" class="mt-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full">Cerrar sesión</button>
  </div>

  <!-- Juego -->
  <div class="flex-1 flex flex-col items-center">
    <h1 class="text-4xl font-extrabold mb-4 text-gray-800">2048 Adventure</h1>

    <!-- HUD -->
    <div class="flex gap-4 mb-4">
      <div class="px-4 py-2 bg-purple-600 text-white rounded-xl shadow text-lg font-bold">Nivel: <span id="level">1</span></div>
      <div class="px-4 py-2 bg-gray-100 rounded-xl shadow text-gray-700 font-semibold">Puntuación: <span id="score" class="font-bold">0</span></div>
      <div class="px-4 py-2 bg-gray-100 rounded-xl shadow text-gray-700 font-semibold">Máxima puntuación: <span id="max-score" class="font-bold">0</span></div>
    </div>

    <!-- Objetivo -->
    <div class="mb-4 flex flex-col items-center">

      <div class="targetBoard shadow-xl rounded-lg p-2">
        <div id="target-tile" class="tile tile-16">16</div>
      </div>
    </div>

    <!-- Tablero -->
    <div id="game-board" class="board shadow-xl rounded-lg p-2"></div>

    <!-- Controles -->
    <div class="mt-6 flex gap-4">
      <button id="restart-game" class="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition">Reiniciar partida</button>
      <button id="restart-level" class="px-4 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600 transition">Reiniciar nivel</button>
    </div>

    <div id="game-over-container" class="text-red-600 text-xl font-bold mt-3"></div>

    <!-- Reglas -->
    <div class="mt-auto mb-4 w-full flex justify-center">
      <p class="text-l text-gray-500 text-center leading-relaxed max-w-xl">
        Usa las <span class="font-semibold">flechas del teclado</span> para mover todas las fichas en una dirección.
        Cuando dos fichas con el mismo valor chocan, se <span class="font-semibold">fusionan en una sola</span> sumando puntos.
        Alcanza la ficha <span class="font-semibold">objetivo</span> para <span class="font-semibold">avanzar de nivel</span>.
        Cuantos más niveles superes y más fusiones hagas, <span class="font-semibold">mayor será tu puntuación</span>.
      </p>
    </div>

  </div>

  <!-- Ranking -->
  <div class="w-1/4 bg-white p-4 rounded-xl shadow-md flex flex-col gap-2">
    <h2 class="text-2xl font-bold mb-2">Ranking Global</h2>
    <ul id="ranking-list" class="flex flex-col gap-1 overflow-y-auto max-h-[70vh]"></ul>
  </div>

</div>

  `;

  const gameBoard = root.querySelector("#game-board");
  const score = root.querySelector("#score");
  const maxScore = root.querySelector("#max-score");
  const level = document.getElementById("level");
  const gameOverContainer = root.querySelector("#game-over-container");
  const restartGameButton = root.querySelector("#restart-game");
  const restartLevelButton = root.querySelector("#restart-level");
  const rankingList = root.querySelector("#ranking-list");
  const userEmailSpan = root.querySelector("#user-email");
  const nicknameInput = root.querySelector("#nickname-input");
  const updateNicknameBtn = root.querySelector("#update-nickname-btn");
  const textMsg = root.querySelector("#text-msg");
  const targetTile = document.getElementById("target-tile");
  const logoutBtn = root.querySelector("#logout-btn");
  const avatarForm = root.querySelector("#avatarForm");
  const profileAvatar = root.querySelector("#profileAvatar");

  function renderGameOverText() {
    gameOverContainer.textContent = gameOver ? "¡No puedes hacer mas movimientos!" : "";
  }

  function renderBoard(gameBoard, grid) {
    gameBoard.innerHTML = "";

    grid.forEach((row) =>
      row.forEach((tile) => {
        const div = document.createElement("div");
        div.className = "tile";

        if (tile) {
          div.textContent = tile.value;
          div.classList.add(`tile-${tile.value}`);
        }

        gameBoard.appendChild(div);
      })
    );
  }

  async function updateRanking() {
    const { success, data: ranking, error } = await fetchGlobalRanking();

    if (!success) {
      console.error("No se pudo actualizar el ranking:", error.message);
      rankingList.innerHTML = `<li class="text-red-500">No se pudo cargar el ranking</li>`;
      return;
    }

    const currentNickname = state$.value.user?.nickname;

    rankingList.innerHTML = ranking
      .map((user, index) => {
        const isCurrent = user.nickname === currentNickname;

        return `
        <li class="flex justify-between py-1 px-2 rounded mb-1 ${
          isCurrent ? "bg-yellow-200 font-bold" : ""
        }">
          <span>${index + 1}. ${user.nickname}</span>
          <span>${user.max_score}</span>
        </li>
      `;
      })
      .join("");
  }

  if (!state$.value.user.game) {
    const prevUser = state$.value.user;
    const newGame = createGameState();
    setState({ user: { ...prevUser, game: newGame } });
  }

  if (!keyListenerAdded) {
    keyListenerAdded = true;

    window.addEventListener("keydown", (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        !gameOver
      ) {
        e.preventDefault();

        const prevUser = state$.value.user;
        if (!prevUser || !prevUser.game) return;

        const newGame = applyMove(prevUser.game, e.key);

        const newMaxScore = Math.max(
          prevUser.max_score ?? 0,
          newGame.score ?? 0
        );

        setState({
          user: {
            ...prevUser,
            game: newGame,
            max_score: newMaxScore,
          },
        });
      }
    });
  }

  if (!gameSubscription) {
    gameSubscription = state$.subscribe(async (state) => {
      const { user } = state;
      if (!user || !user.game) return;

      const game = user.game;

      renderBoard(gameBoard, game.grid);

      score.textContent = game.score;
      maxScore.textContent = user.max_score ?? 0;
      level.textContent = game.level;

      targetTile.textContent = game.target;
      targetTile.className = "tile";
      targetTile.classList.add(`tile-${game.target}`);

      gameOver = isGameOver(game);
      renderGameOverText();

      await saveGame();

      updateRanking();

      if (game.levelCompleted) {
        const nextLevel = game.level + 1;
        const newLevelGame = createGameState(5, nextLevel);

        setState({
          user: {
            ...state.user,
            game: newLevelGame,
          },
        });
        return;
      }
    });
  }

  if (state$.value.user) {
    userEmailSpan.textContent = state$.value.user.email;
    nicknameInput.value = state$.value.user.nickname ?? "";
    profileAvatar.src = state$.value.user.avatar_url || defaultAvatar;
  }

  updateNicknameBtn.addEventListener("click", async () => {
    const prevUser = state$.value.user;

    const newNickname = nicknameInput.value.trim();
    if (!newNickname || newNickname === prevUser.nickname) return;

    const { success, error } = await updateNickname(
      prevUser.email,
      prevUser.token,
      newNickname
    );

    if (success) {
      setState({
        user: {
          ...prevUser,
          nickname: newNickname,
        },
      });

      updateRanking();

      textMsg.textContent = "Nickname actualizado correctamente!";
      textMsg.className = "text-green-500 text-l text-center mt-1";
      setTimeout(() => (textMsg.textContent = ""), 3000);
    } else {
      textMsg.textContent = "No se pudo actualizar el nickname";
      textMsg.className = "text-red-500 text-l text-center mt-1";
      setTimeout(() => (textMsg.textContent = ""), 3000);
    }
  });

  restartGameButton.addEventListener("click", (e) => {
    e.preventDefault();

    const prevUser = state$.value.user;
    if (!prevUser || !prevUser.game) return;

    const newGame = createGameState();

    setState({
      user: {
        ...prevUser,
        game: newGame,
      },
    });

    gameOver = false;
  });

  restartLevelButton.addEventListener("click", (e) => {
    e.preventDefault();

    const prevUser = state$.value.user;
    if (!prevUser || !prevUser.game) return;

    const newGame = createGameState(5, prevUser.game.level);

    setState({
      user: {
        ...prevUser,
        game: newGame,
      },
    });

    gameOver = false;
  });

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (gameSubscription) {
      gameSubscription.unsubscribe();
      gameSubscription = null;
    }

    keyListenerAdded = false;
    gameOver = false;

    logout();
  });

  avatarForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    const file = formData.get("avatar");

    if (!file || file.size === 0) {
      textMsg.textContent = "Selecciona una imagen";
      textMsg.className = "text-red-500 text-l text-center mt-1";
      setTimeout(() => (textMsg.textContent = ""), 3000);
      return;
    }

    const { email, token } = state$.value.user;

    const { success } = await uploadAvatar(formData, email, token);

    if (success) {
      const avatar_url = await getAvatar(email, token);

      profileAvatar.src = avatar_url || defaultAvatar;
      textMsg.textContent = "Imagen subida correctamente!";
      textMsg.className = "text-green-500 text-l text-center mt-1";
      setTimeout(() => (textMsg.textContent = ""), 3000);
      const currentUser = state$.value.user;

      setState({
        user: {
          ...currentUser,
          avatar_url,
        },
      });

      avatarForm.reset();
    } else {
      textMsg.textContent = "Error subiendo imagen";
      textMsg.className = "text-red-500 text-l text-center mt-1";
      setTimeout(() => (textMsg.textContent = ""), 3000);
    }

  });

  updateRanking();
}
