import {setUpCanvas} from './canvas.js';
import {spawnPaddles}  from './paddle.js';
import {Ball}  from './ball.js';
import {spawnParticlePatch, updateParticles}  from './particle.js';



const TICK_RATE = 60;
const TICK_INTERVAL = 1000 / TICK_RATE;


let ws = new WebSocket("wss://nerter.fr/pong/");
//let ws = new WebSocket("http://127.0.0.1:3001/");

//global variables used to store all the game informations thanks to the on message function down bellow
let roomId = 0;
let playerId = null;

var gameState = null;
var startInfo = null;
var status = "en attente d'un 2ème joueur";
var canvasDisplay = "none"
var controlsDisplay = "none"

const gameCanvas = document.getElementById("game-canvas");
const ctx = gameCanvas.getContext('2d');
var canvasSize = [gameCanvas.width, gameCanvas.height];
var gameScreenSize = canvasSize;


//the proportion of the window that is filled by the canvas
const windowFilling = 0.75

const countdownColor = "#f2d5f5";

const playerColor = "#94b9ec";
const oppenentColor = "#405066";

const ballColor = "#e896f1";
const terrainColor = "#e896f1"

const paddleBorderRadius = 2;

//text
const scoreSize = 50
const countdownSize = 100
//placement of the score texts based on subdivion of screen
const scoreXScreenDivider = 16
const scoreYScreenDivider = 10

//middle line
const middleLineRectangleWidth = 2
const middleLineRectangleNumber = 24
const middleLineRectangleSpacing = 8

var scores = {
    0 : 0,
    1 : 0
}

var paddleList = []
var ball;

var upPressed = false;
var downPressed = false;

//particles is a list of patch of particles
let particles = [];

var lastTime = Date.now()
var deltatime = 0

function updateInfoBloc(){
    document.getElementById("playerId").innerHTML = `<strong>Identifiant de joueur :</strong> ${playerId}`;
    document.getElementById("room").innerHTML = `<strong>Salle :</strong> ${roomId}`;
    document.getElementById("status").innerHTML = `<strong>Status :</strong> ${status}`;
    document.getElementById("game-canvas").style.display = canvasDisplay;
    document.getElementById("controls-bloc").style.display = controlsDisplay;
}

function activateArrowButtons(){
    const upBtn = document.getElementById("up-btn")
    const downBtn = document.getElementById("down-btn")
    upBtn.addEventListener("pointerdown", () => {upPressed = true;});
    upBtn.addEventListener("pointerup", () => {upPressed = false;});
    upBtn.addEventListener("pointerleave", () => {upPressed = false;});

    downBtn.addEventListener("pointerdown", () => {downPressed = true;});
    downBtn.addEventListener("pointerup", () => {downPressed = false;});
    downBtn.addEventListener("pointerleave", () => {downPressed = false;});

}

function displayScores(){
    //display the scores at symetrical parts of the screen, and calculates the space of the text so it's always symetrical
    var textMultiplier = 0.55 * scores[0].toString().length // we multiply the textsize by the number of digits it has
    var color0 = playerColor
    var color1 = oppenentColor;
    if(playerId == 1){
        var color0 = oppenentColor
        var color1 = playerColor;
    }
    ctx.font = scoreSize + "px Noto";
    ctx.fillStyle = color0;
    ctx.fillText(scores[0], gameScreenSize[0] / 2 - scoreSize * textMultiplier - gameScreenSize[0] / scoreXScreenDivider, gameScreenSize[1] / scoreYScreenDivider);
    ctx.fillStyle = color1;
    ctx.fillText(scores[1], gameScreenSize[0] / 2 + gameScreenSize[0] / scoreXScreenDivider, gameScreenSize[1] / scoreYScreenDivider);
}

function displayCountdown(countdown){
    //display the countdown at the center of the screen
    var textMultiplier = 0.55 * scores[0].toString().length // we multiply the textsize by the number of digits it has
    ctx.font = countdownSize + "px Noto";
    ctx.fillStyle = countdownColor;
    ctx.fillText(countdown, gameScreenSize[0] / 2 - (countdownSize * textMultiplier) / 2 , gameScreenSize[1] / 2 - 100);
}

