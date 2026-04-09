const WebSocket = require("ws");

const port = 3001;
const wss = new WebSocket.Server({ port: port });

const TICK_RATE = 60;
const TICK_INTERVAL = 1000 / TICK_RATE;

const playerPerRoom = 2;

console.log("pong web socket running");

const Game = require("./game");

var currentTime = Date.now();
var deltaTime;
var lastTime;

var rooms = [];

function getRoomId(){
    var id = 0
    var idTaken = false;
    var idFound = false
    let i = 0
    while(i < rooms.length && !idFound){
        let j = 0
        idTaken = false;
        while(j < rooms.length && !idTaken){
            if(rooms[j].id == i){
                idTaken = true
            }
            j++
        }
        if(!idTaken){
            idFound = true
            id = i;
        }
        i++;
    }
    if(!idFound){
        id = rooms.length;
    }
    return id
}

function createRoom() {
    //creates a default room that will contain an id, a player list, a game and a loop to run the game 
    return {
        id : getRoomId(),
        players: [],
        game: new Game(),
        loop: null
    };
}

function findRoom() {

    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].players.length < playerPerRoom) {
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

function getPlayerId(room){

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

    return playerId

}


function sendConnectionPackage(ws, room, playerId){
    console.log("player " + playerId + " connected in " + room.id);
    ws.send(JSON.stringify({
        type: "connected",
        playerId: playerId,
        roomId: room.id
    }));
}

//--------------------------------------------Game-----------------------------------------


function gameLoop(room) {
    currentTime = Date.now();
    deltaTime = (currentTime - lastTime) / 1000
    lastTime = currentTime;

    room.game.ball.move(deltaTime)
    
    //send the state to every clients
    sendDataToRoom(room, room.game.getState(), "state")
}

wss.on("connection", function (ws) {

    //----------------------------------------------Connections-----------------------------------------------


    var room = findRoom();

    var playerId = getPlayerId(room, ws);

    sendConnectionPackage(ws, room, playerId);

    room.players.push({
        id: playerId,
        socket: ws
    });

    ws.room = room;
    ws.playerId = playerId;

    //start game if we have 2 players
    if (room.players.length === 2) {
        sendDataToRoom(room, room.game.getStartInfo(), "start");

        room.loop = setInterval(function () {
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
            room.game.handleInput(ws.playerId, messageParsed.input, deltaTime);

        }
    });


    //----------------------------------------------Disconnexion-----------------------------------------------
    ws.on("close", function () {
        var room = ws.room;

        if (!room) return;

        console.log("player disconnected");

        // remove player
        for (var i = 0; i < room.players.length; i++) {
            if (room.players[i].socket === ws) {
                room.players.splice(i, 1);
                break;
            }
        }

        //when someone disconnect, the entire room is deleted.

        //we stop the loop
        if (room.interval) {
            clearInterval(room.interval);
        }

        //we look for the oppenent
        var oppenent = null;

        for (var i = 0; i < room.players.length; i++) {
            if (room.players[i].socket !== ws) {
                oppenent = room.players[i].socket;
            }
        }

        //we clear players
        room.players = []
        //we remove the room
        var index = rooms.indexOf(room);
        if (index !== -1) {
            rooms.splice(index, 1);
        }

        //we say to the oppenent to reconnect and we diconnect him
        if(oppenent != null){
            oppenent.send(JSON.stringify({
                type: "reconnect"
            }));
            oppenent.close();
        }
    });
});


