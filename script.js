const STORAGE_KEY = 'sessionPlayers';
const MAX_PLAYERS = 3;

/* DOM elements */
const nameScreen = document.getElementById('name-screen');
const gameScreen = document.getElementById('game-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');
const inputName = document.getElementById('player-name');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnPlayAgain = document.getElementById('btn-playagain');
const playerDisplay = document.getElementById('player-display');
const timerLabel = document.getElementById('timer');
const gameBoard = document.getElementById('game-board');
const leaderList = document.getElementById('leader-list');
const soundWin = document.getElementById('sound-win');
const soundLose = document.getElementById('sound-lose');

let playerName = '', cards = [], flipped = [], matches = 0, startTime = 0, timerInterval = null;
const MEMES = ['😂','🔥','😎','🥶','💀','💩','😜','🤡'];

/* storage */
function loadSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveSession(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

/* buttons */
btnStart.addEventListener('click', () => {
  const name = inputName.value.trim();
  if (!name) return alert('Please enter your name');
  playerName = name;
  setupGameForPlayer();
});

btnRestart.addEventListener('click', createBoard);

btnPlayAgain.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  inputName.value = '';
  leaderboardScreen.classList.add('hidden');
  nameScreen.classList.remove('hidden');
});

/* setup */
function setupGameForPlayer() {
  nameScreen.classList.add('hidden');
  leaderboardScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  playerDisplay.textContent = `Player: ${playerName}`;
  startTimer();
  createBoard();
}

/* board */
function createBoard() {
  stopTimer();
  timerLabel.textContent = '⏱ 0s';
  startTime = Date.now();
  startTimer();
  const pairSet = MEMES.slice(0, 8);
  cards = shuffle([...pairSet, ...pairSet]);
  matches = 0;
  flipped = [];
  gameBoard.innerHTML = '';
  cards.forEach((sym, idx) => {
    const c = document.createElement('div');
    c.className = 'card';
    c.dataset.index = idx;
    c.dataset.sym = sym;
    c.textContent = '?';
    c.addEventListener('click', onCardClick);
    gameBoard.appendChild(c);
  });
}
function shuffle(a) { return a.sort(() => Math.random() - 0.5); }

/* card click */
function onCardClick(e) {
  const el = e.currentTarget;
  if (el.classList.contains('flipped') || flipped.length === 2) return;
  el.classList.add('flipped');
  el.textContent = el.dataset.sym;
  flipped.push(el);
  if (flipped.length === 2) setTimeout(checkPair, 700);
}

/* check pair */
function checkPair() {
  if (flipped.length < 2) return;
  const [a, b] = flipped;
  if (a.dataset.sym === b.dataset.sym && a !== b) {
    a.style.pointerEvents = b.style.pointerEvents = 'none';
    matches++;
  } else {
    a.classList.remove('flipped'); a.textContent = '?';
    b.classList.remove('flipped'); b.textContent = '?';
  }
  flipped = [];
  if (matches === MEMES.length) roundComplete();
}

/* timer */
function startTimer() {
  stopTimer();
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const sec = Math.floor((Date.now() - startTime) / 1000);
    timerLabel.textContent = `⏱ ${sec}s`;
  }, 300);
}
function stopTimer() { if (timerInterval) clearInterval(timerInterval); }

/* finish */
function roundComplete() {
  stopTimer();
  const timeSec = Math.floor((Date.now() - startTime) / 1000);
  const score = Math.max(100 - timeSec, 10);
  const session = loadSession();
  const existing = session.find(p => p.name.toLowerCase() === playerName.toLowerCase());
  if (existing) {
    if (score > existing.score) existing.score = score;
  } else {
    if (session.length < MAX_PLAYERS) session.push({ name: playerName, score });
    else {
      const minIdx = session.reduce((mi, cur, i, arr) => cur.score < arr[mi].score ? i : mi, 0);
      if (score > session[minIdx].score) session[minIdx] = { name: playerName, score };
    }
  }
  saveSession(session);
  const after = loadSession();
  if (after.length >= MAX_PLAYERS) showLeaderboard();
  else {
    setTimeout(() => {
      alert(`Round finished! ${playerName} scored ${score}. Next player, please enter your name.`);
      inputName.value = '';
      gameScreen.classList.add('hidden');
      nameScreen.classList.remove('hidden');
    }, 300);
  }
}

/* leaderboard */
function showLeaderboard() {
  gameScreen.classList.add('hidden');
  leaderboardScreen.classList.remove('hidden');
  const session = loadSession().slice().sort((a, b) => b.score - a.score);
  leaderList.innerHTML = '';
  session.forEach((p, i) => {
    const li = document.createElement('li');
    if (i === 0) {
      li.classList.add('winner');
      li.innerHTML = `🏆 ${p.name} — WINNER 🎉 (Score: ${p.score})`;
      playSound(soundWin);
      launchConfetti();
    } else {
      li.classList.add(i === 1 ? 'loser-1' : 'loser-2');
      li.innerHTML = `💀 ${p.name} — Loser 😞 (Score: ${p.score})`;
      playSound(soundLose);
    }
    leaderList.appendChild(li);
  });
}

/* confetti */
function launchConfetti() {
  if (typeof confetti === 'function') {
    const duration = 2500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}
function playSound(el) { if (el && el.play) el.play().catch(() => {}); }

/* init */
(function init() {
  const session = loadSession();
  if (session.length >= MAX_PLAYERS) {
    nameScreen.classList.add('hidden');
    showLeaderboard();
  } else {
    nameScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
  }
})();

