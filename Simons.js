let gameSeq = [];
let userSeq = [];

let btns = ["yellow", "red", "purple", "green"];

let started = false;
let level = 0;

let h2 = document.querySelector("h2");

/* SOUND EFFECTS */

const sounds = {
    yellow: new Audio("sounds/yellow.mp3"),
    red: new Audio("sounds/red.mp3"),
    purple: new Audio("sounds/purple.mp3"),
    green: new Audio("sounds/green.mp3")
};

document.addEventListener("keypress", function () {
    if (started == false) {
        console.log("game is started");
        started = true;
        levelUp();
    }
});

/* GAME FLASH */

function gameFlash(btn) {
    btn.classList.add("flash");

    let color = btn.getAttribute("id");
    sounds[color].play();

    setTimeout(function () {
        btn.classList.remove("flash");
    }, 200);
}

/* USER FLASH */

function userFlash(btn) {
    btn.classList.add("userflash");

    let color = btn.getAttribute("id");
    sounds[color].play();

    setTimeout(function () {
        btn.classList.remove("userflash");
    }, 200);
}

/* LEVEL UP */

function levelUp() {

    userSeq = [];
    level++;

    h2.innerText = `Level ${level}`;

    /* LEVEL GLOW EFFECT */

    h2.classList.add("level-up");
    setTimeout(() => {
        h2.classList.remove("level-up");
    }, 300);

    let randIdx = Math.floor(Math.random() * btns.length);
    let randColor = btns[randIdx];
    let randBtn = document.querySelector(`.${randColor}`);

    gameSeq.push(randColor);

    gameFlash(randBtn);
}

/* CHECK ANSWER */

function checkAns(idx){

    if(userSeq[idx] === gameSeq[idx]){

        if(userSeq.length == gameSeq.length){
            setTimeout(levelUp,600)
        }

    } else {

        h2.innerHTML = `Game Over! Your score was <b>${level}</b> <br> Press any key to Start`;

        document.body.classList.add("shake");

        setTimeout(()=>{
            document.body.classList.remove("shake");
        },500);

        reset();
    }
}

/* BUTTON PRESS */

function btnPress() {

    let btn = this;

    userFlash(btn);

    let userColor = btn.getAttribute("id");

    userSeq.push(userColor);

    console.log(userSeq);

    checkAns(userSeq.length-1);
}

/* BUTTON EVENTS */

let allBtns = document.querySelectorAll(".btn");

for (let btn of allBtns) {
    btn.addEventListener("click", btnPress);
}

/* RESET GAME */

function reset(){
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
}