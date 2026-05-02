import {setUpCanvas} from './canvas.js';
import {spawnPaddles}  from './paddle.js';
import {Ball}  from './ball.js';
import {spawnParticlePatch, updateParticles}  from './particle.js';


const TICK_RATE = 60; // fps
const TICK_INTERVAL = 1000 / TICK_RATE;
const RENDER_DELAY = 25 // time offset with the server data (in MS)

//send the url params back to the param of the web socket url
const params = new URLSearchParams(window.location.search);
const wantedRoomId = params.get("room");

let ws = new WebSocket(`wss://nerter.fr/pong/?room=${wantedRoomId}`);
ws = new WebSocket(`http://127.0.0.1:3001/?room=${wantedRoomId}`);

//global variables used to store all the game informations thanks to the on message function down bellow
let roomId = 0;
let playerId = null;

var gameState = null;
var gameStateBuffer = []; // variable in which we will store the raw data
var startInfo = null;
var status = "en attente d'un 2ème joueur";
var canvasDisplay = "none"
var controlsDisplay = "none"

var ballSpeedMultiplier = 1

const gameCanvas = document.getElementById("game-canvas");
const ctx = gameCanvas.getContext('2d');
var canvasSize = [gameCanvas.width, gameCanvas.height];
var gameScreenSize = canvasSize;

//the proportion of the window that is filled by the canvas
var windowFilling = 0.75;

//@media equivalent
if (window.matchMedia("(min-width: 1000px)").matches) {//horizontal
    windowFilling = 0.75
}
if (window.matchMedia("(max-width: 1000px)").matches) {//vertical
    windowFilling = 0.95
}


const lightPink = "#f2d5f5";

const lightBlue = "#94b9ec";
const darkBlue = "#405066";

const mainPink = "#e896f1";
const terrainColor = "#e896f1"

const paddleBorderRadius = 2;


//text
const scoreSize = 50
const countdownSize = 100
const gameInfoSize = 12
const winnerSize = 30
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
var winCondition;

var paddleList = []
var ball;

var ballTrailLength = 20


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
    var color0 = lightBlue
    var color1 = darkBlue;
    if(playerId == 1){
        var color0 = darkBlue
        var color1 = lightBlue;
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
    ctx.fillStyle = lightPink;
    ctx.fillText(countdown, gameScreenSize[0] / 2 - (countdownSize * textMultiplier) / 2 , gameScreenSize[1] / 2 - 100);
}

function displayGameInfo(speedMult, winCondition){
    //display the speed multiplier at the bottom left of the screen
    ctx.font = gameInfoSize + "px Noto";
    ctx.fillStyle = lightPink;
    ctx.fillText("Vitesse : x" + speedMult + " | Premier à " + winCondition + " de score", 5 , gameScreenSize[1] - 5 );
}

function displayWinner(winner){
    var direction = "gauche"
    if(winner == 1){
        direction = "droit"
    }
    var text = "Le joueur " + direction + " a gagné !"
    var textMultiplier = 0.46 * text.toString().length
    ctx.font = winnerSize + "px Noto";
    ctx.fillStyle = lightBlue;
    ctx.fillText(text, gameScreenSize[0] / 2 - (winnerSize * textMultiplier) / 2 , gameScreenSize[1] / 2 - 50);
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


function getInterpolatedData() {
    //allow to get a clean data stream with less holes in it from the raw data in the buffer, to fix the mess that the network caused
    //this function fixes the ball trajectory by filling the holes and adds the RENDER_DELAY to every action
    let now = performance.now() - RENDER_DELAY;

    //clean the buffer
    while (gameStateBuffer.length >= 2 && gameStateBuffer[1].time <= now) {
        gameStateBuffer.shift();
    }

    if(gameStateBuffer.length < 2){
        return null
    }

    let g1 = gameStateBuffer[0];
    let g2 = gameStateBuffer[1];

    let g1Ball = g1.gameState.ball
    let g2Ball = g2.gameState.ball

    let t = (now - g1.time) / (g2.time - g1.time);

    gameStateBuffer[0].gameState.ball.x = g1Ball.x + (g2Ball.x - g1Ball.x) * t
    gameStateBuffer[0].gameState.ball.y = g1Ball.y + (g2Ball.y - g1Ball.y) * t

    return gameStateBuffer[0]

}

function spawnBall(){
    ball = new Ball(startInfo.ballStartX, startInfo.ballStartY, startInfo.ballRadius, mainPink, ballTrailLength)
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
        spawnPaddles(playerId, paddleList, canvasSize, startInfo, lightBlue, darkBlue, paddleBorderRadius)
        
        spawnBall()

        gameScreenSize = [startInfo.screenWidth, startInfo.screenHeight]

        winCondition = startInfo.winCondition

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

    var gameStateTemp = getInterpolatedData()

    if(gameStateTemp != null){
        gameState = gameStateTemp.gameState

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
            if(gameState.winner != null){
                displayWinner(gameState.winner)
            }
            
        }


        ballSpeedMultiplier = gameState.ballSpeedMultiplier
    }
    updateParticles(particles, deltatime, ctx)

    displayGameInfo(ballSpeedMultiplier, winCondition)

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
        //fills the buffer with the raw data
        gameStateBuffer.push({
            gameState : message.data,
            time : performance.now()
        })
    }

    if(message.type === "score"){
        scores = message.data
        spawnBall()
    }

    if(message.type === "collision"){
        var color;
        var num = 30
        var angleDiff = Math.PI / 2
        var speed = 0.08
        var speedDiff = 0.04
        if(message.data.type == "paddle"){
            color = lightBlue;
        }
        else if(message.data.type == "wall"){
            color = mainPink
        }
        else{
            color = mainPink
            num = 400
            angleDiff = Math.PI
            speed = 0.2
            speedDiff = 0.08
        }
        spawnParticlePatch(particles, message.data.x, message.data.y, message.data.angle, message.data.direction, num, color, angleDiff, speed, speedDiff)

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


