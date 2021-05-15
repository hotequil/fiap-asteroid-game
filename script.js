const canvas = document.querySelector('[data-canvas]');

if(!canvas?.getContext){ 
    const msg = 'seu browser não suporta canvas, atualize ele ou troque de navegador';
    
    alert(msg);
    throw Error(msg);
}

const sizeObj = 100;
const initImg = () => new Image(sizeObj, sizeObj);
const planeUp = initImg();
const planeLeft = initImg();
const planeRight = initImg();
const planeDown = initImg();
const asteroid = initImg();
let plane = initImg();

planeUp.src = './imgs/plane-up.png';
planeLeft.src = './imgs/plane-left.png';
planeRight.src = './imgs/plane-right.png';
planeDown.src = './imgs/plane-down.png';
asteroid.src = './imgs/asteroid.png';
plane = planeUp;

const initPlaneObj = () => ({x: (canvasWidth / 2) - (sizeObj / 2), y: (canvasHeight / 2) - (sizeObj / 2)});
const btn = document.querySelector('[data-btn]');
const canvasWidth = 800;
const canvasHeight = 400;
const fontFam = 'Arial';
const principalColor = '#000';
const yellow = '#ffb91a';
const red = '#ff1a1a';
const warningColors = [yellow, '#ff841a', red];
const startColors = ['#1bf931', yellow, red];
const ctx = canvas.getContext('2d');
const defaultPoint = 10;
const upKeyCode = 38;
const oneSecond = 1000;
const ftSzPoints = 20;
const damagePoints = defaultPoint * 30;

let planeObj = initPlaneObj();
let intervalStart = null;
let animationFrameIds = [];
let intervalSec = null;
let points = null;
let seconds = null;
let timeToStart = null;
let gameOver = null;
let remainingSeconds = null;
let isDamaged = null;

const clear = () => ctx.clearRect(0, 0, canvasWidth, canvasHeight);
const drawPlane = img => ctx.drawImage(img, planeObj.x, planeObj.y, sizeObj, sizeObj);
const resetRemainingSeconds = () => remainingSeconds = 10;
const watchKeyDown = () => window.onkeydown = evt => paint(evt.keyCode);

const endGame = () => {
    gameOver = true;
    planeObj = initPlaneObj();
    window.onkeydown = null;
    animationFrameIds.forEach(id => window.cancelAnimationFrame(id));
    clearInterval(intervalStart);
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
    ctx.fillText(`Sua pontuação é: ${points}`, ftSzPoints, canvasHeight - ftSzPoints);

    ctx.textBaseline = 'top';
    ctx.fillStyle = remainingSeconds >= 4 ? principalColor : [...warningColors].reverse()[remainingSeconds - 1];
    ctx.fillText(`Você pederá ${damagePoints} pontos se ficar parado por mais ${remainingSeconds} ${remainingSeconds > 1 ? 'segundos' : 'segundo'}`, ftSzPoints, ftSzPoints);

    drawPlane(plane);

    animationFrameIds.push(requestAnimationFrame(paint));
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
