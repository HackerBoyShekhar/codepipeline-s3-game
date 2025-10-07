/* 
  Behavior:
  - sessionPlayers (in localStorage) holds the tournament players (max 3)
  - each finished player enters their best score (higher is better)
  - after 3 unique players finish => show leaderboard automatically
  - Play Again clears the session and returns to name input
*/

const STORAGE_KEY = 'sessionPlayers';       // stores current tournament players (array)
const MAX_PLAYERS = 3;                      // EXACTLY 3 players per tournament

/* DOM */
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

let playerName = '';
let cards = [];
let flipped = [];
let matches = 0;
let startTime = 0;
let timerInterval = null;

/* emoji set used as cards */
const MEMES = ['😂','🔥','😎','🥶','💀','💩','😜','🤡'];

/* load session from storage or empty array */
function loadSession(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}
function saveSession(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* start tournament flow */
btnStart.addEventListener('click', () => {
  const name = inputName.value.trim();
  if(!name){ alert('Please enter your name'); return; }
  playerName = name;
  setupGameForPlayer();
});

/* restart round button (only restarts current round) */
btnRestart.addEventListener('click', () => {
  createBoard();
});

/* Play Again after leaderboard - resets tournament */
btnPlayAgain.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  // reset UI to name input for new tournament
  inputName.value = '';
  leaderboardScreen.classList.add('hidden');
  nameScreen.classList.remove('hidden');
});

/* prepare game UI for current player */
function setupGameForPlayer(){
  // show game, hide name/leaderboard
  nameScreen.classList.add('hidden');
  leaderboardScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  playerDisplay.textContent = `Player: ${playerName}`;
  startTimer();
  createBoard();
}

/* create shuffled board and reset status */
function createBoard(){
  stopTimer();
  timerLabel.textContent = '⏱ 0s';
  startTime = Date.now();
  startTimer();

  // prepare shuffled card set
  const pairSet = MEMES.slice(0, 8); // uses 8 pairs; adjust if needed
  cards = shuffle([...pairSet, ...pairSet]);
  matches = 0;
  flipped = [];

  // render
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

/* shuffle helper */
function shuffle(a){ return a.sort(()=> Math.random()-0.5); }

/* card click handler */
function onCardClick(e){
  const el = e.currentTarget;
  if(el.classList.contains('flipped')) return;
  if(flipped.length === 2) return;

  el.classList.add('flipped');
  el.textContent = el.dataset.sym;
  flipped.push(el);

  if(flipped.length === 2){
    setTimeout(checkPair, 700);
  }
}

/* check pair */
function checkPair(){
  if(flipped.length < 2) return;
  const [a,b] = flipped;
  if(a.dataset.sym === b.dataset.sym && a !== b){
    a.style.pointerEvents = 'none';
    b.style.pointerEvents = 'none';
    matches++;
  } else {
    a.classList.remove('flipped'); a.textContent = '?';
    b.classList.remove('flipped'); b.textContent = '?';
  }
  flipped = [];

  if(matches === MEMES.length){ roundComplete(); }
}

/* timer helpers */
function startTimer(){
  stopTimer();
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const sec = Math.floor((Date.now() - startTime)/1000);
    timerLabel.textContent = `⏱ ${sec}s`;
  }, 300);
}
function stopTimer(){
  if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
}

/* round complete - compute score and save to session */
function roundComplete(){
  stopTimer();
  const timeSec = Math.floor((Date.now() - startTime)/1000);
  // score formula: faster => higher. keep floor 10
  const score = Math.max(100 - timeSec, 10);

  // get existing session
  const session = loadSession();
  // check existing player entry -> keep best score
  const existing = session.find(p => p.name.toLowerCase() === playerName.toLowerCase());
  if(existing){
    if(score > existing.score) existing.score = score;
  } else {
    if(session.length < MAX_PLAYERS) session.push({ name: playerName, score });
    else {
      // if session already has 3 players, replace lowest if this is higher
      const minIdx = session.reduce((mi, cur, i, arr) => cur.score < arr[mi].score ? i : mi, 0);
      if(score > session[minIdx].score){
        session[minIdx] = { name: playerName, score };
      }
    }
  }
  saveSession(session);

  // if session reached exactly MAX_PLAYERS -> show leaderboard
  const after = loadSession();
  if(after.length >= MAX_PLAYERS){
    showLeaderboard();
  } else {
    // otherwise prompt next player: return to name screen
    setTimeout(()=> {
      alert(`Round finished! ${playerName} scored ${score}. Next player, please enter your name.`);
      // go to name input for next player
      inputName.value = '';
      gameScreen.classList.add('hidden');
      nameScreen.classList.remove('hidden');
    }, 300);
  }
}

/* show the leaderboard built from session (max 3) */
function showLeaderboard(){
  gameScreen.classList.add('hidden');
  leaderboardScreen.classList.remove('hidden');

  const session = loadSession().slice(); // copy
  // sort desc by score
  session.sort((a,b)=> b.score - a.score);

  // build UI (exactly up to 3 entries)
  leaderList.innerHTML = '';
  session.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `${p.name} — Score: ${p.score}`;
    // style rows similar to sample image: first gold, remaining darker shades
    if(i===0){
      li.classList.add('winner');
      li.innerHTML = `🏆 ${p.name} — WINNER 🎉 (Score: ${p.score})`;
      // celebratory effects
      if(soundAvailable(soundWin)) soundWin.play().catch(()=>{});
      launchConfetti();
    } else if(i===1){
      li.classList.add('loser-1');
      li.innerHTML = `💀 ${p.name} — Loser 😞 (Score: ${p.score})`;
      if(soundAvailable(soundLose)) soundLose.play().catch(()=>{});
    } else {
      li.classList.add('loser-2');
      li.innerHTML = `💀 ${p.name} — Loser 😞 (Score: ${p.score})`;
      if(soundAvailable(soundLose)) soundLose.play().catch(()=>{});
    }
    leaderList.appendChild(li);
  });
}

/* simple confetti */
function launchConfetti(){
  if(typeof confetti === 'function'){
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;
    (function frame(){
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
      if(Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

/* sound check helper */
function soundAvailable(el){ return !!(el && el.play); }

/* --- on load, restore session state if any --- */
(function init(){
  const session = loadSession();
  // if session already reached MAX_PLAYERS, show leaderboard directly
  if(session && session.length >= MAX_PLAYERS){
    nameScreen.classList.add('hidden');
    showLeaderboard();
    return;
  }
  // otherwise show name input
  nameScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  leaderboardScreen.classList.add('hidden');
})();

