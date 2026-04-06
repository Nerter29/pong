import {setUpCanvas} from './canvas.js';
import {spawnPaddles}  from './paddle.js';


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


var paddleList = []

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

        gameScreenSize = [startInfo.screenWidth, startInfo.screenHeight]

        status = "partie en cours";
        canvasDisplay = "block"
        updateInfoBloc();
    }

    mainLoop();
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
    }
    sendInput()
    if(running){
        requestAnimationFrame(mainLoop);
    }   
}


ws.onmessage = function(event) {
    let message = JSON.parse(event.data);

    if (message.type === "assign") {
        playerId = message.player;
        console.log("im", playerId);
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


