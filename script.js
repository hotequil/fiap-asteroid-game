const canvas = document.querySelector('[data-canvas]');

if(!canvas?.getContext){ 
    const msg = 'seu browser não suporta canvas, atualize ele ou troque de navegador';
    
    alert(msg);
    throw Error(msg);
}

const sizeObj = 50;
const initImg = () => new Image(sizeObj, sizeObj);
const planeUp = initImg();
const planeLeft = initImg();
const planeRight = initImg();
const planeDown = initImg();
const asteroidUp = initImg();
const asteroidLeft = initImg();
const asteroidRight = initImg();
const asteroidDown = initImg();
let asteroid = initImg();
let plane = initImg();

planeUp.src = './imgs/plane-up.png';
planeLeft.src = './imgs/plane-left.png';
planeRight.src = './imgs/plane-right.png';
planeDown.src = './imgs/plane-down.png';
asteroidUp.src = './imgs/asteroid-up.png';
asteroidLeft.src = './imgs/asteroid-left.png';
asteroidRight.src = './imgs/asteroid-right.png';
asteroidDown.src = './imgs/asteroid-down.png';
plane = planeUp;

const initObj = isPlane => isPlane ? ({ x: (canvasWidth / 2) - (sizeObj / 2), y: (canvasHeight / 2) - (sizeObj / 2) }) : { x: -9999, y: -9999 };
const btn = document.querySelector('[data-btn]');
const canvasWidth = 800;
const canvasHeight = 400;
const fontFam = 'Arial';
const principalColor = '#000';
const yellow = '#ffb91a';
const red = '#ff1a1a';
const orange = '#ff841a';
const warningColors = [yellow, orange, red];
const startColors = ['#1bf931', yellow, red];
const ctx = canvas.getContext('2d');
const defaultPoint = 10;
const upKeyCode = 38;
const oneSecond = 1000;
const oneHundredMs = 100;
const ftSzPoints = 20;
const damagePoints = defaultPoint * 30;
const validKeyCodes = [upKeyCode, 40, 39, 37];
const asteroidsImgs = [asteroidUp, asteroidLeft, asteroidRight, asteroidDown];
const topTxtHeight = canvasHeight - ftSzPoints;
const lvls = ['fácil', 'médio', 'difícil'];
const setLvl = lvlIdx => ({ txt: lvls[lvlIdx], color: warningColors[lvlIdx] })
let planeObj = initObj(true);
let asteroidObj = initObj();
let intervalStart = null;
let animationFrameIds = [];
let intervalSec = null;
let points = null;
let seconds = null;
let timeToStart = null;
let gameOver = null;
let remainingSeconds = null;
let isDamaged = null;
let asteroidTimeout = null;
let timesWithinAsteroidTimeout = 0;
let changeAsteroidPos= false;
let lvl = setLvl(0);

const setRandomVal = (max = 0, min = 0) => Math.floor((Math.random() * (max - min) + min))
const clear = () => ctx.clearRect(0, 0, canvasWidth, canvasHeight);
const resetRemainingSeconds = () => remainingSeconds = 5;
const canChangeAsteroidPos = (time, rest, idxLvl) => timesWithinAsteroidTimeout >= time && timesWithinAsteroidTimeout % rest === 0 && lvls.indexOf(lvl.txt) <= idxLvl;

const watchKeyDown = () => window.onkeydown = evt => {
    const { keyCode } = evt;

    validKeyCodes.includes(keyCode) ? paint(evt.keyCode) : null;
};

const watchAsteroidShow = () => {
    asteroidTimeout = setInterval(() => {
        if(timesWithinAsteroidTimeout !== 0){
            if(canChangeAsteroidPos(100, 2, 2)){
                lvl = setLvl(2);
                changeAsteroidPos = true;
            } else if(canChangeAsteroidPos(50, 5, 1)){
                lvl = setLvl(1);
                changeAsteroidPos = true;
            } else if(canChangeAsteroidPos(0, 10, 0)) {
                lvl = setLvl(0);
                changeAsteroidPos = true;
            }
        }

        ++timesWithinAsteroidTimeout;
    }, oneHundredMs);
}

