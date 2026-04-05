const WebSocket = require("ws");

const port = 3001;
const wss = new WebSocket.Server({ port: port });

console.log("pong web socket running");

var playerNumber = 2;

var players = [];

const Game = require("./game");
const game = new Game();

function assignPlayers(ws){
    // this function assigns ids to the player, add it to the list, and send a message to the client to tell them.

    var playerId;

    if (players.length === 0) {
        playerId = 0;
    } else {
        if(players[0].id === 0){
            playerId = 1;
        }
        else{
            playerId = 0;
        }
    }  
    
    players.push({
        id: playerId,
        socket: ws
    });

    console.log("player " + playerId + " connected");

    ws.send(JSON.stringify({
        type: "assign",
        player: playerId
    }));

    return playerId;
}


function sendData(data, type){
    for (var i = 0; i < players.length; i++) {
        players[i].socket.send(JSON.stringify({
            type: type,
            data: data
        }));
    }
}

wss.on("connection", function (ws) {

    //----------------------------------------------Connexions-----------------------------------------------


    //unconnect the client if the server is full
    if (players.length >= 2) {
        ws.send(JSON.stringify({
            type: "error",
            message: "server full"
        }));
        ws.close();
        return;
    }

    var playerId = assignPlayers(ws)

    //start game if we have 2 players
    if (players.length === 2) {

        sendData(game.getStartInfo(), "start");
    }


    //----------------------------------------------Game-----------------------------------------------


    ws.on("message", function (message) {
        let messageParsed;

        try {
            messageParsed = JSON.parse(message.toString());
        } catch (e) {
            console.log("json message bad format")
            return;
        }

        if (messageParsed.type === "input") {
            console.log("input recu : " + messageParsed.input + " de " + messageParsed.playerId)

            //handle inputs of clients
            game.handleInput(playerId, messageParsed.input);

            //send the state to every clients
            sendData(game.getState(), "state")
        }
    });


    //----------------------------------------------Unconnexion-----------------------------------------------
    ws.on("close", function () {

        // remove player
        for (var i = 0; i < players.length; i++) {
            if (players[i].socket === ws) {
                players.splice(i, 1);
                break;
            }
        }
    });
});