const buttons = document.querySelectorAll(".options button");

const playerChoice = document.querySelector(".playerChoice");
const pcChoice = document.querySelector(".pcChoice");

const playerScore = document.querySelector(".playerScore");
const pcScore = document.querySelector(".pcScore");

const message = document.querySelector(".msg");
const roundStatus = document.querySelector(".round-status");
const modeSelect = document.querySelector(".game-mode");
const difficultySelect = document.querySelector(".difficulty");
const roundLimitSelect = document.querySelector(".round-limit");
const soundToggle = document.querySelector(".sound-toggle");
const historyList = document.querySelector(".game-history");
const newMatchButton = document.querySelector(".new-match");
const opponentLabel = document.querySelector(".opponent-label");

let playerPoints = 0;
let computerPoints = 0;
let localPlayerChoice = null;
let history = [];
let matchFinished = false;
const HISTORY_KEY = "rps-round-history";
try {
  const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  if (Array.isArray(savedHistory))
    history = savedHistory
      .filter((entry) => typeof entry === "string")
      .slice(0, 8);
} catch {
  history = [];
}

const choices = ["Rock", "Paper", "Scissor"];

function getComputerChoice() {
  const difficulty = difficultySelect.value;
  if (difficulty === "hard") {
    return choices[(choices.indexOf(lastPlayerChoice) + 1) % choices.length];
  }
  if (difficulty === "easy" && Math.random() < 0.65) {
    return choices[(choices.indexOf(lastPlayerChoice) + 2) % choices.length];
  }
  const randomIndex = Math.floor(Math.random() * choices.length);

  return choices[randomIndex];
}

let lastPlayerChoice = "Rock";

function playSound(winner) {
  if (!soundToggle.checked) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value =
    winner === "draw" ? 300 : winner === "player" ? 620 : 190;
  gain.gain.setValueAtTime(0.08, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.16);
  oscillator.onended = () => context.close();
}

function getWinner(player, computer) {
  if (player === computer) {
    return "draw";
  }

  if (
    (player === "Rock" && computer === "Scissor") ||
    (player === "Paper" && computer === "Rock") ||
    (player === "Scissor" && computer === "Paper")
  ) {
    return "player";
  }

  return "computer";
}

function playGame(player, opponent) {
  if (matchFinished) return;
  const computer = opponent || getComputerChoice();
  lastPlayerChoice = player;

  // Display choices

  playerChoice.textContent = player;
  pcChoice.textContent = computer;

  // Find winner

  const winner = getWinner(player, computer);

  //  Result

  if (winner === "player") {
    playerPoints++;

    message.textContent =
      modeSelect.value === "local" ? "Player 1 wins this round!" : "You win!";
    message.style.color = "#22c55e";
  } else if (winner === "computer") {
    computerPoints++;

    message.textContent =
      modeSelect.value === "local"
        ? "Player 2 wins this round!"
        : "Computer wins!";
    message.style.color = "#ef4444";
  } else {
    message.textContent = " It's a draw!";
    message.style.color = "#f59e0b";
  }

  // UPDATE SCORE

  playerScore.textContent = playerPoints;
  pcScore.textContent = computerPoints;
  history.unshift(
    `${player} vs ${computer}: ${winner === "draw" ? "Draw" : winner === "player" ? (modeSelect.value === "local" ? "Player 1" : "You") + " won" : (modeSelect.value === "local" ? "Player 2" : "Computer") + " won"}`,
  );
  history = history.slice(0, 8);
  renderHistory();
  playSound(winner);
  const winsNeeded = Math.ceil(Number(roundLimitSelect.value) / 2);
  if (playerPoints >= winsNeeded || computerPoints >= winsNeeded) {
    matchFinished = true;
    roundStatus.textContent = `${playerPoints > computerPoints ? (modeSelect.value === "local" ? "Player 1" : "You") : modeSelect.value === "local" ? "Player 2" : "Computer"} won the match.`;
  } else {
    roundStatus.textContent = `First to ${winsNeeded} ${winsNeeded === 1 ? "win" : "wins"}.`;
  }
}

function renderHistory() {
  historyList.replaceChildren();
  history.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    historyList.appendChild(item);
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function resetMatch() {
  playerPoints = 0;
  computerPoints = 0;
  localPlayerChoice = null;
  matchFinished = false;
  playerChoice.textContent = "-";
  pcChoice.textContent = "-";
  playerScore.textContent = "0";
  pcScore.textContent = "0";
  message.textContent = "";
  roundStatus.textContent =
    modeSelect.value === "local"
      ? "Player 1, make your choice."
      : "First to " + Math.ceil(Number(roundLimitSelect.value) / 2) + " wins.";
}

// Button even

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const playerChoiceValue = button.textContent;
    if (modeSelect.value === "local") {
      if (!localPlayerChoice) {
        localPlayerChoice = playerChoiceValue;
        roundStatus.textContent = "Player 2, make your choice.";
        playerChoice.textContent = "Player 1 is ready";
        pcChoice.textContent = "Waiting";
        return;
      }
      playGame(localPlayerChoice, playerChoiceValue);
      localPlayerChoice = null;
      if (!matchFinished)
        roundStatus.textContent = "Player 1, make your choice.";
      return;
    }
    playGame(playerChoiceValue);
  });
});

newMatchButton.addEventListener("click", resetMatch);
modeSelect.addEventListener("change", () => {
  difficultySelect.disabled = modeSelect.value === "local";
  opponentLabel.textContent =
    modeSelect.value === "local" ? "Player 2" : "Computer";
  resetMatch();
});
roundLimitSelect.addEventListener("change", resetMatch);
difficultySelect.disabled = modeSelect.value === "local";
opponentLabel.textContent =
  modeSelect.value === "local" ? "Player 2" : "Computer";
renderHistory();
resetMatch();