const selectAsteroid = () => {
    if(changeAsteroidPos){
        changeAsteroidPos = false;

        const imgCurIdx = asteroidsImgs.indexOf(asteroid);

        asteroid = imgCurIdx >= (asteroidsImgs.length - 1) ? asteroidsImgs[0] : asteroidsImgs[imgCurIdx + 1];
        asteroidObj.x = setRandomVal(canvasWidth - sizeObj, 0)
        asteroidObj.y = setRandomVal(canvasHeight - sizeObj, 0)
    }
}

const draw = imgPlane => {
    ctx.drawImage(imgPlane, planeObj.x, planeObj.y, sizeObj, sizeObj);
    ctx.drawImage(asteroid, asteroidObj.x, asteroidObj.y, sizeObj, sizeObj);
};

const endGame = () => {
    gameOver = true;
    planeObj = initObj(true);
    asteroidObj = initObj();
    lvl = setLvl(0);
    timesWithinAsteroidTimeout = 0;
    window.onkeydown = null;
    animationFrameIds.forEach(id => window.cancelAnimationFrame(id));
    clearInterval(intervalStart);
    clearInterval(asteroidTimeout);
    clearInterval(intervalSec);
};

const checkSecondsEvts = () => {
    intervalSec = setInterval(() => {
        points += defaultPoint;

        if(remainingSeconds === 1){
            resetRemainingSeconds();

            points -= damagePoints;
            isDamaged = true
        } else{
            --remainingSeconds;
            isDamaged = false;
        }
    }, oneSecond);
};

const showTimeStart = () => {
    ctx.fillStyle = startColors[timeToStart - 1];
    ctx.fillText(`${timeToStart--}`, canvasWidth / 2, canvasHeight / 2);
};

const paint = (keyCode, speed = 25) => {
    clear();

    switch(keyCode){
        case upKeyCode:
            if(speed && planeObj.y > 0) planeObj.y -= speed;

            resetRemainingSeconds();

            plane = planeUp;
            break;
        case 40:           
            if(speed && planeObj.y < (canvasHeight - sizeObj)) planeObj.y += speed;
            
            resetRemainingSeconds();

            plane = planeDown;
            break;
        case 39:
            if(speed && planeObj.x < (canvasWidth - sizeObj)) planeObj.x += speed;
            
            resetRemainingSeconds();

            plane = planeRight;
            break;
        case 37:
            if(speed && planeObj.x > 0) planeObj.x -= speed;

            resetRemainingSeconds();
            
            plane = planeLeft;
            break;
    }

    ctx.font = `${ftSzPoints}px ${fontFam}`;
    ctx.fillStyle = isDamaged ? red : principalColor;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillText(`Sua pontuação é: ${points}`, ftSzPoints, topTxtHeight);
    ctx.fillStyle = lvl.color;
    ctx.fillText(`Dificuldade do jogo: ${lvl.txt}`, ftSzPoints, topTxtHeight - ftSzPoints - 8);

    ctx.textBaseline = 'top';
    ctx.fillStyle = remainingSeconds >= 4 ? principalColor : [...warningColors].reverse()[remainingSeconds - 1];
    ctx.fillText(`Você pederá ${damagePoints} pontos se ficar parado por mais ${remainingSeconds} ${remainingSeconds > 1 ? 'segundos' : 'segundo'}`, ftSzPoints, ftSzPoints);

    selectAsteroid();
    draw(plane);

    if(!gameOver) animationFrameIds.push(requestAnimationFrame(paint.bind(this, 0)));
}

const start = () => {
    points = 0;
    seconds = 0;
    timeToStart = 3;
    gameOver = false;
    isDamaged = null;
    resetRemainingSeconds();

    ctx.font = `124px ${fontFam}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    clear();
    showTimeStart();

    intervalStart = setInterval(() => {
        clear();

        if(!timeToStart){ 
            clearInterval(intervalStart);
            paint(upKeyCode, 0);
            watchKeyDown();
            checkSecondsEvts();
            watchAsteroidShow();

            return;
        }

        showTimeStart();
    }, oneSecond);
};

btn.onclick = () => {
    endGame();
    start();
};

start();
