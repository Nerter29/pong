import {setUpCanvas} from './canvas.js';
import {spawnPaddles}  from './paddle.js';
import {Ball}  from './ball.js';


const TICK_RATE = 60;
const TICK_INTERVAL = 1000 / TICK_RATE;


let ws = new WebSocket("wss://nerter.fr/pong/");

let roomId = 0;
let playerId = null;

var gameState = null;
var startInfo = null;
var status = "en attente d'un 2ème joueur";
var canvasDisplay = "none"

var running = false;

const gameCanvas = document.getElementById("game-canvas");
const ctx = gameCanvas.getContext('2d');
var canvasSize = [gameCanvas.width, gameCanvas.height];
var gameScreenSize = null;

//the proportion of the window that is filled by the canvas
const windowFilling = 0.8

const paddleColor = "#93549a";
const ballColor = "#e896f1";



var paddleList = []
var ball;

function updateInfoBloc(){
    document.getElementById("playerId").innerHTML = `<strong>Identifiant de joueur :</strong> ${playerId}`;
    document.getElementById("room").innerHTML = `<strong>Salle :</strong> ${roomId}`;
    document.getElementById("status").innerHTML = `<strong>Status :</strong> ${status}`;
    document.getElementById("game-canvas").style.display = canvasDisplay;

}

function start(){
    if(startInfo != null){
        
        setUpCanvas(gameCanvas, ctx, startInfo.screenWidth, startInfo.screenHeight, windowFilling);
        canvasSize = [gameCanvas.width, gameCanvas.height];
        paddleList = [];
        spawnPaddles(paddleList, canvasSize, startInfo, paddleColor)
        
        ball = new Ball(startInfo.ballStartX, startInfo.ballStartY, startInfo.ballRadius, ballColor)

        gameScreenSize = [startInfo.screenWidth, startInfo.screenHeight]

        status = "partie en cours";
        canvasDisplay = "block"
        updateInfoBloc();
    }

    setInterval(mainLoop, TICK_INTERVAL);
}

function mainLoop() {

    ctx.clearRect( 0, 0, gameScreenSize[0], gameScreenSize[1]);

    if(gameState != null){
        for(let i = 0; i < paddleList.length; i++){
            var paddle = paddleList[i]
            var playerInfo = gameState.players[i]
            paddle.move(playerInfo.y)
            paddle.draw(ctx)
        }
        ball.move(gameState.ball.x, gameState.ball.y);
        ball.draw(ctx)
        console.log(ball.x, ball.y)
    }
    sendInput()

}


ws.onmessage = function(event) {
    let message = JSON.parse(event.data);

    if (message.type === "connected") {
        playerId = message.playerId;
        roomId = message.roomId;
        console.log("im " + playerId + " in room " + roomId);
        updateInfoBloc();
    }

    if (message.type === "start") {
        console.log("game started !");
        startInfo = message.data;
        running = true
        start();
    }

    if (message.type === "state") {
        gameState = message.data;
        //console.log("state received : ", gameState);
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

//----------------------------input handling----------------------------
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

    if (keys["ArrowUp"]) {
        input = "up";
    }

    if (keys["ArrowDown"]) {
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


