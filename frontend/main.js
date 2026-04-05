import {setUpCanvas} from './canvas.js';
import {spawnPaddles}  from './paddle.js';


let ws = new WebSocket("wss://nerter.fr/pong/");

let playerId = null;

var gameState = null;

ws.onmessage = function(event) {
    let data = JSON.parse(event.data);

    if (data.type === "assign") {
        playerId = data.player;
        console.log("im", playerId);
    }

    if (data.type === "start") {
        console.log("game started for client !");
    }

    if (data.type === "state") {
        gameState = data.state

        console.log("state received : ", gameState);
    }
};

//----------------------------input handling----------------------------
const keys = {};

document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
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

//----------------------------game loop----------------------------

const gameCanvas = document.getElementById("game-canvas");
const ctx = gameCanvas.getContext('2d');
setUpCanvas(gameCanvas, 500, 500);
const canvasSize = [gameCanvas.width, gameCanvas.height];


var paddleList = []

const paddleWidth = 20
const paddleHeight = 100
const startY = 50

spawnPaddles(paddleList, canvasSize, startY, paddleWidth, paddleHeight)

function mainLoop() {

    ctx.clearRect( 0, 0, canvasSize[0], canvasSize[1]);

    if(gameState != null){
        
        for(let i = 0; i < paddleList.length; i++){
            var paddle = paddleList[i]
            var playerInfo = gameState.players[i]
            paddle.move(playerInfo.y)
            paddle.draw(ctx)
        }
    }
    

    sendInput()
    requestAnimationFrame(mainLoop);
}

mainLoop();
