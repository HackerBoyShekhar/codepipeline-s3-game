document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('game-board');
    const startBtn = document.getElementById('start-game');
    const playerInput = document.getElementById('player-name');
    const playerForm = document.getElementById('player-form');
    const gameStats = document.getElementById('game-stats');
    const timerEl = document.getElementById('timer');
    const scoreEl = document.getElementById('score');
    const modal = document.getElementById('modal');
    const winnerList = document.getElementById('winner-list');
    const playAgainBtn = document.getElementById('play-again');

    const flipSound = document.getElementById('flip-sound');
    const matchSound = document.getElementById('match-sound');
    const winSound = document.getElementById('win-sound');

    let cardsChosen = [], cardsChosenId = [], cardsWon = [], score = 0, timer=0, interval;
    const maxPlayers = 5;
    const players = [];

    const cardArray = [
        {name:'card1',img:'https://i.imgur.com/ZVbqP2C.png'},
        {name:'card1',img:'https://i.imgur.com/ZVbqP2C.png'},
        {name:'card2',img:'https://i.imgur.com/fXK0Mka.png'},
        {name:'card2',img:'https://i.imgur.com/fXK0Mka.png'},
        {name:'card3',img:'https://i.imgur.com/DPxYhQf.png'},
        {name:'card3',img:'https://i.imgur.com/DPxYhQf.png'},
        {name:'card4',img:'https://i.imgur.com/ieJML6v.png'},
        {name:'card4',img:'https://i.imgur.com/ieJML6v.png'},
        {name:'card5',img:'https://i.imgur.com/2y8A1pq.png'},
        {name:'card5',img:'https://i.imgur.com/2y8A1pq.png'},
    ];

    function shuffle(array){array.sort(()=>0.5 - Math.random());}

    function startGame(){
        const playerName = playerInput.value.trim();
        if(!playerName) return alert('Enter your name!');
        if(players.length >= maxPlayers) return alert('Maximum 5 players reached!');
        players.push({name:playerName, score:0});
        playerForm.classList.add('hidden');
        gameStats.classList.remove('hidden');
        resetBoard();
        interval = setInterval(()=>{timer++; timerEl.textContent=timer;},1000);
    }

    function resetBoard(){
        shuffle(cardArray);
        grid.innerHTML='';
        cardsChosen=[]; cardsChosenId=[]; cardsWon=[];
        score=0; scoreEl.textContent=score;
        for(let i=0;i<cardArray.length;i++){
            const card = document.createElement('div');
            card.classList.add('card');
            card.setAttribute('data-id',i);
            card.innerHTML = `<div class="card-inner">
                <div class="card-front">❓</div>
                <div class="card-back" style="background-image:url(${cardArray[i].img})"></div>
            </div>`;
            card.addEventListener('click', flipCard);
            grid.appendChild(card);
        }
    }

    function flipCard(){
        const cardId = this.getAttribute('data-id');
        if(cardsChosenId.includes(cardId)) return;
        flipSound.play();
        cardsChosen.push(cardArray[cardId].name);
        cardsChosenId.push(cardId);
        this.classList.add('flip');

        if(cardsChosen.length===2){
            setTimeout(checkMatch,500);
        }
    }

    function checkMatch(){
        const cards = document.querySelectorAll('.card');
        const [firstId,secondId] = cardsChosenId;

        if(cardsChosen[0]===

