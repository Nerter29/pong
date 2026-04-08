const WebSocket = require("ws");

const port = 3001;
const wss = new WebSocket.Server({ port: port });

const TICK_RATE = 60;
const TICK_INTERVAL = 1000 / TICK_RATE;

console.log("pong web socket running");


const Game = require("./game");

// var players = [];
// const game = new Game();
var rooms = [];

function createRoom() {
    return {
        players: [],
        game: new Game(),
        interval: null
    };
}

function findRoom() {

    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].players.length < 2) {
            return rooms[i];
        }
    }
    var newRoom = createRoom();
    rooms.push(newRoom);
    return newRoom;
}

function sendDataToRoom(room, data, type){
    for (var i = 0; i < room.players.length; i++) {
        room.players[i].socket.send(JSON.stringify({
            type: type,
            data: data
        }));
    }
}

function getPlayerId(room, ws){

    var playerId;

    if (room.players.length === 0) {
        playerId = 0;
    } 
    else {
        if(room.players[0].id === 0){
            playerId = 1;
        }
        else{
            playerId = 0;
        }
    }  

    console.log("player " + playerId + " connected");

    ws.send(JSON.stringify({
        type: "assign",
        player: playerId
    }));
    return playerId

}

//--------------------------------------------Game-----------------------------------------


function gameLoop(room) {
    //send the state to every clients
    sendDataToRoom(room, room.game.getState(), "state")
}

wss.on("connection", function (ws) {

    //----------------------------------------------Connexions-----------------------------------------------


    //disconnect the client if the server is full
    // if (players.length >= 2) {
    //     ws.send(JSON.stringify({
    //         type: "error",
    //         code : 0
    //     }));
    //     ws.close();
    //     return;
    // }

    //var playerId = assignPlayers(ws)
    var room = findRoom();

    var playerId = getPlayerId(room, ws);

    room.players.push({
        id: playerId,
        socket: ws
    });

    ws.room = room;
    ws.playerId = playerId;

    //start game if we have 2 players
    if (room.players.length === 2) {
        sendDataToRoom(room, room.game.getStartInfo(), "start");

        room.interval = setInterval(function () {
        gameLoop(room);
        }, TICK_INTERVAL);
    }


    //----------------------------------------------Messages-----------------------------------------------

    ws.on("message", function (message) {
        let messageParsed;

        try {
            messageParsed = JSON.parse(message.toString());
        } catch (e) {
            console.log("json message bad format")
            return;
        }

        if (messageParsed.type === "input") {

            var room = ws.room;
            //onsole.log("input recu : " + messageParsed.input + " de " + messageParsed.playerId)
            //handle inputs of clients
            room.game.handleInput(ws.playerId, messageParsed.input);

        }
    });


    //----------------------------------------------Disconnexion-----------------------------------------------
    ws.on("close", function () {
        var room = ws.room;

        // remove player
        for (var i = 0; i < room.players.length; i++) {
            if (room.players[i].socket === ws) {
                room.players.splice(i, 1);
                break;
            }
        }

        //remove room if it is empty
        if (room.players.length === 0) {
            clearInterval(room.interval);

            var index = rooms.indexOf(room);
            if (index !== -1) {
                rooms.splice(index, 1);
            }
        }
    });
});