function drawTerrain(){
    //draw the middle line by displaying a lot of rounded rectangles
    var rectHeight = (gameScreenSize[1] - middleLineRectangleNumber * middleLineRectangleSpacing) / middleLineRectangleNumber 
    for(let i = 0; i < middleLineRectangleNumber; i++){

        ctx.beginPath();
        ctx.roundRect(gameScreenSize[0] / 2 - middleLineRectangleWidth / 2, middleLineRectangleSpacing / 2 + i * (rectHeight + middleLineRectangleSpacing),
        middleLineRectangleWidth, rectHeight, 10);
        ctx.fillStyle = terrainColor;
        ctx.fill();
    }
    
}

function start(){
    if(startInfo != null){
        
        

        window.addEventListener("resize", () => {
            setUpCanvas(gameCanvas, ctx, startInfo.screenWidth, startInfo.screenHeight, windowFilling);
            canvasSize = [gameCanvas.width, gameCanvas.height];
        });

        setUpCanvas(gameCanvas, ctx, startInfo.screenWidth, startInfo.screenHeight, windowFilling);
        canvasSize = [gameCanvas.width, gameCanvas.height];

        gameScreenSize = [startInfo.screenWidth, startInfo.screenHeight]
        paddleList = [];
        spawnPaddles(playerId, paddleList, canvasSize, startInfo, playerColor, oppenentColor, paddleBorderRadius)
        
        ball = new Ball(startInfo.ballStartX, startInfo.ballStartY, startInfo.ballRadius, ballColor)

        gameScreenSize = [startInfo.screenWidth, startInfo.screenHeight]

        status = "partie en cours";
        canvasDisplay = "block"
        controlsDisplay = "flex"
        updateInfoBloc();
        activateArrowButtons()
    }
    setInterval(mainLoop, TICK_INTERVAL);
}

function mainLoop() {

    deltatime = Date.now() - lastTime;
    lastTime = Date.now()

    ctx.clearRect( 0, 0, gameScreenSize[0], gameScreenSize[1]);

    drawTerrain()
    displayScores()

    if(gameState != null){
        for(let i = 0; i < paddleList.length; i++){
            var paddle = paddleList[i]
            var playerInfo = gameState.paddles[i]
            paddle.move(playerInfo.y)
            paddle.draw(ctx)
        }
        ball.move(gameState.ball.x, gameState.ball.y);
        ball.draw(ctx)

        if(gameState.startIn > 0){
            displayCountdown(gameState.startIn)
        }
    }
    updateParticles(particles, deltatime, ctx)

    sendInput()

}

//---------------------------------------message reception------------------------------------------

ws.onmessage = function(event) {
    let message = JSON.parse(event.data);

    if (message.type === "connected") {
        playerId = message.playerId;
        roomId = message.roomId;
        updateInfoBloc();
    }

    if (message.type === "start") {
        console.log("game started !");
        startInfo = message.data;
        start();
    }

    if (message.type === "state") {
        gameState = message.data;
        //console.log("state received : ", gameState);
    }

    if(message.type === "score"){
        scores = message.data
    }

    if(message.type === "collision"){
        spawnParticlePatch(particles, message.data.x, message.data.y, message.data.angle, message.data.direction, 20, playerColor)

    }

    if (message.type === "error"){
        if(message.code === 0){
            console.log("you have been disconnected because the server is full");
            status = "serveur plein";
            updateInfoBloc()
        }
    }

    if (message.type === "reconnect"){
        console.log("you have been disconnected because the other player left");
        ws.close();
        status = "L'adversaire s'est deconnecté";
        updateInfoBloc()

        setTimeout(function () {
            location.reload(); //refresh page
        }, 2000);

    }
};

//---------------------------------------input handling------------------------------------------
const keys = {};

document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault(); // block scroll with arrows
    }
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

function sendInput(){
    let input = "";

    if (keys["ArrowUp"] || upPressed) {
        input = "up";
    }

    if (keys["ArrowDown"] || downPressed) {
        input = "down";
    }

    if (input) {
        ws.send(JSON.stringify({
            type: "input",
            playerId: playerId,
            input: input
        }));
    }
}


