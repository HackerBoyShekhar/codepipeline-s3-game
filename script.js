const startBtn = document.getElementById("start-btn");
const playerInput = document.getElementById("player-name");
const nameScreen = document.getElementById("name-screen");
const gameArea = document.getElementById("game-area");
const playerDisplay = document.getElementById("player-display");
const gameBoard = document.getElementById("game-board");
const leaderboardDiv = document.getElementById("leaderboard");
const leaderList = document.getElementById("leader-list");
const playAgainBtn = document.getElementById("play-again");
const timerDisplay = document.getElementById("timer");
const winSound = document.getElementById("win-sound");
const loseSound = document.getElementById("lose-sound");

let playerName = "";
let flippedCards = [];
let matchedPairs = 0;
let roundCount = 0;
let startTime, timerInterval;
let playersData = JSON.parse(localStorage.getItem("playersData")) || [];

const memes = ["😂","🔥","😎","🥶","💀","💩","😜","🤡"];

startBtn.addEventListener("click", () => {
  playerName = playerInput.value.trim();
  if (!playerName) return alert("Please enter your name!");
  nameScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  playerDisplay.textContent = `🎯 Player: ${playerName}`;
  startGame();
});

function startGame() {
  matchedPairs = 0;
  flippedCards = [];
  startTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  const cards = [...memes, ...memes].sort(() => Math.random() - 0.5);
  gameBoard.innerHTML = "";
  cards.forEach(symbol => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.textContent = "?";
    card.dataset.symbol = symbol;
    card.addEventListener("click", flipCard);
    gameBoard.appendChild(card);
  });
}

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `⏱️ Time: ${seconds}s`;
}

function flipCard() {
  if (flippedCards.length === 2 || this.classList.contains("flipped")) return;
  this.classList.add("flipped");
  this.textContent = this.dataset.symbol;
  flippedCards.push(this);
  if (flippedCards.length === 2) setTimeout(checkMatch, 800);
}

function checkMatch() {
  const [c1, c2] = flippedCards;
  if (c1.dataset.symbol === c2.dataset.symbol) {
    matchedPairs++;
    c1.style.pointerEvents = "none";
    c2.style.pointerEvents = "none";
    if (matchedPairs === memes.length) endRound();
  } else {
    c1.classList.remove("flipped");
    c2.classList.remove("flipped");
    c1.textContent = "?";
    c2.textContent = "?";
  }
  flippedCards = [];
}

function endRound() {
  clearInterval(timerInterval);
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const score = Math.max(100 - timeTaken, 10);
  
  const bonus = document.createElement("div");
  bonus.classList.add("bonus");
  bonus.textContent = `+${score} Speed Bonus!`;
  gameArea.appendChild(bonus);
  setTimeout(() => bonus.remove(), 1500);

  roundCount++;
  playersData.push({ name: playerName, score });
  
  if (roundCount >= 3) showLeaderboard();
  else setTimeout(startGame, 2000);
}

function showLeaderboard() {
  gameArea.classList.add("hidden");
  leaderboardDiv.classList.remove("hidden");
  playersData = playersData.slice(-5);
  localStorage.setItem("playersData", JSON.stringify(playersData));

  const sorted = [...playersData].sort((a,b) => b.score - a.score);
  leaderList.innerHTML = "";

  sorted.forEach((p, i) => {
    const li = document.createElement("li");
    if (i === 0) {
      li.classList.add("winner");
      li.innerHTML = `🏆 ${p.name} — WINNER 🎉 (Score: ${p.score})`;
      winSound.play();
      launchConfetti();
    } else {
      li.innerHTML = `💀 ${p.name} — Loser 😞 (Score: ${p.score})`;
      loseSound.play();
    }
    leaderList.appendChild(li);
  });
}

playAgainBtn.addEventListener("click", () => {
  leaderboardDiv.classList.add("hidden");
  nameScreen.classList.remove("hidden");
  roundCount = 0;
});

function launchConfetti() {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

