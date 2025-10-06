document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('#game-board');
  const startButton = document.getElementById('start-game');
  const modal = document.getElementById('modal');
  const playAgainButton = document.getElementById('play-again');
  const timerDisplay = document.getElementById('timer');
  const scoreDisplay = document.getElementById('score');
  const finalTime = document.getElementById('final-time');

  let cardsChosen = [];
  let cardsChosenId = [];
  let cardsWon = [];
  let time = 0;
  let timer;
  let score = 0;

  const cardArray = [
    { name: 'distracted', img: 'images/distracted.png' },
    { name: 'drake', img: 'images/drake.png' },
    { name: 'fine', img: 'images/fine.png' },
    { name: 'rollsafe', img: 'images/rollsafe.png' },
    { name: 'success', img: 'images/success.png' },
  ];

  const gameCards = [...cardArray, ...cardArray];

  function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }

  function createBoard() {
    grid.innerHTML = '';
    shuffle(gameCards);
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
      grid.appendChild(card);
    });
    resetStats();
  }

  function resetStats() {
    cardsChosen = [];
    cardsChosenId = [];
    cardsWon = [];
    score = 0;
    time = 0;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = time;
    clearInterval(timer);
  }

  function startGame() {
    createBoard();
    clearInterval(timer);
    timer = setInterval(() => {
      time++;
      timerDisplay.textContent = time;
    }, 1000);
  }

  function flipCard() {
    const card = this;
    const cardId = card.dataset.id;
    if (cardsChosenId.includes(cardId) || card.classList.contains('flip')) return;
    card.classList.add('flip');
    cardsChosen.push(gameCards[cardId].name);
    cardsChosenId.push(cardId);
    if (cardsChosen.length === 2) {
      setTimeout(checkForMatch, 700);
    }
  }

  function checkForMatch() {
    const cards = document.querySelectorAll('.card');
    const [firstId, secondId] = cardsChosenId;
    const [firstName, secondName] = cardsChosen;

    if (firstName === secondName && firstId !== secondId) {
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
      clearInterval(timer);
      finalTime.textContent = time;
      modal.classList.remove('hidden');
    }
  }

  startButton.addEventListener('click', startGame);
  playAgainButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    startGame();
  });
});
