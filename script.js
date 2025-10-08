document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro-screen');
  const gameContainer = document.getElementById('game-container');
  const gameBoard = document.getElementById('game-board');
  const startBtn = document.getElementById('start-btn');
  const startGameBtn = document.getElementById('start-game');
  const modal = document.getElementById('modal');
  const playAgainBtn = document.getElementById('play-again');
  const winnerScreen = document.getElementById('winner-screen');
  const restartAllBtn = document.getElementById('restart-all');
  const bgMusic = document.getElementById('bg-music');
  const flipSound = document.getElementById('flip-sound');
  const matchSound = document.getElementById('match-sound');
  const winSound = document.getElementById('win-sound');
  const playerNameInput = document.getElementById('player-name');
  const displayName = document.getElementById('display-name');
  const finalPlayer = document.getElementById('final-player');
  const timerDisplay = document.getElementById('timer');
  const scoreDisplay = document.getElementById('score');
  const finalTime = document.getElementById('final-time');
  const winnerName = document.getElementById('winner-name');
  const losersList = document.getElementById('losers-list');

  let playerName = '';
  let timer, time = 0, score = 0;
  let cardsChosen = [], cardsChosenId = [], cardsWon = [];
  let playersData = [];

  const cardArray = [
    { name: 'distracted', img: 'images/distracted.png' },
    { name: 'drake', img: 'images/drake.png' },
    { name: 'fine', img: 'images/fine.png' },
    { name: 'rollsafe', img: 'images/rollsafe.png' },
    { name: 'success', img: 'images/success.png' },
  ];

  const gameCards = [...cardArray, ...cardArray];

  // Start Game Button (intro)
  startBtn.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName === '') return alert('Please enter your name!');
    intro.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    displayName.textContent = playerName;
    bgMusic.play();
    startGame();
  });

  // Shuffle Function
  function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }

  // Start Game Logic
  function startGame() {
    shuffle(gameCards);
    gameBoard.innerHTML = '';
    cardsChosen = [];
    cardsChosenId = [];
    cardsWon = [];
    score = 0;
    time = 0;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = time;

    clearInterval(timer);
    timer = setInterval(() => {
      time++;
      timerDisplay.textContent = time;
    }, 1000);

    gameCards.forEach((item, i) => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">🎭</div>
          <div class="card-back" style="background-image: url(${item.img})"></div>
        </div>
      `;
      card.dataset.id = i;
      card.addEventListener('click', flipCard);
      gameBoard.appendChild(card);
    });
  }

  // Flip Card
  function flipCard() {
    const card = this;
    const id = card.dataset.id;

    if (cardsChosenId.includes(id) || card.classList.contains('flip')) return;

    flipSound.play();
    card.classList.add('flip');
    cardsChosen.push(gameCards[id].name);
    cardsChosenId.push(id);

    if (cardsChosen.length === 2) setTimeout(checkForMatch, 600);
  }

  // Check for Match
  function checkForMatch() {
    const cards = document.querySelectorAll('.card');
    const [firstId, secondId] = cardsChosenId;
    const [firstName, secondName] = cardsChosen;

    if (firstName === secondName && firstId !== secondId) {
      matchSound.play();
      score += 10;
      scoreDisplay.textContent = score;
      cards[firstId].style.visibility = 'hidden';
      cards[secondId].style.visibility = 'hidden';
      cardsWon.push(cardsChosen);
    } else {
      cards[firstId].classList.remove('flip');
      cards[secondId].classList.remove('flip');
    }

    cardsChosen = [];
    cardsChosenId = [];

    if (cardsWon.length === gameCards.length / 2) {
      endGame();
    }
  }

  // End Game
  function endGame() {
    clearInterval(timer);
    winSound.play();
    finalPlayer.textContent = playerName;
    finalTime.textContent = time;
    playersData.push({ name: playerName, score, time });
    modal.classList.remove('hidden');

    if (playersData.length === 5) {
      showFinalWinner();
    }
  }

  // Play Again
  playAgainBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    startGame();
  });

  // Show Winner Screen after 5 players
  function showFinalWinner() {
    modal.classList.add('hidden');
    gameContainer.classList.add('hidden');
    bgMusic.pause();

    playersData.sort((a, b) => b.score - a.score || a.time - b.time);
    const winner = playersData[0];

    winnerName.textContent = `🏅 ${winner.name.toUpperCase()} 🏅`;
    losersList.innerHTML = playersData
      .slice(1)
      .map(p => `<p>😅 ${p.name} — Loser</p>`)
      .join('');

    winnerScreen.classList.remove('hidden');
  }

  // Restart Tournament
  restartAllBtn.addEventListener('click', () => {
    playersData = [];
    winnerScreen.classList.add('hidden');
    intro.classList.remove('hidden');
  });

  // Restart Single Game
  startGameBtn.addEventListener('click', startGame);
});

