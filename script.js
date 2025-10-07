const startBtn = document.getElementById('start-btn');
const playerInput = document.getElementById('player-name');
const playerDisplay = document.getElementById('player-display');
const gameBoard = document.getElementById('game-board');
const restartBtn = document.getElementById('restart-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const playAgainBtn = document.getElementById('play-again');
const bgMusic = document.getElementById('bg-music');
const flipSound = document.getElementById('flip-sound');
const winSound = document.getElementById('win-sound');

let currentPlayer = '';
let leaderboard = [];
let cardsChosen = [];
let cardsChosenId = [];
let cardsWon = [];

const cardArray = [
  { name: 'card1', img: 'images/distracted.png' },
  { name: 'card1', img: 'images/distracted.png' },
  { name: 'card2', img: 'images/drake.png' },
  { name: 'card2', img: 'images/drake.png' },
  { name: 'card3', img: 'images/fine.png' },
  { name: 'card3', img: 'images/fine.png' },
  { name: 'card4', img: 'images/rollsafe.png' },
  { name: 'card4', img: 'images/rollsafe.png' },
  { name: 'card5', img: 'images/success.png' },
  { name: 'card5', img: 'images/success.png' },
];

function shuffle(array) {
  array.sort(() => 0.5 - Math.random());
}

function createBoard() {
  shuffle(cardArray);
  gameBoard.innerHTML = '';
  for (let i = 0; i < cardArray.length; i++) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = i;

    const inner = document.createElement('div');
    inner.classList.add('card-inner');

    const front = document.createElement('div');
    front.classList.add('card-front');
    front.innerHTML = '🃏';

    const back = document.createElement('div');
    back.classList.add('card-back');
    const img = document.createElement('img');
    img.src = cardArray[i].img;
    back.appendChild(img);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  }
}

function flipCard() {
  flipSound.play();
  const cardId = this.dataset.id;
  const card = this;
  if (!cardsChosenId.includes(cardId) && cardsChosen.length < 2) {
    card.classList.add('flipped');
    cardsChosen.push(cardArray[cardId].name);
    cardsChosenId.push(cardId);
  }

  if (cardsChosen.length === 2) {
    setTimeout(checkForMatch, 700);
  }
}

function checkForMatch() {
  const cards = document.querySelectorAll('.card');
  const [firstId, secondId] = cardsChosenId;

  if (cardsChosen[0] === cardsChosen[1] && firstId !== secondId) {
    cards[firstId].style.visibility = 'hidden';
    cards[secondId].style.visibility = 'hidden';
    cardsWon.push(cardsChosen);
  } else {
    cards[firstId].classList.remove('flipped');
    cards[secondId].classList.remove('flipped');
  }

  cardsChosen = [];
  cardsChosenId = [];

  if (cardsWon.length === cardArray.length / 2) {
    setTimeout(() => {
      winSound.play();
      handleWin();
    }, 800);
  }
}

function handleWin() {
  leaderboard.push({ name: currentPlayer, score: cardsWon.length });
  if (leaderboard.length >= 3) {
    showLeaderboard();
  } else {
    alert(`Nice job, ${currentPlayer}! Next player's turn.`);
    showIntro();
  }
}

function showIntro() {
  document.getElementById('intro-screen').classList.add('active');
  document.getElementById('game-screen').classList.add('hidden');
  playerInput.value = '';
}

function showGame() {
  document.getElementById('intro-screen').classList.remove('active');
  document.getElementById('intro-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  createBoard();
  playerDisplay.textContent = `👤 Player: ${currentPlayer}`;
}

function showLeaderboard() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('leaderboard-screen').classList.remove('hidden');
  leaderboardList.innerHTML = leaderboard
    .map((p, i) => {
      const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
      return `<div class="leaderboard-item">${emoji} ${p.name} — ${p.score * 10} pts</div>`;
    })
    .join('');
}

startBtn.addEventListener('click', () => {
  const name = playerInput.value.trim();
  if (name) {
    currentPlayer = name;
    bgMusic.play();
    cardsWon = [];
    cardsChosen = [];
    cardsChosenId = [];
    showGame();
  } else {
    alert('Please enter your name!');
  }
});

restartBtn.addEventListener('click', () => {
  const confirmRestart = confirm(
    'Are you sure you want to restart the round? This will clear all leaderboard data.'
  );
  if (confirmRestart) {
    leaderboard = [];
    cardsWon = [];
    showIntro();
  }
});

playAgainBtn.addEventListener('click', () => {
  leaderboard = [];
  showIntro();
});

