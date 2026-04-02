const WebSocket = require("ws");

const port = 3001;
const wss = new WebSocket.Server({ port: port });

console.log("pong web socket running");

var playerNumber = 2;

var players = [];

function assignPlayers(){
    // this function assigns ids to the player, add it to the list, and send a message to the client to tell them.

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

    assignPlayers()

    //start game if we have 2 players
    if (players.length === 2) {
        console.log("start of the game");

        for (var i = 0; i < players.length; i++) {
        players[i].socket.send(JSON.stringify({
            type: "start"
        }));
        }
    }


    //----------------------------------------------Game-----------------------------------------------


    ws.on("message", function (message) {
        let data;

        try {
            data = JSON.parse(message.toString());
        } catch (e) {
            return;
        }

        if (data.type === "input") {
            console.log("Input reçu du joueur " + playerId + ": " + data.input);

            //send the input to every clients
            for (var i = 0; i < players.length; i++) {
                players[i].socket.send(JSON.stringify({
                    type: "input",
                    player: playerId,
                    input: data.input
                }));
            }
        }
    });


    //----------------------------------------------Unconnexion-----------------------------------------------
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