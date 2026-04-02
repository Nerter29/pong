const WebSocket = require("ws");

const port = 3001;
const wss = new WebSocket.Server({ port: port });

console.log("pong web socket running");

var playerNumber = 2;

var players = [];

wss.on("connection", function (ws) {
    console.log("connexion received");


    if (players.length >= 2) {
        ws.send(JSON.stringify({
            type: "error",
            message: "server full"
        }));
        ws.close();
        return;
    }

    //assign player
    var playerId;

    if (players.length === 0) {
        playerId = 1;
    } else {
        if(players[0].id === 1){
            playerId = 2;
        }
        else{
            playerId = 1;
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

    //start game
    if (players.length === 2) {
        console.log("start of the game");

        for (var i = 0; i < players.length; i++) {
        players[i].socket.send(JSON.stringify({
            type: "start"
        }));
        }
    }

    ws.on("message", function (message) {
        console.log("Message recu:", message.toString());
    });

    ws.on("close", function () {
        console.log("Joueur " + playerId + " d  connect  ");

        // remove player
        for (var i = 0; i < players.length; i++) {
        if (players[i].socket === ws) {
            players.splice(i, 1);
            break;
        }
        }
    });
});